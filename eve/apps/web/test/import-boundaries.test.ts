import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

function filesUnder(root: string): readonly string[] {
  if (!existsSync(root)) return [];

  return readdirSync(root).flatMap((entry) => {
    const path = join(root, entry);
    return statSync(path).isDirectory() ? filesUnder(path) : [path];
  });
}

describe("web app import boundaries", () => {
  it("does not import Eve app code from browser code", () => {
    const files = [
      ...filesUnder(join(process.cwd(), "app")),
      ...filesUnder(join(process.cwd(), "src")),
    ].filter((file) => /\.(ts|tsx)$/.test(file));
    const violations = files.filter((file) => {
      const source = readFileSync(file, "utf8");
      return /eve-agent|apps\/eve/.test(source);
    });

    expect(violations).toEqual([]);
  });

  it("loads initial specs through Eve standard sessions", () => {
    const pageSource = readFileSync(
      join(process.cwd(), "app", "page.tsx"),
      "utf8",
    );

    expect(pageSource).toMatch(/@mcpapp\/eve\/next/);
    expect(pageSource).not.toMatch(/clientContext|hostContext/);
  });

  it("keeps the Eve MCPApp host generic", () => {
    const genericHostFiles = [
      ...filesUnder(join(process.cwd(), "app")),
      ...filesUnder(join(process.cwd(), "src")),
    ].filter((file) => /\.(ts|tsx)$/.test(file));
    const domainTerms = /\b(tenantId|roles)\b/i;
    const violations = genericHostFiles.filter((file) =>
      domainTerms.test(readFileSync(file, "utf8")),
    );

    expect(violations).toEqual([]);
  });

  it("keeps the Eve MCPApp host as a thin renderer bridge", () => {
    const source = [...filesUnder(join(process.cwd(), "app"))]
      .filter((file) => /\.(ts|tsx)$/.test(file))
      .map((file) => readFileSync(file, "utf8"))
      .join("\n");

    expect(source).not.toMatch(/optimistic/);
    expect(source).not.toMatch(/connect=\{false\}/);
    expect(source).not.toMatch(/Render the initial|Handle the MCPApp/);
    expect(source).not.toMatch(/Eve error|agent\.error\.message/);
    expect(source).not.toMatch(/mcpAppEvent|eventClientContext/);
    expect(source).not.toMatch(/outputSchema|mcpAppSpecOutputSchema/);
    expect(source).not.toMatch(/initialEvents|dismissedError|onDismiss/);
  });

  it("keeps app rendering delegated to the packaged Eve adapter", () => {
    const pageSource = readFileSync(
      join(process.cwd(), "app", "page.tsx"),
      "utf8",
    );

    expect(pageSource.trim()).toBe(
      'export { EveMCPAppServer as default } from "@mcpapp/eve/next";',
    );
  });

  it("keeps Eve streams out of local server rendering", () => {
    const hostSource = [...filesUnder(join(process.cwd(), "app"))]
      .filter((file) => /\.(ts|tsx)$/.test(file))
      .map((file) => readFileSync(file, "utf8"))
      .join("\n");

    expect(hostSource).not.toMatch(/initialSession|@mcpapp\/react\/server/);
  });

  it("keeps the page as a shell without auth context wiring", () => {
    const source = readFileSync(join(process.cwd(), "app", "page.tsx"), "utf8");

    expect(source).not.toMatch(/clientContext|hostContext|principal|tenantId/);
  });

  it("keeps identity shape out of the web app", () => {
    const files = [
      ...filesUnder(join(process.cwd(), "app")),
      ...filesUnder(join(process.cwd(), "src")),
    ].filter((file) => /\.(ts|tsx)$/.test(file));
    const violations = files.filter((file) => {
      const source = readFileSync(file, "utf8");
      return /x-eve-principal|tenantId|roles|displayName/.test(source);
    });

    expect(violations).toEqual([]);
  });

  it("keeps local shell components deleted", () => {
    expect(filesUnder(join(process.cwd(), "src", "components"))).toEqual([]);
  });

  it("keeps the shell stylesheet-free", () => {
    const cssFiles = [
      ...filesUnder(join(process.cwd(), "app")),
      ...filesUnder(join(process.cwd(), "src", "components")),
    ].filter((file) => file.endsWith(".css"));

    expect(cssFiles).toEqual([]);
  });

  it("keeps shell components classless", () => {
    const source = [...filesUnder(join(process.cwd(), "app"))]
      .filter((file) => /\.(ts|tsx)$/.test(file))
      .map((file) => readFileSync(file, "utf8"))
      .join("\n");

    expect(source).not.toMatch(/\bclassName=/);
  });

  it("keeps component source and css in component folders", () => {
    const rootFiles = existsSync(join(process.cwd(), "src", "components"))
      ? readdirSync(join(process.cwd(), "src", "components"), {
          withFileTypes: true,
        })
          .filter((entry) => entry.isFile())
          .map((entry) => entry.name)
      : [];

    expect(rootFiles).toEqual([]);
  });

  it("does not use component folder barrel files", () => {
    const indexFiles = filesUnder(join(process.cwd(), "src", "components"))
      .filter((file) => file.endsWith("/index.ts"))
      .map((file) => file.replace(`${process.cwd()}/`, ""));

    expect(indexFiles).toEqual([]);
  });

  it("does not define Eve session routes in the web app", () => {
    expect(existsSync(join(process.cwd(), "proxy.ts"))).toBe(false);
  });
});
