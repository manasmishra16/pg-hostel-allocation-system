import { fetcher } from "./client";
import { Room, Bed, BedStatus, Building, Floor } from "@/types";

export interface CreateBuildingPayload {
  property_id: string;
  name: string;
  total_floors?: number;
}

export interface CreateFloorPayload {
  building_id: string;
  floor_number: number;
  floor_name: string;
}

export interface CreateRoomPayload {
  floor_id: string;
  room_number: string;
  room_type?: string;
  capacity?: number;
  base_rent?: number;
  image_url?: string;
}

export interface CreateBedPayload {
  room_id: string;
  bed_code: string;
  monthly_rent?: number;
  status?: BedStatus;
}

export const roomsApi = {
  getRooms: (propertyId?: string) => {
    const qs = propertyId ? `?property_id=${propertyId}` : "";
    return fetcher<Room[]>(`/rooms${qs}`);
  },

  getBeds: (roomId?: string, statusFilter?: string) => {
    const q = new URLSearchParams();
    if (roomId) q.append("room_id", roomId);
    if (statusFilter && statusFilter !== "ALL") q.append("status_filter", statusFilter);
    const qs = q.toString() ? `?${q.toString()}` : "";
    return fetcher<Bed[]>(`/rooms/beds${qs}`);
  },

  createBuilding: (data: CreateBuildingPayload) =>
    fetcher<Building>("/rooms/buildings", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  createFloor: (data: CreateFloorPayload) =>
    fetcher<Floor>("/rooms/floors", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  createRoom: (data: CreateRoomPayload) =>
    fetcher<Room>("/rooms", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  createBed: (data: CreateBedPayload) =>
    fetcher<Bed>("/rooms/beds", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateBedStatus: (bedId: string, status: BedStatus) =>
    fetcher<Bed>(`/rooms/beds/${bedId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
};
