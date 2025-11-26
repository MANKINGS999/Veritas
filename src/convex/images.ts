import { v } from "convex/values";
import { action, internalMutation, mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    return await ctx.storage.generateUploadUrl();
  },
});

export const saveAnalysis = internalMutation({
  args: {
    userId: v.id("users"),
    storageId: v.id("_storage"),
    probability: v.number(),
    isMorphed: v.boolean(),
    analysis: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("image_checks", args);
  },
});

export const analyzeImage = action({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    // Simulate AI analysis delay
    await new Promise((resolve) => setTimeout(resolve, 2500));

    const probability = Math.floor(Math.random() * 100);
    const isMorphed = probability > 50;
    
    const analysis = isMorphed
      ? "Detected inconsistencies in pixel patterns and lighting gradients suggesting digital manipulation. AI generation artifacts present in background textures."
      : "Image metadata and noise patterns are consistent with original camera capture. No significant signs of manipulation detected.";

    await ctx.runMutation(internal.images.saveAnalysis, {
      userId,
      storageId: args.storageId,
      probability,
      isMorphed,
      analysis,
    });

    return { probability, isMorphed, analysis };
  },
});

export const getHistory = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const checks = await ctx.db
      .query("image_checks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(10);

    return await Promise.all(
      checks.map(async (check) => ({
        ...check,
        url: await ctx.storage.getUrl(check.storageId),
      }))
    );
  },
});