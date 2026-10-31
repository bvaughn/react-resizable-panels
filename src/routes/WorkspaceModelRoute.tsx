import json from "../../public/generated/types/WorkspaceModel.json";
import {
  ModelType,
  type ModelTypeMetadata
} from "../components/workspace/ModelType";

export default function WorkspaceModelRoute() {
  return <ModelType json={json as ModelTypeMetadata} />;
}
