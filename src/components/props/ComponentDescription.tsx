import type { Section } from "../../types";
import { Box } from "../Box";
import { Callout } from "../Callout";

export function ComponentDescription({ sections }: { sections: Section[] }) {
  return (
    <Box direction="column" gap={2}>
      {sections.map(({ content, intent }, index) => {
        if (intent) {
          return (
            <Callout key={index} html inline intent={intent} minimal>
              {content}
            </Callout>
          );
        }

        return (
          <div
            key={index}
            dangerouslySetInnerHTML={{
              __html: content
            }}
          ></div>
        );
      })}
    </Box>
  );
}
