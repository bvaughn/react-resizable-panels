import { isDevelopment } from "./isDevelopment";

const warnedMessages = new Set<string>();

/**
 * Logs a warning about likely misuse; each distinct message is only logged once.
 *
 * ℹ️ Warnings are only logged in development builds.
 */
export function warnOnce(message: string) {
  if (isDevelopment() && !warnedMessages.has(message)) {
    warnedMessages.add(message);

    console.warn(`react-resizable-panels: ${message}`);
  }
}

export function resetWarnOnceForTest() {
  warnedMessages.clear();
}
