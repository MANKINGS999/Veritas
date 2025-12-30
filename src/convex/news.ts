import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";
import { vly } from "../lib/vly-integrations";

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