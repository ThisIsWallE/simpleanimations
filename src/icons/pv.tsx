import { forwardRef } from "react";

/**
 * Solar/PV panel icon from svg/pv-black.svg
 * Multi-element SVG with stroke-based design.
 */
export const PvIcon = forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>(
  (props, ref) => (
    <svg
      ref={ref}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M30 35H70L80 65H20L30 35Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line x1="43.3" y1="35" x2="40" y2="65" strokeLinecap="round" />
      <line x1="56.7" y1="35" x2="60" y2="65" strokeLinecap="round" />
      <line x1="26.6" y1="45" x2="73.4" y2="45" strokeLinecap="round" />
      <line x1="23.3" y1="55" x2="76.7" y2="55" strokeLinecap="round" />
    </svg>
  )
);
PvIcon.displayName = "PvIcon";

/** This icon needs runtime conversion — flag it */
export const pvNeedsConversion = true;
export const pvViewBox = "0 0 100 100";

/** Static compound path for Remotion export (no runtime conversion needed) */
export const pvStaticPath =
  "M30 35 L70 35 L80 65 L20 65 Z M43.3 35 L40 65 M56.7 35 L60 65 M26.6 45 L73.4 45 M23.3 55 L76.7 55";
