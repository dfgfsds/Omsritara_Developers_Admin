import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { DashboardHeader } from "@/components/layout/DashboardHeader";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("token");
    if (!isAuthenticated && location.pathname !== "/login") {
      navigate("/login");
    }
  }, [navigate, location]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-[#f8fafc] relative selection:bg-primary/10 selection:text-primary">
        {/* Subtle Ambient Mesh Background */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute -top-[20%] left-[25%] w-[650px] h-[650px] rounded-full bg-rose-500/[0.035] blur-[130px]" />
          <div className="absolute top-[45%] right-[10%] w-[550px] h-[550px] rounded-full bg-amber-500/[0.03] blur-[140px]" />
        </div>
        <AppSidebar />
        <main className="flex-1 flex flex-col min-w-0 relative z-10">
          <DashboardHeader />
          <div className="flex-1 p-4 sm:p-6 lg:p-7 max-w-[1600px] w-full mx-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;