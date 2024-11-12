import globals from "globals";
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import prettierConfig from "eslint-config-prettier";

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ["**/*.{js,mjs,cjs,ts}"] },
  {
    ignores: [
      "coverage/",
      "lib/",
      "node_modules/",
      "tsconfig.vitest-temp.json",
    ],
  },
  { languageOptions: { globals: globals.browser } },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  prettierConfig,
  { rules: { "linebreak-style": ["error", "unix"] } },
];
