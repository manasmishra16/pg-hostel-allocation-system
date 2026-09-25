"use client";

// Force Next.js dev route refresh
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import LocalitiesSection from "@/components/home/LocalitiesSection";
import FeaturedStaysSection from "@/components/home/FeaturedStaysSection";
import TrustStrip from "@/components/home/TrustStrip";
import { api } from "@/lib/api";
import { Property } from "@/types";

export default function LandingPage() {
  // Fetch real properties from the backend API
  const { data: dbProperties } = useQuery<Property[]>({
    queryKey: ["landing-properties"],
    queryFn: () => api.properties.getAll(),
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#090D14] text-slate-100 selection:bg-emerald-500 selection:text-slate-950">
      <Navbar />
      <HeroSection />
      <LocalitiesSection />
      <FeaturedStaysSection dbProperties={dbProperties} />
      <TrustStrip />
      <Footer />
    </div>
  );
}
