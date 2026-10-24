import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/16/solid";
import {
  type PropsWithChildren,
  type ReactNode,
  useRef,
  useState
} from "react";
import { cn } from "react-lib-tools";
import { Panel, useGroupRef } from "react-resizable-panels";
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

export function Accordion() {
  const elementRef = useRef<HTMLDivElement>(null);
  const ref = useGroupRef();
  const [openIds, setOpenIds] = useState(["editors", "folders", "outline"]);

  const toggle = (id: string) => {
    const ids = openIds.includes(id)
      ? openIds.filter((openId) => openId !== id)
      : [...openIds, id];

    // Keep at least one section open
    if (ids.length === 0) {
      return;
    }

    // Collapsed sections shrink to their headers; open sections share the rest evenly
    const height = elementRef.current?.offsetHeight ?? 0;
    const headerSize = height > 0 ? (HEADER_HEIGHT / height) * 100 : 0;
    const openSize =
      (100 - headerSize * (SECTIONS.length - ids.length)) / ids.length;

    ref.current?.setLayout(
      Object.fromEntries(
        SECTIONS.map(({ id }) => [id, ids.includes(id) ? openSize : headerSize])
      )
    );
  };

  return (
    <Group
      className="h-96!"
      elementRef={elementRef}
      groupRef={ref}
      orientation="vertical"
    >
      {SECTIONS.map(({ content, id, title }) => {
        const isOpen = openIds.includes(id);
        const Icon = isOpen ? ChevronDownIcon : ChevronRightIcon;

        return (
          <Panel
            className="flex flex-col bg-white/8 rounded-md"
            collapsedSize={HEADER_HEIGHT}
            collapsible
            defaultSize={isOpen ? undefined : HEADER_HEIGHT}
            id={id}
            key={id}
            minSize={HEADER_HEIGHT * 2.5}
            onResize={(size) => {
              // Also tracks sections that are collapsed or expanded by dragging
              const nextIsOpen = size.inPixels > HEADER_HEIGHT;
              setOpenIds((prev) =>
                prev.includes(id) === nextIsOpen
                  ? prev
                  : nextIsOpen
                    ? [...prev, id]
                    : prev.filter((openId) => openId !== id)
              );
            }}
          >
            <button
              aria-expanded={isOpen}
              className={cn(
                "shrink-0 flex flex-row items-center gap-1 px-1 text-xs uppercase tracking-wide text-white/60 cursor-pointer hover:text-white",
                isOpen && "border-b border-white/10"
              )}
              onClick={() => toggle(id)}
              style={{ height: HEADER_HEIGHT }}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{title}</span>
            </button>
            <div className="grow min-h-0 py-1 overflow-auto">{content}</div>
          </Panel>
        );
      })}
    </Group>
  );
}

function Item({
  children,
  indent = false
}: PropsWithChildren<{ indent?: boolean }>) {
  return (
    <div
      className="px-2 py-0.5 text-sm text-white/80 truncate"
      style={{ paddingLeft: indent ? "1.75rem" : "1.25rem" }}
    >
      {children}
    </div>
  );
}
