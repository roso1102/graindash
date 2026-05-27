"use client";

import { ReactNode } from "react";
import NavSidebar from "./NavSidebar";
import AuthProvider from "./AuthProvider";
import ToastContainer from "./Toast";
import { usePathname } from "next/navigation";

const PUBLIC_ROUTES = ["/", "/login"];

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isPublic = PUBLIC_ROUTES.includes(pathname);

  if (isPublic) {
    return <>{children}</>;
  }

  return (
    <AuthProvider>
      <div className="flex min-h-screen bg-bg-page">
        <NavSidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1200px] mx-auto px-6 py-6">
            {children}
          </div>
        </main>
        <ToastContainer />
      </div>
    </AuthProvider>
  );
}
