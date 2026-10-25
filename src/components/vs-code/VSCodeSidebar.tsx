import {
  FolderIcon,
  MagnifyingGlassIcon,
  PlayIcon
} from "@heroicons/react/20/solid";
import { Box } from "react-lib-tools";
import { VSCodeSidebarButton } from "./VSCodeSidebarButton";

export function VSCodeSidebar() {
  return (
    // Hidden on small screens to leave more room for the panels
    <Box
      className="hidden sm:flex p-1 rounded-md bg-ink/8"
      direction="column"
      gap={1}
    >
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
