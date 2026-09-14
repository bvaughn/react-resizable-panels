// Build with pnpm build:docs, then pnpm exec vite preview --port 4173.
// Open /examples/nested-groups in Chromium with CDP on port 9222.
// Keep that tab visible and the pointer still; run node scripts/profile-resize.mjs.
import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { tmpdir } from "node:os";
import { parseArgs } from "node:util";
import puppeteer from "puppeteer";

const { values } = parseArgs({
  options: {
    endpoint: { type: "string", default: "http://127.0.0.1:9222" },
    url: {
      type: "string",
      default: "http://127.0.0.1:4173/examples/nested-groups"
    },
    out: {
      type: "string",
      default: resolve(tmpdir(), "react-resizable-panels-profile")
    },
    modes: { type: "string", default: "live,freeze,preview" },
    samples: { type: "string", default: "3" },
    "cpu-rate": { type: "string", default: "6" },
    seconds: { type: "string", default: "5" }
  }
});
const samples = Number(values.samples),
  cpuRate = Number(values["cpu-rate"]),
  durationMs = Number(values.seconds) * 1000;
assert(Number.isInteger(samples) && samples > 0 && samples <= 20);
assert(Number.isFinite(cpuRate) && cpuRate >= 1 && cpuRate <= 20);
assert(
  Number.isFinite(durationMs) && durationMs >= 1000 && durationMs <= 30000
);
const output = resolve(values.out);
await mkdir(output, { recursive: true });
const browser = await puppeteer.connect({
  browserURL: values.endpoint,
  defaultViewport: null,
  protocolTimeout: 120000
});
let page,
  client,
  tracing = false,
  pressed = false,
  point;
