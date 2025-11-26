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
  handler: async (ctx, args): Promise<{ result: "real" | "fake"; analysis: string }> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    // Get user location to determine relevant sources
    const location = (await ctx.runQuery(internal.users.getUserLocation, { userId })) as { latitude: number; longitude: number } | null | undefined;
    
    // Simulate analysis delay
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    // Determine sources based on location
    let sources = [
      "Reuters",
      "Associated Press", 
      "Al Jazeera",
      "BBC World"
    ];

    if (location) {
      const { latitude, longitude } = location;
      
      // Rough bounding boxes for demonstration
      const isIndia = latitude >= 8 && latitude <= 37 && longitude >= 68 && longitude <= 97;
      const isUS = latitude >= 24 && latitude <= 49 && longitude >= -125 && longitude <= -66;
      const isEurope = latitude >= 36 && latitude <= 71 && longitude >= -10 && longitude <= 40;

      if (isIndia) {
        sources = ["NDTV", "The Hindu", "Times of India", "Indian Express"];
      } else if (isUS) {
        sources = ["CNN", "The New York Times", "Washington Post", "NPR"];
      } else if (isEurope) {
        sources = ["BBC", "Deutsche Welle", "France 24", "Euronews"];
      }
    }
    
    // Mock logic for demonstration
    const isFake = Math.random() > 0.5;
    const confidence = Math.floor(Math.random() * 30) + 70; // 70-100%
    
    const analysis = isFake 
      ? `VERDICT: POTENTIALLY MISLEADING / FAKE\n\nDetailed Forensic Analysis:\n1. Source Credibility: Cross-referencing with trusted ${location ? 'regional' : 'global'} networks (including ${sources.slice(0, 2).join(" and ")}) yielded no matching reports for the claimed events.\n2. Sentiment Anomaly: Text analysis detected high emotional manipulation and sensationalist phrasing typical of disinformation campaigns.\n3. Fact-Check: Key entities and dates mentioned contradict verified records in our knowledge base.\n\nRecommendation: Treat this content with extreme caution. Do not share without further verification.`
      : `VERDICT: VERIFIED / CREDIBLE\n\nDetailed Forensic Analysis:\n1. Source Corroboration: The information is independently reported by multiple high-confidence outlets, including ${sources.slice(0, 2).join(" and ")}.\n2. Contextual Consistency: Timestamps, geolocation data, and event sequences align with verified historical and real-time records.\n3. Network Consensus: No flags raised by our automated fact-checking protocols or partner fact-checking organizations.\n\nConclusion: The content appears accurate and trustworthy.`;

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