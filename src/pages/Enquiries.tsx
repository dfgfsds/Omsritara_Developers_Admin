import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Eye,
  Phone,
  Mail,
  Calendar,
  Search,
  Trash2,
  Sparkles,
  RefreshCw,
  MessageCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building,
  ExternalLink,
  X,
  Filter,
  User,
} from "lucide-react";
import axiosInstance from "@/lib/axiosInstance";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { getAgentEnquiries, getStoredEnquiries } from "@/data/mockAgentsData";

// Soft status pill styling
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

// Soft priority pill styling
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

const Enquiries = () => {
  const { role, isAgent, isAdmin, currentAgent } = useAuth();
  const [searchParams] = useSearchParams();
  const urlSearch = searchParams.get("search") || searchParams.get("q") || "";

  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [selectedEnquiry, setSelectedEnquiry] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(urlSearch);

  useEffect(() => {
    const q = searchParams.get("search") || searchParams.get("q");
    if (q !== null && q !== undefined) {
      setSearchTerm(q);
    }
  }, [searchParams]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Status & Priority cycles
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
        message: item.message || "No message provided",
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
          message: item.property?.[0]?.description || "No message provided",
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

  const refreshEnquiries = async () => {
    setIsRefreshing(true);
    await fetchEnquiries();
    setTimeout(() => setIsRefreshing(false), 350);
  };

  useEffect(() => {
    fetchEnquiries();
  }, [isAgent, currentAgent?._id]);

  // Handler for cycling status
  const handleStatusClick = async (id: string, currentStatus: string) => {
    const newStatus = statusCycle[currentStatus] || "New";

    setEnquiries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: newStatus } : e))
    );

    if (selectedEnquiry && selectedEnquiry.id === id) {
      setSelectedEnquiry((prev: any) => ({ ...prev, status: newStatus }));
    }

    try {
      await axiosInstance.put(`/enquiry/${id}`, { status: newStatus });
      toast({
        title: "Status Updated",
        description: `Enquiry status changed to ${newStatus}.`,
      });
    } catch (error) {
      console.error("Error updating status:", error);
      fetchEnquiries();
    }
  };

  // Handler for cycling priority
  const handlePriorityClick = async (id: string, currentPriority: string) => {
    const newPriority = priorityCycle[currentPriority] || "Low";

    setEnquiries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, priority: newPriority } : e))
    );

    if (selectedEnquiry && selectedEnquiry.id === id) {
      setSelectedEnquiry((prev: any) => ({ ...prev, priority: newPriority }));
    }

    try {
      await axiosInstance.put(`/enquiry/${id}`, { priority: newPriority });
      toast({
        title: "Priority Updated",
        description: `Enquiry priority set to ${newPriority}.`,
      });
    } catch (error) {
      console.error("Error updating priority:", error);
      fetchEnquiries();
    }
  };

  const handleDeleteEnquiry = async (enquiryId: string) => {
    if (!confirm("Are you sure you want to delete this enquiry?")) return;

    try {
      const res = await axiosInstance.delete(`/enquiry/${enquiryId}`);
      fetchEnquiries();
      if (selectedEnquiry?.id === enquiryId) {
        setIsViewDialogOpen(false);
        setSelectedEnquiry(null);
      }
      toast({
        title: "Enquiry Deleted",
        description: res?.data?.msg || "The inquiry has been removed.",
      });
    } catch (error: any) {
      console.error("Error deleting enquiry:", error);
      toast({
        title: "Failed to delete",
        description: error?.response?.data?.msg || "Something went wrong!",
        variant: "destructive",
      });
    }
  };

  const handleViewEnquiry = (enquiry: any) => {
    setSelectedEnquiry(enquiry);
    setIsViewDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Metric stats
  const stats = useMemo(() => {
    return {
      total: enquiries.length,
      new: enquiries.filter((e) => e.status === "New").length,
      inProgress: enquiries.filter((e) => e.status === "In Progress").length,
      closed: enquiries.filter((e) => e.status === "Closed").length,
    };
  }, [enquiries]);

  // Filtered enquiries
  const filteredEnquiries = useMemo(() => {
    return enquiries.filter((enquiry) => {
      const q = searchTerm.toLowerCase().trim();
      const name = String(enquiry.name || "").toLowerCase();
      const email = String(enquiry.email || "").toLowerCase();
      const mobile = String(enquiry.mobile || "").toLowerCase();
      const prop = String(enquiry.propertyName || "").toLowerCase();
      const msg = String(enquiry.message || "").toLowerCase();
      const status = String(enquiry.status || "").toLowerCase();

      const matchesSearch =
        !q ||
        name.includes(q) ||
        email.includes(q) ||
        mobile.includes(q) ||
        prop.includes(q) ||
        msg.includes(q) ||
        status.includes(q);

      const matchesStatus =
        statusFilter === "All" ||
        enquiry.status?.toLowerCase() === statusFilter.toLowerCase();

      const matchesPriority =
        priorityFilter === "All" ||
        enquiry.priority?.toLowerCase() === priorityFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [enquiries, searchTerm, statusFilter, priorityFilter]);

  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    statusFilter !== "All" ||
    priorityFilter !== "All";

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setPriorityFilter("All");
  };

  return (
    <div className="space-y-7">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-slate-50 to-indigo-50/40 p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 px-3 py-0.5 text-[11px] font-black text-indigo-900 tracking-wide mb-2 shadow-2xs">
              <Sparkles className="h-3 w-3 text-indigo-600" />
              Client Relationship Management
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
              Customer Enquiries
            </h1>
            <p className="mt-1 text-xs font-semibold text-slate-600 max-w-xl">
              Inspect buyer requests, track customer response statuses, and manage sales outreach for real estate listings.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshEnquiries}
              className="h-10 rounded-2xl border-slate-200 bg-white font-bold text-xs text-slate-700 shadow-xs hover:bg-slate-50 transition"
              title="Refresh inquiries"
            >
              <RefreshCw
                className={`mr-2 h-3.5 w-3.5 text-slate-600 ${
                  isRefreshing ? "animate-spin" : ""
                }`}
              />
              Sync Leads
            </Button>
          </div>
        </div>

        {/* Decorative soft glow */}
        <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-indigo-200/30 blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 h-44 w-44 rounded-full bg-emerald-200/20 blur-3xl pointer-events-none" />
      </div>

      {/* 2. Soft & Interactive Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Leads */}
        <button
          type="button"
          onClick={() => setStatusFilter("All")}
          className={`group text-left overflow-hidden rounded-3xl border p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${
            statusFilter === "All"
              ? "bg-white border-primary/50 ring-2 ring-primary/20"
              : "bg-white border-slate-200/85 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-2xs group-hover:scale-110 transition-transform">
              <MessageCircle className="h-5 w-5 stroke-[2.5]" />
            </div>
            <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-indigo-700 border border-indigo-200/60">
              All Leads
            </span>
          </div>
          <p className="text-[11px] font-black uppercase tracking-wider text-slate-500">
            Total Enquiries
          </p>
          <h3 className="mt-1 text-3xl font-black text-slate-950 tracking-tight">
            {stats.total}
          </h3>
        </button>

        {/* Card 2: New Inquiries */}
        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === "New" ? "All" : "New")}
          className={`group text-left overflow-hidden rounded-3xl border p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${
            statusFilter === "New"
              ? "bg-white border-sky-500/60 ring-2 ring-sky-500/20"
              : "bg-white border-slate-200/85 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 shadow-2xs group-hover:scale-110 transition-transform">
              <Clock className="h-5 w-5 stroke-[2.5]" />
            </div>
            <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-sky-700 border border-sky-200/60">
              Needs Review
            </span>
          </div>
          <p className="text-[11px] font-black uppercase tracking-wider text-slate-500">
            New Enquiries
          </p>
          <h3 className="mt-1 text-3xl font-black text-slate-950 tracking-tight">
            {stats.new}
          </h3>
        </button>

        {/* Card 3: In Progress */}
        <button
          type="button"
          onClick={() =>
            setStatusFilter(statusFilter === "In Progress" ? "All" : "In Progress")
          }
          className={`group text-left overflow-hidden rounded-3xl border p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${
            statusFilter === "In Progress"
              ? "bg-white border-amber-500/60 ring-2 ring-amber-500/20"
              : "bg-white border-slate-200/85 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 shadow-2xs group-hover:scale-110 transition-transform">
              <AlertCircle className="h-5 w-5 stroke-[2.5]" />
            </div>
            <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-700 border border-amber-200/60">
              In Follow-up
            </span>
          </div>
          <p className="text-[11px] font-black uppercase tracking-wider text-slate-500">
            In Progress
          </p>
          <h3 className="mt-1 text-3xl font-black text-slate-950 tracking-tight">
            {stats.inProgress}
          </h3>
        </button>

        {/* Card 4: Closed / Converted */}
        <button
          type="button"
          onClick={() =>
            setStatusFilter(statusFilter === "Closed" ? "All" : "Closed")
          }
          className={`group text-left overflow-hidden rounded-3xl border p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${
            statusFilter === "Closed"
              ? "bg-white border-emerald-500/60 ring-2 ring-emerald-500/20"
              : "bg-white border-slate-200/85 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-2xs group-hover:scale-110 transition-transform">
              <CheckCircle2 className="h-5 w-5 stroke-[2.5]" />
            </div>
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-700 border border-emerald-200/60">
              Resolved
            </span>
          </div>
          <p className="text-[11px] font-black uppercase tracking-wider text-slate-500">
            Closed Leads
          </p>
          <h3 className="mt-1 text-3xl font-black text-slate-950 tracking-tight">
            {stats.closed}
          </h3>
        </button>
      </div>

      {/* 3. Filter & Search Panel */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by client name, email, phone, property..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-9 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-primary focus:outline-none transition"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Dropdowns & Reset */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 hidden sm:inline">
              Status:
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-800 focus:border-primary focus:outline-none shadow-xs"
            >
              <option value="All">All Statuses</option>
              <option value="New">New</option>
              <option value="In Progress">In Progress</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 hidden sm:inline">
              Priority:
            </span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-800 focus:border-primary focus:outline-none shadow-xs"
            >
              <option value="All">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-10 rounded-xl font-bold text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700"
            >
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      {/* 4. Enquiries Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-200/85 bg-white shadow-xs">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-black text-slate-950">Inquiry Records</h2>
            <span className="rounded-full bg-slate-100 text-slate-800 text-[11px] font-black px-2.5 py-0.5 border border-slate-200/70">
              {filteredEnquiries.length} {filteredEnquiries.length === 1 ? "Lead" : "Leads"}
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-500 hidden sm:block">
            Click on status or priority pills to cycle values directly
          </p>
        </div>

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
                  Property Target
                </TableHead>
                <TableHead className="px-4 py-3 text-[11px] font-black uppercase tracking-wider text-slate-600 text-center">
                  Status Pipeline
                </TableHead>
                <TableHead className="px-4 py-3 text-[11px] font-black uppercase tracking-wider text-slate-600 text-center">
                  Priority
                </TableHead>
                <TableHead className="px-4 py-3 text-[11px] font-black uppercase tracking-wider text-slate-600">
                  Received Date
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
                        No customer enquiries match your filters
                      </p>
                      <p className="text-xs text-slate-500">
                        Try resetting your search query or status filter.
                      </p>
                      {hasActiveFilters && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={clearFilters}
                          className="mt-1 rounded-xl font-bold text-xs"
                        >
                          Clear Active Filters
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                [...filteredEnquiries].reverse().map((enquiry) => {
                  const initials = (enquiry.name || "U")
                    .split(" ")
                    .map((n: string) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase();

                  return (
                    <TableRow
                      key={enquiry.id}
                      className="transition-colors hover:bg-slate-50/70"
                    >
                      {/* Client Info with Avatar */}
                      <TableCell className="pl-7 pr-4 py-3.5 font-medium">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-blue-100 text-indigo-900 font-black text-xs border border-indigo-200/70 shadow-2xs">
                            {initials}
                          </div>
                          <div>
                            <p className="font-black text-slate-950 text-xs tracking-tight">
                              {enquiry.name || "Anonymous Lead"}
                            </p>
                            <p className="text-[10px] text-slate-500 font-semibold">
                              Web Inquiry
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Contact Details */}
                      <TableCell className="px-4 py-3.5 text-xs">
                        <div className="space-y-1">
                          <a
                            href={enquiry.mobile ? `tel:${enquiry.mobile}` : undefined}
                            className="flex items-center gap-1.5 text-slate-700 font-semibold hover:text-primary transition-colors"
                            title="Click to dial"
                          >
                            <Phone className="h-3 w-3 text-slate-400 shrink-0" />
                            <span>{enquiry.mobile || "—"}</span>
                          </a>
                          <a
                            href={enquiry.email ? `mailto:${enquiry.email}` : undefined}
                            className="flex items-center gap-1.5 text-slate-500 font-medium truncate max-w-[190px] hover:text-primary transition-colors"
                            title="Click to email"
                          >
                            <Mail className="h-3 w-3 text-slate-400 shrink-0" />
                            <span className="truncate">{enquiry.email || "—"}</span>
                          </a>
                        </div>
                      </TableCell>

                      {/* Target Property */}
                      <TableCell className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <Building className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="font-bold text-xs text-slate-900 line-clamp-1 max-w-[190px]">
                            {enquiry.propertyName && enquiry.propertyName !== "-"
                              ? enquiry.propertyName
                              : "General Inquiry"}
                          </span>
                        </div>
                      </TableCell>

                      {/* Status */}
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

                      {/* Priority */}
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

                      {/* Date */}
                      <TableCell className="px-4 py-3.5 text-xs font-semibold text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3 w-3 text-slate-400 shrink-0" />
                          <span>{formatDate(enquiry.createdAt)}</span>
                        </div>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Inspect enquiry message & details"
                            onClick={() => handleViewEnquiry(enquiry)}
                            className="h-8 w-8 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-slate-100"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            title="Delete enquiry"
                            onClick={() => handleDeleteEnquiry(enquiry.id)}
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

      {/* 5. Modern View Enquiry Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-lg rounded-3xl p-6 border border-slate-200">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                <User className="h-4 w-4" />
              </div>
              <div>
                <DialogTitle className="text-lg font-black text-slate-950">
                  Customer Lead Dossier
                </DialogTitle>
                <DialogDescription className="text-xs font-semibold text-slate-500">
                  Received on {selectedEnquiry ? formatDate(selectedEnquiry.createdAt) : "—"}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {selectedEnquiry && (
            <div className="space-y-4 py-2">
              {/* Client Info Card */}
              <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                      Client Name
                    </span>
                    <h4 className="text-base font-black text-slate-950">
                      {selectedEnquiry.name || "Anonymous Lead"}
                    </h4>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-black capitalize ${getStatusBadgeStyles(
                        selectedEnquiry.status
                      )}`}
                    >
                      {selectedEnquiry.status}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${getPriorityBadgeStyles(
                        selectedEnquiry.priority
                      )}`}
                    >
                      {selectedEnquiry.priority}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-200/70 text-xs">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-extrabold uppercase text-slate-500">
                      Phone Number
                    </span>
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                      <Phone className="h-3 w-3 text-slate-400" />
                      <span>{selectedEnquiry.mobile || "—"}</span>
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-extrabold uppercase text-slate-500">
                      Email Address
                    </span>
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 truncate">
                      <Mail className="h-3 w-3 text-slate-400" />
                      <span className="truncate">{selectedEnquiry.email || "—"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Property Target */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-4">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Target Property Interest
                </span>
                <div className="mt-1 flex items-center gap-2 text-sm font-black text-slate-950">
                  <Building className="h-4 w-4 text-primary" />
                  <span>
                    {selectedEnquiry.propertyName && selectedEnquiry.propertyName !== "-"
                      ? selectedEnquiry.propertyName
                      : "General Real Estate Inquiry"}
                  </span>
                </div>
              </div>

              {/* Inquiry Message */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-4">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Inquiry Message / Request
                </span>
                <p className="mt-1.5 text-xs font-semibold leading-relaxed text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200/70 whitespace-pre-wrap">
                  "{selectedEnquiry.message || "No custom message attached with this inquiry."}"
                </p>
              </div>

              {/* Quick Actions inside Dialog */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteEnquiry(selectedEnquiry.id)}
                  className="rounded-xl text-xs font-bold"
                >
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  Delete Lead
                </Button>

                <div className="flex items-center gap-2">
                  {selectedEnquiry.mobile && (
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="rounded-xl font-bold text-xs border-slate-300"
                    >
                      <a href={`tel:${selectedEnquiry.mobile}`}>
                        <Phone className="mr-1.5 h-3.5 w-3.5 text-emerald-600" />
                        Call Client
                      </a>
                    </Button>
                  )}
                  {selectedEnquiry.email && (
                    <Button
                      asChild
                      size="sm"
                      className="rounded-xl font-black text-xs bg-primary text-white"
                    >
                      <a href={`mailto:${selectedEnquiry.email}`}>
                        <Mail className="mr-1.5 h-3.5 w-3.5" />
                        Send Email
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Enquiries;
