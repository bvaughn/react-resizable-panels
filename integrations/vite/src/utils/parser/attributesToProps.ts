import { transformAttributesAfterParsing } from "./transformAttributesAfterParsing";
import type { Props } from "./types";

export function attributesToProps(map: NamedNodeMap): Props {
  const props: Props = {};

  for (const current of Object.values(map)) {
    const { name: nameRaw, value } = current;

    const name = transformAttributesAfterParsing(nameRaw);

    if (value.startsWith("{") && value.endsWith("}")) {
      const stripped = value.substring(1, value.length - 1);
      const maybeNumber = parseFloat(stripped);

      props[name] = Number.isNaN(maybeNumber) ? stripped : maybeNumber;
    } else {
      props[name] = value;
    }
  }

  return props;
}
