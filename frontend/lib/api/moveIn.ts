import { fetcher } from "./client";

export type MoveInStatus =
  | "INITIATED"
  | "KYC_SUBMITTED"
  | "KYC_VERIFIED"
  | "AGREEMENT_SIGNED"
  | "DEPOSIT_PAID"
  | "INSPECTION_COMPLETED"
  | "KEY_HANDED_OVER"
  | "MOVE_IN_COMPLETED"
  | "REJECTED";

export interface MoveInAuditLog {
  id: string;
  workflow_id: string;
  from_status: string;
  to_status: string;
  action: string;
  performed_by?: string | null;
  performer_name?: string | null;
  notes?: string | null;
  timestamp: string;
}

export interface MoveInWorkflow {
  id: string;
  allocation_id: string;
  tenant_id: string;
  tenant_name?: string;
  property_id: string;
  property_name?: string;
  bed_id: string;
  bed_code?: string;
  room_number?: string;
  status: MoveInStatus;
  kyc_document_id?: string | null;
  kyc_verified_at?: string | null;
  agreement_signed_at?: string | null;
  agreement_document_url?: string | null;
  deposit_paid_at?: string | null;
  inspection_notes?: string | null;
  inspection_passed?: boolean | null;
  inspection_completed_at?: string | null;
  key_number?: string | null;
  key_handed_over_at?: string | null;
  created_at: string;
  updated_at: string;
  audit_logs: MoveInAuditLog[];
}

export interface MoveInActionPayload {
  action:
    | "SUBMIT_KYC"
    | "VERIFY_KYC"
    | "SIGN_AGREEMENT"
    | "PAY_DEPOSIT"
    | "COMPLETE_INSPECTION"
    | "HANDOVER_KEYS"
    | "COMPLETE_MOVE_IN"
    | "REJECT";
  notes?: string;
  document_id?: string;
  signature?: string;
  payment_id?: string;
  inspection_passed?: boolean;
  inspection_notes?: string;
  key_number?: string;
}

export const moveInApi = {
  getStatus: () => fetcher<MoveInWorkflow | null>("/move-in/status"),
  getWorkflowById: (id: string) => fetcher<MoveInWorkflow>(`/move-in/${id}`),
  executeAction: (workflowId: string, payload: MoveInActionPayload) =>
    fetcher<MoveInWorkflow>(`/move-in/${workflowId}/action`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getPropertyWorkflows: (propertyId: string) =>
    fetcher<MoveInWorkflow[]>(`/move-in/property/${propertyId}`),
};
