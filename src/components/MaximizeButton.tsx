import {
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon
} from "@heroicons/react/20/solid";
import { DemoButton } from "./DemoButton";

/**
 * Maximize/restore toggle positioned in the top-right corner of a panel or cell;
 * the panel or cell should be styled with `relative` positioning.
 */
export function MaximizeButton({
  isMaximized,
  label,
  onClick
}: {
  isMaximized: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <DemoButton
      className="absolute top-1 right-1 p-1"
      onClick={onClick}
      title={isMaximized ? `Restore ${label}` : `Maximize ${label}`}
    >
      {isMaximized ? (
        <ArrowsPointingInIcon className="w-4 h-4" />
      ) : (
        <ArrowsPointingOutIcon className="w-4 h-4" />
      )}
    </DemoButton>
  );
}
