import { Box } from "../components/Box";
import { Callout } from "../components/Callout";
import { ExternalLink } from "../components/ExternalLink";
import { Header } from "../components/Header";

export default function GettingStartedRoute() {
  return (
    <Box direction="column" gap={4}>
      <Header title="Getting started" />
      <div>
        <strong>react-resizable-panels</strong> is a set of components for
        building resizable panels like VS Code's "Folders" sidebar. It's used in
        production applications like the{" "}
        <ExternalLink href="https://github.com/replayio/devtools">
          Replay browser
        </ExternalLink>
        .
      </div>
      <div className="text-xl mt-4">Installation</div>
      <div>Begin by installing the library from NPM:</div>
      <code className="grow text-xs md:text-sm block text-left whitespace-pre-wrap rounded-md p-3 bg-black text-white!">
        npm install <span className="tok-keyword">react-resizable-panels</span>
      </code>
      <Callout intent="primary">
        TypeScript definitions are included within the published{" "}
        <code>dist</code> folder.
      </Callout>
      <div className="text-xl mt-4">Support</div>
      If you like this project there are several ways to support it:
      <ul className="pl-8">
        <li className="list-disc">
          <ExternalLink href="https://github.com/sponsors/bvaughn/">
            Become a GitHub sponsor
          </ExternalLink>
        </li>
        <li className="list-disc">
          <ExternalLink href="https://opencollective.com/react-resizable-panels#sponsor">
            Become an Open Collective sponsor
          </ExternalLink>
        </li>
        <li className="list-disc">
          or{" "}
          <ExternalLink href="http://givebrian.coffee/">
            buy me a coffee
          </ExternalLink>
        </li>
      </ul>
    </Box>
  );
}
