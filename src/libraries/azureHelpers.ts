import { AzureKeyCredential, OpenAIClient } from "@azure/openai";
import { config } from "dotenv";

config({ path: "/etc/gptbot/.env" });

const azBaseUrl: string = process.env.AZ_BASE_URL || "";
const azApiKey: string = process.env.AZ_API_KEY || "";
const azSearchUrl: string = process.env.AZ_SEARCH_URL || "";
const azSearchKey: string = process.env.AZ_SEARCH_KEY || "";
const azIndexName: string = process.env.AZ_INDEX_NAME || "";
const azPMIndexName: string = process.env.AZ_PM_INDEX_NAME || "";
const azAnswersIndexName: string = "vet";

const client = new OpenAIClient(azBaseUrl, new AzureKeyCredential(azApiKey));
const deploymentId = "bmi-centsbot-pilot";

export const simpleAnswer = async (messages: any): Promise<any> => {
  const response: any = await client.getChatCompletions(
    deploymentId,
    messages,
    {
      maxTokens: 1000,
    }
  );
  return await response;
};
