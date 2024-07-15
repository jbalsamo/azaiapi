import { beforeAll, describe, expect, test } from "bun:test";
import { config } from "dotenv";
import {
  submitQuestionDocuments,
  submitQuestionGeneralGPT,
} from "../src/libraries/azureHelpers.ts";

var configResult: any;

const questionPrompt = `
  ### Act
    Act as a medical professional, answering a patient's medical questions.
  ### User persona.
    Explain it like to an 8th grader and avoid jargon.
  ### Targeted Action
    Answer the user's medical question.
    Detect the language of the question and answer in that language.
    If question is not in a recognizable language, display the message 'You have used an unsupported language. Please choose a different language to see if its supported.', in each of these languages: English, Spanish, French, Mandarin, Japanese, Korean, and Hindi.
  ### Output Definition
    The answer should be in the language of the user's question.
    Explain domain specific terms if possible.
    Always add a disclaimer at the end: "Always see a medical professional for treatment and if this is an emergency, call 911."
  ### Mode
    Be polite and professional.
  ### Topic Whitelisting
    If the user's question is not related to medical, health, or psychological, answer "I can only answer health related questions".
    Topics allowed are health, diet, substance abuse, mental health, and mental illness.
`;

const question = "What is diabetic neuropathy?";

describe("test loading .env", () => {
  beforeAll(() => {
    configResult = config({ path: "/etc/gptbot/.env" });
  });
  test("loading .env", async () => {
    expect(configResult).toHaveProperty("parsed");
  });
  test("load urls", async () => {
    expect(configResult.parsed.AZ_BASE_URL).not.toBe("");
    expect(configResult.parsed.AZ_SEARCH_URL).not.toBe("");
  });
  test("load keys", async () => {
    expect(configResult.parsed.AZ_API_KEY).not.toBe("");
    expect(configResult.parsed.AZ_SEARCH_KEY).not.toBe("");
  });
});

describe("test doing a direct query", () => {
  beforeAll(() => {
    configResult = config({ path: "/etc/gptbot/.env" });
  });
  test("Returns an answer", async () => {
    expect(
      await submitQuestionGeneralGPT(question, questionPrompt)
    ).toHaveProperty("answer");
    expect(
      await submitQuestionGeneralGPT(question, questionPrompt)
    ).toHaveProperty("status", 200);
  });
  test("Doesn't return an error", async () => {
    expect(
      await submitQuestionGeneralGPT(question, questionPrompt)
    ).toHaveProperty("status");
  });
});

describe("test doing a document query", () => {
  beforeAll(() => {
    configResult = config({ path: "/etc/gptbot/.env" });
  });
  test("Returns an answer", async () => {
    expect(
      await submitQuestionDocuments(question, questionPrompt)
    ).toHaveProperty("choices");
    expect(
      await submitQuestionDocuments(question, questionPrompt)
    ).toHaveProperty("status", 200);
  });
  test("Doesn't return an error", async () => {
    expect(
      await submitQuestionDocuments(question, questionPrompt)
    ).toHaveProperty("status");
  });
});
