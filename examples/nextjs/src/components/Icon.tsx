import { SVGProps } from "react";
import styles from "./Icon.module.css";

export type IconType =
  | "chevron-down"
  | "close"
  | "collapse"
  | "css"
  | "dialog"
  | "drag"
  | "expand"
  | "files"
  | "horizontal-collapse"
  | "horizontal-expand"
  | "html"
  | "loading"
  | "markdown"
  | "resize"
  | "resize-horizontal"
  | "resize-vertical"
  | "search"
  | "typescript"
  | "warning";

export default function Icon({
  className = "",
  type,
  ...rest
}: SVGProps<SVGSVGElement> & {
  className?: string;
  type: IconType;
}) {
  let path = "";
  switch (type) {
    case "chevron-down":
      path = "M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z";
      break;
    case "close":
      path =
        "M20 6.91L17.09 4L12 9.09L6.91 4L4 6.91L9.09 12L4 17.09L6.91 20L12 14.91L17.09 20L20 17.09L14.91 12L20 6.91Z";
      break;
    case "collapse":
      path =
        "M19.5,3.09L15,7.59V4H13V11H20V9H16.41L20.91,4.5L19.5,3.09M4,13V15H7.59L3.09,19.5L4.5,20.91L9,16.41V20H11V13H4Z";
      break;
    case "css":
      path =
        "M5,3L4.35,6.34H17.94L17.5,8.5H3.92L3.26,11.83H16.85L16.09,15.64L10.61,17.45L5.86,15.64L6.19,14H2.85L2.06,18L9.91,21L18.96,18L20.16,11.97L20.4,10.76L21.94,3H5Z";
      break;
    case "dialog":
      path =
        "M18 18V20H4A2 2 0 0 1 2 18V8H4V18M22 6V14A2 2 0 0 1 20 16H8A2 2 0 0 1 6 14V6A2 2 0 0 1 8 4H20A2 2 0 0 1 22 6M20 6H8V14H20Z";
      break;
    case "drag":
      path =
        "M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2m-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2m0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2m6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2m0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2m0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2";
      break;
    case "expand":
      path =
        "M10,21V19H6.41L10.91,14.5L9.5,13.09L5,17.59V14H3V21H10M14.5,10.91L19,6.41V10H21V3H14V5H17.59L13.09,9.5L14.5,10.91Z";
      break;
    case "files":
      path =
        "M15,7H20.5L15,1.5V7M8,0H16L22,6V18A2,2 0 0,1 20,20H8C6.89,20 6,19.1 6,18V2A2,2 0 0,1 8,0M4,4V22H20V24H4A2,2 0 0,1 2,22V4H4Z";
      break;
    case "horizontal-collapse":
      path =
        "M13,20V4H15.03V20H13M10,20V4H12.03V20H10M5,8L9.03,12L5,16V13H2V11H5V8M20,16L16,12L20,8V11H23V13H20V16Z";
      break;
    case "horizontal-expand":
      path =
        "M13,4V20H11V4H13M8,20V4H10V20H8M19,8V11H22V13H19V16L15,12L19,8M5,16L9,12L5,8V11H2V13H5V16Z";
      break;
    case "html":
      path =
        "M12,17.56L16.07,16.43L16.62,10.33H9.38L9.2,8.3H16.8L17,6.31H7L7.56,12.32H14.45L14.22,14.9L12,15.5L9.78,14.9L9.64,13.24H7.64L7.93,16.43L12,17.56M4.07,3H19.93L18.5,19.2L12,21L5.5,19.2L4.07,3Z";
      break;
    case "loading":
      path = "M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z";
      break;
    case "markdown":
      path =
        "M22.269,19.385H1.731a1.73,1.73,0,0,1-1.73-1.73V6.345a1.73,1.73,0,0,1,1.73-1.73H22.269a1.731,1.731,0,0,1,1.731,1.73V17.654A1.73,1.73,0,0,1,22.269,19.385ZM12,6.923v9.231H9.462V9.077l-2.308,3.846L4.846,9.077v7.077H2.308V6.923H5.769L7.154,9.308,8.538,6.923Zm7.385,2.769V6.923h2.308v9.231H19.385V10.615L16.154,16.154,12.923,10.615v5.539H10.615V6.923h2.308l3.231,5.539Z";
      break;
    case "resize":
      path =
        "M22,3H2C0.91,3.04 0.04,3.91 0,5V19C0.04,20.09 0.91,20.96 2,21H22C23.09,20.96 23.96,20.09 24,19V5C23.96,3.91 23.09,3.04 22,3M22,19H2V5H22V19Z";
      break;
    case "resize-horizontal":
      path =
        "M18,16V13H22V11H18V8L15,12L18,16M6,16L9,12L6,8V11H2V13H6V16M11,18H13V6H11V18Z";
      break;
    case "resize-vertical":
      path =
        "M8,18H11V22H13V18H16L12,15L8,18M8,6L12,9L16,6H13V2H11V6H8M18,11V13H6V11H18Z";
      break;
    case "search":
      path =
        "M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z";
      break;
    case "typescript":
      path =
        "M3,3H21V21H3V3M13.71,17.86C14.21,18.84 15.22,19.59 16.8,19.59C18.4,19.59 19.6,18.76 19.6,17.23C19.6,15.82 18.79,15.19 17.35,14.57L16.93,14.39C16.2,14.08 15.89,13.87 15.89,13.37C15.89,12.96 16.2,12.64 16.7,12.64C17.18,12.64 17.5,12.85 17.79,13.37L19.1,12.5C18.55,11.54 17.77,11.17 16.7,11.17C15.19,11.17 14.22,12.13 14.22,13.4C14.22,14.78 15.03,15.43 16.25,15.95L16.67,16.13C17.45,16.47 17.91,16.68 17.91,17.26C17.91,17.74 17.46,18.09 16.76,18.09C15.93,18.09 15.45,17.66 15.09,17.06L13.71,17.86M13,11.25H8V12.75H9.5V20H11.25V12.75H13V11.25Z";
      break;
    case "warning":
      path =
        "M5,3H19A2,2 0 0,1 21,5V19A2,2 0 0,1 19,21H5A2,2 0 0,1 3,19V5A2,2 0 0,1 5,3M13,13V7H11V13H13M13,17V15H11V17H13Z";
      break;
  }

  return (
    <svg
      className={[styles.Icon, className].join(" ")}
      viewBox="0 0 24 24"
      {...rest}
    >
      <path fill="currentColor" d={path} />
    </svg>
  );
}
