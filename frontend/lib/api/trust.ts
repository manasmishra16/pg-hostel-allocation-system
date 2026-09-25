import { fetcher } from "./client";

export interface TrustScoreSubmetric {
  name: string;
  score: number;
  max_score: number;
  weight_pct: number;
  evidence: string;
}

export interface PropertyTrustScoreResponse {
  property_id: string;
  property_name: string;
  overall_trust_score: number;
  verification_score: number;
  availability_accuracy_score: number;
  complaint_resolution_score: number;
  payment_reliability_score: number;
  resident_experience_score: number;
  submetrics: TrustScoreSubmetric[];
  audit_summary: string;
  last_calculated_at: string;
}

export const trustApi = {
  getPropertyTrustScore: (propertyId: string) =>
    fetcher<PropertyTrustScoreResponse>(`/trust/property/${propertyId}`),
  recalculateTrustScore: (propertyId: string) =>
    fetcher<PropertyTrustScoreResponse>(`/trust/property/${propertyId}/recalculate`, {
      method: "POST",
    }),
};
