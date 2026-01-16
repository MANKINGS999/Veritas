import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove
      
      // Custom fields
      location: v.optional(v.object({
        latitude: v.number(),
        longitude: v.number(),
        displayName: v.optional(v.string()),
      })),
    }).index("email", ["email"]), // index for the email. do not remove or modify

    news_checks: defineTable({
      userId: v.id("users"),
      content: v.string(), // URL or text
      type: v.union(v.literal("url"), v.literal("text")),
      result: v.union(v.literal("real"), v.literal("fake"), v.literal("uncertain")),
      confidence: v.number(), // 0-100
      sources: v.array(v.string()),
      analysis: v.string(),
    }).index("by_user", ["userId"]),

    image_checks: defineTable({
      userId: v.id("users"),
      storageId: v.id("_storage"),
      probability: v.number(), // 0-100 probability of being morphed
      analysis: v.string(),
      isMorphed: v.boolean(),
    }).index("by_user", ["userId"]),

    community_posts: defineTable({
      userId: v.id("users"),
      content: v.string(), // URL or text of the news
      type: v.union(v.literal("url"), v.literal("text")),
      result: v.union(v.literal("real"), v.literal("fake"), v.literal("uncertain")),
      confidence: v.number(), // 0-100
      sources: v.array(v.string()),
      analysis: v.string(),
      upvotes: v.number(), // count of upvotes
      downvotes: v.number(), // count of downvotes
    }).index("by_user", ["userId"]),

    votes: defineTable({
      userId: v.id("users"),
      postId: v.id("community_posts"),
      voteType: v.union(v.literal("upvote"), v.literal("downvote")),
    })
      .index("by_user", ["userId"])
      .index("by_post", ["postId"])
      .index("by_user_and_post", ["userId", "postId"]),

    user_stats: defineTable({
      userId: v.id("users"),
      reputation: v.number(), // calculated reputation score
      totalUpvotesGiven: v.number(),
      totalDownvotesGiven: v.number(),
      totalPostsCreated: v.number(),
      credibilityScore: v.number(), // 0-100 based on vote patterns
    }).index("by_user", ["userId"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;