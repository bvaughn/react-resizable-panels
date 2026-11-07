import { copyStructure } from "./copyStructure";
import type { WorkspaceModel } from "../types";

// Operations on the model are immutable: they return a new model (or the original one if nothing changed).
// Each one copies the tree's structure (with this function) before changing it, but never copies (or changes) application data.
export function copyModel<Model extends WorkspaceModel>(model: Model): Model {
  const next = { ...model, root: copyStructure(model.root) };
  if (model.floating) {
    next.floating = model.floating.map(copyStructure);
  }

  return next;
}
