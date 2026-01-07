import type { HTMLAttributes } from "react";
import { Link as ExternalLink, type DefaultPath } from "react-lib-tools";
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
