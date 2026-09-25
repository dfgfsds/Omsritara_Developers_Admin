import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Search,
  User,
  X,
  Building2,
  MessageCircle,
  FolderTree,
  Sparkles,
  Newspaper,
  Users,
  LayoutDashboard,
  ArrowRight,
  Loader2,
  Phone,
  Mail,
  MapPin,
  Tag,
  CornerDownLeft,
  Briefcase,
  ShieldCheck,
  Check,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import axiosInstance from "@/lib/axiosInstance";
import { getStoredAgents } from "@/data/mockAgentsData";
import { cn } from "@/lib/utils";

// App navigation items with searchable keywords
const navItems = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
    desc: "Executive metrics & recent leads",
    keywords: ["home", "overview", "stats", "analytics", "dashboard"],
  },
  {
    name: "Properties",
    path: "/properties",
    icon: Building2,
    desc: "Manage live portfolio & listings",
    keywords: ["properties", "property", "listings", "villa", "apartment", "plot", "sale"],
  },
  {
    name: "Agents",
    path: "/agents",
    icon: Briefcase,
    desc: "Real estate agents & team management",
    keywords: ["agents", "agent", "staff", "realtor", "broker", "sales"],
    adminOnly: true,
  },
  {
    name: "Enquiries",
    path: "/enquiries",
    icon: MessageCircle,
    desc: "Customer leads & inquiries",
    keywords: ["enquiries", "inquiry", "leads", "customers", "messages", "contact"],
  },
  {
    name: "Property Types",
    path: "/property-types",
    icon: FolderTree,
    desc: "Categories & configuration",
    keywords: ["types", "categories", "commercial", "residential", "villa", "plot"],
    adminOnly: true,
  },
  {
    name: "Amenities",
    path: "/amenities",
    icon: Sparkles,
    desc: "Facilities & feature lists",
    keywords: ["amenities", "amenity", "features", "facilities", "swimming", "gym"],
    adminOnly: true,
  },
  {
    name: "Blogs",
    path: "/blogs",
    icon: Newspaper,
    desc: "News, updates & articles",
    keywords: ["blogs", "blog", "articles", "news", "posts"],
    adminOnly: true,
  },
  {
    name: "Users & Roles",
    path: "/users",
    icon: Users,
    desc: "Team accounts & permissions",
    keywords: ["users", "roles", "staff", "admin", "accounts", "permissions"],
    adminOnly: true,
  },
];

