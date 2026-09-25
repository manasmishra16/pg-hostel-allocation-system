"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Star,
  MapPin,
  ShieldCheck,
  ArrowRight,
  Wifi,
  Wind,
  Utensils,
  Heart,
} from "lucide-react";
import { motion } from "framer-motion";
import { Property } from "@/types";

/* ── Amenity icon map ── */
const amenityIcon: Record<string, React.ElementType> = {
  WiFi: Wifi,
  AC: Wind,
  Food: Utensils,
  Housekeeping: ShieldCheck,
};

/* ── Curated fallback matching seeded database properties ── */
const fallbackFeatured = [
  {
    id: "b0000000-0000-0000-0000-000000000001",
    name: "Sunrise PG",
    locality: "Koramangala",
    price: "₹8,000",
    rating: "4.8",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
    amenities: ["WiFi", "Food", "AC"],
    tag: "PG",
  },
  {
    id: "b0000000-0000-0000-0000-000000000002",
    name: "Elite Hostel",
    locality: "HSR Layout",
    price: "₹6,500",
    rating: "4.6",
    image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80",
    amenities: ["WiFi", "Food", "AC"],
    tag: "Hostel",
  },
  {
    id: "b0000000-0000-0000-0000-000000000003",
    name: "Green Valley PG",
    locality: "Indiranagar",
    price: "₹9,000",
    rating: "4.7",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
    amenities: ["WiFi", "AC", "Housekeeping"],
    tag: "PG",
  },
];

interface FeaturedProperty {
  id: string;
  name: string;
  locality: string;
  price: string;
  rating: string;
  image: string;
  amenities: string[];
  tag: string;
}

function mapDbToFeatured(properties: Property[]): FeaturedProperty[] {
  return properties.slice(0, 3).map((p) => ({
    id: p.id,
    name: p.name,
    locality: p.locality,
    price: `₹${p.starting_rent?.toLocaleString()}`,
    rating: String(p.rating || "4.8"),
    image: p.cover_image || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
    amenities: ["WiFi", "AC", "Food", "Housekeeping"],
    tag: p.property_type === "PG" ? "PG" : "Hostel",
  }));
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
};

interface Props {
  dbProperties?: Property[];
}

export default function FeaturedStaysSection({ dbProperties }: Props) {
  const [wishlisted, setWishlisted] = useState<Set<string>>(new Set());

  // Load wishlist from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("staynest_wishlist");
      if (saved) {
        setWishlisted(new Set(JSON.parse(saved)));
      }
    } catch {
      // ignore
    }
  }, []);

  const toggleWishlist = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlisted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        localStorage.setItem("staynest_wishlist", JSON.stringify(Array.from(next)));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const featured =
    dbProperties && dbProperties.length > 0
      ? mapDbToFeatured(dbProperties)
      : fallbackFeatured;

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-8 sm:py-10 max-w-7xl mx-auto w-full">
      <div className="flex items-end justify-between mb-5 gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white">
            Featured Stays
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Handpicked properties in Bengaluru
          </p>
        </div>
        <Link
          href="/properties"
          className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          See all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {featured.map((p) => (
          <div key={p.id}>
            <Link
              href={`/properties/${p.id}`}
              className="group rounded-xl glass-card-glow overflow-hidden flex flex-col block"
            >
              {/* Image */}
              <div className="relative h-40 sm:h-36 w-full overflow-hidden bg-slate-900">
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute top-2.5 left-2.5 px-2 py-px rounded-full text-[9px] font-semibold bg-emerald-500/90 text-slate-950">
                  {p.tag}
                </div>
                <button
                  className={`absolute top-2.5 right-2.5 w-6 h-6 rounded-full backdrop-blur-sm flex items-center justify-center transition-all duration-200 ${
                    wishlisted.has(p.id)
                      ? "bg-rose-500/20 text-rose-400"
                      : "bg-black/30 text-white/60 hover:text-rose-400"
                  }`}
                  onClick={(e) => toggleWishlist(p.id, e)}
                  aria-label={wishlisted.has(p.id) ? "Remove from saved" : "Save property"}
                >
                  <Heart
                    className={`w-3 h-3 transition-all duration-200 ${
                      wishlisted.has(p.id) ? "fill-rose-400 scale-110" : ""
                    }`}
                  />
                </button>
                <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/50 backdrop-blur-sm text-[10px] font-bold text-emerald-400 border border-white/8">
                  {p.price}
                  <span className="text-[8px] text-slate-400 font-normal"> / mo</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-3.5 space-y-2 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-[13px] font-semibold text-white group-hover:text-emerald-400 transition-colors truncate">
                    {p.name}
                  </h3>
                  <span className="flex items-center gap-0.5 text-[10px] text-slate-300 shrink-0">
                    <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                    {p.rating}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 flex items-center gap-1">
                  <MapPin className="w-2.5 h-2.5" />
                  {p.locality}
                </p>
                <div className="flex flex-wrap gap-1">
                  {p.amenities.map((a) => {
                    const Icon = amenityIcon[a] ?? ShieldCheck;
                    return (
                      <span
                        key={a}
                        className="inline-flex items-center gap-0.5 px-1.5 py-px rounded bg-white/4 border border-white/5 text-[9px] text-slate-400"
                      >
                        <Icon className="w-2.5 h-2.5" />
                        {a}
                      </span>
                    );
                  })}
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
