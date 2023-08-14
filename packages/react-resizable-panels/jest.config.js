/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironmentOptions: {
    customExportConditions: ["development"],
  },
  testMatch: ["**/*.test.{ts,tsx}"],
};
