/**
 * Wraps an error caught from a user callback so it can be re-thrown later (even if the thrown value is falsy).
 */
export type CaughtError = { error: unknown };