const results = [];
try {
  const target = new URL(values.url);
  const pages = [];
  for (const candidate of await browser.pages()) {
    const url = new URL(candidate.url());
    if (
      url.origin === target.origin &&
      url.pathname === target.pathname &&
      (await candidate.evaluate(() => document.visibilityState === "visible"))
    )
      pages.push(candidate);
  }
  assert.equal(
    pages.length,
    1,
    `Bring one tab at ${values.url} to the foreground`
  );
  page = pages[0];
  assert(
    await page.$("[data-resize-example]"),
    "Expected the nested groups example"
  );
  const development = !!(await page.$('script[src*="/@vite/client"]'));
  const errors = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  client = await page.createCDPSession();
  await client.send("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 1000,
    deviceScaleFactor: 1,
    mobile: false
  });
  const settle = () =>
    page.evaluate(
      () =>
        new Promise((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(resolve))
        )
    );
  const mark = (name) => page.evaluate((name) => performance.mark(name), name);
  const move = async (x, y, buttons = 1) => {
    point = { x, y };
    await client.send("Input.dispatchMouseEvent", {
      type: "mouseMoved",
      x,
      y,
      buttons,
      pointerType: "mouse"
    });
  };
  const button = async (down) => {
    await client.send("Input.dispatchMouseEvent", {
      type: down ? "mousePressed" : "mouseReleased",
      ...point,
      button: "left",
      buttons: down ? 1 : 0,
      clickCount: 1
    });
    pressed = down;
    await settle();
  };
  const sizes = () =>
    page.evaluate(() => {
      const panel = document.querySelector(
        "[data-resize-example] > [data-panel]"
      );
      return [
        panel.getBoundingClientRect().width,
        panel.firstElementChild.getBoundingClientRect().width
      ];
    });
  const modes = values.modes.split(",");
  assert(
    modes.length > 0 &&
      modes.every((mode) => ["live", "freeze", "preview"].includes(mode))
  );
  assert.equal(new Set(modes).size, modes.length);
  for (let sample = 0; sample < samples; sample++) {
    for (const mode of [
      ...modes.slice(sample % modes.length),
      ...modes.slice(0, sample % modes.length)
    ]) {
      await client.send("Emulation.setCPUThrottlingRate", { rate: 1 });
      await page.goto(values.url, { waitUntil: "networkidle0" });
      await page.click(
        `label:has(input[name="panel-resize-mode"][value="${mode}"])`
      );
      await page.$eval("[data-resize-example]", (element) =>
        element.scrollIntoView({ block: "center" })
      );
      await settle();
      const geometry = await page.evaluate(() => {
        const group = document.querySelector("[data-resize-example]");
        const [left, right] = [...group.children].map((element) =>
          element.getBoundingClientRect()
        );
        return {
          x: (left.right + right.left) / 2,
          y: left.top + left.height / 4,
          rows: group.querySelectorAll("tbody tr").length,
          visible: document.visibilityState
        };
      });
      assert.equal(geometry.rows, 1000);
      assert.equal(geometry.visible, "visible", "Keep the benchmark visible");
      const { x, y } = geometry;
      // Warm the same gesture, then return to the initial size before measuring.
      await move(x, y, 0);
      await button(true);
      await move(x - 40, y);
      await settle();
      await move(x, y);
      await button(false);
      const before = await sizes();
      await move(x, y, 0);
      await client.send("Emulation.setCPUThrottlingRate", { rate: cpuRate });
      const path = resolve(output, `${mode}-${sample + 1}.json`);
      await page.tracing.start({
        path,
        screenshots: false,
        categories: [
          "devtools.timeline",
          "disabled-by-default-devtools.timeline",
          "blink.user_timing"
        ]
      });
      tracing = true;
      await mark("resize:press");
      await button(true);
      await mark("resize:moves");
      const started = performance.now();
      let sentMoves = 0;
      while (performance.now() - started < durationMs) {
        const tick = performance.now();
        const offset = 40 * (1 - Math.cos(((tick - started) * Math.PI) / 1000));
        await move(x - offset, y);
        sentMoves++;
        // Aim for 60 Hz without queuing a backlog when the browser is busy.
        const delay =
          Math.min(started + durationMs, tick + 1000 / 60) - performance.now();
        if (delay > 0)
          await new Promise((resolve) => setTimeout(resolve, delay));
      }
      const movementWallMs = performance.now() - started;
      const offset = x - point.x;
      const during = await sizes();
      assert(
        Math.abs(before[0] - during[0] - (mode === "preview" ? 0 : offset)) < 1,
        "Unexpected panel movement"
      );
      assert(
        Math.abs(before[1] - during[1] - (mode === "live" ? offset : 0)) < 1,
        "Unexpected content movement"
      );
      await mark("resize:release");
      await button(false);
      await mark("resize:end");
      await page.tracing.stop();
      tracing = false;
      const after = await sizes();
      assert(
        Math.abs(before[0] - after[0] - offset) < 1,
        "Final layout did not commit"
      );
      assert.equal(
        await page.evaluate(() => document.visibilityState),
        "visible"
      );
      assert.equal(errors.length, 0, errors.join("; "));
      const events = JSON.parse(await readFile(path, "utf8")).traceEvents;
      const pointer = events.filter(
        (e) =>
          e.name === "EventDispatch" && e.args?.data?.type === "pointermove"
      );
      assert.equal(
        pointer.length,
        sentMoves,
        "Extra pointer input; reject capture and keep the pointer still"
      );
      const main = events.filter(
        (e) =>
          e.ph === "X" && e.pid === pointer[0].pid && e.tid === pointer[0].tid
      );
      const time = (name) => {
        const marker = events.find(
          (e) => e.name === `resize:${name}` && e.pid === pointer[0].pid
        );
        assert(marker, `Missing ${name} marker`);
        return marker.ts;
      };
      const phase = (from, to) => {
        const start = time(from),
          end = time(to);
        const cost = (name) =>
          main
            .filter((e) => e.name === name)
            .reduce(
              (sum, e) =>
                sum +
                Math.max(
                  0,
                  Math.min(end, e.ts + e.dur) - Math.max(start, e.ts)
                ) /
                  1000,
              0
            );
        return {
          wallMs: (end - start) / 1000,
          mainThreadMs: cost("RunTask"),
          layoutMs: cost("Layout"),
          styleMs: cost("UpdateLayoutTree"),
          paintMs: cost("Paint"),
          commitMs: cost("Commit")
        };
      };
      const result = {
        mode,
        sample: sample + 1,
        before,
        during,
        after,
        sentMoves,
        movementWallMs,
        press: phase("press", "moves"),
        moves: phase("moves", "release"),
        release: phase("release", "end"),
        total: phase("press", "end")
      };
      results.push(result);
      await writeFile(
        resolve(output, "summary.json"),
        JSON.stringify(
          {
            browser: await browser.version(),
            cpuRate,
            development,
            url: values.url,
            rows: 1000,
            viewport: [1440, 1000],
            durationMs,
            trajectory: "0 to -80 px and back every 2 seconds; up to 60 Hz",
            results
          },
          null,
          2
        )
      );
      console.log(
        `${mode} ${sample + 1}: ${sentMoves} moves in ${movementWallMs.toFixed(0)} ms; movement work ${result.moves.mainThreadMs.toFixed(1)} ms; release ${result.release.mainThreadMs.toFixed(1)} ms; total ${result.total.mainThreadMs.toFixed(1)} ms main-thread work`
      );
    }
  }
  console.log(
    `${output}/summary.json — timings overlap; do not add category totals.`
  );
} finally {
  if (pressed)
    await client
      .send("Input.dispatchMouseEvent", {
        type: "mouseReleased",
        ...point,
        button: "left",
        buttons: 0,
        clickCount: 1
      })
      .catch(() => {});
  if (tracing) await page.tracing.stop().catch(() => {});
  if (client) {
    await client
      .send("Emulation.setCPUThrottlingRate", { rate: 1 })
      .catch(() => {});
    await client.send("Emulation.clearDeviceMetricsOverride").catch(() => {});
  }
  await browser.disconnect();
}
