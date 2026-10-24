import { type ReactNode, useState } from "react";
import { cn } from "react-lib-tools";
import { Panel } from "react-resizable-panels";
import { Group } from "../styled-panels/Group";
import { Separator } from "../styled-panels/Separator";

const METHODS = ["GET", "GET", "POST", "GET", "PUT", "GET", "DELETE"];
const PATHS = [
  "/api/users",
  "/api/projects",
  "/api/layouts",
  "/api/sessions",
  "/api/billing"
];
const STATUSES = [200, 200, 201, 200, 304, 200, 404, 200, 500];

const ROWS = Array.from({ length: 40 }, (_, index) => ({
  duration: 20 + ((index * 37) % 280),
  id: index,
  method: METHODS[index % METHODS.length],
  path: `${PATHS[index % PATHS.length]}/${1000 + ((index * 7919) % 9000)}`,
  status: STATUSES[index % STATUSES.length]
}));

/**
 * Request log and response panels in a group that defers re-rendering until a resize is finished.
 */
export function RequestLogDemo() {
  return (
    <Group className="h-72!" resizePreviewMode="separator">
      <DemoPanel minSize="25%" title="Requests">
        <RequestLog />
      </DemoPanel>
      <Separator />
      <DemoPanel minSize="25%" title="Response">
        <RequestDetails />
      </DemoPanel>
    </Group>
  );
}

/**
 * Panel with a title bar that shows its current size.
 */
export function DemoPanel({
  children,
  maxSize,
  minSize,
  title
}: {
  children: ReactNode;
  maxSize?: string;
  minSize: string;
  title: string;
}) {
  const [percentage, setPercentage] = useState(0);

  return (
    <Panel
      className="@container bg-white/8 rounded-md flex flex-col"
      maxSize={maxSize}
      minSize={minSize}
      onResize={(size) => setPercentage(size.asPercentage)}
    >
      {/* Narrow panels stack the title above the size */}
      <div className="shrink-0 flex flex-col @min-[9rem]:flex-row @min-[9rem]:items-center justify-between gap-x-2 px-2 py-1 border-b border-white/10">
        <div className="truncate">{title}</div>
        <div className="text-white/60 text-xs">{Math.round(percentage)}%</div>
      </div>
      <div className="grow min-h-0 overflow-auto">{children}</div>
    </Panel>
  );
}

// Less important columns are hidden when the panel is narrow
const NOT_NARROW = "hidden @min-[8rem]:table-cell";
const WIDE_ONLY = "hidden @min-[15rem]:table-cell";

export function RequestLog() {
  return (
    <table className="w-full text-sm">
      <thead className="text-white/60 text-xs text-left">
        <tr>
          <th className={cn("px-2 py-1 font-normal", WIDE_ONLY)}>Method</th>
          <th className="px-2 py-1 font-normal">Path</th>
          <th className={cn("px-2 py-1 font-normal text-right", NOT_NARROW)}>
            Status
          </th>
          <th className={cn("px-2 py-1 font-normal text-right", WIDE_ONLY)}>
            Time
          </th>
        </tr>
      </thead>
      <tbody>
        {ROWS.map(({ duration, id, method, path, status }) => (
          <tr className="border-t border-white/5" key={id}>
            <td
              className={cn(
                "px-2 py-0.5 text-white/60 text-xs whitespace-nowrap",
                WIDE_ONLY
              )}
            >
              {method}
            </td>
            {/* max-w-0 lets the path column shrink so that it truncates with an ellipsis */}
            <td className="px-2 py-0.5 w-full max-w-0 truncate">{path}</td>
            <td
              className={cn(
                "px-2 py-0.5 text-right whitespace-nowrap",
                NOT_NARROW,
                status >= 500
                  ? "text-rose-400"
                  : status >= 400
                    ? "text-amber-400"
                    : "text-white/60"
              )}
            >
              {status}
            </td>
            <td
              className={cn(
                "px-2 py-0.5 text-right text-white/60 tabular-nums whitespace-nowrap",
                WIDE_ONLY
              )}
            >
              {duration}ms
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function RequestDetails() {
  return (
    <pre className="p-2 text-xs font-mono">
      <span className="text-white/60">GET {ROWS[0].path}</span>
      {"\n\n"}
      {JSON.stringify(
        {
          id: 1000,
          name: "Maya Chen",
          plan: "team",
          layout: { sidebar: 25, editor: 50, preview: 25 }
        },
        null,
        2
      )}
    </pre>
  );
}

const HEADERS = [
  ["cache-control", "private, max-age=0, must-revalidate"],
  ["content-type", "application/json; charset=utf-8"],
  ["content-length", "142"],
  ["date", "Fri, 24 Oct 2026 16:42:07 GMT"],
  ["etag", 'W/"8e-1f2a9c4b7d3e"'],
  ["server-timing", "db;dur=12, render;dur=4"],
  ["vary", "Accept-Encoding, Authorization"],
  ["x-request-id", "4f7c2a91-d2b8-4e0a-9c55-6a1b3e8f0d27"]
];

/**
 * Fake response headers for the first request in the log.
 */
export function RequestHeaders() {
  return (
    <div className="flex flex-col text-sm">
      {HEADERS.map(([name, value]) => (
        <div
          className="px-2 py-0.5 border-t border-white/5 first:border-t-0"
          key={name}
        >
          <div className="text-white/60 text-xs truncate">{name}</div>
          <div className="truncate">{value}</div>
        </div>
      ))}
    </div>
  );
}
