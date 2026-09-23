import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Building,
  Building2,
  MessageCircle,
  TrendingUp,
  Edit,
  Trash2,
  Sparkles,
  ArrowUpRight,
  RefreshCw,
  Phone,
  Mail,
  Calendar,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  HelpCircle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import axiosInstance from "@/lib/axiosInstance";
import { useAuth } from "@/context/AuthContext";
import {
  getAgentProperties,
  getAgentEnquiries,
  updateAgentEnquiryStatus,
} from "@/data/mockAgentsData";

// Soft, harmonious status badge colors
const getStatusBadgeStyles = (status: string) => {
  switch (status?.toLowerCase()) {
    case "new":
      return "bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100";
    case "in progress":
    case "progress":
      return "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100";
    case "closed":
      return "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200";
  }
};

// Soft priority badge colors
const getPriorityBadgeStyles = (priority: string) => {
  switch (priority?.toLowerCase()) {
    case "high":
      return "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100";
    case "medium":
      return "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100";
    case "low":
      return "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200";
    default:
      return "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200";
  }
};

const Dashboard = () => {
  const { role, isAgent, isAdmin, currentAgent } = useAuth();
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState<any>(null);
  const [editStatus, setEditStatus] = useState("New");
  const [editPriority, setEditPriority] = useState("Low");

  const statusCycle: Record<string, string> = {
    New: "In Progress",
    "In Progress": "Closed",
    Closed: "New",
  };

  const priorityCycle: Record<string, string> = {
    Low: "Medium",
    Medium: "High",
    High: "Low",
  };

  const formatStatus = (status: string) => {
    switch (status?.toLowerCase()) {
      case "new":
        return "New";
      case "progress":
      case "in progress":
        return "In Progress";
      case "closed":
        return "Closed";
      default:
        return "Unknown";
    }
  };

  const formatPriority = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "High";
      case "medium":
        return "Medium";
      case "low":
        return "Low";
      default:
        return "Unknown";
    }
  };

  const fetchEnquiries = async () => {
    if (isAgent && currentAgent) {
      const agentEnqs = getAgentEnquiries(currentAgent._id);
      const formatted = agentEnqs.map((item: any) => ({
        id: item._id,
        name: item.name,
        email: item.email,
        mobile: item.mobile,
        propertyId: item.propertyId || "-",
        propertyName: item.propertyName || "-",
        message: item.message || "No message",
        status: formatStatus(item.status),
        priority: formatPriority(item.priority),
        source: "Agent Lead",
        createdAt: item.createdAt,
        followUpDate: null,
      }));
      setEnquiries(formatted);
      return;
    }

    try {
      const res = await axiosInstance.get("/enquiry");
      if (res.data?.result) {
        const formatted = res.data.result.map((item: any) => ({
          id: item._id,
          name: item.name,
          email: item.email,
          mobile: item.mobile,
          propertyId: item.property?.[0]?._id || "-",
          propertyName: item.property?.[0]?.name || "-",
          message: item.property?.[0]?.description || "No message",
          status: formatStatus(item.status),
          priority: formatPriority(item.priority),
          source: "API",
          createdAt: item.createdAt,
          followUpDate: item.followUpDate || null,
        }));
        setEnquiries(formatted);
      }
    } catch (error) {
      console.error("Error fetching enquiries:", error);
    }
  };

  const fetchStats = async () => {
    if (isAgent && currentAgent) {
      const agentProps = getAgentProperties(currentAgent._id);
      const agentEnqs = getAgentEnquiries(currentAgent._id);
      setStats({
        result: {
          property: agentProps.length,
          enquiry: agentEnqs.length,
          available: agentProps.filter((p) => p.status === "available").length,
          sold: agentProps.filter((p) => p.status === "sold").length,
        },
      });
      return;
    }

    try {
      const res = await axiosInstance.get("/dashboard");
      setStats(res.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const refreshAll = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchStats(), fetchEnquiries()]);
    setTimeout(() => setIsRefreshing(false), 400);
  };

  useEffect(() => {
    refreshAll();
  }, [isAgent, currentAgent?._id]);

  const handleStatusClick = async (id: string, currentStatus: string) => {
    const newStatus = statusCycle[currentStatus] || "New";

    setEnquiries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: newStatus } : e))
    );

    try {
      await axiosInstance.put(`/enquiry/${id}`, {
        status: newStatus,
      });
    } catch (error) {
      console.error("Error updating status:", error);
      fetchEnquiries();
    }
  };

  const handlePriorityClick = async (id: string, currentPriority: string) => {
    const newPriority = priorityCycle[currentPriority] || "Low";

    setEnquiries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, priority: newPriority } : e))
    );

    try {
      await axiosInstance.put(`/enquiry/${id}`, {
        priority: newPriority,
      });
    } catch (error) {
      console.error("Error updating priority:", error);
      fetchEnquiries();
    }
  };

  const handleEdit = (enquiry: any) => {
    setSelectedEnquiry(enquiry);
    setEditStatus(enquiry.status || "New");
    setEditPriority(enquiry.priority || "Low");
    setIsEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedEnquiry) return;

    try {
      await axiosInstance.put(`/enquiry/${selectedEnquiry.id}`, {
        status: editStatus,
        priority: editPriority,
      });

      setEnquiries((prev) =>
        prev.map((e) =>
          e.id === selectedEnquiry.id
            ? {
                ...e,
                status: editStatus,
                priority: editPriority,
              }
            : e
        )
      );

      setIsEditOpen(false);
      setSelectedEnquiry(null);
    } catch (error) {
      console.error("Error updating enquiry:", error);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this enquiry?"
    );
    if (!confirmDelete) return;

    try {
      await axiosInstance.delete(`/enquiry/${id}`);
      setEnquiries((prev) => prev.filter((e) => e.id !== id));
    } catch (error) {
      console.error("Error deleting enquiry:", error);
    }
  };

  // Filtered enquiries for fast search
  const filteredEnquiries = useMemo(() => {
    if (!searchQuery.trim()) return enquiries;
    const q = searchQuery.toLowerCase().trim();
    return enquiries.filter((e) => {
      const name = String(e.name || "").toLowerCase();
      const email = String(e.email || "").toLowerCase();
      const mobile = String(e.mobile || "").toLowerCase();
      const prop = String(e.propertyName || "").toLowerCase();
      const msg = String(e.message || "").toLowerCase();
      const status = String(e.status || "").toLowerCase();
      const priority = String(e.priority || "").toLowerCase();

      return (
        name.includes(q) ||
        email.includes(q) ||
        mobile.includes(q) ||
        prop.includes(q) ||
        msg.includes(q) ||
        status.includes(q) ||
        priority.includes(q)
      );
    });
  }, [enquiries, searchQuery]);

  return (
    <div className="space-y-7">
      {/* 1. Soft Hero Welcome Header */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-slate-50 to-indigo-50/40 p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 px-3 py-0.5 text-[11px] font-black text-indigo-900 tracking-wide mb-2 shadow-2xs">
              <Sparkles className="h-3 w-3 text-indigo-600" />
              {isAgent
                ? `Agent Workspace • ${currentAgent?.city || "Tamil Nadu"}`
                : "Real Estate Management Suite"}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
              {isAgent
                ? `Welcome, ${currentAgent?.name || "Agent"}!`
                : "Executive Overview"}
            </h1>
            <p className="mt-1 text-xs font-semibold text-slate-600 max-w-xl">
              {isAgent
                ? `Here are your assigned properties (${stats?.result?.property || 0} listings) and direct customer inquiries (${stats?.result?.enquiry || 0} leads).`
                : "Monitor key real estate portfolio metrics, track prospective customer inquiries, and manage listing statuses in real time."}
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshAll}
              className="h-10 rounded-2xl border-slate-200 bg-white font-bold text-xs text-slate-700 shadow-xs hover:bg-slate-50 transition"
              title="Refresh statistics and inquiries"
            >
              <RefreshCw
                className={`mr-2 h-3.5 w-3.5 text-slate-600 ${
                  isRefreshing ? "animate-spin" : ""
                }`}
              />
              Sync Data
            </Button>

            <Button
              asChild
              className="h-10 rounded-2xl bg-gradient-to-r from-primary to-rose-600 px-4 font-black text-xs text-white shadow-md shadow-primary/20 hover:opacity-95"
            >
              <Link to="/properties">
                Properties Portfolio
                <ArrowUpRight className="ml-1.5 h-3.5 w-3.5 stroke-[3]" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Decorative soft ambient glow */}
        <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-indigo-200/30 blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 h-44 w-44 rounded-full bg-rose-200/20 blur-3xl pointer-events-none" />
      </div>

      {/* 2. Soft & Unique Metric Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Properties */}
        <div className="group relative overflow-hidden rounded-3xl border border-slate-200/85 bg-white p-6 sm:p-7 pl-7 sm:pl-8 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-slate-300">
          <div className="flex items-center justify-between mb-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 shadow-2xs group-hover:scale-110 transition-transform">
              <Building className="h-5 w-5 stroke-[2.5]" />
            </div>
            <span className="rounded-full bg-sky-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-sky-700 border border-sky-200/60 shadow-2xs">
              Live Assets
            </span>
          </div>
          <div className="space-y-1.5">
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              Total Properties
            </p>
            <div className="flex items-baseline gap-3">
              <h3 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
                {stats?.result ? stats.result.property : "—"}
              </h3>
              <span className="text-xs font-bold text-slate-400">
                active listings
              </span>
            </div>
          </div>
          <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Portfolio Catalog</span>
            <span className="font-bold text-sky-700">Residential & Commercial</span>
          </div>
        </div>

        {/* Card 2: Total Enquiries */}
        <div className="group relative overflow-hidden rounded-3xl border border-slate-200/85 bg-white p-6 sm:p-7 pl-7 sm:pl-8 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-slate-300">
          <div className="flex items-center justify-between mb-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-2xs group-hover:scale-110 transition-transform">
              <MessageCircle className="h-5 w-5 stroke-[2.5]" />
            </div>
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-700 border border-emerald-200/60 shadow-2xs">
              Customer Leads
            </span>
          </div>
          <div className="space-y-1.5">
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              Total Enquiries
            </p>
            <div className="flex items-baseline gap-3">
              <h3 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
                {stats?.result ? stats.result.enquiry : "—"}
              </h3>
              <span className="text-xs font-bold text-slate-400">
                inquiries logged
              </span>
            </div>
          </div>
          <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Client Conversion</span>
            <span className="font-bold text-emerald-700">Direct Inquiries</span>
          </div>
        </div>

        {/* Card 3: Available Properties */}
        <div className="group relative overflow-hidden rounded-3xl border border-slate-200/85 bg-white p-6 sm:p-7 pl-7 sm:pl-8 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-slate-300">
          <div className="flex items-center justify-between mb-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-2xs group-hover:scale-110 transition-transform">
              <Building2 className="h-5 w-5 stroke-[2.5]" />
            </div>
            <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-indigo-700 border border-indigo-200/60 shadow-2xs">
              Ready to Sell
            </span>
          </div>
          <div className="space-y-1.5">
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              Available for Sale
            </p>
            <div className="flex items-baseline gap-3">
              <h3 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
                {stats?.result ? stats.result.availablePropety : "—"}
              </h3>
              <span className="text-xs font-bold text-slate-400">
                units open
              </span>
            </div>
          </div>
          <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Market Inventory</span>
            <span className="font-bold text-indigo-700">Publicly Listed</span>
          </div>
        </div>

        {/* Card 4: Sold Properties */}
        <div className="group relative overflow-hidden rounded-3xl border border-slate-200/85 bg-white p-6 sm:p-7 pl-7 sm:pl-8 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-slate-300">
          <div className="flex items-center justify-between mb-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 shadow-2xs group-hover:scale-110 transition-transform">
              <TrendingUp className="h-5 w-5 stroke-[2.5]" />
            </div>
            <span className="rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-rose-700 border border-rose-200/60 shadow-2xs">
              Closed Deals
            </span>
          </div>
          <div className="space-y-1.5">
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              Sold Properties
            </p>
            <div className="flex items-baseline gap-3">
              <h3 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
                {stats?.result ? stats.result.soldProperty : "—"}
              </h3>
              <span className="text-xs font-bold text-slate-400">
                closed units
              </span>
            </div>
          </div>
          <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Success Rate</span>
            <span className="font-bold text-rose-700">Delivered Keys</span>
          </div>
        </div>
      </div>

      {/* 3. Soft, Unique Recent Enquiries Card & Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-200/85 bg-white shadow-xs">
        {/* Table Header with Search & Count */}
        <div className="flex flex-col gap-3 p-5 sm:p-6 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-black text-slate-950">
                Recent Enquiries
              </h2>
              <span className="rounded-full bg-slate-100 text-slate-800 text-[11px] font-black px-2.5 py-0.5 border border-slate-200/70">
                {enquiries.length} {enquiries.length === 1 ? "Inquiry" : "Inquiries"}
              </span>
            </div>
            <p className="mt-1 text-xs font-semibold text-slate-500">
              Direct inquiries submitted by potential clients. Click badges to toggle status or priority.
            </p>
          </div>

          {/* Search bar inside header */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search enquiries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-8.5 pr-3 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-primary focus:outline-none transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/75">
              <TableRow className="border-b border-slate-200/80 hover:bg-transparent">
                <TableHead className="pl-7 pr-4 py-3 text-[11px] font-black uppercase tracking-wider text-slate-600">
                  Client Info
                </TableHead>
                <TableHead className="px-4 py-3 text-[11px] font-black uppercase tracking-wider text-slate-600">
                  Contact Details
                </TableHead>
                <TableHead className="px-4 py-3 text-[11px] font-black uppercase tracking-wider text-slate-600">
                  Target Property
                </TableHead>
                <TableHead className="px-4 py-3 text-[11px] font-black uppercase tracking-wider text-slate-600 text-center">
                  Status
                </TableHead>
                <TableHead className="px-4 py-3 text-[11px] font-black uppercase tracking-wider text-slate-600 text-center">
                  Priority
                </TableHead>
                <TableHead className="px-4 py-3 text-[11px] font-black uppercase tracking-wider text-slate-600">
                  Date
                </TableHead>
                <TableHead className="px-5 py-3 text-[11px] font-black uppercase tracking-wider text-slate-600 text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-slate-100">
              {filteredEnquiries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-44 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-slate-500">
                      <MessageCircle className="h-8 w-8 text-slate-300 stroke-[1.5]" />
                      <p className="text-sm font-bold text-slate-700">
                        No enquiries found
                      </p>
                      <p className="text-xs text-slate-500">
                        {searchQuery
                          ? "Try searching with a different client name or property."
                          : "New client inquiries will appear here automatically."}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                [...filteredEnquiries].reverse().map((enquiry: any) => {
                  const initials = (enquiry.name || "U")
                    .split(" ")
                    .map((n: string) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase();

                  return (
                    <TableRow
                      key={enquiry.id}
                      className="transition-colors hover:bg-slate-50/70 group"
                    >
                      {/* 1. Client Info with Avatar */}
                      <TableCell className="pl-7 pr-4 py-3.5 font-medium">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-blue-100 text-indigo-900 font-black text-xs border border-indigo-200/70 shadow-2xs">
                            {initials}
                          </div>
                          <div>
                            <p className="font-black text-slate-950 text-xs tracking-tight">
                              {enquiry.name || "Unnamed Client"}
                            </p>
                            <p className="text-[10px] text-slate-500 font-semibold">
                              Direct Inquiry
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* 2. Contact Details */}
                      <TableCell className="px-4 py-3.5 text-xs">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                            <Phone className="h-3 w-3 text-slate-400 shrink-0" />
                            <span>{enquiry.mobile || "—"}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-500 font-medium truncate max-w-[180px]">
                            <Mail className="h-3 w-3 text-slate-400 shrink-0" />
                            <span className="truncate">{enquiry.email || "—"}</span>
                          </div>
                        </div>
                      </TableCell>

                      {/* 3. Target Property */}
                      <TableCell className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <Building className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="font-bold text-xs text-slate-900 line-clamp-1 max-w-[180px]">
                            {enquiry.propertyName && enquiry.propertyName !== "-"
                              ? enquiry.propertyName
                              : "General Inquiry"}
                          </span>
                        </div>
                      </TableCell>

                      {/* 4. Clickable Status Badge */}
                      <TableCell className="px-4 py-3.5 text-center">
                        <button
                          type="button"
                          onClick={() =>
                            handleStatusClick(enquiry.id, enquiry.status)
                          }
                          title="Click to cycle status (New -> In Progress -> Closed)"
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-black capitalize transition-all hover:scale-105 active:scale-95 shadow-2xs ${getStatusBadgeStyles(
                            enquiry.status
                          )}`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          {enquiry.status}
                        </button>
                      </TableCell>

                      {/* 5. Clickable Priority Badge */}
                      <TableCell className="px-4 py-3.5 text-center">
                        <button
                          type="button"
                          onClick={() =>
                            handlePriorityClick(enquiry.id, enquiry.priority)
                          }
                          title="Click to cycle priority (Low -> Medium -> High)"
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider transition-all hover:scale-105 active:scale-95 shadow-2xs ${getPriorityBadgeStyles(
                            enquiry.priority
                          )}`}
                        >
                          {enquiry.priority}
                        </button>
                      </TableCell>

                      {/* 6. Date */}
                      <TableCell className="px-4 py-3.5 text-xs font-semibold text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3 w-3 text-slate-400 shrink-0" />
                          <span>
                            {enquiry.createdAt
                              ? new Date(enquiry.createdAt).toLocaleDateString(
                                  "en-US",
                                  {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  }
                                )
                              : "—"}
                          </span>
                        </div>
                      </TableCell>

                      {/* 7. Action Buttons */}
                      <TableCell className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Edit enquiry status & priority"
                            onClick={() => handleEdit(enquiry)}
                            className="h-8 w-8 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-slate-100"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            title="Delete enquiry"
                            onClick={() => handleDelete(enquiry.id)}
                            className="h-8 w-8 rounded-xl text-rose-600 hover:bg-rose-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* 4. Soft & Elegant Edit Modal */}
      <Dialog open={isEditOpen && Boolean(selectedEnquiry)} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6 border border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-slate-950">
              Update Enquiry
            </DialogTitle>
            <DialogDescription className="text-xs font-semibold text-slate-600">
              Modify the customer pipeline status and priority response level.
            </DialogDescription>
          </DialogHeader>

          {selectedEnquiry && (
            <div className="space-y-4 py-2">
              {/* Client Name (Read only) */}
              <div className="space-y-1">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
                  Client Name
                </label>
                <input
                  value={selectedEnquiry.name || ""}
                  readOnly
                  className="w-full h-10 rounded-xl border border-slate-200 bg-slate-100/80 px-3.5 text-xs font-bold text-slate-800 cursor-not-allowed"
                />
              </div>

              {/* Email & Mobile */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
                    Email
                  </label>
                  <input
                    value={selectedEnquiry.email || ""}
                    readOnly
                    className="w-full h-10 rounded-xl border border-slate-200 bg-slate-100/80 px-3 text-xs font-semibold text-slate-700 truncate cursor-not-allowed"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
                    Mobile
                  </label>
                  <input
                    value={selectedEnquiry.mobile || ""}
                    readOnly
                    className="w-full h-10 rounded-xl border border-slate-200 bg-slate-100/80 px-3 text-xs font-semibold text-slate-700 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Status Select */}
              <div className="space-y-1">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
                  Status Pipeline
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full h-10 rounded-xl border border-slate-300 bg-white px-3 text-xs font-bold text-slate-900 focus:border-primary focus:outline-none"
                >
                  <option value="New">New</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              {/* Priority Select */}
              <div className="space-y-1">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
                  Priority Level
                </label>
                <select
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value)}
                  className="w-full h-10 rounded-xl border border-slate-300 bg-white px-3 text-xs font-bold text-slate-900 focus:border-primary focus:outline-none"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditOpen(false);
                    setSelectedEnquiry(null);
                  }}
                  className="rounded-xl font-bold text-xs border-slate-300 text-slate-700"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdate}
                  className="rounded-xl font-black text-xs bg-primary text-white shadow-sm shadow-primary/25"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;