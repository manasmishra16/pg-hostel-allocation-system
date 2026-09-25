import { fetcher } from "./client";

export interface UserStayPreference {
  id: string;
  user_id: string;
  max_budget: number;
  preferred_localities: string[];
  preferred_gender_type: string;
  preferred_room_types: string[];
  required_amenities: string[];
  lifestyle_preferences: Record<string, any>;
  updated_at: string;
}

export interface StayMatchCategoryScore {
  category: string;
  score: number;
  max_score: number;
  percentage: number;
  details: string;
}

export interface StayMatchScoreResponse {
  property_id: string;
  property_name: string;
  locality: string;
  city: string;
  starting_rent: number;
  total_score: number;
  category_scores: StayMatchCategoryScore[];
  reasons: string[];
}

export const staymatchApi = {
  getPreferences: () => fetcher<UserStayPreference>("/staymatch/preferences"),
  updatePreferences: (data: Partial<UserStayPreference>) =>
    fetcher<UserStayPreference>("/staymatch/preferences", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  getPropertyScore: (propertyId: string) =>
    fetcher<StayMatchScoreResponse>(`/staymatch/property/${propertyId}`),
  getAllPropertyScores: () =>
    fetcher<StayMatchScoreResponse[]>("/staymatch/all"),
};
