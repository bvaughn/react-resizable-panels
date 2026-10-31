import json from "../../public/generated/types/TabNode.json";
import {
  ModelType,
  type ModelTypeMetadata
} from "../components/workspace/ModelType";

export default function TabNodeRoute() {
  return <ModelType json={json as ModelTypeMetadata} />;
}
