import OpenAI from "openai";

const getVercelBackendUrl = () => {
  if (!process.env.VERCEL_URL) return "http://127.0.0.1:8000";
  const protocol = process.env.VERCEL_URL.includes("localhost") ? "http" : "https";
  return `${protocol}://${process.env.VERCEL_URL}/_/backend`;
};

const apiHost = typeof window !== "undefined"
  ? ""
  : (process.env.NEXT_PUBLIC_API_URL || 
     (process.env.VERCEL === "1" ? getVercelBackendUrl() : "http://127.0.0.1:8000"));

export const apiClient = new OpenAI({
  apiKey: "native-mode-placeholder",
  baseURL: `${apiHost}/api/v1`,
  dangerouslyAllowBrowser: true
});
