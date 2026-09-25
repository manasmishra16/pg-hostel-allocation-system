import { fetcher } from "./client";
import { Invoice } from "@/types";

export interface CreateInvoicePayload {
  tenant_id: string;
  property_id?: string;
  billing_period: string;
  due_date?: string;
  subtotal: number;
  electricity_charges?: number;
  maintenance_charges?: number;
  discount?: number;
  items?: { description: string; amount: number }[];
}

export const invoicesApi = {
  getMy: () => fetcher<Invoice[]>("/invoices/my"),

  getAll: (propertyId?: string, statusFilter?: string) => {
    const q = new URLSearchParams();
    if (propertyId) q.append("property_id", propertyId);
    if (statusFilter && statusFilter !== "ALL") q.append("status_filter", statusFilter);
    const qs = q.toString() ? `?${q.toString()}` : "";
    return fetcher<Invoice[]>(`/invoices${qs}`);
  },

  getById: (id: string) => fetcher<Invoice>(`/invoices/${id}`),

  getReceipt: (id: string) => fetcher<any>(`/invoices/${id}/receipt`),

  create: (data: CreateInvoicePayload) =>
    fetcher<Invoice>("/invoices", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
