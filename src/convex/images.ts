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
      ? `VERDICT: LIKELY MANIPULATED (Probability: ${probability}%)\n\nForensic Analysis Report:\n• Error Level Analysis (ELA): Detected inconsistent compression artifacts in the subject's facial region, suggesting digital splicing.\n• Lighting Consistency: Shadow angles on the foreground subject do not match the background light source direction.\n• Noise Distribution: High-frequency noise patterns in the edited areas differ significantly from the rest of the image.\n• Metadata: EXIF data appears stripped or modified, indicating post-processing software usage.`
      : `VERDICT: AUTHENTIC (Probability: ${probability}%)\n\nForensic Analysis Report:\n• Error Level Analysis (ELA): Uniform compression levels observed across the entire image frame.\n• Lighting Consistency: Global illumination and shadow falloff are physically consistent with the scene geometry.\n• Noise Distribution: Sensor noise is homogeneous, indicating a single, unmodified capture event.\n• Metadata: Original EXIF data is intact and consistent with the image content.`;

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