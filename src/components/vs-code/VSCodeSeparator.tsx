import { Separator } from "react-resizable-panels";

export function VSCodeSeparator() {
  return (
    <Separator className="w-[2px] transition transition-colors! duration-300 [&[data-separator='hover']]:bg-slate-300 [&[data-separator='active']]:bg-slate-300" />
  );
}
