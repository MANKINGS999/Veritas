import { VlyIntegrations } from "@vly-ai/integrations";

export const vly = new VlyIntegrations({
  // Provide a fallback for build-time analysis where env vars might be missing
  deploymentToken: process.env.VLY_INTEGRATION_KEY || "dummy_token_for_build",
});