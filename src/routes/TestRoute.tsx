import { Fragment } from "react";
import { Box } from "../components/Box";
import { Callout } from "../components/Callout";
import { ExternalLink } from "../components/ExternalLink";
import type { Intent } from "../types";

export default function TestRoute() {
  return (
    <Box direction="column" gap={2}>
      {INTENTS.map((intent) => (
        <Fragment key={intent}>
          <Callout intent={intent}>
            Text and <ExternalLink href="#">link text</ExternalLink>.
          </Callout>
          <Callout intent={intent} minimal>
            Text and <ExternalLink href="#">link text</ExternalLink>.
          </Callout>
        </Fragment>
      ))}
    </Box>
  );
}

const INTENTS: Intent[] = ["none", "primary", "success", "warning", "danger"];
