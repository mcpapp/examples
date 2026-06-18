import { describe, expect, it } from "vitest";
import { defaultWebSpecSchema } from "@mcpapp/react/server";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import helloWorldTool, {
  helloWorldSpec,
} from "../agent/tools/hello_world.js";
import { resolveModel, useFixtureModel } from "../agent/agent.js";

function filesUnder(root: string): readonly string[] {
  if (!existsSync(root)) return [];

  return readdirSync(root).flatMap((entry) => {
    const path = join(root, entry);
    return statSync(path).isDirectory() ? filesUnder(path) : [path];
  });
}

describe("hello world app", () => {
  it("builds a valid MCPApp spec", () => {
    const spec = helloWorldSpec();

    expect(defaultWebSpecSchema.parse(spec)).toStrictEqual(spec);
    expect(spec.root).toBe("root");
    expect(spec.elements.heading?.props.text).toBe("Hello world");
  });

  it("returns the hello world spec from the Eve tool", async () => {
    expect(await helloWorldTool.execute({}, {} as never)).toEqual(
      helloWorldSpec(),
    );
  });

  it("uses the configured model by default", () => {
    const previousFixtureMode = process.env.EVE_TEST_FIXTURE;
    const previousModel = process.env.EVE_MODEL;
    try {
      delete process.env.EVE_TEST_FIXTURE;
      process.env.EVE_MODEL = "openai/gpt-5-mini";
      expect(useFixtureModel()).toBe(false);
      expect(resolveModel()).toBe("openai/gpt-5-mini");
    } finally {
      if (previousFixtureMode === undefined) {
        delete process.env.EVE_TEST_FIXTURE;
      } else {
        process.env.EVE_TEST_FIXTURE = previousFixtureMode;
      }
      if (previousModel === undefined) {
        delete process.env.EVE_MODEL;
      } else {
        process.env.EVE_MODEL = previousModel;
      }
    }
  });

  it("can use a deterministic fixture model", () => {
    const previousFixtureMode = process.env.EVE_TEST_FIXTURE;
    try {
      process.env.EVE_TEST_FIXTURE = "1";
      expect(useFixtureModel()).toBe(true);
      expect(resolveModel()).toMatchObject({
        modelId: "eve-mcpapp-fixture",
        provider: "eve-fixture",
      });
    } finally {
      if (previousFixtureMode === undefined) {
        delete process.env.EVE_TEST_FIXTURE;
      } else {
        process.env.EVE_TEST_FIXTURE = previousFixtureMode;
      }
    }
  });

  it("keeps the deterministic fixture spec aligned with the hello world tool", async () => {
    const previousFixtureMode = process.env.EVE_TEST_FIXTURE;
    try {
      process.env.EVE_TEST_FIXTURE = "1";
      const model = resolveModel();
      if (typeof model === "string") throw new Error("Expected fixture model.");

      const result = await model.doGenerate({
        prompt: [
          {
            role: "tool",
            content: [
              {
                output: { type: "text", value: "ok" },
                toolCallId: "call_hello_world",
                toolName: "hello_world",
                type: "tool-result",
              },
            ],
          },
        ],
      } as never);
      const finalOutputCall = result.content.find(
        (part): part is {
          readonly input: string;
          readonly toolCallId: string;
          readonly toolName: string;
          readonly type: "tool-call";
        } =>
          part.type === "tool-call" &&
          "toolName" in part &&
          part.toolName === "final_output" &&
          "input" in part &&
          typeof part.input === "string",
      );

      expect(finalOutputCall?.type).toBe("tool-call");
      expect(JSON.parse(finalOutputCall?.input ?? "null")).toEqual(
        helloWorldSpec(),
      );
    } finally {
      if (previousFixtureMode === undefined) {
        delete process.env.EVE_TEST_FIXTURE;
      } else {
        process.env.EVE_TEST_FIXTURE = previousFixtureMode;
      }
    }
  });

  it("does not define custom Eve session routes", () => {
    const files = [
      ...filesUnder(join(process.cwd(), "agent")),
      ...filesUnder(join(process.cwd(), "src")),
    ].filter((file) => /\.ts$/.test(file));
    const violations = files.filter((file) => {
      const source = readFileSync(file, "utf8");
      return /defineChannel|POST\("\/eve\/v1\/session|GET\("\/eve\/v1\/session\/:sessionId\/stream/.test(
        source,
      );
    });

    expect(violations).toEqual([]);
  });
});
