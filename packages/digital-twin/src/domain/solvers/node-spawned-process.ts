/**
 * Node child-process boundary for Digital Twin solvers.
 *
 * Web consumers compile this package with DOM libs. Node `spawn` overloads then
 * collapse ChildProcess intersections (stdin) to `never`, and sandboxed env
 * objects fail ProcessEnv because NODE_ENV is required. This module types the
 * spawned process without weakening global DOM or ProcessEnv contracts.
 */

import { spawn } from "node:child_process";

export type NodeSpawnedStream = {
  on(event: "data", listener: (chunk: Buffer) => void): NodeSpawnedStream;
};

export type NodeSpawnedProcess = {
  kill(signal?: string): boolean;
  stdout: NodeSpawnedStream | null;
  stderr: NodeSpawnedStream | null;
  on(event: "error", listener: (err: Error) => void): NodeSpawnedProcess;
  on(
    event: "close",
    listener: (code: number | null, signal: string | null) => void,
  ): NodeSpawnedProcess;
};

export type SandboxedSolverEnv = {
  PATH?: string;
  SYSTEMROOT?: string;
  LANG: string;
};

function asNodeSpawnedProcess(value: unknown): NodeSpawnedProcess {
  if (!value || typeof value !== "object") {
    throw new Error("solver_process_spawn_failed");
  }
  return value as NodeSpawnedProcess;
}

export function spawnSandboxedSolverProcess(
  command: string,
  args: readonly string[],
  options: { cwd: string; env: SandboxedSolverEnv },
): NodeSpawnedProcess {
  const child = spawn(command, [...args], {
    cwd: options.cwd,
    shell: false,
    windowsHide: true,
    env: {
      NODE_ENV: process.env.NODE_ENV,
      PATH: options.env.PATH,
      SYSTEMROOT: options.env.SYSTEMROOT,
      LANG: options.env.LANG,
    },
  });
  return asNodeSpawnedProcess(child);
}
