export type UserRole = "TENANT" | "PROPERTY_OWNER" | "WARDEN" | "STAFF" | "SUPER_ADMIN";

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string | null;
  role: UserRole;
  avatar_url?: string | null;
  is_active: boolean;
  created_at?: string;
}

export type BedStatus = "AVAILABLE" | "OCCUPIED" | "MAINTENANCE" | "RESERVED";

export interface Bed {
  id: string;
  room_id: string;
  bed_code: string;
  monthly_rent: number;
  status: BedStatus;
  current_tenant_id?: string | null;
  current_tenant_name?: string | null;
}

export interface Room {
  id: string;
  floor_id: string;
  room_number: string;
  room_type: string;
  capacity: number;
  base_rent: number;
  is_active: boolean;
  image_url?: string | null;
  beds: Bed[];
  occupied_count: number;
  available_count: number;
}

export interface Floor {
  id: string;
  building_id: string;
  floor_number: number;
  floor_name: string;
  rooms: Room[];
}

export interface Building {
  id: string;
  property_id: string;
  name: string;
  total_floors: number;
  floors: Floor[];
}

export interface Property {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  property_type: "PG" | "HOSTEL" | string;
  gender_type: "COED" | "BOYS" | "GIRLS" | string;
  description?: string | null;
  address: string;
  locality: string;
  city: string;
  state: string;
  pincode: string;
  starting_rent: number;
  starting_price?: number;
  rating: number;
  total_reviews: number;
  is_verified: boolean;
  is_featured: boolean;
  cover_image?: string | null;
  images_json?: string[];
  images?: string[];
  rules_json?: string[];
  amenities?: string[];
  total_beds: number;
  occupied_beds: number;
  contact_phone?: string | null;
  contact_email?: string | null;
  created_at: string;
  buildings?: Building[];
}

export interface Allocation {
  id: string;
  bed_id: string;
  tenant_id: string;
  check_in_date: string;
  check_out_date?: string | null;
  status: "ACTIVE" | "COMPLETED" | "CANCELLED" | string;
  monthly_rent: number;
  deposit_amount: number;
  notes?: string | null;
  created_at: string;
  bed_code?: string | null;
  room_number?: string | null;
  property_name?: string | null;
  tenant_name?: string | null;
}

export interface RoomOccupant {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  avatar_url?: string | null;
  is_me: boolean;
}

export interface RoomBedInfo {
  bed_id: string;
  bed_code: string;
  status: BedStatus;
  monthly_rent: number;
  is_current_user: boolean;
  occupant?: RoomOccupant | null;
}

export interface MyRoomData {
  is_allocated: boolean;
  message?: string;
  allocation_id?: string;
  check_in_date?: string;
  monthly_rent?: number;
  deposit_amount?: number;
  my_bed?: {
    id: string;
    code: string;
    rent: number;
    status: BedStatus;
  };
  room?: {
    id: string;
    number: string;
    type: string;
    capacity: number;
    image_url?: string | null;
    beds: RoomBedInfo[];
  };
  building?: string;
  floor?: string;
  property?: {
    id: string;
    name: string;
    locality: string;
    city: string;
    contact_phone?: string;
  };
  roommates?: RoomOccupant[];
}

export interface InvoiceItem {
  id: string;
  description: string;
  amount: number;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  tenant_id: string;
  property_id?: string | null;
  billing_period: string;
  due_date: string;
  subtotal: number;
  electricity_charges: number;
  maintenance_charges: number;
  total_amount: number;
  status: "PENDING" | "PAID" | "OVERDUE" | "CANCELLED";
  paid_at?: string | null;
  created_at: string;
  items?: InvoiceItem[];
}

export interface Payment {
  id: string;
  invoice_id?: string | null;
  tenant_id: string;
  amount: number;
  status: "COMPLETED" | "PENDING" | "FAILED";
  payment_date?: string | null;
  payment_method: string;
  transaction_id?: string | null;
  month_year: string;
  description?: string | null;
  receipt_url?: string | null;
  created_at: string;
}

export interface PaymentSummary {
  next_due_amount: number;
  next_due_date: string;
  next_invoice_id?: string | null;
  next_invoice_number?: string | null;
  total_paid: number;
  total_pending: number;
  payment_status: "Good" | "Attention Needed" | string;
}

export interface Complaint {
  id: string;
  tenant_id: string;
  property_id?: string | null;
  room_id?: string | null;
  title: string;
  description: string;
  category: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: "PENDING" | "ASSIGNED" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  image_url?: string | null;
  ai_summary?: string | null;
  suggested_department?: string | null;
  escalated: boolean;
  created_at: string;
  resolved_at?: string | null;
  tenant_name?: string | null;
  room_number?: string | null;
  staff_name?: string | null;
}

export interface Notice {
  id: string;
  property_id?: string | null;
  title: string;
  description: string;
  priority: "LOW" | "NORMAL" | "MEDIUM" | "HIGH" | "URGENT";
  is_pinned: boolean;
  is_active: boolean;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: "PAYMENT" | "COMPLAINT" | "NOTICE" | "GENERAL" | string;
  is_read: boolean;
  link?: string | null;
  created_at: string;
}

export interface DocumentItem {
  id: string;
  user_id: string;
  document_type: string;
  title: string;
  file_url: string;
  signed_url?: string | null;
  verification_status: "VERIFIED" | "PENDING" | "REJECTED";
  is_private: boolean;
  created_at: string;
}

export interface RoommateMatchCard {
  tenant_id: string;
  full_name: string;
  avatar_url?: string | null;
  course: string;
  year_of_study: number;
  overall_compatibility: number;
  academic_compatibility: number;
  lifestyle_compatibility: number;
  sleep_compatibility: number;
  cleanliness_compatibility: number;
  noise_compatibility: number;
  match_tag: string;
  room_number?: string | null;
  bed_code?: string | null;
  bio?: string | null;
  hobbies?: string | null;
}

export interface RoommatePreference {
  id?: string;
  tenant_id?: string;
  course?: string;
  year_of_study?: number;
  sleep_schedule?: string;
  noise_tolerance?: number | string;
  cleanliness?: number;
  smoking?: string;
  drinking?: string;
  food_preference?: string;
  study_habits?: string;
  bio?: string | null;
  hobbies?: string | null;
  created_at?: string;
}

export interface DashboardStats {
  total_properties: number;
  total_residents: number;
  occupancy_rate: number;
  monthly_revenue: number;
  pending_complaints: number;
  pending_invoices_amount: number;
  recent_complaints?: Complaint[];
  recent_notices?: Notice[];
}
