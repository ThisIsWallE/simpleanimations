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
