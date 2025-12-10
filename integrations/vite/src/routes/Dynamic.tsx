import { useParams } from "react-router";
import { decode } from "../../tests/utils/serializer/decode";

export function Dynamic() {
  const { json = "" } = useParams();

  return decode(json);
}
