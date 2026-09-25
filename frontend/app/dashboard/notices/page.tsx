'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api, Notice } from '@/lib/api';
import { Bell, Calendar, Pin, AlertCircle, Utensils, Wrench, PartyPopper } from 'lucide-react';
import Header from '@/components/dashboard/Header';

export default function NoticesPage() {
  const { user } = useAuth();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadNotices();
  }, [user]);

  const loadNotices = async () => {
    try {
      setIsLoading(true);
      const data = await api.getNotices();
      setNotices(data);
    } catch (err) {
      console.error('Failed to load notices:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getNoticeIcon = (type?: string) => {
    const t = (type || '').toLowerCase();
    if (t.includes('food') || t.includes('mess')) return <Utensils className="w-5 h-5 text-emerald-400" />;
    if (t.includes('maintenance') || t.includes('water') || t.includes('power')) return <Wrench className="w-5 h-5 text-amber-400" />;
    if (t.includes('event') || t.includes('festival')) return <PartyPopper className="w-5 h-5 text-purple-400" />;
    return <Bell className="w-5 h-5 text-blue-400" />;
  };

  return (
    <div className="space-y-8 pb-12">
      <Header
        title="Notice Board"
        subtitle="Official announcements, mess schedules, and maintenance circulars."
      />

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse" />
          ))}
        </div>
      ) : notices.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-2xl border border-white/5">
          <Bell className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-white">No active notices</h3>
          <p className="text-sm text-slate-400 mt-1">Check back later for hostel updates and meal circulars.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notices.map((notice) => (
            <div
              key={notice.id}
              className={`glass-card p-5 sm:p-6 rounded-2xl border transition-all ${
                notice.is_pinned 
                  ? 'border-emerald-500/30 bg-gradient-to-r from-emerald-500/5 to-transparent' 
                  : 'border-white/5 hover:border-white/10'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  {getNoticeIcon(notice.priority)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-semibold text-white">{notice.title}</h3>
                      {notice.is_pinned && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold tracking-wider uppercase flex items-center gap-1">
                          <Pin className="w-2.5 h-2.5" /> Pinned
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500 flex items-center gap-1 shrink-0">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(notice.created_at).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>

                  <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                    {notice.description}
                  </p>

                  <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                    <span>Issued by: Hostel Administration</span>
                    <span className="text-[11px] text-slate-500">Notice Ref #{notice.id.slice(0, 8)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
