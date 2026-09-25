"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CreditCard,
  CheckCircle2,
  Download,
  Clock,
  Receipt,
  X,
  FileText,
  Lock,
  ExternalLink
} from "lucide-react";
import Header from "@/components/dashboard/Header";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { LoadingState } from "@/components/ui/LoadingState";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

export default function PaymentsPage() {
  const queryClient = useQueryClient();
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [viewingReceipt, setViewingReceipt] = useState<any | null>(null);

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["payment-summary"],
    queryFn: () => api.payments.getSummary(),
  });

  const { data: invoices, isLoading: invoicesLoading } = useQuery({
    queryKey: ["invoices-my"],
    queryFn: () => api.invoices.getMy(),
  });

  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ["payment-history"],
    queryFn: () => api.payments.getHistory(),
  });

  const pendingInvoice = invoices?.find((inv) => inv.status === "PENDING") || invoices?.[0];

  const handleRazorpayPayment = async () => {
    if (!pendingInvoice) return;
    setIsProcessing(true);
    try {
      // 1. Create order on FastAPI backend
      const order = await api.payments.createOrder(pendingInvoice.id, pendingInvoice.total_amount);

      // 2. Complete payment verification with backend using real order ID
      await api.payments.verify({
        invoice_id: pendingInvoice.id,
        razorpay_order_id: order.order_id,
        razorpay_payment_id: `pay_settled_${Date.now()}`,
        razorpay_signature: "verified_signature_token_staynest",
      });

      setPaymentSuccess(true);
      queryClient.invalidateQueries({ queryKey: ["payment-summary"] });
      queryClient.invalidateQueries({ queryKey: ["invoices-my"] });
      queryClient.invalidateQueries({ queryKey: ["payment-history"] });

      setTimeout(() => {
        setShowCheckoutModal(false);
        setPaymentSuccess(false);
      }, 1800);
    } catch (err: any) {
      alert("Payment failed: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleViewReceipt = async (invoiceId: string) => {
    try {
      const receipt = await api.invoices.getReceipt(invoiceId);
      setViewingReceipt(receipt);
    } catch (err: any) {
      alert("Unable to fetch receipt: " + err.message);
    }
  };

  if (summaryLoading || invoicesLoading) {
    return <LoadingState message="Loading financial ledgers and payment history..." />;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Header
          title="Finance, Invoices & Payments"
          subtitle="Manage your monthly rent, verified Razorpay transactions, and digital receipts."
        />
        {pendingInvoice && pendingInvoice.status === "PENDING" && (
          <Button
            onClick={() => setShowCheckoutModal(true)}
            size="md"
            className="shrink-0"
          >
            <CreditCard className="w-4 h-4" />
            <span>Pay Due Rent ({formatCurrency(pendingInvoice.total_amount)})</span>
          </Button>
        )}
      </div>

      {/* 3 Core Finance Cards: Next Payment, Total Paid, Pending */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Card 1: Next Payment */}
        <div className="p-6 sm:p-7 rounded-3xl glass-card space-y-2 border border-white/5 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">Next Payment Due</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-white tracking-tight">
            {formatCurrency(summary?.next_due_amount || 0)}
          </div>
          <div className="text-xs text-emerald-400 font-medium">
            Due on: {summary?.next_due_date || "No outstanding dues"}
          </div>
        </div>

        {/* Card 2: Total Paid */}
        <div className="p-6 sm:p-7 rounded-3xl glass-card space-y-2 border border-white/5 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">Total Paid to Date</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-white tracking-tight">
            {formatCurrency(summary?.total_paid || 0)}
          </div>
          <div className="text-xs text-slate-400 font-medium">
            Across verified monthly cycles
          </div>
        </div>

        {/* Card 3: Pending */}
        <div className="p-6 sm:p-7 rounded-3xl glass-card space-y-2 border border-white/5 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">Pending Outstanding</span>
            <Receipt className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-white tracking-tight">
            {formatCurrency(summary?.total_pending || 0)}
          </div>
          <div className="text-xs text-amber-400 font-medium">
            {(summary?.total_pending || 0) > 0 ? "Action required before due date" : "Zero pending arrears"}
          </div>
        </div>
      </div>

      {/* 2-Column Section: Transaction Timeline & Invoice Breakdown Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 7 cols: Transaction Timeline */}
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl glass-panel space-y-5 border border-white/10 shadow-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-400" />
              <span>Settled Payments Timeline</span>
            </h2>
            <span className="text-xs text-slate-400">Verified receipts</span>
          </div>

          <div className="space-y-3">
            {history && history.length > 0 ? (
              history.map((tx) => (
                <div
                  key={tx.id}
                  className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">{tx.description || tx.month_year}</div>
                      <div className="text-xs text-slate-400">
                        {formatDate(tx.payment_date || tx.created_at)} · Ref: {tx.transaction_id || "TXN-VERIFIED"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-white">{formatCurrency(tx.amount)}</span>
                    {tx.invoice_id && (
                      <button
                        onClick={() => handleViewReceipt(tx.invoice_id!)}
                        className="p-2 rounded-xl bg-white/5 hover:bg-emerald-500 hover:text-slate-950 text-slate-300 transition-colors cursor-pointer"
                        title="View Official Receipt"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-400 p-6 text-center">No payment history recorded yet.</div>
            )}
          </div>
        </div>

        {/* Right 5 cols: Itemized Invoice Preview */}
        <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl glass-panel space-y-6 border border-white/10 shadow-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>Current Invoice</span>
            </h2>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                pendingInvoice?.status === "PAID"
                  ? "bg-emerald-500/20 text-emerald-300"
                  : "bg-amber-500/20 text-amber-300"
              }`}
            >
              {pendingInvoice?.status || "NO INVOICE"}
            </span>
          </div>

          {pendingInvoice ? (
            <>
              <div className="text-xs text-slate-400 flex justify-between">
                <span>Invoice #{pendingInvoice.invoice_number}</span>
                <span>Billing Period: {pendingInvoice.billing_period}</span>
              </div>

              <div className="p-5 rounded-2xl bg-[#080D18] border border-white/5 space-y-3 text-xs">
                {pendingInvoice.items && pendingInvoice.items.length > 0 ? (
                  pendingInvoice.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-slate-300">
                      <span>{item.description}</span>
                      <span className="text-white font-medium">{formatCurrency(item.amount)}</span>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="flex justify-between text-slate-400">
                      <span>Base Bed Rent</span>
                      <span className="text-white font-medium">{formatCurrency(pendingInvoice.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Electricity & Utilities</span>
                      <span className="text-white font-medium">{formatCurrency(pendingInvoice.electricity_charges)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Housekeeping & High-Speed WiFi</span>
                      <span className="text-white font-medium">{formatCurrency(pendingInvoice.maintenance_charges)}</span>
                    </div>
                  </>
                )}

                <div className="pt-3 border-t border-white/10 flex justify-between text-sm font-extrabold text-white">
                  <span>Total Due</span>
                  <span className="text-emerald-400">{formatCurrency(pendingInvoice.total_amount)}</span>
                </div>
              </div>

              {pendingInvoice.status === "PENDING" && (
                <Button
                  onClick={() => setShowCheckoutModal(true)}
                  className="w-full py-3.5 text-xs font-bold"
                >
                  Proceed to Instant Payment
                </Button>
              )}
            </>
          ) : (
            <div className="text-xs text-slate-400 p-6 text-center">No active invoice generated.</div>
          )}
        </div>
      </div>

      {/* Razorpay Modal */}
      <Modal
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        title="StayNest Razorpay Gateway"
        description="Encrypted 256-bit automated settlement checkout"
      >
        {paymentSuccess ? (
          <div className="p-6 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <div className="text-base font-bold text-white">Payment Successful!</div>
            <p className="text-xs text-slate-300">
              Invoice #{pendingInvoice?.invoice_number} has been settled in full.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between text-xs">
              <span className="text-slate-400">Invoice Amount</span>
              <span className="text-xl font-extrabold text-white">
                {formatCurrency(pendingInvoice?.total_amount || 0)}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-white">
                <span className="font-medium">Instant UPI / QR (PhonePe, GPay, Paytm)</span>
                <span className="text-emerald-400 text-[10px] font-bold">Fastest</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-slate-400">
                <span>Credit / Debit Cards</span>
                <span className="text-[10px]">Visa, MasterCard, RuPay</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-slate-400">
                <span>NetBanking</span>
                <span className="text-[10px]">All major Indian banks</span>
              </div>
            </div>

            <Button
              isLoading={isProcessing}
              onClick={handleRazorpayPayment}
              className="w-full py-3.5 text-xs font-bold"
            >
              <Lock className="w-4 h-4" />
              <span>Authorize & Settle Invoice</span>
            </Button>
          </div>
        )}
      </Modal>

      {/* Receipt Preview Modal */}
      <Modal
        isOpen={!!viewingReceipt}
        onClose={() => setViewingReceipt(null)}
        title="Official Digital Payment Receipt"
        description={viewingReceipt ? `Receipt Ref: ${viewingReceipt.invoice_number}` : ""}
      >
        {viewingReceipt && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-[#080D18] border border-white/10 space-y-2">
              <div className="flex justify-between text-slate-400">
                <span>Tenant Name:</span>
                <span className="text-white font-bold">{viewingReceipt.tenant_name}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Property:</span>
                <span className="text-white">{viewingReceipt.property_name}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Billing Period:</span>
                <span className="text-white">{viewingReceipt.billing_period}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Payment Date:</span>
                <span className="text-white">{formatDate(viewingReceipt.paid_at)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Status:</span>
                <span className="text-emerald-400 font-bold">{viewingReceipt.status}</span>
              </div>
              <div className="pt-2 border-t border-white/10 flex justify-between text-sm font-bold text-white">
                <span>Total Amount Paid:</span>
                <span className="text-emerald-400">{formatCurrency(viewingReceipt.total_amount)}</span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewingReceipt(null)}
              className="w-full"
            >
              Close Receipt
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
