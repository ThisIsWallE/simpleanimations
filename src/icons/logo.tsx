import { forwardRef } from "react";

/** Simplestrom hexagon + lightning bolt logo */
export const LogoIcon = forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>(
  (props, ref) => (
    <svg
      ref={ref}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {/* Hexagon outline */}
      <path
        className="morph-path"
        d="M50 5 L89 27.5 L89 72.5 L50 95 L11 72.5 L11 27.5 Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinejoin="round"
      />
    </svg>
  )
);
LogoIcon.displayName = "LogoIcon";

/** Just the lightning bolt path for morphing */
export const logoPaths = {
  hexagon: "M50 5 L89 27.5 L89 72.5 L50 95 L11 72.5 L11 27.5 Z",
  lightning: "M42 25 L65 25 L54 50 L72 50 L38 85 L48 58 L30 58 Z",
};
