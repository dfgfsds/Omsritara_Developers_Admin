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

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Properties", url: "/properties", icon: Building2 },
  { title: "Property Types", url: "/property-types", icon: Building },
  { title: "Enquiries", url: "/enquiries", icon: MessageCircle },
  { title: "Amenities Type", url: "/amenitiestype", icon: Star },
  { title: "Amenities", url: "/amenities", icon: Star },
  { title: "Blogs", url: "/blogs", icon: FileText },
  { title: "Users", url: "/users", icon: User },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { logout } = useAuth();
  const { toast } = useToast();
  const collapsed = state === "collapsed";

  const handleLogout = () => {
    logout();
  };

  return (
    <Sidebar className={collapsed ? "w-[76px]" : "w-64"} collapsible="icon">
      <SidebarContent className="bg-sidebar">
        {/* Logo Section */}
        <div
          className={cn(
            "border-b border-sidebar-border transition-all duration-200",
            collapsed ? "py-4 px-2 flex items-center justify-center" : "p-4"
          )}
        >
          <div className={cn("flex items-center", collapsed ? "justify-center" : "gap-3")}>
            <img
              src="/favicon.ico"
              alt="Logo"
              className={collapsed ? "h-9 w-9 object-contain" : "h-10 w-10"}
            />
            {!collapsed && (
              <div>
                <h1 className="text-xl font-bold text-sidebar-foreground">
                  OST Developers
                </h1>
                <p className="text-[10px] text-sidebar-foreground/70 font-medium tracking-wide">
                  Admin Real Estate CRM
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <SidebarGroup className={collapsed ? "px-1.5" : "px-2"}>
          {!collapsed && (
            <SidebarGroupLabel className="text-sidebar-foreground/75 text-xs font-bold uppercase tracking-wider px-3 mb-1">
              Management
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className={cn("space-y-1.5", collapsed ? "px-0" : "px-1")}>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title} className={collapsed ? "flex justify-center" : ""}>
                  <SidebarMenuButton asChild size="lg" className="p-0 hover:bg-transparent">
                    <NavLink
                      to={item.url}
                      title={collapsed ? item.title : undefined}
                      className={({ isActive }) =>
                        cn(
                          "relative flex items-center rounded-xl transition-all duration-200",
                          collapsed
                            ? "h-11 w-11 justify-center mx-auto"
                            : "w-full gap-3.5 px-3.5 py-2.5 text-sm font-semibold",
                          isActive
                            ? "bg-white/20 text-white shadow-md backdrop-blur-md ring-1 ring-white/25 font-bold"
                            : "text-sidebar-foreground/80 hover:bg-white/10 hover:text-white"
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {/* Active Indicator Bar on left edge (expanded mode) */}
                          {!collapsed && isActive && (
                            <span className="absolute left-0 top-1.5 bottom-1.5 w-1.5 rounded-r-full bg-amber-400 shadow-[0_0_12px_#f59e0b]" />
                          )}

                          <item.icon
                            className={cn(
                              "h-5 w-5 flex-shrink-0 transition-transform duration-200",
                              isActive
                                ? "text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.7)] scale-110"
                                : "text-sidebar-foreground/75 group-hover:text-white"
                            )}
                          />

                          {!collapsed && (
                            <span className="flex-1 truncate tracking-wide">
                              {item.title}
                            </span>
                          )}

                          {/* Glowing Active Dot indicator on right side (expanded mode) */}
                          {!collapsed && isActive && (
                            <span className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]" />
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
            "mt-auto border-t border-sidebar-border transition-all duration-200",
            collapsed ? "p-2.5 flex justify-center" : "p-4"
          )}
        >
          <Button
            variant="ghost"
            title={collapsed ? "Logout" : undefined}
            className={cn(
              "font-bold text-sidebar-foreground hover:bg-rose-500/20 hover:text-rose-200 rounded-xl transition-all",
              collapsed
                ? "h-11 w-11 p-0 flex items-center justify-center mx-auto"
                : "w-full justify-start px-3.5 py-2.5"
            )}
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span className="ml-3">Logout</span>}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}