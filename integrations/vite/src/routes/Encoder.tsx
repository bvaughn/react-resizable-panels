import { useEffect, useState, type ReactElement } from "react";
import type { GroupProps } from "react-resizable-panels";
import { Group } from "react-resizable-panels";
import { Link } from "react-router";
import { useLocalStorage } from "../../../../src/hooks/useLocalStorage";
import { encode } from "../../tests/utils/serializer/encode";
import { assert } from "../utils/assert";
import { cn } from "../utils/cn";
import { parser } from "../utils/parser/parser";

export function Encoder() {
  const [code, setCode] = useLocalStorage("e2e:Encoder:code", "");
  const [encoded, setEncoded] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      try {
        const parsed = parser(code) ?? "";

        assert(typeof parsed === "object");
        assert(parsed.type === Group);

        setEncoded(encode(parsed as ReactElement<GroupProps>));
      } catch (error) {
        console.error(error);

        setEncoded("");
      }
    }, 250);

    return () => {
      clearTimeout(timeout);
    };
  }, [code]);

  return (
    <div className="flex flex-col p-2 gap-2">
      <textarea
        className={cn(
          "h-50 p-2 resize-none rounded-md font-mono text-xs",
          "border border-2 border-slate-800 focus:outline-none focus:border-sky-700"
        )}
        onChange={(event) => {
          setCode(event.currentTarget.value);
        }}
        value={code}
      />
      {encoded && <Link to={`/e2e/decoder/${encoded}`}>preview</Link>}
    </div>
  );
}
