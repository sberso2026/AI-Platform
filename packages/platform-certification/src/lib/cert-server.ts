import { execSync, spawn, type ChildProcess } from "node:child_process";
import net from "node:net";
import { resolve } from "node:path";

function log(msg: string): void {
  console.log(`[platform-7b:cert-server] ${msg}`);
}

async function findFreePort(): Promise<number> {
  return new Promise((resolvePort, reject) => {
    const server = net.createServer();
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        server.close();
        reject(new Error("Unable to resolve free port"));
        return;
      }
      const port = address.port;
      server.close((err) => (err ? reject(err) : resolvePort(port)));
    });
    server.on("error", reject);
  });
}

async function waitForEndpoint(url: string, timeoutMs = 180_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  let lastError = "timeout";
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url, { headers: { Accept: "application/json" } });
      if (res.ok) return;
      lastError = `status ${res.status}`;
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`Server not ready at ${url}: ${lastError}`);
}

export class CertificationServer {
  private proc: ChildProcess | null = null;
  private port = 0;
  private readonly webDir: string;

  constructor(private readonly root: string) {
    this.webDir = resolve(root, "apps/web");
  }

  get baseUrl(): string {
    return `http://127.0.0.1:${this.port}`;
  }

  async start(): Promise<number> {
    this.port = await findFreePort();
    log(`Building @rtb/web...`);
    execSync("pnpm build", {
      cwd: this.webDir,
      stdio: "inherit",
      env: { ...process.env, FORCE_COLOR: "0" },
    });
    log(`Starting server on ${this.port}`);
    this.proc = spawn("pnpm", ["start"], {
      cwd: this.webDir,
      env: { ...process.env, PORT: String(this.port), HOSTNAME: "127.0.0.1" },
      stdio: "inherit",
      shell: true,
    });
    await waitForEndpoint(`${this.baseUrl}/api/platform/build-identity`);
    process.env.RTB_TEST_BASE_URL = this.baseUrl;
    return this.port;
  }

  async stop(): Promise<void> {
    if (!this.proc?.pid) return;
    try {
      process.kill(this.proc.pid);
    } catch {
      /* ignore */
    }
    this.proc = null;
  }
}
