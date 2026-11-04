import { DocsSection, HookSignature, HookSignatureItem } from "react-lib-tools";
import type { ModelTypeMetadata } from "./workspace/ModelType";

/**
 * The fields of a type documented by `compile:types`, with their descriptions.
 */
export function TypeFields({ json }: { json: ModelTypeMetadata }) {
  return (
    <HookSignature>
      {json.fields.map((field) => (
        <HookSignatureItem
          key={field.name}
          name={field.name}
          optional={field.optional}
          type={field.type}
        >
          <DocsSection sections={field.description} />
        </HookSignatureItem>
      ))}
    </HookSignature>
  );
}
