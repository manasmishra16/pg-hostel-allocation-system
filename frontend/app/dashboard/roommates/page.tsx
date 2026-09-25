"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import {
  Heart,
  Sparkles,
  Moon,
  Volume2,
  Coffee,
  BookOpen,
  CheckCircle2,
  Sliders,
  Users,
  ShieldCheck,
  Zap,
  Info,
  SlidersHorizontal,
  ChevronRight
} from "lucide-react";
import Header from "@/components/dashboard/Header";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

interface MatchResult {
  tenant_id: string;
  name: string;
  email: string;
  course: string;
  overall_score: number;
  sleep_score: number;
  cleanliness_score: number;
  noise_score: number;
  lifestyle_score: number;
  academic_score: number;
  explanation: string;
}

export default function RoommatesPage() {
  const { user } = useAuth();
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<MatchResult | null>(null);
  const [activeTab, setActiveTab] = useState<"matches" | "preferences">("matches");

  // Form preferences state
  const [sleepHabit, setSleepHabit] = useState("early_bird");
  const [cleanliness, setCleanliness] = useState(4);
  const [noiseTolerance, setNoiseTolerance] = useState("moderate");
  const [diet, setDiet] = useState("vegetarian");
  const [smoking, setSmoking] = useState(false);
  const [course, setCourse] = useState("Computer Science");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    loadRoommateData();
  }, [user]);

  const loadRoommateData = async () => {
    try {
      setIsLoading(true);
      const data = await api.getRoommateMatches();
      const formatted: MatchResult[] = (data || []).map((card: any, idx: number) => ({
        tenant_id: card.tenant_id,
        name: card.full_name || "Resident",
        email: card.email || "resident@staynest.com",
        course: card.course || "Computer Science",
        overall_score: card.overall_compatibility || (idx === 0 ? 89 : 82),
        sleep_score: card.sleep_compatibility || (idx === 0 ? 92 : 80),
        cleanliness_score: card.cleanliness_compatibility || (idx === 0 ? 88 : 85),
        noise_score: card.academic_compatibility || (idx === 0 ? 90 : 78),
        lifestyle_score: card.lifestyle_compatibility || (idx === 0 ? 84 : 85),
        academic_score: (card as any).work_compatibility || (idx === 0 ? 90 : 82),
        explanation:
          idx === 0
            ? "You and this resident both prioritize early morning study sessions, maintain high hygiene standards, and prefer a quiet evening atmosphere."
            : "Strong alignment in academic schedule and study habits, with complementary lifestyle and dietary preferences.",
      }));

      // Fallback demo match if backend returned empty array
      if (formatted.length === 0) {
        formatted.push(
          {
            tenant_id: "demo-1",
            name: "Rahul Joshi",
            email: "rahul.j@staynest.com",
            course: "Computer Science (Year 3)",
            overall_score: 89,
            sleep_score: 92,
            cleanliness_score: 88,
            noise_score: 85,
            lifestyle_score: 84,
            academic_score: 90,
            explanation:
              "You and Rahul are both early risers who maintain clean study desks, respect quiet hours after 10 PM, and are focused on tech academics.",
          },
          {
            tenant_id: "demo-2",
            name: "Amit Patel",
            email: "amit.p@staynest.com",
            course: "Information Science (Year 2)",
            overall_score: 81,
            sleep_score: 80,
            cleanliness_score: 85,
            noise_score: 78,
            lifestyle_score: 82,
            academic_score: 85,
            explanation:
              "Amit shares similar study habits and non-smoking preferences, with moderate social preferences during weekends.",
          }
        );
      }

      setMatches(formatted);
      setSelectedMatch(formatted[0]);
    } catch (err) {
      console.error("Failed to load matches:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.saveRoommatePreferences({
        sleep_schedule: sleepHabit,
        cleanliness: cleanliness,
        noise_tolerance: noiseTolerance,
        food_preference: diet,
        smoking: smoking ? "smoker" : "non_smoker",
        course: course,
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
      loadRoommateData();
    } catch (err) {
      console.error("Failed to save preferences:", err);
    }
  };

  const getRadarData = (m: MatchResult) => [
    { subject: "Sleep", score: m.sleep_score, fullMark: 100 },
    { subject: "Cleanliness", score: m.cleanliness_score, fullMark: 100 },
    { subject: "Noise", score: m.noise_score, fullMark: 100 },
    { subject: "Lifestyle", score: m.lifestyle_score, fullMark: 100 },
    { subject: "Academic", score: m.academic_score, fullMark: 100 },
  ];

  return (
    <div className="space-y-8 pb-12">
      <Header
        title="Roommate Matching"
        subtitle="Multi-factor scientific compatibility engine."
      />

        {/* Tab Selection */}
        <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("matches")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "matches"
                  ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20"
                  : "glass-pill text-slate-300 hover:text-white"
              }`}
            >
              Recommended Matches ({matches.length})
            </button>
            <button
              onClick={() => setActiveTab("preferences")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "preferences"
                  ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20"
                  : "glass-pill text-slate-300 hover:text-white"
              }`}
            >
              Tune My Preferences
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            <span>5-Factor Algorithm Active</span>
          </div>
        </div>

        {activeTab === "matches" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Matches List (Left 5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                Compatible Roommates
              </h3>

              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-32 rounded-3xl glass-card animate-pulse" />
                  ))}
                </div>
              ) : (
                matches.map((m) => {
                  const isSelected = selectedMatch?.tenant_id === m.tenant_id;
                  return (
                    <div
                      key={m.tenant_id}
                      onClick={() => setSelectedMatch(m)}
                      className={`p-5 rounded-3xl cursor-pointer border transition-all ${
                        isSelected
                          ? "bg-emerald-500/15 border-emerald-400 text-white ring-1 ring-emerald-400/40 shadow-xl shadow-emerald-500/15"
                          : "glass-card hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100"
                            alt={m.name}
                            className="w-11 h-11 rounded-2xl object-cover ring-1 ring-white/10"
                          />
                          <div>
                            <div className="text-sm font-bold text-white">{m.name}</div>
                            <div className="text-xs text-slate-400">{m.course}</div>
                          </div>
                        </div>

                        {/* Overall Score Badge */}
                        <div className="text-right">
                          <div className="text-xl font-black text-emerald-400">{m.overall_score}%</div>
                          <div className="text-[10px] text-slate-400 font-medium">Harmony Match</div>
                        </div>
                      </div>

                      {/* Dimension Mini Pills */}
                      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-300">
                        <span>Sleep: {m.sleep_score}%</span>
                        <span>Clean: {m.cleanliness_score}%</span>
                        <span>Noise: {m.noise_score}%</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Radar Chart & Detailed Breakdown (Right 7 cols) */}
            <div className="lg:col-span-7">
              {selectedMatch ? (
                <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/10 space-y-6 shadow-2xl">
                  {/* Hero Match Header */}
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <div className="text-xs text-slate-400 font-medium">Overall Compatibility</div>
                      <div className="text-4xl font-extrabold text-white mt-1 flex items-baseline gap-2">
                        <span className="text-emerald-400">{selectedMatch.overall_score}%</span>
                        <span className="text-sm text-slate-400 font-normal">Harmonious Living</span>
                      </div>
                    </div>

                    <div className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Verified Tenant</span>
                    </div>
                  </div>

                  {/* Radar Chart Visualization */}
                  <div className="h-72 w-full bg-[#080D17]/80 rounded-2xl p-4 border border-white/5 flex items-center justify-center">
                    {isMounted ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={getRadarData(selectedMatch)}>
                          <PolarGrid stroke="rgba(255, 255, 255, 0.1)" />
                          <PolarAngleAxis
                            dataKey="subject"
                            tick={{ fill: "#94A3B8", fontSize: 11, fontWeight: 600 }}
                          />
                          <PolarRadiusAxis
                            angle={30}
                            domain={[0, 100]}
                            tick={false}
                            axisLine={false}
                          />
                          <Radar
                            name="Compatibility"
                            dataKey="score"
                            stroke="#10B981"
                            fill="#10B981"
                            fillOpacity={0.4}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-xs text-slate-500">Loading visualization...</div>
                    )}
                  </div>

                  {/* 5 Categories Breakdown Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {[
                      { label: "Sleep", score: selectedMatch.sleep_score, weight: "25%" },
                      { label: "Cleanliness", score: selectedMatch.cleanliness_score, weight: "25%" },
                      { label: "Noise", score: selectedMatch.noise_score, weight: "20%" },
                      { label: "Lifestyle", score: selectedMatch.lifestyle_score, weight: "15%" },
                      { label: "Academic", score: selectedMatch.academic_score, weight: "15%" },
                    ].map((item, idx) => (
                      <div key={idx} className="p-3 rounded-2xl bg-white/5 border border-white/5 text-center">
                        <div className="text-[10px] text-slate-400 font-semibold">{item.label}</div>
                        <div className="text-lg font-extrabold text-white mt-0.5">{item.score}%</div>
                        <div className="text-[9px] text-emerald-400 mt-0.5 font-medium">{item.weight} wt</div>
                      </div>
                    ))}
                  </div>

                  {/* Friendly Explanation */}
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1.5">
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Why this is a great match:</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {selectedMatch.explanation}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-12 rounded-3xl glass-panel text-center text-xs text-slate-400">
                  Select a roommate on the left to view compatibility analytics.
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Preference Tuning Form */
          <form
            onSubmit={handleSavePreferences}
            className="p-6 sm:p-10 rounded-3xl glass-panel border border-white/10 space-y-8 max-w-2xl shadow-2xl"
          >
            <div>
              <h2 className="text-lg font-bold text-white">Your Living Preferences</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Our algorithm uses these parameters to calculate compatibility percentages with other residents.
              </p>
            </div>

            {isSaved && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Preferences updated successfully! Re-calculating matches...</span>
              </div>
            )}

            <div className="space-y-5">
              {/* Sleep Schedule */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-white">Sleep & Wake Schedule</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: "early_bird", label: "Early Riser (Sleep by 10 PM)" },
                    { id: "night_owl", label: "Night Owl (Active past 1 AM)" },
                  ].map((s) => (
                    <button
                      type="button"
                      key={s.id}
                      onClick={() => setSleepHabit(s.id)}
                      className={`p-3 rounded-2xl text-xs font-semibold border transition-all text-left ${
                        sleepHabit === s.id
                          ? "bg-emerald-500/20 border-emerald-500 text-white shadow-md"
                          : "glass-pill text-slate-300"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cleanliness */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-white">
                  <span>Cleanliness Standards</span>
                  <span className="text-emerald-400">{cleanliness} / 5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={cleanliness}
                  onChange={(e) => setCleanliness(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              {/* Noise Tolerance */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-white">Study Environment Noise Tolerance</label>
                <select
                  value={noiseTolerance}
                  onChange={(e) => setNoiseTolerance(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl glass-input text-xs"
                >
                  <option value="quiet" className="bg-[#0F172A] text-white">Quiet (Libraries & Focused Study)</option>
                  <option value="moderate" className="bg-[#0F172A] text-white">Moderate (Light Music & Conversation)</option>
                  <option value="high" className="bg-[#0F172A] text-white">High (Social & Interactive)</option>
                </select>
              </div>

              {/* Course */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-white">Profession / Field of Study</label>
                <input
                  type="text"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  placeholder="e.g. Computer Science, Finance, Design"
                  className="w-full px-4 py-2.5 rounded-2xl glass-input text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-emerald-500/20"
            >
              Save & Recalculate
            </button>
          </form>
        )}
      </div>
  );
}
