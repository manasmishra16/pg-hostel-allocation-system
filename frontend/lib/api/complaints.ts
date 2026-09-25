import { fetcher } from "./client";
import { Complaint } from "@/types";

export interface CreateComplaintPayload {
  title: string;
  description: string;
  category?: string;
  priority?: string;
  property_id?: string;
  room_id?: string;
  image_url?: string;
}

export interface UpdateComplaintPayload {
  status?: string;
  priority?: string;
  assigned_staff_id?: string;
  notes?: string;
}

export interface AITriageResponse {
  category: string;
  priority: string;
  department: string;
  summary: string;
}

export const complaintsApi = {
  getAll: (statusFilter?: string) => {
    const qs = statusFilter && statusFilter !== "ALL" ? `?status_filter=${statusFilter}` : "";
    return fetcher<Complaint[]>(`/complaints${qs}`);
  },

  getById: (id: string) => fetcher<Complaint>(`/complaints/${id}`),

  create: (data: CreateComplaintPayload) =>
    fetcher<Complaint>("/complaints", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateComplaintPayload) =>
    fetcher<Complaint>(`/complaints/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  assign: (id: string, staffId: string, notes?: string) =>
    fetcher<Complaint>(`/complaints/${id}/assign?staff_id=${staffId}${notes ? `&notes=${encodeURIComponent(notes)}` : ""}`, {
      method: "POST",
    }),

  resolve: (id: string, notes?: string) =>
    fetcher<Complaint>(`/complaints/${id}/resolve${notes ? `?notes=${encodeURIComponent(notes)}` : ""}`, {
      method: "POST",
    }),

  escalate: (id: string, reason?: string) =>
    fetcher<Complaint>(`/complaints/${id}/escalate${reason ? `?reason=${encodeURIComponent(reason)}` : ""}`, {
      method: "POST",
    }),

  previewTriage: (title: string, description: string) =>
    fetcher<AITriageResponse>(
      `/complaints/ai-triage?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}`,
      { method: "POST" }
    ),
};
