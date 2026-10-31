import json from "../../public/generated/types/TabsetNode.json";
import {
  ModelType,
  type ModelTypeMetadata
} from "../components/workspace/ModelType";

export default function TabsetNodeRoute() {
  return <ModelType json={json as ModelTypeMetadata} />;
}
