"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Sidebar from "@/components/dashboard/Sidebar";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#090D14]">
        <LoadingState message="Verifying property owner permissions..." />
      </div>
    );
  }

  if (!user) return null;

  if (user.role !== "PROPERTY_OWNER" && user.role !== "SUPER_ADMIN") {
    return (
      <div className="min-h-screen flex bg-[#090D14] text-slate-100">
        <Sidebar />
        <div className="flex-1 flex flex-col p-10 max-w-xl mx-auto my-auto">
          <ErrorState
            title="Access Restricted"
            message="This section is reserved for Property Owners. Please log in with a property owner account."
            onRetry={() => router.push("/dashboard")}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#090D14] text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col p-5 sm:p-10 max-w-7xl mx-auto w-full overflow-y-auto space-y-8 pb-24 lg:pb-10">
        {children}
      </div>
    </div>
  );
}
