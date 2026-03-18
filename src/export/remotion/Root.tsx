import { Composition } from "remotion";
import { LogoIntro } from "./LogoIntro";
import { IconMorph } from "./IconMorph";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="LogoIntro"
        component={LogoIntro}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={1080}
        defaultProps={{
          color: "#0B99E6",
          bgColor: "#fafafa",
        }}
      />
      <Composition
        id="IconMorph"
        component={IconMorph}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1080}
        defaultProps={{
          color: "#0B99E6",
          bgColor: "#fafafa",
          icon: "logo" as const,
        }}
      />
    </>
  );
};
