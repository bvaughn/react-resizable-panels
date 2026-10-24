import type { HTMLAttributes } from "react";
import { type DefaultPath, Link as ExternalLink } from "react-lib-tools";
import type { Path } from "../routes";

export function Link({
  anchor,
  to,
  ...rest
}: HTMLAttributes<HTMLSpanElement> & {
  anchor?: string;
  to: Path | DefaultPath;
}) {
  return <ExternalLink to={anchor ? `${to}#${anchor}` : to} {...rest} />;
}
