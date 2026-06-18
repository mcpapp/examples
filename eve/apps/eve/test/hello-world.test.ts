import { describe, expect, it } from "vitest";
import { defaultWebSpecSchema } from "@mcpapp/react/server";
import helloWorldTool, {
  helloWorldSpec,
} from "../agent/tools/hello_world.js";
import {
  fixtureStream,
  useFixtureEveChannel,
} from "./fixtures/eve-session-fixture.js";

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

  it("serves deterministic Eve session fixture streams for browser e2e", async () => {
    const previousFixtureMode = process.env.EVE_TEST_FIXTURE;
    try {
      process.env.EVE_TEST_FIXTURE = "1";
      expect(useFixtureEveChannel()).toBe(true);
    } finally {
      if (previousFixtureMode === undefined) {
        delete process.env.EVE_TEST_FIXTURE;
      } else {
        process.env.EVE_TEST_FIXTURE = previousFixtureMode;
      }
    }

    await expect(fixtureStream().text()).resolves.toContain("Hello world");
  });
});
