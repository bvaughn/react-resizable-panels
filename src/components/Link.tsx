import type { HTMLAttributes } from "react";
import { Link as ExternalLink, type DefaultPath } from "react-lib-tools";
import type { Path } from "../routes";

export function Link({
  to,
  ...rest
}: HTMLAttributes<HTMLSpanElement> & {
  to: Path | DefaultPath;
}) {
  return <ExternalLink to={to} {...rest} />;
}
