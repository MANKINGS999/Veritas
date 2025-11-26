import { v } from "convex/values";
import { action, internalMutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

export const saveCheck = internalMutation({
  args: {
    userId: v.id("users"),
    content: v.string(),
    type: v.union(v.literal("url"), v.literal("text")),
    result: v.union(v.literal("real"), v.literal("fake"), v.literal("uncertain")),
    confidence: v.number(),
    sources: v.array(v.string()),
    analysis: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("news_checks", args);
  },
});

export const checkNews = action({
  args: {
    content: v.string(),
    type: v.union(v.literal("url"), v.literal("text")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    // Simulate analysis delay
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    // Mock logic for demonstration
    const isFake = Math.random() > 0.5;
    const confidence = Math.floor(Math.random() * 30) + 70; // 70-100%
    
    const sources = [
      "CNN",
      "ABC News",
      "Reuters",
      "Associated Press"
    ];

    const analysis = isFake 
      ? "This content shows patterns consistent with known misinformation. Cross-referencing with major networks found no matching verified reports."
      : "This content has been verified against multiple reliable sources. The information aligns with reports from major news networks.";

    await ctx.runMutation(internal.news.saveCheck, {
      userId,
      content: args.content,
      type: args.type,
      result: isFake ? "fake" : "real",
      confidence,
      sources,
      analysis,
    });

    return { result: isFake ? "fake" : "real", analysis };
  },
});

export const getHistory = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("news_checks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(10);
  },
});
