import { createServer } from "node:http";
import { readFile, realpath } from "node:fs/promises";
import { resolve, sep, extname } from "node:path";

const root = await realpath(resolve(process.argv[2] || "."));
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
};
const pages = new Set([
  "index.html",
  "404.html",
  "styles.css",
  "script.js",
  "robots.txt",
  "sitemap.xml",
  "app-ads.txt",
]);
const server = createServer(async (request, response) => {
  if (!["GET", "HEAD"].includes(request.method)) {
    response.writeHead(405, { Allow: "GET, HEAD" });
    response.end();
    return;
  }
  try {
    const pathname = decodeURIComponent(
      new URL(request.url, "http://localhost").pathname,
    );
    const name = pathname === "/" ? "index.html" : pathname.slice(1);
    const publicAsset =
      name.startsWith("assets/") &&
      !name.includes("\\") &&
      !name.split("/").some((part) => part.startsWith("."));
    if (!pages.has(name) && !publicAsset) throw new Error("Not public");
    const file = await realpath(resolve(root, name));
    if (
      !file.startsWith(root + sep) ||
      (publicAsset && !file.startsWith(resolve(root, "assets") + sep))
    )
      throw new Error("Outside public files");
    const content = await readFile(file);
    response.writeHead(200, {
      "Content-Type": types[extname(file)] || "application/octet-stream",
      "Content-Length": content.length,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    });
    response.end(request.method === "HEAD" ? undefined : content);
  } catch {
    const content = await readFile(resolve(root, "404.html"));
    response.writeHead(404, { "Content-Type": types[".html"] });
    response.end(request.method === "HEAD" ? undefined : content);
  }
});
server.listen(Number(process.env.PORT || 4173), "127.0.0.1", () => {
  console.log(`Portfolio: http://127.0.0.1:${server.address().port} (${root})`);
});
server.on("error", (error) => {
  console.error(error.message);
  process.exitCode = 1;
});
