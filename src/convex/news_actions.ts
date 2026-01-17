import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Simple rule-based news verification
function analyzeNewsContent(content: string) {
  const lowerContent = content.toLowerCase().trim();

  // Fake news indicators
  const fakeIndicators = [
    'shocking', 'unbelievable', 'miracle cure', 'doctors hate', 'one weird trick',
    'you won\'t believe', 'conspiracy', 'cover up', 'they don\'t want you to know',
    'secret revealed', 'banned by', 'government hiding', 'big pharma', 'illuminati'
  ];

  // Clickbait patterns
  const clickbaitPatterns = [
    'number 7 will shock you', 'what happened next', 'the reason why',
    'this is why', 'you need to see', 'gone wrong', 'goes viral'
  ];

  // Reliable source mentions
  const reliableSources = [
    'reuters', 'associated press', 'ap news', 'bbc', 'cnn', 'nyt', 'new york times',
    'washington post', 'the guardian', 'nature', 'science', 'who', 'un', 'government',
    'official', 'peer-reviewed', 'study published', 'research shows'
  ];

  // Medical/scientific red flags
  const scienceRedFlags = [
    'cure for cancer', 'cure for all', 'scientists discover cure', 'breakthrough overnight',
    'instant cure', 'miracle treatment', 'doctors amazed', 'lose weight fast'
  ];

  // Celebrity death hoaxes
  const celebrityDeathPatterns = [
    'is dead', 'has died', 'passes away', 'found dead', 'tragic death', 'died suddenly'
  ];

  let fakeScore = 0;
  let realScore = 0;
  let flags: string[] = [];

  // Check for fake indicators
  fakeIndicators.forEach(indicator => {
    if (lowerContent.includes(indicator)) {
      fakeScore += 15;
      flags.push(`Sensational language detected: "${indicator}"`);
    }
  });

  // Check for clickbait
  clickbaitPatterns.forEach(pattern => {
    if (lowerContent.includes(pattern)) {
      fakeScore += 10;
      flags.push(`Clickbait pattern: "${pattern}"`);
    }
  });

  // Check for science red flags
  scienceRedFlags.forEach(flag => {
    if (lowerContent.includes(flag)) {
      fakeScore += 20;
      flags.push(`Suspicious medical claim: "${flag}"`);
    }
  });

  // Check for celebrity death hoax patterns
  let hasCelebrityDeath = false;
  celebrityDeathPatterns.forEach(pattern => {
    if (lowerContent.includes(pattern)) {
      hasCelebrityDeath = true;
    }
  });

  if (hasCelebrityDeath && !reliableSources.some(source => lowerContent.includes(source))) {
    fakeScore += 25;
    flags.push('Unverified celebrity death claim');
  }

  // Check for reliable sources
  reliableSources.forEach(source => {
    if (lowerContent.includes(source)) {
      realScore += 15;
      flags.push(`Reliable source mentioned: ${source}`);
    }
  });

  // URL analysis
  if (content.startsWith('http')) {
    try {
      const url = new URL(content);
      const domain = url.hostname.toLowerCase();

      // Check for suspicious domains
      if (domain.includes('fake') || domain.includes('satire') || domain.includes('parody')) {
        fakeScore += 30;
        flags.push('Suspicious domain name');
      }

      // Check for typosquatting
      const trustedDomains = ['bbc.com', 'cnn.com', 'nytimes.com', 'reuters.com', 'theguardian.com'];
      trustedDomains.forEach(trusted => {
        if (domain.includes(trusted.replace('.com', '')) && !domain.includes(trusted)) {
          fakeScore += 25;
          flags.push('Possible typosquatting of trusted domain');
        }
      });

      // Trusted domains
      if (trustedDomains.some(td => domain.includes(td))) {
        realScore += 20;
        flags.push('Trusted domain');
      }
    } catch (e) {
      flags.push('Invalid URL format');
    }
  }

  // Check for balanced writing
  const hasQuotes = content.includes('"') || content.includes("'");
  const hasNumbers = /\d+/.test(content);
  const hasSourceAttribution = lowerContent.includes('according to') ||
                               lowerContent.includes('reported by') ||
                               lowerContent.includes('source:');

  if (hasQuotes && hasSourceAttribution) {
    realScore += 10;
    flags.push('Contains quotes and source attribution');
  }

  if (hasNumbers && hasSourceAttribution) {
    realScore += 5;
    flags.push('Contains specific data with sources');
  }

  // All caps detection (common in fake news)
  const upperCaseWords = content.match(/[A-Z]{4,}/g);
  if (upperCaseWords && upperCaseWords.length > 3) {
    fakeScore += 10;
    flags.push('Excessive use of capital letters');
  }

  // Multiple exclamation marks
  const exclamationCount = (content.match(/!/g) || []).length;
  if (exclamationCount > 3) {
    fakeScore += 10;
    flags.push('Excessive exclamation marks');
  }

  // Calculate final score
  const netScore = realScore - fakeScore;
  let result: "real" | "fake" | "uncertain";
  let confidence: number;
  let sources: string[] = [];

  if (netScore > 20) {
    result = "real";
    confidence = Math.min(85, 60 + netScore);
    sources = ["Pattern Analysis", "Source Verification"];
  } else if (netScore < -20) {
    result = "fake";
    confidence = Math.min(90, 60 + Math.abs(netScore));
    sources = ["Pattern Analysis", "Red Flag Detection"];
  } else {
    result = "uncertain";
    confidence = 50;
    sources = ["Pattern Analysis"];
  }

  const analysis = flags.length > 0
    ? `Analysis:\n${flags.map(f => `• ${f}`).join('\n')}\n\nVerdict: This content ${result === 'fake' ? 'shows multiple indicators of misinformation' : result === 'real' ? 'appears credible based on source indicators' : 'requires further verification from trusted sources'}.`
    : `Basic analysis complete. ${result === 'uncertain' ? 'Unable to determine credibility with certainty. Cross-check with trusted news sources.' : ''}`;

  return { result, confidence, sources, analysis };
}

export const checkNews = mutation({
  args: {
    content: v.string(),
    type: v.union(v.literal("url"), v.literal("text")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    // Use rule-based analysis
    const analysisResult = analyzeNewsContent(args.content);

    // Save to database
    await ctx.db.insert("news_checks", {
      userId,
      content: args.content,
      type: args.type,
      result: analysisResult.result,
      confidence: analysisResult.confidence,
      sources: analysisResult.sources,
      analysis: analysisResult.analysis,
    });

    return analysisResult;
  },
});