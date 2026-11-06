const warnedMessages = new Set<string>();

/**
 * Logs a warning about likely misuse; each distinct message is only logged once.
 *
 * ⚠️ Callers should only call this in development builds,
 * by checking `process.env.NODE_ENV !== "production"` inline (rather than in a helper function),
 * so that bundlers can remove the check and its message from production builds.
 */
export function warnOnce(message: string) {
  if (!warnedMessages.has(message)) {
    warnedMessages.add(message);

    console.warn(`react-resizable-panels: ${message}`);
  }
}

export function resetWarnOnceForTest() {
  warnedMessages.clear();
}
