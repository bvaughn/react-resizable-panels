import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";
import { useMemo } from "react";
import { repository } from "../../../package.json";
import type { ComponentMetadata } from "../../types";
import { processPropsJSON } from "../../utils/processPropsJSON";
import { Box } from "../Box";
import { DocsSection } from "../DocsSection";
import { ExternalLink } from "../ExternalLink";
import { Header } from "../Header";
import { ComponentPropsSection } from "./ComponentPropsSection";

export function ComponentProps({
  json,
  section
}: {
  json: ComponentMetadata;
  section: string;
}) {
  const { optionalProps, requiredProps } = useMemo(
    () => processPropsJSON(json),
    [json]
  );

  return (
    <Box direction="column" gap={4}>
      <Box align="center" direction="row" gap={2} wrap>
        <Header section={section} title={`${json.name} component`} />
        <ExternalLink
          className="text-sm text-emerald-300 hover:text-white"
          href={`${repository.url.replace(".git", "")}/blob/main/${json.filePath}`}
        >
          <ArrowTopRightOnSquareIcon className="inline-block size-4 fill-current" />
        </ExternalLink>
      </Box>
      <DocsSection sections={json.description} />
      <ComponentPropsSection header="Required props" props={requiredProps} />
      <ComponentPropsSection header="Optional props" props={optionalProps} />
    </Box>
  );
}
