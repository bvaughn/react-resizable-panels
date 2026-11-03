import { EllipsisHorizontalIcon } from "@heroicons/react/16/solid";
import { useRef, useState, type ReactNode } from "react";
import { useTabListFreeSpace } from "react-resizable-panels";

type ToolbarItem = { icon: ReactNode; label: string; onClick: () => void };

// <begin>

// Each item (and the "…" button) is a fixed-size icon button
const ITEM_SIZE = 28;

function getToolbarSize(visibleCount: number, itemCount: number) {
  const hasMenu = visibleCount < itemCount;
  return (visibleCount + (hasMenu ? 1 : 0)) * ITEM_SIZE;
}

function OverflowToolbar({ items }: { items: ToolbarItem[] }) {
  const freeSpace = useTabListFreeSpace();

  // Items are placed when the free space changes; it was measured with the toolbar as it's currently shown,
  // so the toolbar can use the free space plus its current size
  // (and showing or hiding items, which changes the free space by the same amount, doesn't change how many fit)
  const [placement, setPlacement] = useState({
    freeSpace: undefined as number | undefined,
    visibleCount: items.length
  });
  if (freeSpace !== undefined && freeSpace !== placement.freeSpace) {
    const available =
      freeSpace + getToolbarSize(placement.visibleCount, items.length);

    let visibleCount = items.length;
    while (
      visibleCount > 0 &&
      getToolbarSize(visibleCount, items.length) > available
    ) {
      visibleCount--;
    }

    setPlacement({ freeSpace, visibleCount });
  }

  const { visibleCount } = placement;

  return (
    <>
      {items.slice(0, visibleCount).map((item) => (
        <ToolbarButton key={item.label} item={item} />
      ))}
      {visibleCount < items.length && (
        <OverflowMenu items={items.slice(visibleCount)} />
      )}
    </>
  );
}

// <end>

function ToolbarButton({ item }: { item: ToolbarItem }) {
  return (
    <button
      aria-label={item.label}
      className="flex items-center justify-center shrink-0 rounded text-ink/60 hover:text-ink hover:bg-ink/10 cursor-pointer focus-visible:outline-2! focus-visible:outline-sky-400!"
      onClick={item.onClick}
      style={{ height: ITEM_SIZE, width: ITEM_SIZE }}
      title={item.label}
    >
      {item.icon}
    </button>
  );
}

// A popover is shown above the page, so it isn't clipped by the tabset
function OverflowMenu({ items }: { items: ToolbarItem[] }) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <button
        aria-label="More actions"
        className="flex items-center justify-center shrink-0 rounded text-ink/60 hover:text-ink hover:bg-ink/10 cursor-pointer focus-visible:outline-2! focus-visible:outline-sky-400!"
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
        style={{ height: ITEM_SIZE, width: ITEM_SIZE }}
        title="More actions"
      >
        <EllipsisHorizontalIcon className="w-4 h-4" />
      </button>
      <div
        className="fixed left-auto bottom-auto m-0 p-1 rounded-md bg-slate-800 text-white text-sm shadow-lg"
        popover="auto"
        ref={menuRef}
        role="menu"
      >
        {items.map((item) => (
          <button
            className="flex w-full items-center gap-2 px-2 py-1 rounded hover:bg-white/10 cursor-pointer whitespace-nowrap"
            key={item.label}
            onClick={() => {
              menuRef.current?.hidePopover();
              item.onClick();
            }}
            role="menuitem"
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>
    </>
  );
}

export { OverflowToolbar, type ToolbarItem };
