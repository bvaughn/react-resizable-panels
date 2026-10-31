/**
 * Bundlers replace `process.env.NODE_ENV` with a string literal,
 * so code that only runs in development (e.g. warnings) is removed from production builds.
 *
 * ℹ️ `process` is not defined when the library is loaded without a bundler (e.g. directly in a browser);
 * development-only code is skipped in that case.
 */
export function isDevelopment() {
  try {
    return process.env.NODE_ENV !== "production";
  } catch {
    return false;
  }
}
