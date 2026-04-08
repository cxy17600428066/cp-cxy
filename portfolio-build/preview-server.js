const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const port = Number(process.env.PORT || 4173);

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

function send(res, status, body, type) {
  res.writeHead(status, {
    "Content-Type": type,
    "Cache-Control": "no-cache",
  });
  res.end(body);
}

const server = http.createServer((req, res) => {
  const requestPath = decodeURIComponent((req.url || "/").split("?")[0]);
  const safePath = path.normalize(requestPath).replace(/^(\.\.[/\\])+/, "");
  let filePath = path.join(root, safePath);

  if (safePath === "/" || safePath === ".") {
    filePath = path.join(root, "index.html");
  }

  fs.stat(filePath, (statError, stat) => {
    if (statError) {
      send(res, 404, "Not Found", "text/plain; charset=utf-8");
      return;
    }

    const targetPath = stat.isDirectory() ? path.join(filePath, "index.html") : filePath;
    fs.readFile(targetPath, (readError, data) => {
      if (readError) {
        send(res, 500, "Server Error", "text/plain; charset=utf-8");
        return;
      }

      const ext = path.extname(targetPath).toLowerCase();
      send(res, 200, data, contentTypes[ext] || "application/octet-stream");
    });
  });
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Preview available at http://127.0.0.1:${port}`);
});
