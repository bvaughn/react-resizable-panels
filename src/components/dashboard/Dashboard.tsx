import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  HomeIcon,
  UsersIcon
} from "@heroicons/react/16/solid";
import { type ComponentType, type SVGProps, useState } from "react";
import { cn } from "react-lib-tools";
import { Cell } from "react-resizable-panels";
import { Avatar } from "../email/Avatar";
import { Grid } from "../styled-panels/Grid";
import { Gridline } from "../styled-panels/Gridline";

const CELL_CLASS_NAME = "bg-white/8 rounded-md";

const NAV: {
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
}[] = [
  { Icon: HomeIcon, title: "Overview" },
  { Icon: ChartBarIcon, title: "Reports" },
  { Icon: UsersIcon, title: "Customers" },
  { Icon: Cog6ToothIcon, title: "Settings" }
];

const STATS: {
  change: string;
  direction: "down" | "up";
  isGood: boolean;
  label: string;
  value: string;
}[] = [
  {
    change: "+12%",
    direction: "up",
    isGood: true,
    label: "Revenue",
    value: "$48.2K"
  },
  {
    change: "+4%",
    direction: "up",
    isGood: true,
    label: "Active users",
    value: "2,431"
  },
  {
    change: "+18 ms",
    direction: "up",
    isGood: false,
    label: "Response time",
    value: "320 ms"
  }
];

const ACTIVITY = [
  { name: "Maya Chen", text: "upgraded to the Team plan", time: "2m ago" },
  { name: "Jordan Patel", text: "exported the Q3 report", time: "18m ago" },
  { name: "Priya Raman", text: "invited 3 teammates", time: "1h ago" },
  { name: "Sam Okafor", text: "updated billing details", time: "3h ago" }
];

export function Dashboard() {
  const [isActivityCollapsed, setIsActivityCollapsed] = useState(false);

  return (
    <Grid
      className="h-96!"
      columns={[
        {
          collapsedSize: 44,
          collapsible: true,
          defaultSize: 160,
          minSize: 120
        },
        { minSize: "50%" }
      ]}
      onLayoutChange={({ rows }) => setIsActivityCollapsed(rows["1"] === 0)}
      rows={[{ minSize: 100 }, { collapsible: true, minSize: 80 }]}
    >
      <Cell
        className={cn(CELL_CLASS_NAME, "@container p-1")}
        column={0}
        row={0}
        rowSpan={2}
      >
        <div className="flex flex-col gap-0.5">
          {NAV.map(({ Icon, title }, index) => (
            <div
              className={cn(
                "flex flex-row items-center justify-center gap-2 px-2.5 py-1.5 rounded text-sm whitespace-nowrap overflow-hidden",
                index === 0 ? "bg-white/10 text-white" : "text-white/80"
              )}
              key={title}
              title={title}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {/* Labels are hidden when the sidebar is collapsed down to its icons */}
              <span className="flex-grow hidden @min-[6rem]:inline">
                {title}
              </span>
            </div>
          ))}
        </div>
      </Cell>
      <Cell
        className={cn(
          CELL_CLASS_NAME,
          "p-2",
          // A collapsed row has no height, but the gap after the row gridline remains;
          // extend this cell (and shift the gridline below) by one gap to fill it
          isActivityCollapsed && "-mb-2 sm:-mb-1"
        )}
        column={1}
        row={0}
      >
        <div className="flex flex-row flex-wrap gap-2">
          {STATS.map((stat) => (
            <StatTile key={stat.label} {...stat} />
          ))}
        </div>
      </Cell>
      <Cell className={CELL_CLASS_NAME} column={1} row={1}>
        {/* Padding is applied here (rather than to the Cell) so that nothing shows when it collapses */}
        <div className="flex flex-col gap-2 p-2">
          <div className="text-xs uppercase tracking-wide text-white/60">
            Recent activity
          </div>
          {ACTIVITY.map(({ name, text, time }) => (
            <div className="flex flex-row items-center gap-2" key={name}>
              <Avatar name={name} />
              <div className="grow truncate text-sm">
                <span className="font-semibold">{name}</span>{" "}
                <span className="text-white/80">{text}</span>
              </div>
              <div className="shrink-0 text-xs text-white/60">{time}</div>
            </div>
          ))}
        </div>
      </Cell>
      <Gridline column={1} type="column" />
      <Gridline
        className={
          isActivityCollapsed ? "translate-y-2 sm:translate-y-1" : undefined
        }
        column={1}
        row={1}
        type="row"
      />
    </Grid>
  );
}

function StatTile({
  change,
  direction,
  isGood,
  label,
  value
}: {
  change: string;
  direction: "down" | "up";
  isGood: boolean;
  label: string;
  value: string;
}) {
  const Icon = direction === "up" ? ArrowUpIcon : ArrowDownIcon;

  return (
    <div className="grow basis-28 flex flex-col gap-1 rounded-md bg-black/20 px-3 py-2">
      <div className="text-xs text-white/60 truncate">{label}</div>
      <div className="text-xl font-semibold">{value}</div>
      <div
        className={cn(
          "flex flex-row items-center gap-1 text-xs truncate",
          isGood ? "text-emerald-400" : "text-rose-400"
        )}
      >
        <Icon className="w-3 h-3 shrink-0" />
        {change} vs last month
      </div>
    </div>
  );
}
