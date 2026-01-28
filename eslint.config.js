import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";
import sonarJs from "eslint-plugin-sonarjs";

export default tseslint.config([
  globalIgnores([
    "dist",
    "docs",
    "public/generated",
    "integrations/next/.next"
  ]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs["recommended-latest"],
      reactRefresh.configs.vite,
      sonarJs.configs.recommended
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname
      }
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
      ],
      "@typescript-eslint/no-misused-spread": ["error", {}],
      "sonarjs/cognitive-complexity": "off",
      "sonarjs/deprecation": "off",
      "sonarjs/different-types-comparison": "off",
      "sonarjs/function-return-type": "off",
      "sonarjs/no-commented-code": "off",
      "sonarjs/no-dead-store": "off",
      "sonarjs/no-duplicated-branches": "off",
      "sonarjs/no-nested-conditional": "off",
      "sonarjs/no-nested-functions": "off",
      "sonarjs/no-small-switch": "off",
      "sonarjs/no-unused-vars": "off",
      "sonarjs/prefer-read-only-props": "off",
      "sonarjs/prefer-regexp-exec": "off",
      "sonarjs/slow-regex": "off",
      "sonarjs/todo-tag": "off",
      "sonarjs/use-type-alias": "off"
    }
  }
]);
