import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query, QueryCtx, internalQuery } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get the current signed in user. Returns null if the user is not signed in.
 * Usage: const signedInUser = await ctx.runQuery(api.authHelpers.currentUser);
 * THIS FUNCTION IS READ-ONLY. DO NOT MODIFY.
 */
export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);

    if (user === null) {
      return null;
    }

    return user;
  },
});

/**
 * Use this function internally to get the current user data. Remember to handle the null user case.
 * @param ctx
 * @returns
 */
export const getCurrentUser = async (ctx: QueryCtx) => {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    return null;
  }
  return await ctx.db.get(userId);
};

export const getUserLocation = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    return user?.location;
  },
});

export const updateLocation = mutation({
  args: {
    latitude: v.number(),
    longitude: v.number(),
    displayName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    await ctx.db.patch(userId, {
      location: {
        latitude: args.latitude,
        longitude: args.longitude,
        displayName: args.displayName,
      },
    });
  },
});

// Set user role (admin only or self-promotion for first user)
export const setUserRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(v.literal("admin"), v.literal("user"), v.literal("member")),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) throw new Error("Unauthorized");

    const currentUser = await ctx.db.get(currentUserId);

    // Allow if current user is admin, or if it's the first user promoting themselves
    const allUsers = await ctx.db.query("users").collect();
    const isFirstUser = allUsers.length === 1 && currentUserId === args.userId;

    if (currentUser?.role !== "admin" && !isFirstUser) {
      throw new Error("Admin access required");
    }

    await ctx.db.patch(args.userId, { role: args.role });
  },
});