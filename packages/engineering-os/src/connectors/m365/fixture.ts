import { CRUSHER_EXPANSION_FEED_PROJECT_ID } from "../../lifecycle-intelligence/fixture";
import { CRUSHER_FEED_TENANT, CRUSHER_FEED_WORKSPACE } from "../../digital-thread/fixture";
import type { GraphDriveItem, M365Connection } from "./types";

export const A13A_CONNECTION_ID = "conn-m365-a13a";
export const A13A_SITE_ID = "site-project-a";
export const A13A_DRIVE_A = "drive-project-a";
export const A13A_DRIVE_B = "drive-project-b";
export const A13A_ITEM_LOAD = "item-mech-load";
export const A13A_UNMANAGED_SITE = "site-unmanaged";
export const PROJECT_B_ID = "project-b-isolation";

export function a13aConnection(overrides: Partial<M365Connection> = {}): M365Connection {
  const stamp = "2026-10-01T00:00:00.000Z";
  return {
    id: A13A_CONNECTION_ID,
    tenantId: CRUSHER_FEED_TENANT,
    workspaceId: CRUSHER_FEED_WORKSPACE,
    displayName: "Contoso Engineering M365",
    microsoftTenantId: "11111111-2222-3333-4444-555555555555",
    applicationId: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
    credentialSecretId: "secret:m365-graph-client",
    authMode: "CLIENT_SECRET",
    status: "CONFIGURED",
    enabled: true,
    createdBy: "eng-admin",
    createdAt: stamp,
    updatedAt: stamp,
    ...overrides,
  };
}

export function mechLoadItem(overrides: Partial<GraphDriveItem> = {}): GraphDriveItem {
  return {
    id: A13A_ITEM_LOAD,
    name: "Mechanical_Load_Rev_C.xlsx",
    parentId: "folder-loads",
    siteId: A13A_SITE_ID,
    driveId: A13A_DRIVE_A,
    driveType: "documentLibrary",
    webUrl: "https://contoso.sharepoint.com/sites/eng/Mechanical_Load_Rev_C.xlsx",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    size: 2048,
    etag: "etag-rev-c",
    ctag: "ctag-rev-c",
    lastModifiedAt: "2026-09-30T08:00:00.000Z",
    lastModifiedBy: "mech-lead",
    pathWithinRoot: "/Engineering/Mechanical/Mechanical_Load_Rev_C.xlsx",
    ...overrides,
  };
}

export function personalOneDriveItem(): GraphDriveItem {
  return {
    id: "item-personal",
    name: "Mortgage.xlsx",
    parentId: "root",
    siteId: "personal-site",
    driveId: "me-drive",
    driveType: "personal",
    webUrl: "https://contoso-my.sharepoint.com/personal/user/Mortgage.xlsx",
    pathWithinRoot: "/personal/Mortgage.xlsx",
  };
}

export function unmanagedSiteItem(): GraphDriveItem {
  return {
    id: "item-unmanaged",
    name: "Secret.docx",
    parentId: "root",
    siteId: A13A_UNMANAGED_SITE,
    driveId: "drive-unmanaged",
    driveType: "documentLibrary",
    webUrl: "https://contoso.sharepoint.com/sites/unmanaged/Secret.docx",
    pathWithinRoot: "/Secret.docx",
    etag: "etag-u",
    lastModifiedAt: "2026-09-30T09:00:00.000Z",
  };
}

export { CRUSHER_EXPANSION_FEED_PROJECT_ID, CRUSHER_FEED_TENANT, CRUSHER_FEED_WORKSPACE };
