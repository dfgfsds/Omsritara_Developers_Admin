import { useState } from "react";
import {
  Home,
  Building,
  Building2,
  MessageCircle,
  Star,
  LogOut,
  Menu,
  User,
  FileText,
  Briefcase,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const adminMenuItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Properties", url: "/properties", icon: Building2 },
  { title: "Agents", url: "/agents", icon: Briefcase },
  { title: "Property Types", url: "/property-types", icon: Building },
  { title: "Enquiries", url: "/enquiries", icon: MessageCircle },
  { title: "Amenities Type", url: "/amenitiestype", icon: Star },
  { title: "Amenities", url: "/amenities", icon: Star },
  { title: "Blogs", url: "/blogs", icon: FileText },
  { title: "Users", url: "/users", icon: User },
];

const agentMenuItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "My Properties", url: "/properties", icon: Building2 },
  { title: "My Enquiries", url: "/enquiries", icon: MessageCircle },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { logout, role, isAgent, currentAgent } = useAuth();
  const { toast } = useToast();
  const collapsed = state === "collapsed";

  const menuItems = isAgent ? agentMenuItems : adminMenuItems;

  const handleLogout = () => {
    logout();
  };

  return (
    <Sidebar className={collapsed ? "w-[76px]" : "w-64"} collapsible="icon">
      <SidebarContent className="bg-gradient-to-b from-[#8a1c1c] via-[#74151e] to-[#4c0d14] text-white border-r border-rose-950/50 shadow-2xl overflow-x-hidden">
        {/* Logo Section */}
        <div
          className={cn(
            "border-b border-white/10 transition-all duration-200 bg-black/10 backdrop-blur-xs",
            collapsed ? "py-4 px-2 flex items-center justify-center" : "p-4"
          )}
        >
          <div className={cn("flex items-center", collapsed ? "justify-center" : "gap-3")}>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 p-2 ring-1 ring-white/20 shadow-inner backdrop-blur-md">
              <img
                src="/favicon.ico"
                alt="Logo"
                className="h-full w-full object-contain filter drop-shadow-sm"
              />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-lg font-black tracking-tight text-white font-heading truncate">
                    OST Developers
                  </h1>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={cn(
                      "text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-2xs",
                      isAgent
                        ? "bg-amber-400/25 text-amber-300 border border-amber-400/40"
                        : "bg-emerald-400/25 text-emerald-300 border border-emerald-400/40"
                    )}
                  >
                    {isAgent ? "Agent View" : "Admin CRM"}
                  </span>
                  {isAgent && currentAgent && (
                    <span className="text-[10px] text-white/80 truncate font-semibold max-w-[90px]">
                      {currentAgent.name.split(" ")[0]}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <SidebarGroup className={collapsed ? "px-1.5" : "px-2.5"}>
          {!collapsed && (
            <SidebarGroupLabel className="text-white/60 text-[10px] font-black uppercase tracking-widest px-3 mb-2 font-heading">
              {isAgent ? "Agent Workspace" : "Management"}
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className={cn("space-y-1.5", collapsed ? "px-0" : "px-0.5")}>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title} className={collapsed ? "flex justify-center" : ""}>
                  <SidebarMenuButton asChild size="lg" className="p-0 hover:bg-transparent">
                    <NavLink
                      to={item.url}
                      title={collapsed ? item.title : undefined}
                      className={({ isActive }) =>
                        cn(
                          "relative flex items-center rounded-2xl transition-all duration-200 group",
                          collapsed
                            ? "h-11 w-11 justify-center mx-auto"
                            : "w-full gap-3 px-3.5 py-2.5 text-xs font-bold",
                          isActive
                            ? "bg-white/15 text-white shadow-lg shadow-black/25 backdrop-blur-md ring-1 ring-white/30 font-extrabold"
                            : "text-white/75 hover:bg-white/10 hover:text-white"
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {/* Active Indicator Bar on left edge (expanded mode) */}
                          {!collapsed && isActive && (
                            <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-gradient-to-b from-amber-300 to-amber-500 shadow-[0_0_12px_#f59e0b]" />
                          )}

                          <item.icon
                            className={cn(
                              "h-4 w-4 flex-shrink-0 transition-all duration-200",
                              isActive
                                ? "text-amber-300 drop-shadow-[0_0_10px_rgba(251,191,36,0.8)] scale-110"
                                : "text-white/70 group-hover:text-white group-hover:scale-105"
                            )}
                          />

                          {!collapsed && (
                            <span className="flex-1 truncate tracking-wide text-xs">
                              {item.title}
                            </span>
                          )}

                          {/* Glowing Active Dot indicator on right side (expanded mode) */}
                          {!collapsed && isActive && (
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]" />
                          )}
                        </>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Logout Section */}
        <div
          className={cn(
            "mt-auto border-t border-white/10 bg-black/15 backdrop-blur-md transition-all duration-200",
            collapsed ? "p-2 flex justify-center" : "p-3.5"
          )}
        >
          <Button
            variant="ghost"
            title={collapsed ? "Logout" : undefined}
            className={cn(
              "font-black text-xs text-white/90 hover:bg-rose-500/25 hover:text-white rounded-xl transition-all shadow-2xs border border-transparent hover:border-rose-400/30",
              collapsed
                ? "h-10 w-10 p-0 flex items-center justify-center mx-auto"
                : "w-full justify-start px-3 py-2"
            )}
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 flex-shrink-0 text-white/80" />
            {!collapsed && <span className="ml-2.5 tracking-wide">Sign Out</span>}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}