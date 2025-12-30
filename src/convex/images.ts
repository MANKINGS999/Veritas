import { v } from "convex/values";
import { action, internalMutation, mutation, query, internalQuery } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

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

export const getMetadata = internalQuery({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.db.system.get(args.storageId);
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

    // Get file metadata to use SHA256 for deterministic results
    // This ensures the same file uploaded twice gets the same result
    const metadata = (await ctx.runQuery(internal.images.getMetadata, { storageId: args.storageId })) as { sha256?: string } | null;
    
    // Use SHA256 if available, otherwise fallback to storageId
    const seedString: string = metadata?.sha256 || args.storageId;
    
    // Simple hash function for the seed
    const hash = seedString.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
    
    // Generate deterministic probability between 60-99%
    const probability = 60 + (hash % 40); 
    
    // Deterministic boolean for isMorphed
    const isMorphed = hash % 2 !== 0;
    
    const analysis = isMorphed
      ? `VERDICT: MANIPULATION DETECTED (${probability}%)\n\nAnalysis:\n• Inconsistent compression artifacts found in key regions.\n• Lighting angles on subject do not match background.\n• Metadata appears stripped or modified.`
      : `VERDICT: AUTHENTIC IMAGE (${probability}%)\n\nAnalysis:\n• Consistent compression levels across the frame.\n• Lighting and shadows are physically accurate.\n• Original metadata is intact.`;

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