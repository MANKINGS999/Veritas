declare module '@vly-ai/integrations' {
  export class Vly {
    constructor(config: { apiKey: string });
    ai: {
      completion(params: {
        model: string;
        messages: Array<{ role: string; content: string }>;
        temperature?: number;
        maxTokens?: number;
      }): Promise<{
        success: boolean;
        data?: {
          choices: Array<{
            message: {
              content: string;
            };
          }>;
        };
        error?: string;
      }>;
    };
  }
}
