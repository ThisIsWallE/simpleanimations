#!/usr/bin/env node

/**
 * Capture the live animation frame-by-frame using Puppeteer + virtual time,
 * then stitch into MP4 with ffmpeg.
 *
 * Usage:
 *   node scripts/capture-video.mjs [options]
 *
 * Options:
 *   --url        Dev server URL (default: http://localhost:5174)
 *   --params     JSON string of AnimationParams
 *   --width      Output width in px (default: 1080)
 *   --height     Output height in px (default: 1080)
 *   --fps        Frames per second (default: 30)
 *   --duration   Duration in seconds (default: 5)
 *   --output     Output file path (default: out/export.mp4)
 */

import puppeteer from "puppeteer";
import { spawn } from "child_process";
import { mkdirSync } from "fs";
import { dirname } from "path";

// --- Parse CLI args ---
function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {
    url: "http://localhost:5174",
    params: "{}",
    width: 1080,
    height: 1080,
    fps: 30,
    duration: 5,
    output: "out/export.mp4",
  };

  for (let i = 0; i < args.length; i++) {
    const key = args[i].replace(/^--/, "");
    const val = args[i + 1];
    if (key in opts && val !== undefined) {
      if (["width", "height", "fps", "duration"].includes(key)) {
        opts[key] = Number(val);
      } else {
        opts[key] = val;
      }
      i++;
    }
  }

  return opts;
}

async function main() {
  const opts = parseArgs();
  const totalFrames = Math.round(opts.duration * opts.fps);
  const frameDurationMs = 1000 / opts.fps;

  console.log(`Capturing ${totalFrames} frames at ${opts.fps}fps (${opts.duration}s)`);
  console.log(`Resolution: ${opts.width}x${opts.height}`);
  console.log(`Output: ${opts.output}`);

  // Ensure output directory exists
  mkdirSync(dirname(opts.output), { recursive: true });

  // Launch browser
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      `--window-size=${opts.width},${opts.height}`,
      "--no-sandbox",
      "--disable-gpu",
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: opts.width, height: opts.height });

  // Build the capture URL with params
  const paramsEncoded = encodeURIComponent(opts.params);
  const captureUrl = `${opts.url}?capture=true&params=${paramsEncoded}`;
  console.log(`Navigating to: ${opts.url}?capture=true&params=...`);

  await page.goto(captureUrl, { waitUntil: "networkidle0" });

  // Wait for animation to initialize and first frame to render
  await page.waitForSelector("svg", { timeout: 10000 });
  await new Promise((r) => setTimeout(r, 500));

  // Get CDP session for virtual time control
  const client = await page.createCDPSession();

  // Enable precise virtual time control via CDP.
  // This freezes real time and lets us advance performance.now() and rAF
  // by exact increments, so the animation runs at exactly the right speed.
  await client.send("Emulation.setVirtualTimePolicy", {
    policy: "pauseIfNetworkFetchesPending",
    budget: 0, // Start paused
  });

  // Start ffmpeg process — receive PNG frames on stdin, output MP4
  const ffmpeg = spawn("ffmpeg", [
    "-y",                          // Overwrite output
    "-f", "image2pipe",            // Read images from pipe
    "-framerate", String(opts.fps),
    "-i", "-",                     // stdin
    "-c:v", "libx264",
    "-pix_fmt", "yuv420p",
    "-preset", "fast",
    "-crf", "18",
    opts.output,
  ], {
    stdio: ["pipe", "inherit", "inherit"],
  });

  // Capture frames by advancing virtual time one frame at a time
  for (let frame = 0; frame < totalFrames; frame++) {
    // Advance virtual time by exactly one frame duration.
    // This ticks performance.now() forward and fires any pending rAF/setTimeout callbacks.
    await client.send("Emulation.setVirtualTimePolicy", {
      policy: "pauseIfNetworkFetchesPending",
      budget: frameDurationMs * 1000, // budget is in microseconds
    });

    // Wait for the virtual time budget to be exhausted
    await new Promise((resolve) => {
      client.once("Emulation.virtualTimeBudgetExpired", resolve);
    });

    // Take screenshot of the current frame
    const screenshot = await page.screenshot({
      type: "png",
      clip: { x: 0, y: 0, width: opts.width, height: opts.height },
    });

    // Write PNG to ffmpeg stdin
    const canWrite = ffmpeg.stdin.write(screenshot);
    if (!canWrite) {
      await new Promise((resolve) => ffmpeg.stdin.once("drain", resolve));
    }

    // Progress
    if ((frame + 1) % opts.fps === 0 || frame === totalFrames - 1) {
      const pct = Math.round(((frame + 1) / totalFrames) * 100);
      process.stdout.write(`\rCapturing: ${frame + 1}/${totalFrames} (${pct}%)`);
    }
  }

  console.log("\nEncoding...");

  // Close ffmpeg stdin to signal end of input
  ffmpeg.stdin.end();

  // Wait for ffmpeg to finish
  await new Promise((resolve, reject) => {
    ffmpeg.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg exited with code ${code}`));
    });
  });

  await browser.close();
  console.log(`Done! Saved to ${opts.output}`);
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
