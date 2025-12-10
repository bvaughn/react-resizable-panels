import type { Config } from "vike/types";
import vikeReact from "vike-react/config";

// Default config (can be overridden by pages)
// https://vike.dev/config

export default {
  // https://vike.dev/head-tags
  title: "[Vike] react-resizable-panels integration",
  description: "Test harness",
  htmlAttributes: { class: "dark bg-black text-white" },
  extends: [vikeReact]
} satisfies Config;
