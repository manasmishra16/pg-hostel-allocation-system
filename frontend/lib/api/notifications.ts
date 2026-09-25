import { fetcher } from "./client";
import { Notification } from "@/types";

export const notificationsApi = {
  getAll: () => fetcher<Notification[]>("/notifications"),

  markRead: (id: string) =>
    fetcher<Notification>(`/notifications/${id}/read`, {
      method: "PATCH",
    }),
};
