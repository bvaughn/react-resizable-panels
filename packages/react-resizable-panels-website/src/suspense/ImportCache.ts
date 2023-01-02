import createWakeable from "./createWakeable";
import {
  Record,
  STATUS_PENDING,
  STATUS_REJECTED,
  STATUS_RESOLVED,
} from "./types";

const records: Map<string, Record<any>> = new Map();

export function importModule(path: string): any {
  let record = records.get(path);
  if (record == null) {
    const wakeable = createWakeable<any>(path);

    record = {
      status: STATUS_PENDING,
      value: wakeable,
    };

    records.set(path, record);

    // Suspense caches fire and forget; errors will be handled within the fetch function.
    import(path).then(
      (module) => {
        record.value = module;
        record.status = STATUS_RESOLVED;

        wakeable.resolve(module);
      },
      (error) => {
        record.value = error;
        record.status = STATUS_REJECTED;

        wakeable.reject(error);
      }
    );
  }

  if (record!.status === STATUS_RESOLVED) {
    return record!.value;
  } else {
    throw record!.value;
  }
}
