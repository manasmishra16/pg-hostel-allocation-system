"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api, Property } from "@/lib/api";
import { Room } from "@/types";
import Header from "@/components/dashboard/Header";
import { BedGrid } from "@/components/bed";
import { formatCurrency } from "@/lib/utils";
import {
  Bed,
  Layers,
  Search,
  Plus,
  Building2,
  Filter,
  CheckCircle2,
  Clock,
  Wrench,
  Sparkles,
} from "lucide-react";

export default function OwnerRoomsPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const initialPropertyId = searchParams.get("property_id") || "";

  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(initialPropertyId);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [roomSearch, setRoomSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "VACANT" | "FULL">("ALL");

  // Create Room Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRoomNumber, setNewRoomNumber] = useState("");
  const [newRoomType, setNewRoomType] = useState("DOUBLE");
  const [newRoomCapacity, setNewRoomCapacity] = useState(2);
  const [newRoomRent, setNewRoomRent] = useState(8500);
  const [newFloorId, setNewFloorId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadProperties();
  }, [user]);

  useEffect(() => {
    if (selectedPropertyId) {
      loadRooms(selectedPropertyId);
    }
  }, [selectedPropertyId]);

  const loadProperties = async () => {
    try {
      const data = await api.getProperties();
      setProperties(data || []);
      if (data && data.length > 0 && !selectedPropertyId) {
        setSelectedPropertyId(data[0].id);
      }
    } catch (err) {
      console.error("Failed to load properties:", err);
    }
  };

  const loadRooms = async (propId: string) => {
    try {
      setIsLoading(true);
      const data = await api.rooms.getRooms(propId);
      setRooms(data || []);
    } catch (err) {
      console.error("Failed to load rooms:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const currentProperty = properties.find((p) => p.id === selectedPropertyId);
  const floors = currentProperty?.buildings?.[0]?.floors || [];

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFloorId && floors.length > 0) {
      // Pick first floor
    }
    const targetFloorId = newFloorId || floors[0]?.id;
    if (!targetFloorId) {
      alert("Please ensure at least one floor exists in this property before adding rooms.");
      return;
    }

    try {
      setIsSubmitting(true);
      await api.rooms.createRoom({
        floor_id: targetFloorId,
        room_number: newRoomNumber,
        room_type: newRoomType,
        capacity: Number(newRoomCapacity),
        base_rent: Number(newRoomRent),
      });

      setShowAddModal(false);
      setNewRoomNumber("");
      if (selectedPropertyId) {
        await loadRooms(selectedPropertyId);
      }
    } catch (err) {
      console.error("Failed to create room:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredRooms = rooms.filter((r) => {
    const matchesSearch = r.room_number.toLowerCase().includes(roomSearch.toLowerCase());
    if (statusFilter === "VACANT") {
      return matchesSearch && (r.available_count || 0) > 0;
    }
    if (statusFilter === "FULL") {
      return matchesSearch && (r.available_count || 0) === 0;
    }
    return matchesSearch;
  });

  const totalBedsInView = rooms.reduce((acc, r) => acc + (r.beds?.length || r.capacity || 0), 0);
  const occupiedBedsInView = rooms.reduce((acc, r) => acc + (r.occupied_count || 0), 0);
  const vacantBedsInView = Math.max(0, totalBedsInView - occupiedBedsInView);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Header
          title="Bed & Floor Management Console"
          subtitle="Real-time occupancy control, bed transitions, and tenant allocation engine."
        />

        <div className="flex items-center gap-3">
          {/* Property Selector */}
          <div className="relative">
            <select
              value={selectedPropertyId}
              onChange={(e) => setSelectedPropertyId(e.target.value)}
              className="px-4 py-2.5 rounded-full glass-input text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              {properties.map((p) => (
                <option key={p.id} value={p.id} className="bg-[#0B101B] text-white">
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 shrink-0 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Room</span>
          </button>
        </div>
      </div>

      {/* Capacity Telemetry Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="glass-card p-5 rounded-2xl border border-white/5 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-semibold">Total Beds In View</div>
            <div className="text-2xl font-black text-white mt-1">{totalBedsInView}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-300">
            <Layers className="w-5 h-5 text-emerald-400" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/5 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-semibold">Occupied Beds</div>
            <div className="text-2xl font-black text-emerald-400 mt-1">{occupiedBedsInView}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/5 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-semibold">Available Vacancies</div>
            <div className="text-2xl font-black text-blue-400 mt-1">{vacantBedsInView}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
            <Bed className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="glass-card p-4 rounded-2xl border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search room number (e.g. 101, 204)..."
            value={roomSearch}
            onChange={(e) => setRoomSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl glass-input text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {(["ALL", "VACANT", "FULL"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === s
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                  : "bg-white/5 hover:bg-white/10 text-slate-300"
              }`}
            >
              {s === "ALL" ? "All Rooms" : s === "VACANT" ? "Has Vacancy" : "Full"}
            </button>
          ))}
        </div>
      </div>

      {/* Rooms & Bed Grid List */}
      {isLoading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 rounded-3xl bg-white/[0.02] border border-white/5 animate-pulse" />
          ))}
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="glass-card p-16 text-center rounded-3xl border border-white/5">
          <Bed className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h4 className="text-base font-bold text-white">No Rooms Found</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-6">
            No rooms match your filter or no rooms have been added to this property yet.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Room to Floor
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredRooms.map((room) => (
            <div
              key={room.id}
              className="glass-card p-6 rounded-3xl border border-white/5 hover:border-white/10 transition-all space-y-4"
            >
              {/* Room Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white font-extrabold text-sm">
                    {room.room_number}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-white">Room {room.room_number}</h4>
                      <span className="px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-semibold text-slate-300 uppercase">
                        {room.room_type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Base Rent: <span className="text-emerald-400 font-bold">{formatCurrency(room.base_rent)}</span>/month
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="text-slate-400">
                    Occupancy:{" "}
                    <span className="font-bold text-white">
                      {room.occupied_count || 0}/{room.capacity} Beds
                    </span>
                  </span>
                  {(room.available_count || 0) > 0 ? (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-[10px]">
                      {room.available_count} Available
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-white/10 text-slate-400 border border-white/10 font-bold text-[10px]">
                      Full
                    </span>
                  )}
                </div>
              </div>

              {/* Interactive Bed Grid with Live Status Transitions */}
              <div className="pt-2">
                <div className="text-xs font-semibold text-slate-400 mb-3 flex items-center justify-between">
                  <span>Interactive Beds (Click any bed to allocate, release, or mark maintenance):</span>
                </div>
                <BedGrid
                  beds={room.beds || []}
                  roomNumber={room.room_number}
                  allowActions={true}
                  onRefresh={() => {
                    if (selectedPropertyId) loadRooms(selectedPropertyId);
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Room Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-card w-full max-w-md p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl relative">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <div>
                <h3 className="text-lg font-bold text-white">Add New Room</h3>
                <p className="text-xs text-slate-400 mt-0.5">Configure room number and bed capacity</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-full hover:bg-white/5 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Target Floor</label>
                <select
                  value={newFloorId}
                  onChange={(e) => setNewFloorId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl glass-input text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {floors.map((f) => (
                    <option key={f.id} value={f.id} className="bg-[#0B101B] text-white">
                      {f.floor_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Room Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 105, 201"
                  value={newRoomNumber}
                  onChange={(e) => setNewRoomNumber(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl glass-input text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Sharing Type</label>
                  <select
                    value={newRoomType}
                    onChange={(e) => {
                      setNewRoomType(e.target.value);
                      if (e.target.value === "SINGLE") setNewRoomCapacity(1);
                      if (e.target.value === "DOUBLE") setNewRoomCapacity(2);
                      if (e.target.value === "FOUR_SHARING") setNewRoomCapacity(4);
                    }}
                    className="w-full px-3 py-2.5 rounded-2xl glass-input text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="SINGLE" className="bg-[#0B101B]">Single Room</option>
                    <option value="DOUBLE" className="bg-[#0B101B]">Double Sharing</option>
                    <option value="TRIPLE" className="bg-[#0B101B]">Triple Sharing</option>
                    <option value="FOUR_SHARING" className="bg-[#0B101B]">4-Sharing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Base Rent (₹)</label>
                  <input
                    type="number"
                    required
                    value={newRoomRent}
                    onChange={(e) => setNewRoomRent(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-2xl glass-input text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 rounded-full text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  {isSubmitting ? "Creating..." : "Create Room"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
