import { AnimationCanvas } from "./components/AnimationCanvas";
import { Sidebar, useSidebarControls } from "./components/Sidebar";

export default function App() {
  const { params, update } = useSidebarControls();

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar params={params} onUpdate={update} />
      <div className="flex-1">
        <AnimationCanvas params={params} />
      </div>
    </div>
  );
}
