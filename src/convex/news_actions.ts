"use node";
import { v } from "convex/values";
import { action } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";
import { vly } from "../lib/vly-integrations";

export const checkNews = action({
  args: {
    content: v.string(),
    type: v.union(v.literal("url"), v.literal("text")),
  },
  handler: async (ctx, args): Promise<{ result: "real" | "fake" | "uncertain"; analysis: string }> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    // Get user location to determine relevant sources context
    const location = (await ctx.runQuery(internal.users.getUserLocation, { userId })) as { latitude: number; longitude: number } | null | undefined;
    
    let locationContext = "Global";
    if (location) {
      const { latitude, longitude } = location;
      if (latitude >= 8 && latitude <= 37 && longitude >= 68 && longitude <= 97) locationContext = "India";
      else if (latitude >= 24 && latitude <= 49 && longitude >= -125 && longitude <= -66) locationContext = "USA";
      else if (latitude >= 36 && latitude <= 71 && longitude >= -10 && longitude <= 40) locationContext = "Europe";
    }

    const prompt = `
    You are Veritas, a Senior Editor and Fact-Checking AI at a global news desk.
    Your task is to rigorously verify the credibility of the following news content or URL.

    INPUT:
    Content/URL: "${args.content}"
    User Context: ${locationContext}

    INSTRUCTIONS:
    1. Cross-reference this information against established, high-trust news networks (e.g., Reuters, AP, BBC, CNN, Al Jazeera, NYT, Washington Post, The Hindu, etc.).
    2. Analyze for sensationalism, logical fallacies, or signs of manipulation.
    3. If it is a URL, evaluate the domain authority and check if it mimics a legitimate site (typosquatting).
    4. If the content is a claim, check if it is widely reported by multiple independent sources.
    5. Be extremely critical. If a claim is extraordinary and lacks verification from major sources, mark it as "fake" or "uncertain".

    OUTPUT FORMAT (JSON ONLY):
    {
      "result": "real" | "fake" | "uncertain",
      "confidence": number (0-100),
      "sources": ["Source 1", "Source 2", ...],
      "analysis": "Detailed analysis paragraph. Cite specific discrepancies or confirmations. Use bullet points for clarity."
    }
    `;

    try {
      const completion = await vly.ai.completion({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1, // Low temperature for deterministic, factual responses
      });

      const responseContent = completion.data?.choices[0]?.message?.content;
      
      if (!responseContent) {
        throw new Error("Failed to get analysis from AI");
      }

      // Clean up response content (remove markdown code blocks if present)
      const cleanContent = responseContent.replace(/```/g, "").replace(/```/g, "").trim();

      // Extract JSON from response
      const jsonMatch = cleanContent.match(/(?:\{.*\})|(?:\[\{.*\}\].*?)/);
      if (!jsonMatch) {
        throw new Error("Failed to parse JSON from response");
      }

      const jsonResponse = JSON.parse(jsonMatch[0]);

      // Validate required fields
      if (!jsonResponse.result || !jsonResponse.analysis) {
        throw new Error("Missing required fields in response");
      }

      return jsonResponse;
    } catch (error) {
      console.error("Error in checkNews handler:", error);
      throw new Error("Failed to process news content");
    }
  },
});