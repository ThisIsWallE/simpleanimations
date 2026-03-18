import { forwardRef } from "react";

/**
 * Heat pump icon from svg/heatpump-black.svg
 * Multi-element SVG — requires runtime conversion for morphing.
 */
export const HeatpumpIcon = forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>(
  (props, ref) => (
    <svg
      ref={ref}
      viewBox="0 0 120 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g id="static-body">
        <rect x="5" y="5" width="110" height="70" rx="5" ry="5" />
        <path d="M 10 25 L 10 10 L 25 10" strokeLinecap="round" />
        <line x1="75" y1="5" x2="75" y2="75" />
        <g id="service-panel">
          <rect x="85" y="15" width="20" height="18" rx="3" ry="3" />
          <line x1="85" y1="45" x2="105" y2="45" strokeLinecap="round" />
          <line x1="85" y1="52" x2="105" y2="52" strokeLinecap="round" />
          <line x1="85" y1="59" x2="105" y2="59" strokeLinecap="round" />
          <line x1="85" y1="66" x2="105" y2="66" strokeLinecap="round" />
          <line x1="85" y1="73" x2="105" y2="73" strokeLinecap="round" />
        </g>
        <rect x="25" y="75" width="10" height="3" rx="1" ry="1" />
        <rect x="75" y="75" width="10" height="3" rx="1" ry="1" />
      </g>
      <g id="fan-unit" transform="translate(40, 40)">
        <circle cx="0" cy="0" r="28" />
        <g id="spinning-blades">
          <path d="M 0 0 C 6 -10, 10 -15, 0 -24 C -10 -15, -6 -10, 0 0 Z" />
          <path d="M 0 0 C 6 -10, 10 -15, 0 -24 C -10 -15, -6 -10, 0 0 Z" transform="rotate(90)" />
          <path d="M 0 0 C 6 -10, 10 -15, 0 -24 C -10 -15, -6 -10, 0 0 Z" transform="rotate(180)" />
          <path d="M 0 0 C 6 -10, 10 -15, 0 -24 C -10 -15, -6 -10, 0 0 Z" transform="rotate(270)" />
          <circle cx="0" cy="0" r="4" />
        </g>
      </g>
    </svg>
  )
);
HeatpumpIcon.displayName = "HeatpumpIcon";

/** This icon needs runtime conversion — flag it */
export const heatpumpNeedsConversion = true;
export const heatpumpViewBox = "0 0 120 80";

/**
 * Static compound path for Remotion export.
 * Pre-baked into the 100×100 animation space using the transforms:
 *   x → x * 0.75 + 5,  y → y * 0.75 + 20,  size → size * 0.75
 * Includes: outer rect, corner bracket, vertical divider, service panel rect,
 * service panel lines, feet, fan circle.
 */
export const heatpumpStaticPath =
  // Outer body rect (rounded)
  "M13.75 23.75 Q8.75 23.75 8.75 27.5 L8.75 72.5 Q8.75 76.25 13.75 76.25 L91.25 76.25 Q96.25 76.25 96.25 72.5 L96.25 27.5 Q96.25 23.75 91.25 23.75 Z " +
  // Corner bracket
  "M12.5 38.75 L12.5 27.5 L23.75 27.5 " +
  // Vertical divider
  "M61.25 23.75 L61.25 76.25 " +
  // Service panel rect
  "M68.75 31.25 L83.75 31.25 Q86 31.25 86 33.5 L86 42.5 Q86 44.75 83.75 44.75 L68.75 44.75 Q66.5 44.75 66.5 42.5 L66.5 33.5 Q66.5 31.25 68.75 31.25 Z " +
  // Service panel lines
  "M68.75 53.75 L83.75 53.75 M68.75 59 L83.75 59 M68.75 64.25 L83.75 64.25 M68.75 69.5 L83.75 69.5 M68.75 74.75 L83.75 74.75 " +
  // Feet
  "M23.75 76.25 L31.25 76.25 L31.25 78.5 L23.75 78.5 Z M61.25 76.25 L68.75 76.25 L68.75 78.5 L61.25 78.5 Z " +
  // Fan circle
  "M35 50 A21 21 0 1 1 34.99 50 Z";
