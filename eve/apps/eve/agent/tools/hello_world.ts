import { defineTool } from "eve/tools";
import { defaultWebSpecSchema } from "@mcpapp/react/server";
import type { Spec } from "@mcpapp/react";
import { z } from "zod";

export function helloWorldSpec(): Spec {
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

export default defineTool({
  description: "Return the hello world MCPApp spec.",
  inputSchema: z.object({}).passthrough(),
  outputSchema: defaultWebSpecSchema,
  execute() {
    return helloWorldSpec();
  },
});
