import json from "../../public/generated/types/SplitNode.json";
import {
  ModelType,
  type ModelTypeMetadata
} from "../components/workspace/ModelType";

export default function SplitNodeRoute() {
  return <ModelType json={json as ModelTypeMetadata} />;
}
