import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../", import.meta.url));
http
  .createServer(async (req, res) => {
    try {
      let p = new URL(req.url, "http://localhost").pathname;
      if (!/^\/(concepts|assets)\/[\w./-]*$/.test(p) || p.includes(".."))
        throw Error();
      if (p.endsWith("/")) p += "index.html";
      const body = await fs.readFile(path.join(root, p));
      res.setHeader(
        "Content-Type",
        {
          ".js": "text/javascript",
          ".css": "text/css",
          ".woff2": "font/woff2",
          ".html": "text/html",
          ".webm": "video/webm",
          ".jpg": "image/jpeg",
        }[path.extname(p)] || "application/octet-stream",
      );
      res.end(body);
    } catch {
      res.writeHead(404);
      res.end();
    }
  })
  .listen(4186, "127.0.0.1", () =>
    console.log("Concept previews on localhost:4186"),
  );
