import type { Config } from "vike/types";
import vikeReact from "vike-react/config";

// Default config (can be overridden by pages)
// https://vike.dev/config

export default {
  // https://vike.dev/head-tags
  title: "react-resizable-panels SSR demo",
  description: "Test harness",

  extends: [vikeReact]
} satisfies Config;
