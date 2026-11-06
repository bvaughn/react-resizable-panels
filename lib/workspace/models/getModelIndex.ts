import { indexModel, type ModelIndex } from "./indexModel";
import type { WorkspaceModel } from "../types";

const cache = new WeakMap<WorkspaceModel, ModelIndex>();

/**
 * Returns a model's index (see indexModel), which is only calculated once for each model,
 * since models aren't changed once they've been created (operations return new models; see copyModel).
 */
export function getModelIndex(model: WorkspaceModel): ModelIndex {
  let index = cache.get(model);
  if (!index) {
    index = indexModel(model);
    cache.set(model, index);
  }

  return index;
}
