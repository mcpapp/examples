import { defineAgent } from "eve";
import { defaultWebSpecSchema } from "@mcpapp/react/server";

const defaultModel = "openai/gpt-5-nano";

export default defineAgent({
  model: process.env.EVE_MODEL ?? defaultModel,
  outputSchema: defaultWebSpecSchema,
});
