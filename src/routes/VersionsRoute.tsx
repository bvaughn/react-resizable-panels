import { Fragment } from "react/jsx-runtime";
import { Box, ExternalLink, Header } from "react-lib-tools";
import GlobeIcon from "../../public/svgs/globe.svg?react";
import TagsIcon from "../../public/svgs/tags.svg?react";

export default function VersionsRoute() {
  return (
    <Box direction="column" gap={2}>
      <Header title="Previous releases" />
      <div>Click below to view documentation for past releases.</div>
      {Object.entries(VERSIONS)
        .sort((a, b) => b[0].localeCompare(a[0]))
        .map(([major, minors]) => (
          <Fragment key={major}>
            <div className="text-lg mt-2">Version {major}</div>
            <ul className="pl-8">
              {Object.entries(minors)
                .sort((a, b) => b[0].localeCompare(a[0]))
                .map(([version, url]) => (
                  <VersionLink key={version} url={url} version={version} />
                ))}
            </ul>
          </Fragment>
        ))}
    </Box>
  );
}

const VERSIONS = {
  "4": {
    "4.0.8": "https://react-resizable-panels.now.sh/"
  },
  "3": {
    "3.0.6":
      "https://react-resizable-panels-au2wmqbbr-brian-vaughns-projects.vercel.app/"
  },
  "2": {
    "2.1.7":
      "https://react-resizable-panels-ca7gk2gh5-brian-vaughns-projects.vercel.app/",
    "2.0.23": ""
  },
  "1": {
    "1.0.10": ""
  }
};

function VersionLink({ url, version }: { url: string; version: string }) {
  return (
    <li className="list-disc">
      {version.split(".").slice(0, 2).join(".")}
      <span className="text-slate-400">.x</span>
      {url && (
        <ExternalLink
          aria-label={`Documentation for version ${version}`}
          className="ml-4"
          href={url}
        >
          <GlobeIcon className="inline w-4 h-4 text-teal-200" /> documentation
        </ExternalLink>
      )}
      <ExternalLink
        aria-label={`GitHub tag for version ${version}`}
        className="ml-4"
        href={`https://github.com/bvaughn/react-resizable-panels/tree/${version}`}
      >
        <TagsIcon className="inline w-4 h-4 text-teal-200" /> source code
      </ExternalLink>
    </li>
  );
}
