import type { ImperativeHandleMethodMetadata } from "../../types";
import { Code } from "../code/Code";
import { DocsSection } from "../DocsSection";

export function ImperativeHandleMethod({
  method
}: {
  method: ImperativeHandleMethodMetadata;
}) {
  return (
    <>
      <dt className="mt-6 pl-8 indent-[-1rem]">
        <Code className="bg-transparent inline-block p-0" html={method.html} />
      </dt>
      <dd className="mt-2 pl-4 [&_code]:text-sky-300">
        <DocsSection sections={method.description} />
      </dd>
    </>
  );
}
