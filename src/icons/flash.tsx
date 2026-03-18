import { forwardRef } from "react";

/** Lightning bolt / flash icon — standalone version of the logo's bolt */
export const FlashIcon = forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>(
  (props, ref) => (
    <svg ref={ref} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path className="morph-path" d={flashPath} fill="currentColor" />
    </svg>
  )
);
FlashIcon.displayName = "FlashIcon";

export const flashPath =
  "M55 5 L25 55 L45 55 L35 95 L75 42 L52 42 L65 5 Z";
