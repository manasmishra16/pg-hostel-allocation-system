import { fetcher } from "./client";

export interface PreventiveAction {
  id: string;
  property_id: string;
  room_id?: string | null;
  room_number?: string | null;
  category: "PLUMBING" | "ELECTRICAL" | "HVAC" | "APPLIANCE" | "STRUCTURE" | "WIFI";
  title: string;
  description: string;
  risk_level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: "RECOMMENDED" | "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "DISMISSED";
  scheduled_date?: string | null;
  completed_at?: string | null;
  assigned_staff_id?: string | null;
  assigned_staff_name?: string | null;
  cost_estimate?: number | null;
  created_at: string;
}

export interface RoomRiskAssessment {
  room_id: string;
  room_number: string;
  risk_score: number;
  risk_level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  complaint_count_90d: number;
  primary_category: string;
  reasons: string[];
}

export interface CategoryRiskAssessment {
  category: string;
  risk_score: number;
  risk_level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  complaint_count_90d: number;
  recurring_count: number;
  avg_mttr_hours?: number | null;
  reasons: string[];
}

export interface PropertyMaintenanceRiskResponse {
  property_id: string;
  property_name: string;
  overall_risk_score: number;
  overall_risk_level: "LOW" | "MEDIUM" | "HIGH";
  category_risks: CategoryRiskAssessment[];
  high_risk_rooms: RoomRiskAssessment[];
  recommended_actions: PreventiveAction[];
  total_historical_complaints: number;
}

export const maintenanceApi = {
  getPropertyRisk: (propertyId: string) =>
    fetcher<PropertyMaintenanceRiskResponse>(`/maintenance/risk/${propertyId}`),
  getActions: (propertyId: string) =>
    fetcher<PreventiveAction[]>(`/maintenance/actions?property_id=${propertyId}`),
  createAction: (data: {
    property_id: string;
    room_id?: string | null;
    category: string;
    title: string;
    description: string;
    risk_level?: string;
    scheduled_date?: string | null;
    cost_estimate?: number | null;
  }) =>
    fetcher<PreventiveAction>("/maintenance/actions", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateAction: (
    actionId: string,
    data: {
      status?: string;
      scheduled_date?: string | null;
      completed_at?: string | null;
      notes?: string | null;
    }
  ) =>
    fetcher<PreventiveAction>(`/maintenance/actions/${actionId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
};
