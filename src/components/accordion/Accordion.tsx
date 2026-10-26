import { ChevronLeftIcon } from "@heroicons/react/16/solid";
import { type PropsWithChildren, type ReactNode, useState } from "react";
import { cn } from "react-lib-tools";
import { Panel, useParentPanel } from "react-resizable-panels";
import { Group } from "../styled-panels/Group";

// Collapsed sections shrink down to the height of their header
const HEADER_HEIGHT = 28;

const SECTIONS: { content: ReactNode; id: string; title: string }[] = [
  {
    content: (
      <>
        <Item>App.tsx</Item>
        <Item>index.tsx</Item>
      </>
    ),
    id: "editors",
    title: "Open editors"
  },
  {
    content: (
      <>
        <Item>src</Item>
        <Item indent>components</Item>
        <Item indent>App.tsx</Item>
        <Item indent>index.tsx</Item>
        <Item>package.json</Item>
        <Item>README.md</Item>
      </>
    ),
    id: "folders",
    title: "Folders"
  },
  {
    content: (
      <>
        <Item>App</Item>
        <Item indent>Group</Item>
        <Item indent>Panel</Item>
      </>
    ),
    id: "outline",
    title: "Outline"
  },
  {
    content: (
      <>
        <Item>Edited App.tsx · 2m ago</Item>
        <Item>Created App.tsx · 1h ago</Item>
      </>
    ),
    id: "timeline",
    title: "Timeline"
  }
];

const DEFAULT_OPEN_IDS = ["editors", "folders", "outline"];

export function Accordion() {
  const [openIds, setOpenIds] = useState(DEFAULT_OPEN_IDS);

  return (
    <Group className="h-96!" orientation="vertical">
      {SECTIONS.map(({ content, id, title }) => (
        <AccordionSection
          // Keep at least one section open
          canCollapse={openIds.length > 1}
          defaultCollapsed={!DEFAULT_OPEN_IDS.includes(id)}
          id={id}
          key={id}
          onOpenChange={(isOpen) =>
            setOpenIds((prev) =>
              prev.includes(id) === isOpen
                ? prev
                : isOpen
                  ? [...prev, id]
                  : prev.filter((openId) => openId !== id)
            )
          }
          title={title}
        >
          {content}
        </AccordionSection>
      ))}
    </Group>
  );
}

function AccordionSection({
  canCollapse,
  children,
  defaultCollapsed,
  id,
  onOpenChange,
  title
}: PropsWithChildren<{
  canCollapse: boolean;
  defaultCollapsed: boolean;
  id: string;
  onOpenChange: (isOpen: boolean) => void;
  title: string;
}>) {
  const [isOpen, setIsOpen] = useState(!defaultCollapsed);

  return (
    <Panel
      className="flex flex-col bg-ink/8 rounded-md"
      collapsedSize={HEADER_HEIGHT}
      collapsible
      defaultSize={defaultCollapsed ? HEADER_HEIGHT : undefined}
      id={id}
      minSize={HEADER_HEIGHT * 2.5}
      onResize={(size) => {
        // Also tracks sections that are collapsed or expanded by dragging
        const nextIsOpen = size.inPixels > HEADER_HEIGHT;
        setIsOpen(nextIsOpen);
        onOpenChange(nextIsOpen);
      }}
    >
      <AccordionHeader
        canCollapse={canCollapse}
        isOpen={isOpen}
        title={title}
      />
      {isOpen && (
        <div className="grow min-h-0 py-1 overflow-auto">{children}</div>
      )}
    </Panel>
  );
}

function AccordionHeader({
  canCollapse,
  isOpen,
  title
}: {
  canCollapse: boolean;
  isOpen: boolean;
  title: string;
}) {
  const panel = useParentPanel();

  const toggle = () => {
    if (panel?.isCollapsed()) {
      panel.expand();
    } else if (canCollapse) {
      panel?.collapse();
    }
  };

  return (
    <button
      aria-expanded={isOpen}
      className={cn(
        "shrink-0 flex flex-row items-center gap-1 px-2 text-xs uppercase tracking-wide bg-ink/10 text-ink/60 cursor-pointer transition-colors! duration-250! hover:text-ink"
      )}
      onClick={toggle}
      style={{ height: HEADER_HEIGHT }}
    >
      <span className="grow truncate text-left">{title}</span>
      <ChevronLeftIcon
        className={cn(
          "w-4 h-4 shrink-0 transition-transform! duration-150",
          isOpen && "-rotate-90"
        )}
      />
    </button>
  );
}

function Item({
  children,
  indent = false
}: PropsWithChildren<{ indent?: boolean }>) {
  return (
    <div
      className="px-2 py-0.5 text-sm text-ink/80 truncate"
      style={{ paddingLeft: indent ? "1.75rem" : "1.25rem" }}
    >
      {children}
    </div>
  );
}
