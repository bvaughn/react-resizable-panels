import styles from "./Icon.module.css";

type Type = "files" | "resize-horizontal" | "resize-vertical" | "search";

export default function Icon({
  className = "",
  type,
}: {
  className?: string;
  type: Type;
}) {
  let path = "";
  switch (type) {
    case "files":
      path =
        "M15,7H20.5L15,1.5V7M8,0H16L22,6V18A2,2 0 0,1 20,20H8C6.89,20 6,19.1 6,18V2A2,2 0 0,1 8,0M4,4V22H20V24H4A2,2 0 0,1 2,22V4H4Z";
      break;
    case "resize-horizontal":
      path =
        "M18,16V13H15V22H13V2H15V11H18V8L22,12L18,16M2,12L6,16V13H9V22H11V2H9V11H6V8L2,12Z";
      break;
    case "resize-vertical":
      path =
        "M8,18H11V15H2V13H22V15H13V18H16L12,22L8,18M12,2L8,6H11V9H2V11H22V9H13V6H16L12,2Z";
      break;
    case "search":
      path =
        "M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z";
      break;
  }

  return (
    <svg className={[className, styles.Icon].join(" ")} viewBox="0 0 24 24">
      <path fill="currentColor" d={path} />
    </svg>
  );
}
