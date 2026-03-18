import { AnimationCanvas } from "./components/AnimationCanvas";
import type { AnimationParams } from "./components/AnimationCanvas";
import { Sidebar, useSidebarControls } from "./components/Sidebar";
import { iconOrder } from "./icons";
import { brandColors } from "./lib/colors";

const defaultParams: AnimationParams = {
  icon: "logo",
  cycleIcons: [...iconOrder],
  blobStyle: "bubble",
  speed: 2,
  color: brandColors.primary,
  secondaryColor: "#FFFFFF",
  bgColor: "#fafafa",
  strokeWidth: 0,
  blobPoints: 8,
  ease: "power2.inOut",
  pauseDuration: 0.5,
  size: 250,
  mode: "morph",
};

function useCaptureMode() {
  const searchParams = new URLSearchParams(window.location.search);
  const capture = searchParams.get("capture") === "true";
  if (!capture) return { capture: false as const, params: null };

  const paramsJson = searchParams.get("params");
  let urlParams: Partial<AnimationParams> = {};
  if (paramsJson) {
    try { urlParams = JSON.parse(paramsJson); } catch { /* use defaults */ }
  }
  return { capture: true as const, params: { ...defaultParams, ...urlParams } };
}

export default function App() {
  const { params, update } = useSidebarControls();
  const captureMode = useCaptureMode();

  if (captureMode.capture) {
    return (
      <div className="w-screen h-screen overflow-hidden">
        <AnimationCanvas params={captureMode.params} captureMode />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar params={params} onUpdate={update} />
      <div className="flex-1">
        <AnimationCanvas params={params} />
      </div>
    </div>
  );
}
