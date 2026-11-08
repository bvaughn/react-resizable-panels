import {
  type ForwardRefExoticComponent,
  type RefAttributes,
  type SVGProps,
  useContext
} from "react";
import { cn } from "react-lib-tools";
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
    <button
      className={cn(
        "shrink-0 w-8 h-8 p-1 rounded cursor-pointer",
        isActive ? "text-ink bg-ink/10" : "text-ink/60 hover:text-ink"
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
      title={title}
    >
      <Icon className="w-6 h-6" />
    </button>
  );
}
