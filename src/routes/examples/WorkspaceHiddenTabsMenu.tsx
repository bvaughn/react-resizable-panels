import { ChevronDownIcon } from "@heroicons/react/16/solid";
import { useRef } from "react";
import {
  type TabsetNode,
  useParentTabset,
  useTabListOverflow
} from "react-resizable-panels";

// <begin>

function HiddenTabsMenu({ tabset }: { tabset: TabsetNode }) {
  const hiddenTabIds = useTabListOverflow({ includePartiallyVisible: true });
  const parentTabset = useParentTabset();

  if (hiddenTabIds.length === 0) {
    return null;
  }

  const tabs = tabset.tabs.filter(({ id }) => hiddenTabIds.includes(id));

  return (
    <Menu
      items={tabs.map((tab) => ({
        label: tab.title ?? tab.id,
        onSelect: () => parentTabset?.selectTab(tab.id)
      }))}
      label={`+${tabs.length}`}
    />
  );
}

// <end>

// A popover is shown above the page, so it isn't clipped by the tabset
function Menu({
  items,
  label
}: {
  items: { label: string; onSelect: () => void }[];
  label: string;
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <button
        aria-label={`${items.length} more tabs`}
        className="flex items-center gap-0.5 shrink-0 px-1.5 py-0.5 mx-0.5 rounded text-xs text-ink/60 hover:text-ink hover:bg-ink/10 cursor-pointer focus-visible:outline-2! focus-visible:outline-sky-400!"
        onClick={() => {
          const button = buttonRef.current;
          const menu = menuRef.current;
          if (button && menu) {
            const rect = button.getBoundingClientRect();
            menu.style.top = `${rect.bottom + 4}px`;
            menu.style.right = `${window.innerWidth - rect.right}px`;
            menu.togglePopover();
          }
        }}
        ref={buttonRef}
      >
        {label}
        <ChevronDownIcon className="w-3 h-3" />
      </button>
      <div
        className="fixed left-auto bottom-auto m-0 p-1 rounded-md bg-slate-800 text-white text-sm shadow-lg"
        popover="auto"
        ref={menuRef}
        role="menu"
      >
        {items.map((item) => (
          <button
            className="flex w-full items-center px-2 py-1 rounded hover:bg-white/10 cursor-pointer whitespace-nowrap"
            key={item.label}
            onClick={() => {
              menuRef.current?.hidePopover();
              item.onSelect();
            }}
            role="menuitem"
          >
            {item.label}
          </button>
        ))}
      </div>
    </>
  );
}

export { HiddenTabsMenu };