export function DashboardHeader() {
  const { userData, role, isAdmin, isAgent, currentAgent, logout } = useAuth();
  const navigate = useNavigate();

  // Search state
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [hasFetched, setHasFetched] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Safe user details from localStorage
  const storedUser = localStorage.getItem("user");
  let userDetails: { name?: string; email?: string } | null = null;
  try {
    userDetails = storedUser ? JSON.parse(storedUser) : null;
  } catch (e) {
    console.error("Error parsing user from localStorage", e);
  }

  // Fetch live properties and enquiries for search indexing
  const fetchSearchData = async () => {
    if (hasFetched || isLoading) return;
    setIsLoading(true);
    try {
      const [propRes, enqRes] = await Promise.allSettled([
        axiosInstance.get("/property"),
        axiosInstance.get("/enquiry"),
      ]);

      if (propRes.status === "fulfilled") {
        const list =
          propRes.value?.data?.result ||
          propRes.value?.data?.data ||
          propRes.value?.data ||
          [];
        if (Array.isArray(list)) setProperties(list);
      }

      if (enqRes.status === "fulfilled") {
        const list =
          enqRes.value?.data?.result ||
          enqRes.value?.data?.data ||
          enqRes.value?.data ||
          [];
        if (Array.isArray(list)) setEnquiries(list);
      }

      setHasFetched(true);
    } catch (err) {
      console.error("Failed to load search data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
        fetchSearchData();
      } else if (e.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hasFetched, isLoading]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtered Navigation Pages
  const filteredNav = useMemo(() => {
    const accessibleItems = isAgent
      ? navItems.filter((item) => !item.adminOnly)
      : navItems;
    if (!query.trim()) return accessibleItems;
    const q = query.toLowerCase().trim();
    return accessibleItems.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.desc.toLowerCase().includes(q) ||
        item.keywords.some((k) => k.includes(q))
    );
  }, [query, isAgent]);

  // Filtered Properties
  const filteredProperties = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return properties
      .filter((p) => {
        const name = String(p.name || "").toLowerCase();
        const city = String(p.location?.city || "").toLowerCase();
        const address = String(p.location?.address || "").toLowerCase();
        const type = String(p.propertyType?.name || "").toLowerCase();
        const status = String(p.status || "").toLowerCase();
        const price = String(p.price || "").toLowerCase();
        return (
          name.includes(q) ||
          city.includes(q) ||
          address.includes(q) ||
          type.includes(q) ||
          status.includes(q) ||
          price.includes(q)
        );
      })
      .slice(0, 5);
  }, [properties, query]);

  // Filtered Enquiries
  const filteredEnquiries = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return enquiries
      .filter((e) => {
        const name = String(e.name || "").toLowerCase();
        const email = String(e.email || "").toLowerCase();
        const mobile = String(e.mobile || "").toLowerCase();
        const prop = String(e.propertyName || e.property?.[0]?.name || "").toLowerCase();
        const status = String(e.status || "").toLowerCase();
        return (
          name.includes(q) ||
          email.includes(q) ||
          mobile.includes(q) ||
          prop.includes(q) ||
          status.includes(q)
        );
      })
      .slice(0, 5);
  }, [enquiries, query]);

  // Navigation handlers
  const handleSelectNav = (path: string) => {
    setIsOpen(false);
    setQuery("");
    navigate(path);
  };

  const handleSelectProperty = (prop: any) => {
    setIsOpen(false);
    const searchTerm = prop.name || "";
    setQuery("");
    navigate(`/properties?search=${encodeURIComponent(searchTerm)}`);
  };

  const handleSelectEnquiry = (enq: any) => {
    setIsOpen(false);
    const searchTerm = enq.name || "";
    setQuery("");
    navigate(`/enquiries?search=${encodeURIComponent(searchTerm)}`);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    // If matches a page first, go to that page
    if (filteredNav.length > 0 && query.trim().length <= 3) {
      handleSelectNav(filteredNav[0].path);
      return;
    }

    // If matches property, go to properties search
    if (filteredProperties.length > 0) {
      handleSelectProperty(filteredProperties[0]);
      return;
    }

    // Default: search in properties
    setIsOpen(false);
    navigate(`/properties?search=${encodeURIComponent(query.trim())}`);
    setQuery("");
  };

  const totalResults =
    (query.trim() ? filteredNav.length : 0) +
    filteredProperties.length +
    filteredEnquiries.length;

  return (
    <header className="relative h-16 border-b border-border bg-card shadow-xs flex items-center justify-between px-4 sm:px-6 z-40">
      {/* Left: Sidebar trigger and Spotlight Search */}
      <div className="flex items-center gap-3 sm:gap-4 flex-1 max-w-2xl">
        <SidebarTrigger className="h-9 w-9 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors shrink-0" />

        {/* Global Search Container */}
        <div ref={containerRef} className="relative w-full max-w-md">
          <form onSubmit={handleFormSubmit} className="relative flex items-center">
            <Search className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none transition-colors" />

            <input
              ref={inputRef}
              type="text"
              placeholder="Search properties, enquiries, pages... (Ctrl+K)"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (!isOpen) setIsOpen(true);
              }}
              onFocus={() => {
                setIsOpen(true);
                fetchSearchData();
              }}
              className="h-10 w-full rounded-2xl border border-slate-200/90 bg-slate-100/75 pl-10 pr-20 text-xs font-semibold text-slate-900 placeholder:text-slate-400 shadow-2xs transition-all hover:bg-slate-100/90 hover:border-slate-300 focus:bg-white focus:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/10"
            />

            {/* Right indicators: Clear button & Ctrl+K badge */}
            <div className="absolute right-2.5 flex items-center gap-1.5">
              {isLoading && (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />
              )}
              {query ? (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    inputRef.current?.focus();
                  }}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-200/70 hover:text-slate-700 transition"
                  title="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : (
                <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-bold text-slate-400 shadow-2xs select-none">
                  ⌘K
                </kbd>
              )}
            </div>
          </form>

          {/* Spotlight Floating Dropdown */}
          {isOpen && (
            <div className="absolute left-0 top-full mt-2 w-full min-w-[320px] sm:min-w-[480px] max-w-lg rounded-3xl border border-slate-200/90 bg-white/98 backdrop-blur-xl shadow-2xl p-2.5 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              {/* Header / Summary */}
              <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-100 mb-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <span>
                  {query.trim()
                    ? `Results (${totalResults})`
                    : "Quick Shortcuts"}
                </span>
                <span className="text-[10px] lowercase font-medium text-slate-400">
                  press ↵ to search
                </span>
              </div>

              <div className="max-h-[380px] overflow-y-auto space-y-3.5 pr-1 scrollbar-thin">
                {/* 1. App Navigation Links */}
                {filteredNav.length > 0 && (
                  <div>
                    <p className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
                      {query.trim() ? "App Pages" : "Quick Jump"}
                    </p>
                    <div className="mt-1 space-y-0.5">
                      {filteredNav.map((item) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.path}
                            type="button"
                            onClick={() => handleSelectNav(item.path)}
                            className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-left transition-colors hover:bg-slate-100/80 group"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 group-hover:bg-primary group-hover:text-white transition-colors text-slate-600">
                                <Icon className="h-3.5 w-3.5" />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-800 group-hover:text-slate-950">
                                  {item.name}
                                </p>
                                <p className="text-[10px] font-medium text-slate-400 line-clamp-1">
                                  {item.desc}
                                </p>
                              </div>
                            </div>
                            <ArrowRight className="h-3.5 w-3.5 text-slate-300 opacity-0 group-hover:opacity-100 group-hover:text-primary transition-all -translate-x-1 group-hover:translate-x-0" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2. Matched Properties */}
                {query.trim() && filteredProperties.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between px-3 py-1">
                      <p className="text-[10px] font-black uppercase tracking-wider text-sky-600">
                        Properties ({filteredProperties.length})
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setIsOpen(false);
                          navigate(`/properties?search=${encodeURIComponent(query.trim())}`);
                          setQuery("");
                        }}
                        className="text-[10px] font-bold text-sky-600 hover:underline"
                      >
                        View all →
                      </button>
                    </div>
                    <div className="mt-1 space-y-0.5">
                      {filteredProperties.map((p: any) => (
                        <button
                          key={p._id || p.id}
                          type="button"
                          onClick={() => handleSelectProperty(p)}
                          className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-left transition-colors hover:bg-sky-50/70 group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-100/70 text-sky-700 font-black text-xs">
                              <Building2 className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-black text-slate-900 truncate group-hover:text-sky-900">
                                {p.name || "Untitled Property"}
                              </p>
                              <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-500 truncate">
                                <span>{p.propertyType?.name || "Property"}</span>
                                {p.location?.city && (
                                  <>
                                    <span>•</span>
                                    <span className="flex items-center gap-0.5 truncate">
                                      <MapPin className="h-2.5 w-2.5" />
                                      {p.location.city}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="shrink-0 flex items-center gap-2 text-right">
                            {p.price && (
                              <span className="rounded-md bg-white border border-slate-200/80 px-2 py-0.5 text-[10px] font-black text-slate-800 shadow-2xs">
                                ₹{p.price}
                              </span>
                            )}
                            <CornerDownLeft className="h-3 w-3 text-slate-300 opacity-0 group-hover:opacity-100 group-hover:text-sky-600" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Matched Enquiries */}
                {query.trim() && filteredEnquiries.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between px-3 py-1">
                      <p className="text-[10px] font-black uppercase tracking-wider text-emerald-600">
                        Enquiries ({filteredEnquiries.length})
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setIsOpen(false);
                          navigate(`/enquiries?search=${encodeURIComponent(query.trim())}`);
                          setQuery("");
                        }}
                        className="text-[10px] font-bold text-emerald-600 hover:underline"
                      >
                        View all →
                      </button>
                    </div>
                    <div className="mt-1 space-y-0.5">
                      {filteredEnquiries.map((e: any) => (
                        <button
                          key={e._id || e.id}
                          type="button"
                          onClick={() => handleSelectEnquiry(e)}
                          className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-left transition-colors hover:bg-emerald-50/70 group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100/70 text-emerald-700 font-black text-xs">
                              <MessageCircle className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-black text-slate-900 truncate group-hover:text-emerald-900">
                                {e.name || "Client Enquiry"}
                              </p>
                              <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-500 truncate">
                                <span>{e.mobile || e.email || "Lead"}</span>
                                {e.propertyName && (
                                  <>
                                    <span>•</span>
                                    <span className="truncate">{e.propertyName}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="shrink-0 flex items-center gap-2 text-right">
                            <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide">
                              {e.status || "Lead"}
                            </span>
                            <CornerDownLeft className="h-3 w-3 text-slate-300 opacity-0 group-hover:opacity-100 group-hover:text-emerald-600" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. No Results state */}
                {query.trim() &&
                  filteredNav.length === 0 &&
                  filteredProperties.length === 0 &&
                  filteredEnquiries.length === 0 && (
                    <div className="p-6 text-center">
                      <Search className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                      <p className="text-xs font-bold text-slate-700">
                        No matches found for "{query}"
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5 mb-3">
                        Try searching by property name, client phone, or navigate to a section.
                      </p>
                      <Button
                        size="sm"
                        onClick={() => {
                          setIsOpen(false);
                          navigate(`/properties?search=${encodeURIComponent(query.trim())}`);
                          setQuery("");
                        }}
                        className="rounded-xl h-8 text-xs font-bold bg-primary text-white hover:opacity-90"
                      >
                        Search Properties Portfolio
                        <ArrowRight className="ml-1.5 h-3 w-3" />
                      </Button>
                    </div>
                  )}
              </div>

              {/* Bottom Quick Tips */}
              <div className="mt-2 pt-2 border-t border-slate-100 px-3 flex items-center justify-between text-[10px] font-semibold text-slate-400">
                <span>Tip: Use ⌘K to open anytime</span>
                <span>ESC to close</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right side: Role Badge, Notifications & Profile */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Role Badge */}
        <div
          className={cn(
            "h-8 px-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 border shadow-xs select-none",
            isAgent
              ? "bg-amber-50 text-amber-900 border-amber-300"
              : "bg-emerald-50 text-emerald-900 border-emerald-300"
          )}
        >
          {isAgent ? (
            <>
              <Briefcase className="h-3.5 w-3.5 text-amber-600" />
              <span className="hidden sm:inline text-amber-700">Agent:</span>
              <span className="truncate max-w-[100px] font-extrabold">{currentAgent?.name?.split(" ")[0] || "Agent"}</span>
            </>
          ) : (
            <>
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span className="font-extrabold">Admin CRM</span>
            </>
          )}
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-xl">
          <Bell className="h-4 w-4 text-slate-600" />
          <span className="absolute 1.5 top-1.5 right-1.5 h-2 w-2 bg-rose-500 rounded-full ring-2 ring-white" />
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-9 w-9 rounded-full p-0 ring-2 ring-slate-100 hover:ring-primary/40 transition-all">
              <Avatar className="h-8 w-8">
                <AvatarFallback className={cn("font-black text-xs", isAgent ? "bg-amber-600 text-white" : "bg-primary text-primary-foreground")}>
                  {isAgent
                    ? currentAgent?.name?.[0] || "A"
                    : userData?.name?.[0] || userDetails?.name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-popover rounded-2xl shadow-xl border border-slate-200" align="end">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-900 leading-none">
                    {isAgent
                      ? currentAgent?.name || "Agent"
                      : userData?.name || userDetails?.name || "Administrator"}
                  </p>
                  <span
                    className={cn(
                      "text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full",
                      isAgent
                        ? "bg-amber-100 text-amber-800"
                        : "bg-emerald-100 text-emerald-800"
                    )}
                  >
                    {isAgent ? "Agent" : "Admin"}
                  </span>
                </div>
                <p className="text-xs font-medium leading-none text-muted-foreground truncate">
                  {isAgent
                    ? currentAgent?.email || "agent@omsritara.com"
                    : userData?.email || userDetails?.email || "admin@omsritara.com"}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            {isAdmin && (
              <>
                <DropdownMenuItem onClick={() => navigate("/agents")} className="cursor-pointer font-semibold text-xs">
                  <Briefcase className="mr-2 h-4 w-4 text-slate-500" />
                  Manage Agents
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/users")} className="cursor-pointer font-semibold text-xs">
                  <User className="mr-2 h-4 w-4 text-slate-500" />
                  Manage Users & Roles
                </DropdownMenuItem>
              </>
            )}

            <DropdownMenuItem onClick={() => navigate("/properties")} className="cursor-pointer font-semibold text-xs">
              <Building2 className="mr-2 h-4 w-4 text-slate-500" />
              {isAgent ? "My Properties Portfolio" : "Properties Portfolio"}
            </DropdownMenuItem>

            {isAgent && (
              <DropdownMenuItem onClick={() => navigate("/enquiries")} className="cursor-pointer font-semibold text-xs">
                <MessageCircle className="mr-2 h-4 w-4 text-slate-500" />
                My Client Enquiries
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={logout}
              className="cursor-pointer font-bold text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50"
            >
              <LogOut className="mr-2 h-4 w-4 text-rose-500" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

