'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { 
  Building2, 
  MapPin, 
  Layers, 
  Bed, 
  Wifi, 
  ShieldCheck, 
  Sparkles, 
  Coffee, 
  ArrowLeft,
  CheckCircle2,
  Plus
} from 'lucide-react';
import Link from 'next/link';

export default function NewPropertyPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [propertyType, setPropertyType] = useState('PG');
  const [genderType, setGenderType] = useState('UNISEX');
  const [address, setAddress] = useState('');
  const [locality, setLocality] = useState('Koramangala');
  const [city, setCity] = useState('Bengaluru');
  const [pincode, setPincode] = useState('560034');
  const [description, setDescription] = useState('');
  const [startingPrice, setStartingPrice] = useState(8500);
  const [totalFloors, setTotalFloors] = useState(3);
  const [roomsPerFloor, setRoomsPerFloor] = useState(4);
  const [bedsPerRoom, setBedsPerRoom] = useState(2);
  const [amenities, setAmenities] = useState<string[]>([
    'High-speed WiFi',
    'Daily Housekeeping',
    '3x Nutritious Meals',
    'CCTV 24/7 Security',
    'Power Backup'
  ]);

  const toggleAmenity = (item: string) => {
    if (amenities.includes(item)) {
      setAmenities(amenities.filter(a => a !== item));
    } else {
      setAmenities([...amenities, item]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await api.createProperty({
        name,
        property_type: propertyType,
        gender_type: genderType,
        address,
        locality,
        city,
        pincode,
        description,
        starting_price: Number(startingPrice),
        total_floors: Number(totalFloors),
        rooms_per_floor: Number(roomsPerFloor),
        beds_per_room: Number(bedsPerRoom),
        amenities,
        images: [
          'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80'
        ]
      });
      router.push('/owner/properties');
    } catch (err) {
      console.error('Failed to create property:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Link href="/owner/dashboard" className="hover:text-white flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Properties
        </Link>
        <span>/</span>
        <span className="text-white">New Property Onboarding</span>
      </div>

      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Onboard New Property</h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure property details, building hierarchy, rooms, and initial bed layout.
          </p>
        </div>

        {/* Wizard Steps */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 text-xs font-semibold">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-emerald-400' : 'text-slate-500'}`}>
            <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-[11px]">1</span>
            Basic Information
          </div>
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-emerald-400' : 'text-slate-500'}`}>
            <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-[11px]">2</span>
            Inventory & Floors
          </div>
          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-emerald-400' : 'text-slate-500'}`}>
            <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-[11px]">3</span>
            Amenities & Pricing
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Property Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. StayNest Prime Coliving"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={propertyType}
                    onChange={e => setPropertyType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500/50"
                  >
                    <option value="PG">Paying Guest (PG)</option>
                    <option value="HOSTEL">Student Hostel</option>
                    <option value="COLIVING">Luxury Coliving</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Gender Policy</label>
                  <select
                    value={genderType}
                    onChange={e => setGenderType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500/50"
                  >
                    <option value="UNISEX">Unisex / Co-ed</option>
                    <option value="BOYS">Boys Only</option>
                    <option value="GIRLS">Girls Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  placeholder="Plot 42, 5th Cross, 100 Feet Road"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Bengaluru Hub</label>
                  <select
                    value={locality}
                    onChange={e => setLocality(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500/50"
                  >
                    <option value="Koramangala">Koramangala</option>
                    <option value="HSR Layout">HSR Layout</option>
                    <option value="Indiranagar">Indiranagar</option>
                    <option value="BTM Layout">BTM Layout</option>
                    <option value="Electronic City">Electronic City</option>
                    <option value="Marathahalli">Marathahalli</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">City</label>
                  <input
                    type="text"
                    disabled
                    value={city}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Pincode</label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={e => setPincode(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-all shadow-lg shadow-emerald-500/20"
                >
                  Continue to Inventory Setup →
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-slate-200">
                <span className="font-semibold text-emerald-400">StayNest Bed-Level Hierarchy:</span>
                <p className="mt-0.5 text-slate-300">
                  We automatically scaffold Floors, Rooms, and discrete Beds (Bed-A, Bed-B) with independent allocation states.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Total Floors</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={totalFloors}
                    onChange={e => setTotalFloors(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Rooms per Floor</label>
                  <input
                    type="number"
                    min="1"
                    max="15"
                    value={roomsPerFloor}
                    onChange={e => setRoomsPerFloor(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Beds per Room</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={bedsPerRoom}
                    onChange={e => setBedsPerRoom(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 text-center">
                <span className="text-xs text-slate-400">Total Scaffolding Capacity:</span>
                <div className="text-2xl font-black text-emerald-400 mt-1">
                  {totalFloors * roomsPerFloor * bedsPerRoom} Discrete Beds
                </div>
                <span className="text-[11px] text-slate-500">
                  across {totalFloors * roomsPerFloor} rooms on {totalFloors} residential levels
                </span>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-all shadow-lg shadow-emerald-500/20"
                >
                  Continue to Pricing & Amenities →
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Base Monthly Rent per Bed (₹)</label>
                <input
                  type="number"
                  step="500"
                  value={startingPrice}
                  onChange={e => setStartingPrice(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Select Property Amenities</label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {[
                    'High-speed WiFi',
                    'Daily Housekeeping',
                    '3x Nutritious Meals',
                    'CCTV 24/7 Security',
                    'Power Backup',
                    'Washing Machine & Laundry',
                    'Gym & Fitness Zone',
                    'Air Conditioning (AC)',
                    'Covered Parking',
                    'Rooftop Lounge'
                  ].map(item => {
                    const selected = amenities.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleAmenity(item)}
                        className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-between text-left transition-all ${
                          selected
                            ? 'bg-emerald-500/10 border-emerald-500/40 text-white'
                            : 'bg-white/[0.02] border-white/5 text-slate-400 hover:border-white/20'
                        }`}
                      >
                        <span>{item}</span>
                        {selected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description & House Rules</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Tell prospective residents about community vibe, quiet hours, and proximity to tech parks..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm resize-none focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="pt-4 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  {isSubmitting ? 'Publishing Property...' : 'Complete & Publish Property'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
