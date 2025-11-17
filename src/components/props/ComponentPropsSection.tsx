import { Fragment } from "react/jsx-runtime";
import type { ComponentPropMetadata } from "../../types";
import { Code } from "../code/Code";
import { ComponentDescription } from "./ComponentDescription";
import { Box } from "../Box";

export function ComponentPropsSection({
  header,
  props
}: {
  header: string;
  props: ComponentPropMetadata[];
}) {
  if (props.length === 0) {
    return null;
  }

  return (
    <Box direction="column">
      <div className="text-lg font-bold">{header}</div>
      <dl>
        {props.map((prop) => (
          <Fragment key={prop.name}>
            <dt className="mt-6 pl-8 indent-[-1rem]">
              <Code
                className="bg-transparent inline-block p-0"
                html={prop.html}
              />
            </dt>
            <dd className="mt-2 pl-4 [&_code]:text-sky-300">
              <ComponentDescription sections={prop.description} />
            </dd>
          </Fragment>
        ))}
      </dl>
    </Box>
  );
}
