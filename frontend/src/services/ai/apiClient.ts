import OpenAI from "openai";

const apiHost = typeof window !== "undefined"
  ? ""
  : (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000");

export const apiClient = new OpenAI({
  apiKey: "native-mode-placeholder",
  baseURL: `${apiHost}/api/v1`,
  dangerouslyAllowBrowser: true
});
