import createWakeable from "./createWakeable";
import {
  Record,
  STATUS_PENDING,
  STATUS_REJECTED,
  STATUS_RESOLVED,
} from "./types";

type Module = any;

const records: Map<string, Record<Module>> = new Map();

export function importModule(path: string): Module {
  let record = records.get(path);
  if (record == null) {
    const wakeable = createWakeable<Module>(path);

    record = {
      status: STATUS_PENDING,
      value: wakeable,
    };

    records.set(path, record);

    // Suspense caches fire and forget; errors will be handled within the fetch function.
    importHelper(path, record);
  }

  if (record!.status === STATUS_RESOLVED) {
    return record!.value;
  } else {
    throw record!.value;
  }
}

async function importHelper(path: string, record: Record<Module>) {
  const wakeable = record.value;

  try {
    switch (path) {
      case "@codemirror/lang-css":
        record.value = await import("@codemirror/lang-css");
        break;
      case "@codemirror/lang-html":
        record.value = await import("@codemirror/lang-html");
        break;
      case "@codemirror/lang-javascript":
        record.value = await import("@codemirror/lang-javascript");
        break;
      case "@codemirror/lang-markdown":
        record.value = await import("@codemirror/lang-markdown");
        break;
    }
  } catch (error) {}

  if (record.value === wakeable) {
    record.value = Error(`Unknown module "${path}"`);
    record.status = STATUS_REJECTED;

    wakeable.reject(record.value);
  }

  record.status = STATUS_RESOLVED;

  wakeable.resolve(record.value);
}
