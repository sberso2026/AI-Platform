/**
 * HTTP adapter for official clamd (INSTREAM).
 * Accepts POST application/octet-stream and returns clamd status text.
 * This is not a detector — ClamAV performs the scan.
 */
import http from "node:http";
import net from "node:net";

const listenPort = Number(process.env.RTB_CLAMAV_HTTP_PORT ?? 3311);
const clamdHost = process.env.RTB_CLAMD_HOST ?? "127.0.0.1";
const clamdPort = Number(process.env.RTB_CLAMD_PORT ?? 3310);

function scanWithClamd(bytes) {
  return new Promise((resolve, reject) => {
    const socket = net.connect({ host: clamdHost, port: clamdPort });
    const chunks = [];
    socket.on("data", (chunk) => chunks.push(chunk));
    socket.on("error", reject);
    socket.on("end", () => resolve(Buffer.concat(chunks).toString("utf8").trim()));
    socket.on("connect", () => {
      socket.write("nINSTREAM\n");
      const max = 8192;
      for (let offset = 0; offset < bytes.length; offset += max) {
        const slice = bytes.subarray(offset, Math.min(offset + max, bytes.length));
        const header = Buffer.alloc(4);
        header.writeUInt32BE(slice.length, 0);
        socket.write(header);
        socket.write(slice);
      }
      socket.write(Buffer.alloc(4));
    });
  });
}

const expected = process.env.RTB_REVIEW_CLAMAV_AUTH_TOKEN?.trim();
const server = http.createServer(async (req, res) => {
  if (expected) {
    const got = String(req.headers.authorization ?? "");
    if (got !== `Bearer ${expected}`) {
      res.writeHead(401, { "content-type": "text/plain" });
      res.end("unauthorized");
      return;
    }
  }
  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "content-type": "text/plain" });
    res.end("OK");
    return;
  }
  if (req.method !== "POST") {
    res.writeHead(405);
    res.end("method not allowed");
    return;
  }
  const body = [];
  req.on("data", (chunk) => body.push(chunk));
  req.on("end", async () => {
    try {
      const status = await scanWithClamd(Buffer.concat(body));
      res.writeHead(200, { "content-type": "text/plain" });
      res.end(status || "SCAN FAILED");
    } catch (error) {
      res.writeHead(503, { "content-type": "text/plain" });
      res.end(String(error instanceof Error ? error.message : "scan failed"));
    }
  });
});

server.listen(listenPort, "127.0.0.1", () => {
  console.log(`clamav-http-bridge listening on 127.0.0.1:${listenPort} -> ${clamdHost}:${clamdPort}`);
});
