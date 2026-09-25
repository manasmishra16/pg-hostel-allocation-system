"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import Header from "@/components/dashboard/Header";
import {
  Users,
  Search,
  Shield,
  CheckCircle2,
  Filter,
  Mail,
  Phone,
  Calendar,
  Lock,
} from "lucide-react";

interface AdminUserRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "TENANT" | "PROPERTY_OWNER" | "WARDEN" | "STAFF" | "SUPER_ADMIN";
  status: "ACTIVE" | "PENDING_KYC";
  joinedDate: string;
}

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const [usersList, setUsersList] = useState<AdminUserRecord[]>([
    {
      id: "usr-1",
      name: "Manas Mishra",
      email: "tenant@staynest.internal",
      phone: "+91 98765 43210",
      role: "TENANT",
      status: "ACTIVE",
      joinedDate: "10 Aug 2026",
    },
    {
      id: "usr-2",
      name: "Vikramaditya Singhania",
      email: "owner@staynest.internal",
      phone: "+91 98765 22334",
      role: "PROPERTY_OWNER",
      status: "ACTIVE",
      joinedDate: "01 Aug 2026",
    },
    {
      id: "usr-3",
      name: "Rajesh Kumar",
      email: "warden@staynest.internal",
      phone: "+91 98765 11223",
      role: "WARDEN",
      status: "ACTIVE",
      joinedDate: "05 Aug 2026",
    },
    {
      id: "usr-4",
      name: "Anita Devi",
      email: "staff@staynest.internal",
      phone: "+91 98765 44556",
      role: "STAFF",
      status: "ACTIVE",
      joinedDate: "07 Aug 2026",
    },
    {
      id: "usr-5",
      name: "Platform Administrator",
      email: "admin@staynest.internal",
      phone: "+91 80 4567 8900",
      role: "SUPER_ADMIN",
      status: "ACTIVE",
      joinedDate: "01 Jul 2026",
    },
    {
      id: "usr-6",
      name: "Aarav Sharma",
      email: "aarav.sharma@example.com",
      phone: "+91 98765 99887",
      role: "TENANT",
      status: "ACTIVE",
      joinedDate: "15 Aug 2026",
    },
  ]);

  const filtered = usersList.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-8 pb-12">
      <Header
        title="Master User & Identity Registry"
        subtitle="Global directory of tenants, property owners, wardens, maintenance staff, and system admins."
      />

      {/* Filter Bar */}
      <div className="glass-card p-4 rounded-2xl border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl glass-input text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {["ALL", "TENANT", "PROPERTY_OWNER", "WARDEN", "STAFF", "SUPER_ADMIN"].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all whitespace-nowrap ${
                roleFilter === r
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                  : "bg-white/5 hover:bg-white/10 text-slate-300"
              }`}
            >
              {r === "ALL"
                ? "All Roles"
                : r === "PROPERTY_OWNER"
                ? "Owner"
                : r.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-card rounded-3xl border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <h3 className="text-base font-bold text-white">Registered Accounts</h3>
          <p className="text-xs text-slate-400 mt-0.5">RBAC permissions and multi-factor session telemetry</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[11px] uppercase tracking-wider text-slate-400 font-semibold bg-white/[0.01]">
                <th className="py-4 px-6">User</th>
                <th className="py-4 px-6">Contact Phone</th>
                <th className="py-4 px-6">Assigned Role</th>
                <th className="py-4 px-6">Joined Date</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Access Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs text-slate-300">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-white/[0.015] transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center font-bold text-white">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-white">{u.name}</div>
                        <div className="text-[11px] text-slate-400">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-slate-300">{u.phone}</td>
                  <td className="py-4 px-6">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        u.role === "SUPER_ADMIN"
                          ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                          : u.role === "PROPERTY_OWNER"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : u.role === "WARDEN"
                          ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                          : u.role === "STAFF"
                          ? "bg-teal-500/10 text-teal-400 border border-teal-500/20"
                          : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      }`}
                    >
                      {u.role.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-slate-400">{u.joinedDate}</td>
                  <td className="py-4 px-6">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 w-fit">
                      <CheckCircle2 className="w-3 h-3" /> Active
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <span className="text-[11px] text-slate-500 font-mono">RBAC OK</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
