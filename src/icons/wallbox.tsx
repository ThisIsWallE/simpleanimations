import { forwardRef } from "react";

/**
 * Wallbox / EV charger icon — charging station with plug cable.
 */
export const WallboxIcon = forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>(
  (props, ref) => (
    <svg ref={ref} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path className="morph-path" d={wallboxPath} fill="currentColor" />
    </svg>
  )
);
WallboxIcon.displayName = "WallboxIcon";

// Wallbox: rectangular station body + cable + plug
export const wallboxPath =
  "M25 10 Q25 5 30 5 L70 5 Q75 5 75 10 L75 75 Q75 80 70 80 L60 80 L60 85 Q60 90 55 90 L45 90 Q40 90 40 85 L40 80 L30 80 Q25 80 25 75 Z M35 20 L65 20 L65 45 L35 45 Z M45 30 L42 38 L48 38 L45 42 L55 32 L49 32 L52 25 Z M40 55 C40 52 43 50 46 50 L54 50 C57 50 60 52 60 55 L60 60 C60 63 57 65 54 65 L46 65 C43 65 40 63 40 60 Z";
