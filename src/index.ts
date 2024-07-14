import { config } from "dotenv";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { endTime, setMetric, startTime, timing } from "hono/timing";
import { submitQuestionGeneralGPT } from "./libraries/azureHelpers";

// Load environment variables
config({ path: "/etc/gptbot/.env" });

const summaryPrompt = `
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

const drupalUrl: string | undefined = process.env.DRUPAL_BASE_URL;
const azBaseUrl: string | undefined = process.env.AZ_BASE_URL;
const azApiKey: string | undefined = process.env.AZ_API_KEY;
const azSearchUrl: string | undefined = process.env.AZ_SEARCH_URL;
const azSearchKey: string | undefined = process.env.AZ_SEARCH_KEY;
const azIndexName: string | undefined = process.env.AZ_INDEX_NAME;
const azPMIndexName: string | undefined = process.env.AZ_PM_INDEX_NAME;
const azAnswersIndexName: string | undefined = "vet";

const uname = process.env.DRUPAL_USERNAME;
const pword = process.env.DRUPAL_PASSWORD;

const app = new Hono();

app.use(timing());
app.use(logger());

app.get("/", (c) => {
  return c.html(`
    <h1>Welcome to the CentsBot API</h1>
  `);
});

app.post("/api/test/simple", async (c) => {
  setMetric(c, "region", "us-east-1");
  startTime(c, "simple");
  const body = await c.req.json();
  if (!body) {
    return c.json({ error: "Missing query parameter 'question'" });
  } else {
    let question = body.question;
    let answer = await submitQuestionGeneralGPT(question, summaryPrompt);
    endTime(c, "simple");
    return c.json(answer);
  }
});

export default app;
