import { fetcher } from "./client";
import { MyRoomData, Allocation } from "@/types";

export interface CreateAllocationPayload {
  bed_id: string;
  tenant_id: string;
  check_in_date?: string;
  monthly_rent?: number;
  deposit_amount?: number;
  notes?: string;
}

export const allocationsApi = {
  getMyRoom: () => fetcher<MyRoomData>("/allocations/my-room"),

  getAll: (propertyId?: string, status?: string) => {
    const q = new URLSearchParams();
    if (propertyId) q.append("property_id", propertyId);
    if (status && status !== "ALL") q.append("status", status);
    const qs = q.toString() ? `?${q.toString()}` : "";
    return fetcher<Allocation[]>(`/allocations${qs}`);
  },

  create: (data: CreateAllocationPayload) =>
    fetcher<Allocation>("/allocations", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  release: (allocationId: string) =>
    fetcher<Allocation>(`/allocations/${allocationId}/release`, {
      method: "POST",
    }),
};
