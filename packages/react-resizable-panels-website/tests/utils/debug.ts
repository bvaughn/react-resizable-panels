import { Page } from "@playwright/test";

import { LogEntry, LogEntryType } from "../../src/routes/examples/types";

export async function clearLogEntries(
  page: Page,
  logEntryType: LogEntryType | null = null
) {
  await page.evaluate((logEntryType) => {
    const div = document.getElementById("debug");
    if (div == null) {
      throw Error("Could not find debug div");
    }

    if (logEntryType !== null) {
      const textContent = div.textContent!;
      const logEntries = JSON.parse(textContent) as LogEntry[];
      const filteredEntries = logEntries.filter(
        ({ type }) => type !== (logEntryType as LogEntryType)
      );
      div.textContent = JSON.stringify(filteredEntries);
    } else {
      div.textContent = "[]";
    }
  }, logEntryType);
}

export async function getLogEntries<Type extends LogEntry>(
  page: Page,
  logEntryType: LogEntryType | LogEntryType[] | null = null
): Promise<Type[]> {
  const logEntries: Type[] = await page.evaluate((logEntryType) => {
    const div = document.getElementById("debug");
    if (div == null) {
      throw Error("Could not find debug div");
    }

    const textContent = div.textContent!;
    const logEntries = JSON.parse(textContent) as LogEntry[];

    return logEntries.filter(({ type }) => {
      if (logEntryType == null) {
        return true;
      } else if (Array.isArray(logEntryType)) {
        return logEntryType.includes(type);
      } else {
        return logEntryType === type;
      }
    }) as Type[];
  }, logEntryType);

  return logEntries;
}
