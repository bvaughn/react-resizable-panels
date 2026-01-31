import { type PropsWithChildren } from "react";

export type IFrameProps = PropsWithChildren<{
  className?: string | undefined;
}>;

export function IFrame({ className }: IFrameProps) {
  return <iframe className={className} />;
}
