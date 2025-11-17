import express from "express";
import fs from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const __dirname = dirname(fileURLToPath(import.meta.url));

const port = process.env.PORT || 5175;
const base = process.env.BASE || "/";

const app = express();

const vite = await createServer({
  server: { middlewareMode: true },
  appType: "custom",
  base
});
app.use(vite.middlewares);

// Serve HTML
app.use("*all", async (req, res) => {
  try {
    const url = req.originalUrl.replace(base, "");

    // Always read fresh template in development
    const text = await fs.readFile(join(__dirname, "./index.html"), "utf-8");
    const template = await vite.transformIndexHtml(url, text);
    const render = (
      await vite.ssrLoadModule(join(__dirname, "./src/entry-server.tsx"))
    ).render;

    const rendered = await render(url);

    const html = template
      .replace(`<!--app-head-->`, rendered.head ?? "")
      .replace(`<!--app-html-->`, rendered.html ?? "");

    res.status(200).set({ "Content-Type": "text/html" }).send(html);
  } catch (thrown) {
    const error =
      thrown instanceof Error
        ? thrown
        : new Error(typeof thrown === "string" ? thrown : "Unknown error");
    vite.ssrFixStacktrace(error);
    console.log(error.stack);
    res.status(500).end(error.stack);
  }
});

// Start http server
app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});
