"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { DocumentItem } from "@/types";
import Header from "@/components/dashboard/Header";
import {
  FileText,
  Upload,
  CheckCircle2,
  Clock,
  XCircle,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Plus,
  AlertTriangle,
  Lock,
} from "lucide-react";

export default function DocumentsPage() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Upload Form State
  const [title, setTitle] = useState("");
  const [docType, setDocType] = useState("ID_PROOF");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isPrivate, setIsPrivate] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    loadDocuments();
  }, [user]);

  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      const data = await api.documents.getMy();
      setDocuments(data || []);
    } catch (err) {
      console.error("Failed to load documents:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMsg("Please select a file to upload.");
      return;
    }
    if (!title.trim()) {
      setErrorMsg("Please provide a title for the document.");
      return;
    }

    try {
      setIsUploading(true);
      setErrorMsg("");
      await api.documents.upload(selectedFile, title, docType, isPrivate);
      setShowUploadModal(false);
      setTitle("");
      setSelectedFile(null);
      await loadDocuments();
    } catch (err: any) {
      console.error("Upload failed:", err);
      setErrorMsg(err.message || "Failed to upload document");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this document?")) return;
    try {
      await api.documents.delete(id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      console.error("Failed to delete document:", err);
    }
  };

  const verifiedCount = documents.filter((d) => d.verification_status === "VERIFIED").length;
  const pendingCount = documents.filter((d) => d.verification_status === "PENDING").length;

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Header
          title="KYC & Identity Vault"
          subtitle="Encrypted compliance storage for lease contracts, college verifications, and photo IDs."
        />

        <button
          onClick={() => setShowUploadModal(true)}
          className="px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 shrink-0 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass-card p-6 rounded-3xl border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Uploaded</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white mt-3">{documents.length}</div>
          <div className="text-xs text-slate-500 mt-1">Verified via StayNest Security</div>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-white/5 bg-gradient-to-br from-emerald-500/5 to-transparent">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Verified by Admin</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 mt-3">{verifiedCount}</div>
          <div className="text-xs text-slate-500 mt-1">Eligible for expedited check-in</div>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-white/5 bg-gradient-to-br from-amber-500/5 to-transparent">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Under Review</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-amber-400 mt-3">{pendingCount}</div>
          <div className="text-xs text-slate-500 mt-1">Typical verification: 2-4 hours</div>
        </div>
      </div>

      {/* Documents List */}
      <div className="glass-card rounded-3xl border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Stored Documents</h3>
            <p className="text-xs text-slate-400 mt-0.5">End-to-end encrypted resident credentials</p>
          </div>
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-emerald-400" /> AES-256 Storage
          </span>
        </div>

        {isLoading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse" />
            ))}
          </div>
        ) : documents.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4 text-slate-600">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-white">No documents uploaded yet</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-6">
              Upload your government ID proof, student registration, or employment verification to complete KYC.
            </p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Upload First Document
            </button>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-white/[0.015] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 shrink-0">
                    <FileText className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-white">{doc.title}</h4>
                      <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        {doc.document_type.replace(/_/g, " ")}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                      <span>Uploaded {new Date(doc.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                      {doc.is_private && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                          <Lock className="w-3 h-3 text-emerald-400" /> Confidential
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  {doc.verification_status === "VERIFIED" && (
                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                    </span>
                  )}
                  {doc.verification_status === "PENDING" && (
                    <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> In Review
                    </span>
                  )}
                  {doc.verification_status === "REJECTED" && (
                    <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-bold flex items-center gap-1.5">
                      <XCircle className="w-3.5 h-3.5" /> Rejected
                    </span>
                  )}

                  <a
                    href={doc.signed_url || doc.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors"
                    title="View Document"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border border-white/10 hover:border-rose-500/20 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-card w-full max-w-lg p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl relative">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <div>
                <h3 className="text-lg font-bold text-white">Upload New Document</h3>
                <p className="text-xs text-slate-400 mt-0.5">Securely upload documents for identity verification</p>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-2 rounded-full hover:bg-white/5 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Document Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Government Aadhaar Card, Passport, Lease Agreement"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl glass-input text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Document Category</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl glass-input text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="ID_PROOF" className="bg-[#0b101b] text-white">National ID / Passport / Aadhaar</option>
                  <option value="LEASE_AGREEMENT" className="bg-[#0b101b] text-white">Signed Lease Agreement</option>
                  <option value="POLICE_VERIFICATION" className="bg-[#0b101b] text-white">Police Verification Form</option>
                  <option value="COLLEGE_ID" className="bg-[#0b101b] text-white">College / University Enrollment</option>
                  <option value="EMPLOYMENT_PROOF" className="bg-[#0b101b] text-white">Employment Letter / Pay Slip</option>
                  <option value="OTHER" className="bg-[#0b101b] text-white">Other Supporting Document</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Select File (PDF, PNG, JPG)</label>
                <div className="border-2 border-dashed border-white/10 hover:border-emerald-500/50 rounded-2xl p-6 text-center cursor-pointer transition-colors">
                  <input
                    type="file"
                    required
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-emerald-500/10 file:text-emerald-400 hover:file:bg-emerald-500/20"
                  />
                  {selectedFile && (
                    <p className="text-xs text-emerald-400 mt-2 font-medium">Selected: {selectedFile.name}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="is_private"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="rounded border-white/20 text-emerald-500 focus:ring-emerald-500"
                />
                <label htmlFor="is_private" className="text-xs text-slate-300 font-medium cursor-pointer">
                  Keep Private (Accessible strictly to Property Owner and Hostel Warden)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-5 py-2.5 rounded-full text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>Encrypting & Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Securely</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
