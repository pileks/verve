import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    testTimeout: 1000000,
    coverage: {
      enabled: true,
      all: true,
      provider: "istanbul",
      include: ["src/**/*.ts"],
      exclude: ["src/idls/"],
      reportOnFailure: true,
    },
    silent: false,
    disableConsoleIntercept: false,
    typecheck: {
      enabled: true,
      checker: "tsc",
      include: ["tests/**/*.ts"],
      only: false,
      tsconfig: "./tsconfig.json",
    },
  },
});
