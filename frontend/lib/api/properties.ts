import { fetcher } from "./client";
import { Property } from "@/types";

export interface PropertyFilterParams {
  locality?: string;
  city?: string;
  property_type?: string;
  gender_type?: string;
  min_budget?: number;
  max_budget?: number;
  search?: string;
  room_type?: string;
  has_ac?: boolean;
  has_food?: boolean;
  has_wifi?: boolean;
  has_laundry?: boolean;
  has_parking?: boolean;
  has_security?: boolean;
  available_only?: boolean;
  sort_by?: string;
  skip?: number;
  limit?: number;
}

export interface CreatePropertyPayload {
  name: string;
  property_type: string;
  gender_type: string;
  description?: string;
  address: string;
  locality: string;
  city?: string;
  state?: string;
  pincode?: string;
  starting_rent?: number;
  starting_price?: number;
  cover_image?: string;
  images_json?: string[];
  images?: string[];
  amenities?: string[];
  contact_phone?: string;
  contact_email?: string;
  total_floors?: number;
  rooms_per_floor?: number;
  beds_per_room?: number;
}

export const propertiesApi = {
  getAll: (params?: PropertyFilterParams) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "" && value !== "All") {
          query.append(key, String(value));
        }
      });
    }
    const qs = query.toString() ? `?${query.toString()}` : "";
    return fetcher<Property[]>(`/properties${qs}`);
  },

  getById: (idOrSlug: string) => fetcher<Property>(`/properties/${idOrSlug}`),

  create: (data: CreatePropertyPayload) =>
    fetcher<Property>("/properties", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<CreatePropertyPayload>) =>
    fetcher<Property>(`/properties/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetcher<{ detail: string; id: string }>(`/properties/${id}`, {
      method: "DELETE",
    }),
};
