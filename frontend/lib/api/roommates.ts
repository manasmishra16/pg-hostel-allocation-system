import { fetcher } from "./client";
import { RoommateMatchCard, RoommatePreference } from "@/types";

export const roommatesApi = {
  getMatches: () => fetcher<RoommateMatchCard[]>("/roommates/matches"),

  getPreferences: () => fetcher<RoommatePreference>("/roommates/preferences"),

  updatePreferences: (data: Partial<RoommatePreference>) =>
    fetcher<RoommatePreference>("/roommates/preferences", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};
