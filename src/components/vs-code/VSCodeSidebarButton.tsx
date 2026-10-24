import {
  type ForwardRefExoticComponent,
  type RefAttributes,
  type SVGProps,
  useContext
} from "react";
import { cn, Tooltip } from "react-lib-tools";
import { type Tab, VSCodeContext } from "./VSCodeContext";

type Icon = ForwardRefExoticComponent<
  Omit<SVGProps<SVGSVGElement>, "ref"> & {
    title?: string;
    titleId?: string;
  } & RefAttributes<SVGSVGElement>
>;

export function VSCodeSidebarButton({
  Icon,
  tab,
  title
}: {
  Icon: Icon;
  tab: Tab;
  title: string;
}) {
  const { activeTab, changeTab, sidebarCollapsed, toggleSidebar } =
    useContext(VSCodeContext);

  const isActive = activeTab === tab && !sidebarCollapsed;

  return (
    <Tooltip content={title}>
      <button
        className={cn(
          "shrink-0 w-8 h-8 p-1 rounded cursor-pointer",
          isActive ? "text-white bg-white/10" : "text-white/60 hover:text-white"
        )}
        onClick={() => {
          if (activeTab === tab) {
            toggleSidebar();
          } else {
            changeTab(tab);

            if (sidebarCollapsed) {
              toggleSidebar();
            }
          }
        }}
      >
        <Icon className="w-6 h-6" />
      </button>
    </Tooltip>
  );
}
