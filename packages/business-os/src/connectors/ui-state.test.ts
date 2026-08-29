import { describe, expect, it } from "vitest";
import {
  BOS_CONNECTOR_UI_STATES,
  assertConnectorUiTransition,
  bosConnectorUiState,
} from "./ui-state";

describe("canonical connector UI state", () => {
  it("defines the shared state model", () => {
    expect([...BOS_CONNECTOR_UI_STATES]).toEqual([
      "NOT_CONNECTED",
      "CONNECTING",
      "CONNECTED",
      "SYNCING",
      "ERROR",
      "REAUTH_REQUIRED",
      "DISCONNECTED",
    ]);
  });

  it("allows documented transitions and fails closed", () => {
    expect(() => assertConnectorUiTransition("NOT_CONNECTED", "CONNECTING")).not.toThrow();
    expect(() => assertConnectorUiTransition("CONNECTING", "CONNECTED")).not.toThrow();
    expect(() => assertConnectorUiTransition("CONNECTED", "SYNCING")).not.toThrow();
    expect(() => assertConnectorUiTransition("CONNECTED", "DISCONNECTED")).not.toThrow();
    expect(() => assertConnectorUiTransition("ERROR", "ERROR")).not.toThrow();
    expect(() => assertConnectorUiTransition("CONNECTED", "CONNECTING")).toThrow("invalid_connector_ui_transition");
    expect(() => assertConnectorUiTransition("DISCONNECTED", "CONNECTED")).toThrow("invalid_connector_ui_transition");
  });

  it("maps installation health without duplicating provider runtimes", () => {
    expect(
      bosConnectorUiState({
        health: "unconfigured",
        effectiveMode: "fixture",
        secretId: null,
        errorCategory: null,
      }),
    ).toBe("NOT_CONNECTED");
    expect(
      bosConnectorUiState({
        health: "unavailable",
        effectiveMode: "fixture",
        secretId: null,
        errorCategory: "oauth_pending",
        oauthPending: true,
      }),
    ).toBe("CONNECTING");
    expect(
      bosConnectorUiState({
        health: "configured",
        effectiveMode: "fixture",
        secretId: "secret_ref",
        errorCategory: null,
      }),
    ).toBe("CONNECTED");
    expect(
      bosConnectorUiState({
        health: "healthy",
        effectiveMode: "fixture",
        secretId: "secret_ref",
        errorCategory: null,
        inFlightSync: true,
      }),
    ).toBe("SYNCING");
    expect(
      bosConnectorUiState({
        health: "unavailable",
        effectiveMode: "fixture",
        secretId: "secret_ref",
        errorCategory: "timeout",
      }),
    ).toBe("ERROR");
    expect(
      bosConnectorUiState({
        health: "unavailable",
        effectiveMode: "fixture",
        secretId: "secret_ref",
        errorCategory: "reauth_required",
      }),
    ).toBe("REAUTH_REQUIRED");
    expect(
      bosConnectorUiState({
        health: "revoked",
        effectiveMode: "fixture",
        secretId: null,
        errorCategory: "revoked",
      }),
    ).toBe("DISCONNECTED");
  });
});
