import type { CommercialLicense, CommercialSeatPool } from "@rtb/types";
import type { LicenceSeatPoolView, SeatAssignmentView } from "./administration-types";

function mapLicenceStatus(status: string): LicenceSeatPoolView["licenceStatus"] {
  if (status === "active" || status === "expiring_soon") return "active";
  if (status === "suspended") return "suspended";
  return "expired";
}

export function mapLicenceSeatPools(
  licenses: CommercialLicense[],
  seatPools: CommercialSeatPool[],
  productNameById: Map<string, string>
): LicenceSeatPoolView[] {
  const poolViews: LicenceSeatPoolView[] = seatPools.map((pool) => ({
    id: pool.id,
    productId: pool.product_id,
    productName: productNameById.get(pool.product_id),
    licenceStatus: "active",
    seatType: pool.pool_name,
    seatLimit: pool.total_seats,
    assignedSeats: pool.assigned_seats,
    availableSeats: pool.total_seats - pool.assigned_seats,
  }));

  for (const licence of licenses) {
    if (licence.license_type === "product" || licence.license_type === "application") {
      poolViews.push({
        id: licence.id,
        productId: licence.product_id ?? "",
        productName: licence.product_id
          ? productNameById.get(licence.product_id)
          : licence.application_key ?? undefined,
        applicationKey: licence.application_key ?? undefined,
        licenceStatus: mapLicenceStatus(licence.status),
        validFrom: licence.activated_at ?? undefined,
        validUntil: licence.expires_at ?? undefined,
        seatType: "Licence",
        seatLimit: licence.max_seats ?? 0,
        assignedSeats: 0,
        availableSeats: licence.max_seats ?? 0,
      });
    }
  }

  return poolViews;
}

export function mapSeatAssignments(
  assignments: Array<{
    id: string;
    user_id: string;
    seat_type?: string;
    product_id?: string;
    workspace_id?: string;
    assigned_at?: string;
    expires_at?: string;
    user_email?: string;
  }>
): SeatAssignmentView[] {
  return assignments.map((a) => ({
    id: a.id,
    userId: a.user_id,
    userEmail: a.user_email,
    seatType: a.seat_type ?? "Full User",
    productId: a.product_id,
    workspaceId: a.workspace_id,
    assignedAt: a.assigned_at,
    expiresAt: a.expires_at,
  }));
}
