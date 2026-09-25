import { fetcher } from "./client";
import { Notice } from "@/types";

export interface CreateNoticePayload {
  title: string;
  description: string;
  priority?: string;
  property_id?: string;
  is_pinned?: boolean;
}

export const noticesApi = {
  getAll: (propertyId?: string) => {
    const qs = propertyId ? `?property_id=${propertyId}` : "";
    return fetcher<Notice[]>(`/notices${qs}`);
  },

  create: (data: CreateNoticePayload) =>
    fetcher<Notice>("/notices", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
