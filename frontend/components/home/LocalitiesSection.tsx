"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const localities = [
  {
    name: "Koramangala",
    tagline: "Startup Hub",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=75",
  },
  {
    name: "HSR Layout",
    tagline: "Tech Corridor",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=75",
  },
  {
    name: "Indiranagar",
    tagline: "Vibrant & Lively",
    image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=75",
  },
  {
    name: "BTM Layout",
    tagline: "Well Connected",
    image: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=600&q=75",
  },
  {
    name: "Whitefield",
    tagline: "IT & Business Hub",
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=75",
  },
  {
    name: "Marathahalli",
    tagline: "Metro Access",
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=75",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
};

export default function LocalitiesSection() {
  return (
    <section className="px-4 sm:px-6 lg:px-8 py-8 sm:py-10 max-w-7xl mx-auto w-full">
      <div className="flex items-end justify-between mb-5">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white">
            Explore Bengaluru
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Popular localities for students and professionals
          </p>
        </div>
        <Link
          href="/properties"
          className="hidden sm:flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          See all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
        {localities.map((loc) => (
          <div key={loc.name}>
            <Link
              href={`/properties?locality=${encodeURIComponent(loc.name)}`}
              className="group relative rounded-xl overflow-hidden h-28 sm:h-32 border border-white/6 block transition-transform duration-300 hover:-translate-y-1"
            >
              <img
                src={loc.image}
                alt={loc.name}
                className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#090D14] via-[#090D14]/30 to-transparent" />
              <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-end justify-between">
                <div>
                  <div className="text-[11px] font-semibold text-white group-hover:text-emerald-400 transition-colors duration-200">
                    {loc.name}
                  </div>
                  <div className="text-[9px] text-slate-400 mt-px">{loc.tagline}</div>
                </div>
                <ArrowRight className="w-3 h-3 text-white/0 group-hover:text-white/60 transition-colors duration-200" />
              </div>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
