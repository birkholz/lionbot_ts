// @ts-check
import js from "@eslint/js";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import prettier from "eslint-plugin-prettier";
// @ts-ignore
import importPlugin from "eslint-plugin-import";


/** @type {import('eslint').Linter.Config[]} */
export const baseConfig = [
  js.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
        ecmaVersion: "latest",
        sourceType: "module",
      },
      globals: {
        // Node.js globals
        process: "readonly",
        Buffer: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        console: "readonly",
        global: "readonly",
        module: "readonly",
        require: "readonly",
        // Bun-specific globals
        Bun: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      import: importPlugin,
      prettier: prettier,
    },
    settings: {
      "import/resolver": {
        "typescript-bun": {
          project: true,
          alwaysTryTypes: true,
        },
      },
      "import/core-modules": ["bun:test"],
    },
    rules: {
      // TypeScript rules
      ...tsPlugin.configs?.["strict"]?.rules,
      "@typescript-eslint/explicit-function-return-type": "error",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-misused-promises": "error",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/strict-boolean-expressions": "error",

      // Import rules
      "import/order": [
        "error",
        {
          groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
          "newlines-between": "always",
          alphabetize: { order: "asc" },
        },
      ],
      "import/no-unresolved": "error",
      "import/no-cycle": "error",

      // General rules
      "no-console": ["warn", { allow: ["warn", "error"] }],
      eqeqeq: "error",

      // Prettier rules
      "prettier/prettier": "error",
    },
  },
];
