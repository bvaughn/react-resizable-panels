import { useParams } from "react-router";
import { decode } from "../../tests/utils/serializer/decode";

export function Dynamic() {
  const { encoded } = useParams();

  return encoded ? decode(encoded) : null;
}
