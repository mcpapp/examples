import { defineAgent, type AgentDefinition } from "eve";
import { defaultWebSpecSchema } from "@mcpapp/react/server";
import { MockLanguageModelV3, simulateReadableStream } from "ai/test";
import type { LanguageModel } from "ai";

type FixtureGenerateResult = Awaited<
  ReturnType<MockLanguageModelV3["doGenerate"]>
>;
type FixturePrompt =
  Parameters<MockLanguageModelV3["doGenerate"]>[0]["prompt"];
type FixtureStreamResult = Awaited<ReturnType<MockLanguageModelV3["doStream"]>>;
type FixtureStreamPart =
  FixtureStreamResult["stream"] extends ReadableStream<infer Part>
    ? Part
    : never;

const fixtureModelId = "eve-mcpapp-fixture";
const finalOutputToolName = "final_output";

const agent: AgentDefinition = defineAgent({
  model: resolveModel(),
  ...(useFixtureModel() ? { modelContextWindowTokens: 128_000 } : {}),
  outputSchema: defaultWebSpecSchema,
});

export default agent;

export function useFixtureModel(): boolean {
  return process.env.EVE_TEST_FIXTURE === "1";
}

export function resolveModel(): LanguageModel | string {
  if (useFixtureModel()) return createFixtureModel();
  return process.env.EVE_MODEL ?? "openai/gpt-5-nano";
}

function createFixtureModel(): LanguageModel {
  return new MockLanguageModelV3({
    modelId: fixtureModelId,
    provider: "eve-fixture",
    async doGenerate({ prompt }) {
      return fixtureResultForPrompt(prompt);
    },
    async doStream({ prompt }) {
      return fixtureStreamResult(fixtureResultForPrompt(prompt));
    },
  });
}

function fixtureResultForPrompt(prompt: FixturePrompt): FixtureGenerateResult {
  return hasToolResult(prompt, "hello_world")
    ? fixtureToolCallResult(finalOutputToolName, fixtureSpec())
    : fixtureToolCallResult("hello_world", {});
}

function hasToolResult(prompt: FixturePrompt, toolName: string): boolean {
  return prompt.some((message) => {
    if (message.role !== "tool" && message.role !== "assistant") return false;
    return message.content.some(
      (part) =>
        typeof part !== "string" &&
        part.type === "tool-result" &&
        part.toolName === toolName,
    );
  });
}

function fixtureStreamResult(
  result: FixtureGenerateResult,
): FixtureStreamResult {
  const toolCalls = result.content.filter((part) => part.type === "tool-call");
  const chunks: FixtureStreamPart[] = [
    {
      type: "stream-start",
      warnings: result.warnings,
    },
    ...(toolCalls as FixtureStreamPart[]),
    {
      finishReason: result.finishReason,
      type: "finish",
      usage: result.usage,
    },
  ];

  return {
    stream: simulateReadableStream({
      chunks,
      chunkDelayInMs: null,
      initialDelayInMs: null,
    }),
  };
}

function fixtureSpec(): unknown {
  return defaultWebSpecSchema.parse({
    root: "root",
    elements: {
      root: {
        type: "Stack",
        props: {
          gap: 3,
          padding: 4,
        },
        children: ["heading", "message"],
        visible: true,
      },
      heading: {
        type: "Heading",
        props: {
          level: "h1",
          text: "Hello world",
        },
        children: [],
        visible: true,
      },
      message: {
        type: "Text",
        props: {
          text: "This MCPApp spec was served by Eve.",
        },
        children: [],
        visible: true,
      },
    },
  });
}

function fixtureToolCallResult(
  toolName: string,
  input: unknown,
): FixtureGenerateResult {
  const inputJson = JSON.stringify(input);

  return {
    content: [
      {
        input: inputJson,
        toolCallId: `call_${toolName}`,
        toolName,
        type: "tool-call",
      },
    ],
    finishReason: { raw: undefined, unified: "tool-calls" },
    response: {
      id: `fixture_${toolName}`,
      modelId: fixtureModelId,
      timestamp: new Date("2026-06-18T00:00:00.000Z"),
    },
    usage: {
      inputTokens: {
        cacheRead: 0,
        cacheWrite: 0,
        noCache: 1,
        total: 1,
      },
      outputTokens: {
        reasoning: 0,
        text: inputJson.length,
        total: inputJson.length,
      },
    },
    warnings: [],
  };
}
