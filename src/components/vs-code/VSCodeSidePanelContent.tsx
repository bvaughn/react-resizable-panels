import {
  ChevronDownIcon,
  DocumentTextIcon,
  FolderOpenIcon
} from "@heroicons/react/16/solid";
import type { ReactNode } from "react";
import { cn } from "react-lib-tools";
import type { Tab } from "./VSCodeContext";

export function VSCodeSidePanelContent({ tab }: { tab: Tab }) {
  switch (tab) {
    case "debug":
      return <Debug />;
    case "folders":
      return <Folders />;
    case "search":
      return <Search />;
  }
}

function Folders() {
  return (
    <div className="flex flex-col">
      <Row depth={0} icon={<ChevronDownIcon className="w-4 h-4" />}>
        src
      </Row>
      <Row depth={1} icon={<FolderOpenIcon className="w-4 h-4" />}>
        components
      </Row>
      <File depth={2} name="Editor.tsx" />
      <File depth={2} name="FileTree.tsx" />
      <File depth={1} isActive name="App.tsx" />
      <File depth={1} name="index.tsx" />
      <File depth={0} name="package.json" />
      <File depth={0} name="README.md" />
    </div>
  );
}

function Search() {
  return (
    <div className="flex flex-col gap-2">
      <div className="rounded border border-ink/20 bg-black/5 dark:bg-black/20 px-2 py-1 text-sm truncate">
        Panel
      </div>
      <div className="text-xs text-ink/60 truncate">3 results in 1 file</div>
      <div className="flex flex-col">
        <File depth={0} name="App.tsx" />
        <Match before="import { Group, " match="Panel" />
        <Match before="<" match="Panel" />
        <Match before="<" match="Panel" />
      </div>
    </div>
  );
}

function Debug() {
  return (
    <div className="flex flex-col gap-2 text-sm">
      <div className="text-xs uppercase text-ink/60">Variables</div>
      <div className="flex flex-col font-mono text-xs">
        <Variable name="defaultSize" value="200" />
        <Variable name="minSize" value="100" />
        <Variable name="collapsible" value="true" />
      </div>
      <div className="text-xs uppercase text-ink/60">Call stack</div>
      <div className="flex flex-col font-mono text-xs">
        <div className="truncate">App</div>
        <div className="truncate text-ink/60">renderWithHooks</div>
      </div>
    </div>
  );
}

function Row({
  children,
  depth,
  icon,
  isActive = false
}: {
  children: ReactNode;
  depth: number;
  icon: ReactNode;
  isActive?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-row items-center gap-1 py-0.5 text-sm rounded",
        isActive ? "bg-ink/10" : "text-ink/80"
      )}
      style={{ paddingLeft: `${depth * 0.75}rem` }}
    >
      <span className="shrink-0 text-ink/60">{icon}</span>
      <span className="truncate">{children}</span>
    </div>
  );
}

function File({
  depth,
  isActive = false,
  name
}: {
  depth: number;
  isActive?: boolean;
  name: string;
}) {
  return (
    <Row
      depth={depth}
      icon={<DocumentTextIcon className="w-4 h-4" />}
      isActive={isActive}
    >
      {name}
    </Row>
  );
}

function Match({ before, match }: { before: string; match: string }) {
  return (
    <div className="pl-5 py-0.5 text-xs font-mono text-ink/60 truncate">
      {before}
      <span className="bg-violet-400/30 text-ink">{match}</span>
    </div>
  );
}

function Variable({ name, value }: { name: string; value: string }) {
  return (
    <div className="truncate">
      <span className="tok-propertyName">{name}</span>
      <span className="text-ink/60">: </span>
      <span className="tok-number">{value}</span>
    </div>
  );
}
