"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { api, Property } from "@/lib/api";
import Header from "@/components/dashboard/Header";
import {
  Shield,
  UserCheck,
  Phone,
  Mail,
  Building2,
  Plus,
  Clock,
  CheckCircle2,
  Wrench,
  Search,
} from "lucide-react";

interface StaffMember {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: "WARDEN" | "STAFF";
  department: string;
  property_name: string;
  shift: string;
  is_active: boolean;
}

export default function OwnerStaffPage() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Seeded / Connected staff list representing property management personnel
  const [staffList, setStaffList] = useState<StaffMember[]>([
    {
      id: "warden-1",
      full_name: "Rajesh Kumar",
      email: "warden@staynest.internal",
      phone: "+91 98765 11223",
      role: "WARDEN",
      department: "Hostel Operations & Discipline",
      property_name: "StayNest Green Glen Residency",
      shift: "Day Shift (08:00 - 20:00)",
      is_active: true,
    },
    {
      id: "staff-1",
      full_name: "Anita Devi",
      email: "anita.devi@staynest.internal",
      phone: "+91 98765 44556",
      role: "STAFF",
      department: "Housekeeping & Sanitization",
      property_name: "StayNest Green Glen Residency",
      shift: "Morning (07:00 - 15:00)",
      is_active: true,
    },
    {
      id: "staff-2",
      full_name: "Ramu Shinde",
      email: "ramu.shinde@staynest.internal",
      phone: "+91 98765 77889",
      role: "STAFF",
      department: "Plumbing & Mechanical Repairs",
      property_name: "StayNest HSR Elite Hostel",
      shift: "On-Call / General (09:00 - 18:00)",
      is_active: true,
    },
    {
      id: "staff-3",
      full_name: "Suresh Gowda",
      email: "suresh.security@staynest.internal",
      phone: "+91 98765 99001",
      role: "STAFF",
      department: "24/7 Gate & CCTV Security",
      property_name: "StayNest Green Glen Residency",
      shift: "Night Shift (20:00 - 08:00)",
      is_active: true,
    },
  ]);

  useEffect(() => {
    loadProperties();
  }, [user]);

  const loadProperties = async () => {
    try {
      setIsLoading(true);
      const data = await api.getProperties();
      setProperties(data || []);
    } catch (err) {
      console.error("Failed to load properties:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStaff = staffList.filter((s) => {
    const matchesSearch =
      s.full_name.toLowerCase().includes(search.toLowerCase()) ||
      s.department.toLowerCase().includes(search.toLowerCase()) ||
      s.property_name.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const wardenCount = staffList.filter((s) => s.role === "WARDEN").length;
  const maintenanceCount = staffList.filter((s) => s.role === "STAFF").length;

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Header
          title="Staff & Warden Personnel"
          subtitle="Direct roster of campus wardens, housekeeping, and maintenance teams."
        />

        <button
          onClick={() => alert("Invite staff member wizard: enter email and assign property.")}
          className="px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 shrink-0 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Assign Staff</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="glass-card p-5 rounded-2xl border border-white/5 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-semibold">Chief Wardens</div>
            <div className="text-2xl font-black text-white mt-1">{wardenCount} Assigned</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
            <Shield className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/5 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-semibold">Housekeeping & Repairs</div>
            <div className="text-2xl font-black text-emerald-400 mt-1">{maintenanceCount} On Duty</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <Wrench className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/5 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-semibold">Duty Coverage</div>
            <div className="text-2xl font-black text-teal-400 mt-1">24/7 Active</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="glass-card p-4 rounded-2xl border border-white/5 flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by staff name, department, or property..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl glass-input text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Staff Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredStaff.map((staff) => (
          <div
            key={staff.id}
            className="glass-card p-6 rounded-3xl border border-white/5 hover:border-white/10 transition-all space-y-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-200 font-extrabold text-base">
                  {staff.full_name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-bold text-white">{staff.full_name}</h4>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        staff.role === "WARDEN"
                          ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                          : "bg-teal-500/10 text-teal-400 border border-teal-500/20"
                      }`}
                    >
                      {staff.role}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{staff.department}</p>
                </div>
              </div>

              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Active
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2 text-xs text-slate-300">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-500" /> Assigned Property
                </span>
                <span className="font-semibold text-white truncate max-w-[200px]">
                  {staff.property_name}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" /> Shift Hours
                </span>
                <span className="font-semibold text-slate-300">{staff.shift}</span>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <a
                href={`tel:${staff.phone}`}
                className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border border-white/10 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>{staff.phone}</span>
              </a>
              <a
                href={`mailto:${staff.email}`}
                className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border border-white/10 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                <span>Email</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
