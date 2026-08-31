import { describe, it, expect } from "vitest";
import { PermissionService, permissionsFromRole } from "../src/permissions";
import type { Permission } from "@rtb/types";

describe("PermissionService", () => {
  const service = new PermissionService({} as never);

  it("grants access when permission matches resource and action", () => {
    const permissions: Permission[] = [
      { resource: "workspace", action: "read" },
    ];
    expect(service.hasPermission(permissions, "workspace", "read")).toBe(true);
  });

  it("grants access when user has admin on resource", () => {
    const permissions: Permission[] = [
      { resource: "workspace", action: "admin" },
    ];
    expect(service.hasPermission(permissions, "workspace", "delete")).toBe(true);
  });

  it("maps owner slug to tenant admin without a second role read", () => {
    expect(permissionsFromRole("owner", [])).toEqual([{ resource: "tenant", action: "admin" }]);
    expect(permissionsFromRole("engineer", [{ resource: "workspace", action: "read" }])).toEqual([
      { resource: "workspace", action: "read" },
    ]);
  });

  it("denies access when permission does not match", () => {
    const permissions: Permission[] = [
      { resource: "workspace", action: "read" },
    ];
    expect(service.hasPermission(permissions, "user", "admin")).toBe(false);
  });
});
