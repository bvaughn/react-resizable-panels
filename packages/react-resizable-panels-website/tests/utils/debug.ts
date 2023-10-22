import { Page } from "@playwright/test";

import { LogEntry, LogEntryType } from "../../src/routes/examples/types";

type LogEntryOrEntriesType = LogEntryType | LogEntryType[];

export async function clearLogEntries(
  page: Page,
  logEntryType: LogEntryOrEntriesType | null = null
) {
  await page.evaluate((logEntryType: LogEntryOrEntriesType | null) => {
    const div = document.getElementById("debug");
    if (div == null) {
      throw Error("Could not find debug div");
    }

    if (logEntryType !== null) {
      const textContent = div.textContent!;
      const logEntries = JSON.parse(textContent) as LogEntry[];
      const filteredEntries = logEntries.filter(({ type }) => {
        if (Array.isArray(logEntryType)) {
          return !logEntryType.includes(type);
        } else {
          return logEntryType !== type;
        }
      });
      div.textContent = JSON.stringify(filteredEntries);
    } else {
      div.textContent = "[]";
    }
  }, logEntryType);
}

export async function getLogEntries<Type extends LogEntry>(
  page: Page,
  logEntryType: LogEntryOrEntriesType | null = null
): Promise<Type[]> {
  const logEntries: Type[] = await page.evaluate(
    (logEntryType: LogEntryOrEntriesType | null) => {
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
    },
    logEntryType
  );
  return logEntries;
}
