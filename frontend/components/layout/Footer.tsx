import Link from "next/link";
import { Building2, Heart, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/5 bg-[#070A10] text-slate-400 text-sm mt-24">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-16 grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Brand */}
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">StayNest</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            &ldquo;Your home away from home.&rdquo; The premium SaaS management platform connecting students, professionals, and PG owners with transparent bed allocation, roommate compatibility, and instant rent handling.
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Bengaluru, Karnataka, India</span>
          </div>
        </div>

        {/* Popular Localities */}
        <div>
          <h4 className="text-white font-semibold text-sm mb-4">Top Locations (Bengaluru)</h4>
          <ul className="space-y-2.5 text-xs">
            <li><Link href="/properties?locality=Koramangala" className="hover:text-emerald-400 transition-colors">Koramangala (5th & 7th Block)</Link></li>
            <li><Link href="/properties?locality=HSR+Layout" className="hover:text-emerald-400 transition-colors">HSR Layout (Sectors 1-7)</Link></li>
            <li><Link href="/properties?locality=Indiranagar" className="hover:text-emerald-400 transition-colors">Indiranagar (100ft Road)</Link></li>
            <li><Link href="/properties?locality=Electronic+City" className="hover:text-emerald-400 transition-colors">Electronic City Phase 1 & 2</Link></li>
            <li><Link href="/properties?locality=BTM+Layout" className="hover:text-emerald-400 transition-colors">BTM Layout</Link></li>
          </ul>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-semibold text-sm mb-4">Platform</h4>
          <ul className="space-y-2.5 text-xs">
            <li><Link href="/properties" className="hover:text-emerald-400 transition-colors">Explore All PGs & Hostels</Link></li>
            <li><Link href="/dashboard" className="hover:text-emerald-400 transition-colors">Tenant Resident Portal</Link></li>
            <li><Link href="/owner/dashboard" className="hover:text-emerald-400 transition-colors">Property Owner Dashboard</Link></li>
            <li><Link href="/staff/dashboard" className="hover:text-emerald-400 transition-colors">Warden & Staff Operations</Link></li>
            <li><Link href="/admin/dashboard" className="hover:text-emerald-400 transition-colors">Platform Admin Analytics</Link></li>
          </ul>
        </div>

        {/* Contact & Support */}
        <div className="space-y-3">
          <h4 className="text-white font-semibold text-sm mb-4">Resident Support</h4>
          <div className="flex items-center gap-2.5 text-xs text-slate-400">
            <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
            <a href="tel:+919876543210" className="hover:text-emerald-400 transition-colors">
              +91 98765 43210 (24/7 Helpline)
            </a>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-slate-400">
            <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
            <a href="mailto:support@staynest.com" className="hover:text-emerald-400 transition-colors">
              support@staynest.com
            </a>
          </div>
          <div className="pt-2">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[11px] text-slate-400">
              ⚡ Razorpay verified payments & 24/7 AI-triaged maintenance responses.
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
        <p>© 2026 StayNest SaaS Technologies Pvt. Ltd. All rights reserved.</p>
        <p className="flex items-center gap-1 mt-2 sm:mt-0">
          Crafted with care for students & professionals.
        </p>
      </div>
    </footer>
  );
}
