import { fetcher } from "./client";
import { DashboardStats } from "@/types";

export const analyticsApi = {
  getDashboard: (propertyId?: string) => {
    const qs = propertyId ? `?property_id=${propertyId}` : "";
    return fetcher<DashboardStats>(`/analytics/dashboard${qs}`);
  },

  getOwnerDashboard: (propertyId?: string) => {
    return analyticsApi.getDashboard(propertyId);
  },

  getAdminDashboard: () => {
    return analyticsApi.getDashboard();
  },
};
