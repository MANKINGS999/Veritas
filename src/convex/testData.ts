import { mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

export const seedTestData = mutation({
  args: {
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const authUserId = await getAuthUserId(ctx);
    const userId = args.userId || authUserId;
    if (!userId) throw new Error("Please provide a userId or authenticate first");

    // Create some test news checks
    const newsCheck1 = await ctx.db.insert("news_checks", {
      userId,
      content: "New study shows climate change impacts accelerating faster than predicted",
      type: "text",
      result: "real",
      confidence: 85,
      sources: ["BBC", "Reuters", "Nature"],
      analysis: "Cross-verified with multiple reputable scientific sources. Study published in peer-reviewed journal Nature.",
    });

    const newsCheck2 = await ctx.db.insert("news_checks", {
      userId,
      content: "Scientists discover cure for all cancers overnight",
      type: "text",
      result: "fake",
      confidence: 95,
      sources: [],
      analysis: "No credible sources found. Claims are scientifically implausible and not reported by any reputable medical journals.",
    });

    const newsCheck3 = await ctx.db.insert("news_checks", {
      userId,
      content: "Government announces new economic stimulus package",
      type: "text",
      result: "uncertain",
      confidence: 60,
      sources: ["Local News"],
      analysis: "Limited sources available. Waiting for official government press release confirmation.",
    });

    // Create some community posts
    const post1 = await ctx.db.insert("community_posts", {
      userId,
      content: "Breaking: Major tech company announces breakthrough in quantum computing",
      type: "text",
      result: "real",
      confidence: 88,
      sources: ["TechCrunch", "Wired", "MIT Technology Review"],
      analysis: "Confirmed by multiple technology news outlets. Official press release from the company available.",
      upvotes: 15,
      downvotes: 2,
    });

    const post2 = await ctx.db.insert("community_posts", {
      userId,
      content: "Study claims eating chocolate helps lose weight rapidly",
      type: "text",
      result: "fake",
      confidence: 92,
      sources: [],
      analysis: "No scientific evidence. Study not published in any recognized medical journal. Likely clickbait.",
      upvotes: 3,
      downvotes: 25,
    });

    // Initialize user stats
    const existingStats = await ctx.db
      .query("user_stats")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!existingStats) {
      await ctx.db.insert("user_stats", {
        userId,
        reputation: 50,
        totalUpvotesGiven: 0,
        totalDownvotesGiven: 0,
        totalPostsCreated: 2,
        credibilityScore: 75,
      });
    }

    return {
      message: "Test data created successfully!",
      newsChecksCreated: 3,
      communityPostsCreated: 2,
    };
  },
});
