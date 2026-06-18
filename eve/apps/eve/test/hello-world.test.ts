import { describe, expect, it } from "vitest";
import { defaultWebSpecSchema } from "@mcpapp/react/server";
import helloWorldTool, {
  helloWorldSpec,
} from "../agent/tools/hello_world.js";
import {
  helloWorldStream,
  useModelBackedEveChannel,
} from "../src/hello-world-session.js";

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

  it("serves deterministic Eve session streams by default", async () => {
    const previousModelMode = process.env.EVE_USE_MODEL;
    try {
      delete process.env.EVE_USE_MODEL;
      expect(useModelBackedEveChannel()).toBe(false);
    } finally {
      if (previousModelMode === undefined) {
        delete process.env.EVE_USE_MODEL;
      } else {
        process.env.EVE_USE_MODEL = previousModelMode;
      }
    }

    await expect(helloWorldStream().text()).resolves.toContain("Hello world");
  });

  it("can opt into model-backed Eve sessions", () => {
    const previousModelMode = process.env.EVE_USE_MODEL;
    try {
      process.env.EVE_USE_MODEL = "1";
      expect(useModelBackedEveChannel()).toBe(true);
    } finally {
      if (previousModelMode === undefined) {
        delete process.env.EVE_USE_MODEL;
      } else {
        process.env.EVE_USE_MODEL = previousModelMode;
      }
    }
  });
});
