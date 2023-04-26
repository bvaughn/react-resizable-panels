import { useRef } from "react";

import { sequence } from "./LogoAnimation";
import { useLogoAnimation } from "./useLogoAnimation";

import styles from "./Logo.module.css";

export default function Logo({ className = "" }: { className?: string }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useLogoAnimation(svgRef, sequence);

  return (
    <svg
      className={`${className} ${styles.Svg}`}
      fill="none"
      height={248}
      ref={svgRef}
      width={248}
      viewBox="0 0 248 247"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="10" y="10" width="72" height="145" rx="8" fill="#D7B0FF" />
      <rect x="10" y="165" width="72" height="72" rx="8" fill="#F282AE" />
      <rect x="92" y="93" width="146" height="144" rx="8" fill="#88C0FE" />
      <rect x="92" y="10" width="146" height="73" rx="8" fill="#FADD7D" />
    </svg>
  );
}
