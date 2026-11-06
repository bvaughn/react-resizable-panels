import { cn } from "react-lib-tools";
import type { Orientation, WorkspaceClassNames } from "react-resizable-panels";
import { Separator as StyledSeparator } from "../styled-panels/Separator";

// Styles shared by the docs' workspace demos

export function renderSeparator(orientation: Orientation) {
  return (
    <StyledSeparator
      // The icon is vertical, so it's rotated for separators between tabsets stacked vertically
      className={orientation === "vertical" ? "[&>svg]:rotate-90" : undefined}
      orientation={orientation}
      // Like the tabs, only shown for keyboard focus (and not after a separator is dragged)
      useFocusPseudoClasses
    />
  );
}

export const CLASS_NAMES: WorkspaceClassNames = {
  dragPreview:
    "-translate-x-1/2 -translate-y-[calc(100%+4px)] px-2 py-1 rounded bg-violet-700 text-white text-sm whitespace-nowrap shadow-lg",
  // "!" is needed to override the site's global "transition: none";
  // the indicator slides between regions and tabsets, and fades while the tab isn't over any tabset's panels
  dropIndicator:
    "bg-violet-400/25 border-2 border-violet-400 rounded-sm transition-[inset,opacity]! duration-250! motion-reduce:transition-none!",
  // At least as tall (or wide, for tabs on the left or right) as a tab, so an empty tabset's header is the same size
  header: cn(
    "flex shrink-0 items-center min-h-7 tabs-vertical:min-h-0 tabs-vertical:min-w-7 tabs-vertical:flex-col tabs-vertical:items-stretch text-sm",
    // Separated from the tab panels by a line, like the VS Code demo's tabs
    // (logical properties, since tabs placed on the "left" are at the start of the tabset: on the right, in a right-to-left layout)
    "border-ink/10 data-[tab-placement=top]:border-b data-[tab-placement=bottom]:border-t data-[tab-placement=left]:border-e data-[tab-placement=right]:border-s"
  ),
  // Spaced like the VS Code demo's panels
  split: "gap-2 sm:gap-1",
  tab: cn(
    "group/tab relative flex shrink-0 items-center justify-center cursor-pointer select-none whitespace-nowrap",
    "px-3 has-[button]:pe-1 py-1 tabs-vertical:px-1 tabs-vertical:py-3",
    "text-ink/60 hover:text-ink data-[tab-selected]:text-ink data-[tab-dragging]:opacity-50",
    // The selected tab is underlined along the edge facing its content, like the VS Code demo's tabs
    "data-[tab-selected]:shadow-[inset_0_-2px_0_var(--color-violet-400)]",
    "data-[tab-placement=bottom]:data-[tab-selected]:shadow-[inset_0_2px_0_var(--color-violet-400)]",
    // (box shadows don't have logical offsets, so they're flipped by --inline-sign; see tabset)
    "data-[tab-placement=left]:data-[tab-selected]:shadow-[inset_calc(-2px*var(--inline-sign))_0_0_var(--color-violet-400)]",
    "data-[tab-placement=right]:data-[tab-selected]:shadow-[inset_calc(2px*var(--inline-sign))_0_0_var(--color-violet-400)]",
    // "!" is needed to override the site's global "outline: none"
    "focus-visible:outline-2! focus-visible:-outline-offset-2! focus-visible:outline-sky-400!",
    // Lines showing where a dragged tab will be inserted
    "before:absolute before:hidden data-[drop-before]:before:block before:bg-violet-400 before:inset-y-0 before:start-0 before:w-0.5",
    "tabs-vertical:before:inset-x-0 tabs-vertical:before:bottom-auto tabs-vertical:before:w-auto tabs-vertical:before:h-0.5",
    "after:absolute after:hidden data-[drop-after]:after:block after:bg-violet-400 after:inset-y-0 after:end-0 after:w-0.5",
    "tabs-vertical:after:inset-x-0 tabs-vertical:after:top-auto tabs-vertical:after:w-auto tabs-vertical:after:h-0.5"
  ),
  tabContent: "h-full overflow-auto",
  tabList: cn(
    "flex flex-1 min-w-0 min-h-0 self-stretch overflow-auto tabs-vertical:flex-col",
    // Fade the edges that have more tabs beyond them (gradients don't have logical directions, so the angle is flipped by --inline-sign; see tabset)
    "[--fade-direction:calc(90deg*var(--inline-sign))] tabs-vertical:[--fade-direction:to_bottom] [--fade-start:0px] [--fade-end:0px] data-[overflow-start]:[--fade-start:24px] data-[overflow-end]:[--fade-end:24px]",
    "[mask-image:linear-gradient(var(--fade-direction),transparent,black_var(--fade-start),black_calc(100%_-_var(--fade-end)),transparent)]"
  ),
  tabPanels: "grow min-h-0 min-w-0",
  tabset: cn(
    "flex flex-col tabs-vertical:flex-row h-full w-full bg-ink/8 rounded-md overflow-hidden data-[tabset-dragging]:opacity-50",
    // 1 in left-to-right layouts and -1 in right-to-left ones, for styles that don't have logical equivalents (see tab and tabList)
    "[--inline-sign:1] rtl:[--inline-sign:-1]"
  ),
  toolbar:
    "flex tabs-vertical:flex-col tabs-vertical:items-center tabs-vertical:py-1"
};

// The default separators take up no space, so a gap on either side of one would look like two gaps;
// half as much gap leaves the same space between tabsets as there is on either side of a visible separator
export const CLASS_NAMES_DEFAULT_SEPARATORS: WorkspaceClassNames = {
  ...CLASS_NAMES,
  split: "gap-1 sm:gap-0.5"
};
