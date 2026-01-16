import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Post news to community
export const postToCommunity = mutation({
  args: {
    content: v.string(),
    type: v.union(v.literal("url"), v.literal("text")),
    result: v.union(v.literal("real"), v.literal("fake"), v.literal("uncertain")),
    confidence: v.number(),
    sources: v.array(v.string()),
    analysis: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const postId = await ctx.db.insert("community_posts", {
      userId,
      content: args.content,
      type: args.type,
      result: args.result,
      confidence: args.confidence,
      sources: args.sources,
      analysis: args.analysis,
      upvotes: 0,
      downvotes: 0,
    });

    // Update user stats
    const stats = await ctx.db
      .query("user_stats")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (stats) {
      await ctx.db.patch(stats._id, {
        totalPostsCreated: stats.totalPostsCreated + 1,
      });
    } else {
      await ctx.db.insert("user_stats", {
        userId,
        reputation: 0,
        totalUpvotesGiven: 0,
        totalDownvotesGiven: 0,
        totalPostsCreated: 1,
        credibilityScore: 50,
      });
    }

    return postId;
  },
});

// Get all community posts
export const getCommunityPosts = query({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db
      .query("community_posts")
      .order("desc")
      .take(50);

    const postsWithUsers = await Promise.all(
      posts.map(async (post) => {
        const user = await ctx.db.get(post.userId);
        const currentUserId = await getAuthUserId(ctx);

        let userVote = null;
        if (currentUserId) {
          const vote = await ctx.db
            .query("votes")
            .withIndex("by_user_and_post", (q) =>
              q.eq("userId", currentUserId).eq("postId", post._id)
            )
            .first();
          userVote = vote?.voteType || null;
        }

        return {
          ...post,
          userName: user?.name || "Anonymous",
          userVote,
        };
      })
    );

    return postsWithUsers;
  },
});

// Vote on a post
export const voteOnPost = mutation({
  args: {
    postId: v.id("community_posts"),
    voteType: v.union(v.literal("upvote"), v.literal("downvote")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");

    // Check if user already voted
    const existingVote = await ctx.db
      .query("votes")
      .withIndex("by_user_and_post", (q) =>
        q.eq("userId", userId).eq("postId", args.postId)
      )
      .first();

    if (existingVote) {
      // If same vote type, remove the vote
      if (existingVote.voteType === args.voteType) {
        await ctx.db.delete(existingVote._id);

        // Update post counts
        if (args.voteType === "upvote") {
          await ctx.db.patch(args.postId, {
            upvotes: Math.max(0, post.upvotes - 1),
          });
        } else {
          await ctx.db.patch(args.postId, {
            downvotes: Math.max(0, post.downvotes - 1),
          });
        }

        // Update user stats
        const stats = await ctx.db
          .query("user_stats")
          .withIndex("by_user", (q) => q.eq("userId", userId))
          .first();

        if (stats) {
          if (args.voteType === "upvote") {
            await ctx.db.patch(stats._id, {
              totalUpvotesGiven: Math.max(0, stats.totalUpvotesGiven - 1),
            });
          } else {
            await ctx.db.patch(stats._id, {
              totalDownvotesGiven: Math.max(0, stats.totalDownvotesGiven - 1),
            });
          }
        }
      } else {
        // Change vote type
        await ctx.db.patch(existingVote._id, {
          voteType: args.voteType,
        });

        // Update post counts
        if (args.voteType === "upvote") {
          await ctx.db.patch(args.postId, {
            upvotes: post.upvotes + 1,
            downvotes: Math.max(0, post.downvotes - 1),
          });
        } else {
          await ctx.db.patch(args.postId, {
            upvotes: Math.max(0, post.upvotes - 1),
            downvotes: post.downvotes + 1,
          });
        }

        // Update user stats
        const stats = await ctx.db
          .query("user_stats")
          .withIndex("by_user", (q) => q.eq("userId", userId))
          .first();

        if (stats) {
          if (args.voteType === "upvote") {
            await ctx.db.patch(stats._id, {
              totalUpvotesGiven: stats.totalUpvotesGiven + 1,
              totalDownvotesGiven: Math.max(0, stats.totalDownvotesGiven - 1),
            });
          } else {
            await ctx.db.patch(stats._id, {
              totalUpvotesGiven: Math.max(0, stats.totalUpvotesGiven - 1),
              totalDownvotesGiven: stats.totalDownvotesGiven + 1,
            });
          }
        }
      }
    } else {
      // Create new vote
      await ctx.db.insert("votes", {
        userId,
        postId: args.postId,
        voteType: args.voteType,
      });

      // Update post counts
      if (args.voteType === "upvote") {
        await ctx.db.patch(args.postId, {
          upvotes: post.upvotes + 1,
        });
      } else {
        await ctx.db.patch(args.postId, {
          downvotes: post.downvotes + 1,
        });
      }

      // Update or create user stats
      const stats = await ctx.db
        .query("user_stats")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .first();

      if (stats) {
        if (args.voteType === "upvote") {
          await ctx.db.patch(stats._id, {
            totalUpvotesGiven: stats.totalUpvotesGiven + 1,
          });
        } else {
          await ctx.db.patch(stats._id, {
            totalDownvotesGiven: stats.totalDownvotesGiven + 1,
          });
        }

        // Update reputation (simple calculation)
        const newReputation = (stats.totalUpvotesGiven * 2) - stats.totalDownvotesGiven;
        await ctx.db.patch(stats._id, {
          reputation: newReputation,
        });
      } else {
        await ctx.db.insert("user_stats", {
          userId,
          reputation: args.voteType === "upvote" ? 2 : -1,
          totalUpvotesGiven: args.voteType === "upvote" ? 1 : 0,
          totalDownvotesGiven: args.voteType === "downvote" ? 1 : 0,
          totalPostsCreated: 0,
          credibilityScore: 50,
        });
      }
    }
  },
});

// Get user stats/profile
export const getUserStats = query({
  args: {
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const userId = args.userId || await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db.get(userId);
    const stats = await ctx.db
      .query("user_stats")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!stats) {
      return {
        user,
        reputation: 0,
        totalUpvotesGiven: 0,
        totalDownvotesGiven: 0,
        totalPostsCreated: 0,
        credibilityScore: 50,
      };
    }

    return {
      user,
      ...stats,
    };
  },
});

// Delete post (admin only)
export const deletePost = mutation({
  args: {
    postId: v.id("community_posts"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const user = await ctx.db.get(userId);
    if (user?.role !== "admin") throw new Error("Admin access required");

    // Delete all votes associated with the post
    const votes = await ctx.db
      .query("votes")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect();

    await Promise.all(votes.map((vote) => ctx.db.delete(vote._id)));

    // Delete the post
    await ctx.db.delete(args.postId);
  },
});
