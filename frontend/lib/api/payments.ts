import { fetcher } from "./client";
import { Payment, PaymentSummary } from "@/types";

export interface CreateOrderResponse {
  order_id: string;
  amount: number;
  currency: string;
  key_id: string;
  invoice_number: string;
}

export interface VerifyPaymentPayload {
  invoice_id: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export const paymentsApi = {
  getSummary: () => fetcher<PaymentSummary>("/payments/summary"),

  createOrder: (invoiceId: string, amount: number) =>
    fetcher<CreateOrderResponse>("/payments/create-order", {
      method: "POST",
      body: JSON.stringify({ invoice_id: invoiceId, amount }),
    }),

  verify: (data: VerifyPaymentPayload) =>
    fetcher<Payment>("/payments/verify", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getHistory: () => fetcher<Payment[]>("/payments/history"),
};
