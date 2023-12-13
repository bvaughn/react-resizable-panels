/* eslint-env node */
module.exports = {
  ignorePatterns: [".parcel-cache", "dist", "node_modules"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "../../tsconfig.json",
    tsconfigRootDir: __dirname,
  },
  plugins: ["@typescript-eslint", "no-restricted-imports", "react-hooks"],
  root: true,
  rules: {
    "@typescript-eslint/no-non-null-assertion": "error",
    "no-restricted-imports": [
      "error",
      {
        paths: ["react"],
      },
    ],
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": [
      "warn",
      {
        additionalHooks: "(useIsomorphicLayoutEffect)",
      },
    ],
  },
};
