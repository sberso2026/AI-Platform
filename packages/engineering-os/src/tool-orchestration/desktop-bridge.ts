import { randomUUID } from "node:crypto";
import { DESKTOP_BRIDGE_STATUS, DESKTOP_PROTOCOL, type EngineeringToolHandoff } from "./types";

export function desktopBridgeContract() {
  return {
    status: DESKTOP_BRIDGE_STATUS,
    protocol: `${DESKTOP_PROTOCOL}://handoff/{handoffId}`,
    mayMonitorDesktop: false,
    mayScanLocalDrives: false,
    mayCaptureKeystrokes: false,
    mayCaptureBrowserHistory: false,
    mayRecordTimeInApplications: false,
    mayCapturePersonalFiles: false,
    requiresAuthentication: true,
    requiresDeviceRegistration: true,
    token: "short-lived signed handoff id/token only",
    forbiddenInUrl: ["JWT", "password", "TOTP", "secret", "file content", "arbitrary command"],
  };
}

export function protocolUrlFor(handoffId: string) {
  return `${DESKTOP_PROTOCOL}://handoff/${handoffId}`;
}

export function newHandoffId() {
  return randomUUID();
}

export function assertContractHandoff(row: EngineeringToolHandoff) {
  if (row.protocolUrl?.includes("eyJ")) throw new Error("jwt_in_protocol_forbidden");
  if (row.launchedNativeApplication) throw new Error("native_launch_not_implemented");
}
