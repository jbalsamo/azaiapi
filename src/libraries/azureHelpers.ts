/* Azure OpenAI Helpers
 * @module
 * @license MIT
 * @author Joseph Balsamo <https://github.com/josephbalsamo
 * version: 1.0.2
 */

import { AzureKeyCredential, OpenAIClient } from "@azure/openai";
import { config } from "dotenv";

config({ path: "/etc/gptbot/.env" });

const azBaseUrl: string | undefined = process.env.AZ_BASE_URL || "";
const azApiKey: string | undefined = process.env.AZ_API_KEY || "";
const azSearchUrl: string | undefined = process.env.AZ_SEARCH_URL || "";
const azSearchKey: string | undefined = process.env.AZ_SEARCH_KEY || "";
const azIndexName: string | undefined = process.env.AZ_INDEX_NAME || "";
const azPMIndexName: string | undefined = process.env.AZ_PM_INDEX_NAME || "";
const azAnswersIndexName: string | undefined = "vet";

const client = new OpenAIClient(azBaseUrl, new AzureKeyCredential(azApiKey));

const deploymentId = "bmi-centsbot-pilot";

export const submitQuestionGeneralGPT = async (
  question: any,
  system: string
): Promise<any> => {
  let answer;
  let messages: any = [
    {
      "role": "system",
      "content": system,
    },
    {
      "role": "user",
      "content": question,
    },
  ];
  try {
    const response: any = await client.getChatCompletions(
      deploymentId,
      messages,
      {
        maxTokens: 1000,
      }
    );
    answer = {
      "status": 200,
      "answer": response.choices[0].message.content,
    };
    return answer;
  } catch (error: any) {
    answer = {
      "code": -1,
      "error": error.message,
      "answer":
        "There was an error processing your request. Please try again later.",
    };
  }
  console.log(answer);
  return await answer;
};

export const submitQuestionDocuments = async (
  question: any,
  system: string
): Promise<any> => {
  let answer;
  let messages: any = [
    {
      "role": "system",
      "content": system,
    },
    {
      "role": "user",
      "content": question,
    },
  ];
  try {
    const events = await client.streamChatCompletions(deploymentId, messages, {
      maxTokens: 1000,
      azureExtensionOptions: {
        extensions: [
          {
            "type": "AzureCognitiveSearch",
            "endpoint": azSearchUrl,
            "key": azSearchKey,
            "indexName": azIndexName,
          },
        ],
      },
    });
    let response = "";
    for await (const event of events) {
      for (const choice of event.choices) {
        const newText = choice.delta?.content;
        if (!!newText) {
          response += newText;
          // To see streaming results as they arrive, uncomment line below
          // console.log(newText);
        }
      }
    }
    console.log(response);
    return await response;
  } catch (error: any) {
    answer = {
      "code": -1,
      "error": error.message,
      "answer":
        "There was an error processing your request. Please try again later.",
    };
  }
  console.log(answer);
  return await answer;
};
