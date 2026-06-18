import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    exclude: [".eve/**", ".output/**", "dist/**", "node_modules/**"],
    globals: true,
    include: ["test/**/*.test.ts"],
  },
});
