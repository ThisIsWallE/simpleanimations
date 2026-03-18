import gsap from "gsap";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import { generateAnimatedBlobPath, generateBlobPath } from "./blob-generator";
import { flashPath } from "../icons/flash";

gsap.registerPlugin(MorphSVGPlugin);

// Prevent GSAP from jumping ahead when the tab is backgrounded
gsap.ticker.lagSmoothing(500, 33);

export interface MorphParams {
  speed: number;
  blobPoints: number;
  ease: string;
  pauseDuration: number;
}

export interface MorphElements {
  mainPath: SVGPathElement;
  groupEl: SVGGElement;
  overlayPath?: SVGPathElement;
  heatpumpFanEl?: SVGGElement;
}

export interface IconConfig {
  path: string;
  name: string;
  type: "fill" | "stroke";
  hasOverlay?: boolean;
  hasFan?: boolean;
}

export interface AnimationController {
  destroy: () => void;
  pause: () => void;
  resume: () => void;
  isPaused: () => boolean;
}

/**
 * Continuous dot-scale morph animation.
 * The blob rAF runs at ALL times (even at dot scale) for constant motion.
 * Only paused during the GSAP morph to/from icon.
 */
export function createDotScaleMorphAnimation(
  elements: MorphElements,
  icons: IconConfig[],
  params: Partial<MorphParams> & { color?: string; blobStyle?: "bubble" | "flash" } = {}
): AnimationController {
  const p: MorphParams = {
    speed: 2,
    blobPoints: 8,
    ease: "power2.inOut",
    pauseDuration: 0.5,
    ...params,
  };
  const color = params.color || "#0B99E6";
  const blobStyle = params.blobStyle || "bubble";
  const isFlashBlob = blobStyle === "flash";

  const { mainPath, groupEl, overlayPath, heatpumpFanEl } = elements;
  let rafId: number | null = null;
  let destroyed = false;
  let paused = false;
  let isMorphing = false;
  let morphTimeline: gsap.core.Timeline | null = null;
  let iconIndex = 0;

  // Start at dot scale with blob running
  gsap.set(groupEl, { scale: 0.08, svgOrigin: "50 50" });
  if (overlayPath) gsap.set(overlayPath, { opacity: 0, scale: 0, svgOrigin: "50 55" });
  if (heatpumpFanEl) gsap.set(heatpumpFanEl, { opacity: 0 });

  const initShape = isFlashBlob
    ? flashPath
    : generateBlobPath({ points: p.blobPoints, randomness: 0.3, seed: 1 });
  mainPath.setAttribute("d", initShape);
  setPathStyle(mainPath, "fill", color, 0);

  function setPathStyle(el: SVGPathElement, mode: "fill" | "stroke", c: string, sw: number) {
    if (mode === "fill") {
      el.setAttribute("fill", c);
      el.setAttribute("stroke", "none");
      el.setAttribute("stroke-width", "0");
    } else {
      el.setAttribute("fill", "none");
      el.setAttribute("stroke", c);
      el.setAttribute("stroke-width", String(sw));
      el.setAttribute("stroke-linecap", "round");
      el.setAttribute("stroke-linejoin", "round");
    }
  }

  // --- Resting shape animation runs continuously ---
  function animateBlob() {
    if (destroyed || paused || isMorphing) return;

    if (isFlashBlob) {
      // Flash mode: keep the flash path, just subtle scale pulse via rAF
      // (the shape stays as flashPath, pulse handled by GSAP scale on groupEl)
      mainPath.setAttribute("d", flashPath);
      rafId = requestAnimationFrame(animateBlob);
    } else {
      // Bubble mode: organic fluid blob
      const time = performance.now() / 1000;
      const path = generateAnimatedBlobPath(time, {
        points: p.blobPoints,
        amplitude: 0.25,
        speed: 1.2,
      });
      mainPath.setAttribute("d", path);
      rafId = requestAnimationFrame(animateBlob);
    }
  }

  function startBlob() {
    isMorphing = false;
    if (!paused && !destroyed) animateBlob();
  }

  function stopBlob() {
    isMorphing = true;
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  function runCycle() {
    if (destroyed || paused) return;

    const currentIcon = icons[iconIndex % icons.length];
    const isStrokeIcon = currentIcon.type === "stroke";
    const morphDuration = p.speed;

    morphTimeline = gsap.timeline({
      onComplete: () => {
        if (destroyed) return;
        iconIndex++;
        // Immediately start next cycle — no gap
        if (!paused) runCycle();
      },
    });

    // --- Set rendering mode at dot scale ---
    morphTimeline.call(() => {
      if (isStrokeIcon) {
        setPathStyle(mainPath, "stroke", color, 12);
      } else {
        setPathStyle(mainPath, "fill", color, 0);
      }
      startBlob(); // blob wobbles from the start
    });

    // Phase 1: Expand dot → full blob (blob rAF runs during this)
    if (isStrokeIcon) {
      morphTimeline.to(groupEl, {
        scale: 1, svgOrigin: "50 50",
        duration: 0.8, ease: "sine.out",
      });
      morphTimeline.to(mainPath, {
        attr: { "stroke-width": 2 },
        duration: 0.8, ease: "power2.out",
      }, "<");
    } else {
      morphTimeline.to(groupEl, {
        scale: 1, svgOrigin: "50 50",
        duration: 0.8, ease: "sine.out",
      });
    }

    // Phase 2: Stop blob, morph → icon
    morphTimeline.call(() => stopBlob());
    morphTimeline.to(mainPath, {
      morphSVG: { shape: currentIcon.path, shapeIndex: "auto" },
      duration: morphDuration, ease: p.ease,
    });

    // Phase 2b: Overlay grows in during last part of morph
    if (currentIcon.hasOverlay && overlayPath) {
      morphTimeline.to(
        overlayPath,
        {
          opacity: 1, scale: 1, svgOrigin: "50 55",
          duration: morphDuration * 0.4, ease: "back.out(1.5)",
        },
        `-=${morphDuration * 0.3}`
      );
    }
    if (currentIcon.hasFan && heatpumpFanEl) {
      morphTimeline.to(
        heatpumpFanEl,
        { opacity: 1, duration: morphDuration * 0.3, ease: "power2.out" },
        `-=${morphDuration * 0.2}`
      );
    }

    // Phase 3: Hold on icon
    morphTimeline.to(groupEl, { duration: p.pauseDuration });

    // Phase 4: Overlay shrinks out
    if (currentIcon.hasOverlay && overlayPath) {
      morphTimeline.to(overlayPath, {
        opacity: 0, scale: 0, svgOrigin: "50 55",
        duration: 0.4, ease: "power2.in",
      });
    }
    if (currentIcon.hasFan && heatpumpFanEl) {
      morphTimeline.to(heatpumpFanEl, {
        opacity: 0, duration: 0.3, ease: "power2.in",
      }, "<");
    }

    // Phase 5: Morph icon → resting shape AND shrink to dot — fully simultaneous
    const shrinkLabel = "shrink_" + iconIndex;
    const targetBlob = isFlashBlob
      ? flashPath
      : generateBlobPath({
          points: p.blobPoints, randomness: 0.3,
          seed: Math.floor(performance.now()),
        });
    const shrinkDuration = Math.max(morphDuration * 0.7, 0.8);

    // Morph back to blob shape
    morphTimeline.addLabel(shrinkLabel);
    morphTimeline.to(mainPath, {
      morphSVG: { shape: targetBlob, shapeIndex: "auto" },
      duration: shrinkDuration, ease: p.ease,
    }, shrinkLabel);

    // Shrink to dot in parallel (starts at the same time)
    if (isStrokeIcon) {
      morphTimeline.to(mainPath, {
        attr: { "stroke-width": 12 },
        duration: shrinkDuration, ease: "power2.in",
      }, shrinkLabel);
      morphTimeline.to(groupEl, {
        scale: 0.08, svgOrigin: "50 50",
        duration: shrinkDuration, ease: "sine.in",
      }, shrinkLabel);
    } else {
      morphTimeline.to(groupEl, {
        scale: 0.08, svgOrigin: "50 50",
        duration: shrinkDuration, ease: "sine.in",
      }, shrinkLabel);
    }

    // Phase 6: Resume blob at dot scale (ready for next expand)
    morphTimeline.call(() => startBlob());
  }

  // Start immediately
  startBlob();
  runCycle();

  return {
    destroy() {
      destroyed = true;
      if (rafId !== null) cancelAnimationFrame(rafId);
      morphTimeline?.kill();
      if (overlayPath) gsap.set(overlayPath, { opacity: 0, scale: 0 });
      if (heatpumpFanEl) gsap.set(heatpumpFanEl, { opacity: 0 });
    },
    pause() {
      paused = true;
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      morphTimeline?.pause();
    },
    resume() {
      paused = false;
      morphTimeline?.resume();
      if (!isMorphing) animateBlob();
    },
    isPaused() {
      return paused;
    },
  };
}

/**
 * Idle wobble — fluid blob only, no morph, full scale
 */
export function createIdleWobble(
  pathEl: SVGPathElement,
  groupEl: SVGGElement,
  params: { speed?: number; points?: number } = {}
): AnimationController {
  const { speed = 1, points = 8 } = params;
  let destroyed = false;
  let paused = false;
  let rafId: number | null = null;

  gsap.set(groupEl, { scale: 1, svgOrigin: "50 50" });

  function animate() {
    if (destroyed || paused) return;
    const time = performance.now() / 1000;
    const path = generateAnimatedBlobPath(time, { points, amplitude: 0.3, speed });
    pathEl.setAttribute("d", path);
    rafId = requestAnimationFrame(animate);
  }

  animate();

  return {
    destroy() {
      destroyed = true;
      if (rafId !== null) cancelAnimationFrame(rafId);
    },
    pause() {
      paused = true;
      if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
    },
    resume() {
      paused = false;
      animate();
    },
    isPaused() { return paused; },
  };
}
