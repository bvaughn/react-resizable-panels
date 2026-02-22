import {
  FolderIcon,
  MagnifyingGlassIcon,
  PlayIcon
} from "@heroicons/react/20/solid";
import { Box } from "react-lib-tools";
import { VSCodeSidebarButton } from "./VSCodeSidebarButton";

export function VSCodeSidebar() {
  return (
    <Box className="p-1 rounded-tl bg-slate-800" direction="column" gap={2}>
      <VSCodeSidebarButton Icon={FolderIcon} tab="folders" title="Folders" />
      <VSCodeSidebarButton
        Icon={MagnifyingGlassIcon}
        tab="search"
        title="Search"
      />
      <VSCodeSidebarButton Icon={PlayIcon} tab="debug" title="Debug" />
    </Box>
  );
}
