/* Azure OpenAI Helpers
 * @module
 * @license MIT
 * @author Joseph Balsamo <https://github.com/josephbalsamo
 * version: 1.1.5
 */

/**
 * Imports
 */
import { AzureKeyCredential, OpenAIClient } from "@azure/openai";
import {
  SearchClient,
  AzureKeyCredential as SearchKeyCredential,
} from "@azure/search-documents";
import { config } from "dotenv";

/**
 * Load Environment Variables
 */
config({ path: "/etc/gptbot/.env" });

const azBaseUrl: string | undefined = process.env.AZ_BASE_URL || "";
const azApiKey: string | undefined = process.env.AZ_API_KEY || "";
const azSearchUrl: string | undefined = process.env.AZ_SEARCH_URL || "";
const azSearchKey: string | undefined = process.env.AZ_SEARCH_KEY || "";
const azIndexName: string | undefined = process.env.AZ_INDEX_NAME || "";
const azPMIndexName: string | undefined = process.env.AZ_PM_INDEX_NAME || "";
const azAnswersIndexName: string | undefined = "vet";

/*
 * Clients Setup
 */

const gptClient = new OpenAIClient(azBaseUrl, new AzureKeyCredential(azApiKey));

const searchDocsClient = new SearchClient(
  azSearchUrl,
  azIndexName,
  new AzureKeyCredential(azSearchKey)
);

const searchDocsClientPM = new SearchClient(
  azSearchUrl,
  azPMIndexName,
  new AzureKeyCredential(azSearchKey)
);

searchDocsClient.search("diabetes").then((documents) => {
  console.log(`Documents : ${JSON.stringify(documents)}`);
});

/**
 * Azure OpenAI Helpers
 */
const deploymentId = "bmi-centsbot-pilot";

/**
 * Function to submit a general question to GPT for processing.
 *
 * @param {any} question - The user's question to be processed.
 * @param {string} system - The system prompt to be used.
 * @return {Promise<any>} A promise that resolves to the processed answer.
 */
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
    const response: any = await gptClient.getChatCompletions(
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

/**
 * Asynchronously submits question for RAG processing.
 *
 * @param {any} question - The question to be processed.
 * @param {string} system - The system prompt to be used.
 * @return {Promise<any>} A promise that resolves to the processed answer.
 */
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
    const searchResults: any = await searchDocsClient.search(question);
    let relevantDocs = "";

    console.log(searchResults);

    for await (const result of searchResults) {
      console.log(result.results);
      if (result.results()) {
        relevantDocs += result.content + "\n";
      }
    }

    console.log(relevantDocs);
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
