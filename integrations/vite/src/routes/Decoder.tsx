import { useMemo } from "react";
import { useParams } from "react-router";
import { decode } from "../../tests/utils/serializer/decode";

export function Decoder() {
  const { encoded } = useParams();

  const children = useMemo(() => (encoded ? decode(encoded) : null), [encoded]);

  console.group("Decoder");
  console.log(encoded);
  console.log(children);
  console.groupEnd();

  return children;
}
