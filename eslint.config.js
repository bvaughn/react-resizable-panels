import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { globalIgnores } from "eslint/config";

export default tseslint.config([
  globalIgnores(["dist", "docs", "generated"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs["recommended-latest"],
      reactRefresh.configs.vite
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser
    },
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: ["*/../lib/*", "node:test"]
        }
      ],
      "no-restricted-properties": [
        "error",
        {
          property: "clientHeight",
          message:
            "Using clientHeight is restricted; prefer offsetHeight or getBoundingClientRect()"
        },
        {
          property: "clientWidth",
          message:
            "Using clientWidth is restricted; prefer offsetWidth or getBoundingClientRect()"
        }
      ],
      "react-hooks/exhaustive-deps": [
        "error",
        {
          additionalHooks: "useIsomorphicLayoutEffect"
        }
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "all",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true
        }
      ]
    }
  }
]);
