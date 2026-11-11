import {
  CalculatorIcon,
  InformationCircleIcon,
  PencilSquareIcon
} from "@heroicons/react/20/solid";
import { type ComponentType, type HTMLAttributes, useRef } from "react";
import { cn } from "react-lib-tools";
import { useWorkspaceRef, type WorkspaceModel } from "react-resizable-panels";
import { DemoButton } from "../DemoButton";
import { type DemoTab, DemoWorkspace } from "./WorkspaceDemo";

const WIDGET_TYPE = "application/x-docs-widget";

type Widget = {
  description: string;
  Icon: ComponentType<{ className?: string }>;
  kind: "about" | "counter" | "notes";
  title: string;
};

// Dragged with the imperative startExternalDrag method
const POINTER_WIDGETS: Widget[] = [
  {
    description: "Counts clicks",
    Icon: CalculatorIcon,
    kind: "counter",
    title: "Counter"
  },
  {
    description: "Jot things down",
    Icon: PencilSquareIcon,
    kind: "notes",
    title: "Notes"
  }
];

// Dragged with the browser's drag and drop (see the acceptExternalDrop prop)
const NATIVE_WIDGET: Widget = {
  description: "Native drag and drop",
  Icon: InformationCircleIcon,
  kind: "about",
  title: "About"
};

const defaultModel: WorkspaceModel<DemoTab> = {
  version: 1,
  // An empty workspace (an empty root tabset), which isn't split by the first widget dropped into it
  root: { type: "tabset", id: "widgets", tabs: [] }
};

function WidgetTile({
  className,
  widget: { description, Icon, title },
  ...rest
}: HTMLAttributes<HTMLDivElement> & { widget: Widget }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 p-2 rounded-md border border-ink/15 bg-ink/5 hover:bg-ink/10 hover:border-violet-400",
        "cursor-grab active:cursor-grabbing select-none touch-none",
        className
      )}
      {...rest}
    >
      <div className="flex shrink-0 items-center justify-center w-8 h-8 rounded bg-violet-400/20 text-violet-400">
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex flex-col min-w-0">
        <div className="text-sm">{title}</div>
        <div className="text-xs text-ink/60 truncate">{description}</div>
      </div>
    </div>
  );
}

/**
 * A library of widgets that can be dragged into the workspace:
 * with the imperative startExternalDrag method, or with the browser's drag and drop (see the acceptExternalDrop prop).
 */
export function ExternalDragDemo() {
  const workspaceRef = useWorkspaceRef<DemoTab>();

  // Every dragged widget becomes a new tab, so each one needs its own id
  const nextIdRef = useRef(0);
  const createId = (kind: string) => `${kind}-${++nextIdRef.current}`;

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <div className="flex flex-col gap-2 sm:w-52 shrink-0">
        <div className="flex flex-col gap-2 p-2 rounded-md border border-ink/15">
          <div className="text-xs font-bold uppercase tracking-wide text-ink/60">
            Widgets
          </div>
          {POINTER_WIDGETS.map((widget) => (
            <WidgetTile
              key={widget.kind}
              onPointerDown={(event) =>
                workspaceRef.current?.startExternalDrag(event, {
                  tab: {
                    data: { kind: widget.kind },
                    id: createId(widget.kind),
                    title: widget.title
                  }
                })
              }
              widget={widget}
            />
          ))}
          <WidgetTile
            draggable
            onDragStart={(event) => {
              event.dataTransfer.effectAllowed = "copy";
              event.dataTransfer.setData(WIDGET_TYPE, NATIVE_WIDGET.kind);
            }}
            widget={NATIVE_WIDGET}
          />
        </div>
        <DemoButton
          className="w-full"
          onClick={() => workspaceRef.current?.setModel(defaultModel)}
        >
          Reset layout
        </DemoButton>
      </div>
      <div className="flex-1 min-w-0">
        <DemoWorkspace
          acceptExternalDrop={{
            createTab: (dataTransfer) =>
              dataTransfer.getData(WIDGET_TYPE) === NATIVE_WIDGET.kind
                ? {
                    data: { kind: NATIVE_WIDGET.kind },
                    id: createId(NATIVE_WIDGET.kind),
                    title: NATIVE_WIDGET.title
                  }
                : null,
            types: [WIDGET_TYPE]
          }}
          // Tabs are only added by dragging widgets in
          canAddTabs={() => false}
          // The empty workspace's header is hidden until a widget is dropped
          className="h-70 [&:not(:has([data-tab]))_[data-tabset-header]]:hidden"
          defaultModel={defaultModel}
          renderEmptyTabset={() => (
            <div className="absolute inset-0 flex items-center justify-center text-ink/60 text-sm">
              Drag widgets here
            </div>
          )}
          workspaceRef={workspaceRef}
        />
      </div>
    </div>
  );
}
