import { execSync, spawn, type ChildProcess } from "node:child_process";
import net from "node:net";
import { resolve } from "node:path";

function log(msg: string): void {
  console.log(`[installation:cert-server] ${msg}`);
}

export async function findFreePort(): Promise<number> {
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

async function waitForEndpoint(url: string, timeoutMs = 120_000): Promise<void> {
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

  throw new Error(`Server did not become ready at ${url}: ${lastError}`);
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

  get listeningPort(): number {
    return this.port;
  }

  async start(options: { skipBuild?: boolean } = {}): Promise<number> {
    this.port = await findFreePort();
    log(`Selected certification port ${this.port}`);

    if (!options.skipBuild) {
      log("Building @rtb/web for certification server...");
      execSync("pnpm build", {
        cwd: this.webDir,
        stdio: "inherit",
        env: { ...process.env, FORCE_COLOR: "0" },
      });
    }

    log(`Starting next start on ${this.baseUrl}`);
    this.proc = spawn("pnpm", ["start"], {
      cwd: this.webDir,
      env: {
        ...process.env,
        PORT: String(this.port),
        HOSTNAME: "127.0.0.1",
      },
      stdio: "pipe",
      shell: true,
    });

    this.proc.stdout?.on("data", (chunk: Buffer) => {
      const text = chunk.toString();
      if (text.toLowerCase().includes("error")) log(text.trim());
    });
    this.proc.stderr?.on("data", (chunk: Buffer) => {
      const text = chunk.toString();
      if (text.trim()) log(text.trim());
    });

    await waitForEndpoint(`${this.baseUrl}/api/platform/build-identity`);
    process.env.RTB_TEST_BASE_URL = this.baseUrl;
    log(`Certification server ready at ${this.baseUrl}`);
    return this.port;
  }

  stop(): void {
    if (!this.proc) return;
    log("Stopping certification server");
    this.proc.kill("SIGTERM");
    this.proc = null;
  }
}
