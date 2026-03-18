# Simple Animations

A browser-based tool for creating and exporting SVG blob/icon animations. Built for [Simplestrom](https://simplestrom.com).

## What it does

- Morphs SVG icons in and out of animated blob shapes
- Multiple animation modes: morph, cycle, fast-cycle, wobble
- Two blob styles: organic bubble or lightning flash
- Live preview with full control over speed, size, colors, and icons
- Export as MP4 video or embed as HTML/React component

## Available icons

`logo` `heatpump` `pv` `wallbox` `flash`

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:5174. Use the sidebar to tweak the animation and the export panel to get your video.

## Exporting video

The export panel generates a CLI command you can copy and run. Under the hood it uses Puppeteer to capture the actual browser rendering frame by frame, then stitches them into MP4 with ffmpeg.

**Requirements:** [ffmpeg](https://ffmpeg.org/) must be installed on your system.

```bash
# Example: capture a 5-second video at 1080x1080, 30fps
node scripts/capture-video.mjs \
  --width 1080 --height 1080 \
  --fps 30 --duration 5 \
  --output out/export.mp4
```

Make sure the dev server is running (`npm run dev`) before capturing.

## Tech stack

React, GSAP (MorphSVG), Tailwind CSS, Vite, Puppeteer, ffmpeg
