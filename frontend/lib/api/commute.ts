import { fetcher } from "./client";

export interface UserDestination {
  id: string;
  user_id: string;
  name: string;
  destination_type: "WORK" | "COLLEGE" | "OTHER";
  address: string;
  latitude: number;
  longitude: number;
  travel_mode: "DRIVING" | "TRANSIT" | "TWO_WHEELER" | "WALKING";
  is_primary: boolean;
  created_at: string;
}

export interface CommuteCalculationResponse {
  destination_id: string;
  destination_name: string;
  property_id: string;
  property_name: string;
  travel_mode: string;
  distance_km: number | null;
  duration_mins: number | null;
  provider: string;
  is_cached: boolean;
  status: "AVAILABLE" | "UNAVAILABLE";
  message?: string | null;
}

export const commuteApi = {
  getDestinations: () => fetcher<UserDestination[]>("/commute/destinations"),
  addDestination: (data: {
    name: string;
    destination_type?: string;
    address: string;
    latitude: number;
    longitude: number;
    travel_mode?: string;
    is_primary?: boolean;
  }) =>
    fetcher<UserDestination>("/commute/destinations", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  deleteDestination: (id: string) =>
    fetcher<{ status: string; message: string }>(`/commute/destinations/${id}`, {
      method: "DELETE",
    }),
  calculateCommute: (propertyId: string, destinationId: string) =>
    fetcher<CommuteCalculationResponse>(
      `/commute/calculate?property_id=${propertyId}&destination_id=${destinationId}`
    ),
  getPropertyCommutes: (propertyId: string) =>
    fetcher<CommuteCalculationResponse[]>(`/commute/property/${propertyId}`),
};
