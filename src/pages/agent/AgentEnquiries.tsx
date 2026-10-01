import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  MessageCircle,
  Search,
  Phone,
  Mail,
  Calendar,
  Building2,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  Clock,
  Eye,
  Edit2,
  Trash2,
  User,
  ExternalLink,
  MessageSquare,
  AlertTriangle,
  Send,
  Flame,
  ArrowUpRight,
  Tag,
  X,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";
import axiosInstance from "@/lib/axiosInstance";
import { useAuth } from "@/context/AuthContext";

// Helper to ensure safe string rendering in React JSX and prevent "Objects are not valid as a React child" crashes
const getSafeString = (val: any, fallback = ""): string => {
  if (typeof val === "string") return val;
  if (typeof val === "number" || typeof val === "boolean") return String(val);
  if (val && typeof val === "object") {
    if (typeof val.name === "string") return val.name;
    if (typeof val.title === "string") return val.title;
    if (typeof val.city === "string") return val.city;
    if (typeof val.address === "string") return val.address;
    if (typeof val.email === "string") return val.email;
    if (typeof val.mobile === "string" || typeof val.mobile === "number") return String(val.mobile);
  }
  return fallback;
};

export default function AgentEnquiries() {
  const [searchParams] = useSearchParams();
  const { userData, currentAgent } = useAuth();
  const currentAgentId =
    userData?._id ||
    currentAgent?._id ||
    localStorage.getItem("ost_agent_id");

  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "all");

  useEffect(() => {
    const s = searchParams.get("status");
    if (s) {
      setStatusFilter(s);
    }
  }, [searchParams]);

  // Dialog States
  const [viewingEnquiry, setViewingEnquiry] = useState<any | null>(null);
  const [editingEnquiry, setEditingEnquiry] = useState<any | null>(null);
  const [deletingEnquiry, setDeletingEnquiry] = useState<any | null>(null);

  // Form State for Editing
  const [editName, setEditName] = useState<string>("");
  const [editMobile, setEditMobile] = useState<string>("");
  const [editEmail, setEditEmail] = useState<string>("");
  const [editStatus, setEditStatus] = useState<string>("new");
  const [editPriority, setEditPriority] = useState<string>("medium");
  const [editNotes, setEditNotes] = useState<string>("");
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isUpdatingPriority, setIsUpdatingPriority] = useState(false);

  const fetchEnquiries = async () => {
    setIsLoading(true);
    try {
      const res = await axiosInstance.get("/enquiry");
      const list =
        res.data?.result ||
        res.data?.data ||
        (Array.isArray(res.data) ? res.data : []);
      const allEnqs = Array.isArray(list) ? list : [];

      // Strict Scoping:
      // Show ONLY enquiries belonging to properties created by this agent or assigned to this agent
      const myEnquiries = currentAgentId
        ? allEnqs.filter((item: any) => {
            const propObj = Array.isArray(item.property)
              ? item.property[0]
              : item.property;
            const propOwnerId =
              propObj?.created_by?._id ||
              propObj?.created_by ||
              item.created_by?._id ||
              item.created_by;
            const agentFieldId = item.agent?._id || item.agent;

            return (
              String(propOwnerId) === String(currentAgentId) ||
              String(agentFieldId) === String(currentAgentId)
            );
          })
        : allEnqs;

      setEnquiries(myEnquiries);
    } catch (err: any) {
      toast({
        title: "Error Loading Enquiries",
        description:
          err.response?.data?.msg ||
          err.message ||
          "Failed to load client leads.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, [currentAgentId]);

  // Quick Status Switcher Handler
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setIsUpdatingStatus(true);
    try {
      await axiosInstance.put(`/enquiry/${id}`, { status: newStatus });
      toast({
        title: "Lead Status Updated",
        description: `Enquiry marked as "${newStatus}".`,
      });

      // Update state locally
      setEnquiries((prev) =>
        prev.map((e) => (e._id === id ? { ...e, status: newStatus } : e))
      );
      if (viewingEnquiry && viewingEnquiry._id === id) {
        setViewingEnquiry((prev: any) => ({ ...prev, status: newStatus }));
      }
    } catch (err: any) {
      toast({
        title: "Update Failed",
        description:
          err.response?.data?.msg || err.message || "Could not update status.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Quick Priority Switcher Handler
  const handleUpdatePriority = async (id: string, newPriority: string) => {
    setIsUpdatingPriority(true);
    try {
      await axiosInstance.put(`/enquiry/${id}`, {
        priority: newPriority.toLowerCase(),
      });
      toast({
        title: "Lead Priority Updated",
        description: `Lead priority marked as "${newPriority.toUpperCase()}".`,
      });

      // Update state locally
      setEnquiries((prev) =>
        prev.map((e) =>
          e._id === id ? { ...e, priority: newPriority.toLowerCase() } : e
        )
      );
      if (viewingEnquiry && viewingEnquiry._id === id) {
        setViewingEnquiry((prev: any) => ({
          ...prev,
          priority: newPriority.toLowerCase(),
        }));
      }
    } catch (err: any) {
      toast({
        title: "Priority Update Failed",
        description:
          err.response?.data?.msg || err.message || "Could not update priority.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingPriority(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (enq: any) => {
    setEditingEnquiry(enq);
    setEditName(getSafeString(enq.name, ""));
    setEditMobile(getSafeString(enq.mobile || enq.phone, ""));
    setEditEmail(getSafeString(enq.email, ""));
    setEditStatus(getSafeString(enq.status, "new"));
    setEditPriority(getSafeString(enq.priority, "medium"));
    setEditNotes(getSafeString(enq.description || enq.notes || enq.message, ""));
  };

  // Save Edit Submission
  const handleSaveEdit = async () => {
    if (!editingEnquiry) return;
    setIsSubmittingEdit(true);

    try {
      const cleanName = getSafeString(editName).trim();
      const cleanEmail = getSafeString(editEmail).trim().toLowerCase();
      const digitsOnly = getSafeString(editMobile).replace(/\D/g, "");
      const cleanMobile = digitsOnly.length >= 10 ? digitsOnly.slice(-10) : digitsOnly;
      const cleanNotes = getSafeString(editNotes).trim();

      const payload: any = {
        name: cleanName || "Client Lead",
        status: editStatus.toLowerCase(),
        priority: editPriority.toLowerCase(),
      };
      if (cleanEmail && cleanEmail !== "-") payload.email = cleanEmail;
      if (cleanMobile && cleanMobile.length === 10) payload.mobile = cleanMobile;
      if (cleanNotes) payload.description = cleanNotes;

      await axiosInstance.put(`/enquiry/${editingEnquiry._id}`, payload);

      toast({
        title: "Lead Details Updated",
        description: `Enquiry for ${cleanName || "Client"} has been saved.`,
      });

      setEnquiries((prev) =>
        prev.map((item) =>
          item._id === editingEnquiry._id
            ? {
                ...item,
                name: cleanName || item.name,
                email: cleanEmail || item.email,
                mobile: cleanMobile || item.mobile,
                status: editStatus,
                priority: editPriority,
                description: cleanNotes,
              }
            : item
        )
      );

      if (viewingEnquiry && viewingEnquiry._id === editingEnquiry._id) {
        setViewingEnquiry((prev: any) => ({
          ...prev,
          name: cleanName || prev.name,
          email: cleanEmail || prev.email,
          mobile: cleanMobile || prev.mobile,
          status: editStatus,
          priority: editPriority,
          description: cleanNotes,
        }));
      }

      setEditingEnquiry(null);
    } catch (err: any) {
      console.error("Error updating enquiry:", err);
      const serverMsg =
        getSafeString(err.response?.data?.msg) ||
        getSafeString(err.response?.data?.message) ||
        getSafeString(err.message) ||
        "Could not save enquiry.";
      toast({
        title: "Update Failed",
        description: serverMsg,
        variant: "destructive",
      });
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Delete Enquiry Handler
  const handleConfirmDelete = async () => {
    if (!deletingEnquiry) return;
    setIsDeleting(true);

    try {
      await axiosInstance.delete(`/enquiry/${deletingEnquiry._id}`);

      toast({
        title: "Enquiry Removed",
        description: `Lead for "${deletingEnquiry.name || "Client"}" has been deleted.`,
      });

      setEnquiries((prev) =>
        prev.filter((item) => item._id !== deletingEnquiry._id)
      );
      if (viewingEnquiry && viewingEnquiry._id === deletingEnquiry._id) {
        setViewingEnquiry(null);
      }
      setDeletingEnquiry(null);
    } catch (err: any) {
      toast({
        title: "Delete Failed",
        description:
          err.response?.data?.msg || err.message || "Could not delete enquiry.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered Leads
  const filteredEnquiries = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return enquiries.filter((e) => {
      const nameStr = getSafeString(e.name).toLowerCase();
      const emailStr = getSafeString(e.email).toLowerCase();
      const mobileStr = getSafeString(e.mobile || e.phone);
      const propStr = getSafeString(
        e.property?.name || e.property_id?.name || e.propertyName
      ).toLowerCase();

      const matchesSearch =
        !q ||
        nameStr.includes(q) ||
        emailStr.includes(q) ||
        mobileStr.includes(q) ||
        propStr.includes(q);

      const statusStr = getSafeString(e.status).toLowerCase();
      const matchesStatus =
        statusFilter === "all" ||
        statusStr === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [enquiries, searchTerm, statusFilter]);

  // Counts & Stats
  const counts = useMemo(() => {
    return {
      all: enquiries.length,
      new: enquiries.filter(
        (e) => !e.status || getSafeString(e.status).toLowerCase() === "new"
      ).length,
      contacted: enquiries.filter((e) => {
        const s = getSafeString(e.status).toLowerCase();
        return s === "contacted" || s === "in_progress";
      }).length,
      closed: enquiries.filter(
        (e) => getSafeString(e.status).toLowerCase() === "closed"
      ).length,
    };
  }, [enquiries]);

  // Color Helper for Status Badges
  const getStatusBadge = (status: any) => {
    const s = getSafeString(status, "new").toLowerCase();
    switch (s) {
      case "new":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200/80 hover:bg-sky-100 hover:text-sky-950 transition-colors shadow-2xs">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-500 animate-pulse" />
            New Lead
          </span>
        );
      case "contacted":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80 hover:bg-amber-100 hover:text-amber-950 transition-colors shadow-2xs">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Contacted
          </span>
        );
      case "in_progress":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/80 hover:bg-indigo-100 hover:text-indigo-950 transition-colors shadow-2xs">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
            In Progress
          </span>
        );
      case "closed":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 hover:bg-emerald-100 hover:text-emerald-950 transition-colors shadow-2xs">
            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
            Closed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 hover:text-slate-950 transition-colors shadow-2xs">
            {getSafeString(status)}
          </span>
        );
    }
  };

  // Color Helper for Priority Badges
  const getPriorityBadge = (priority: any) => {
    const p = getSafeString(priority, "medium").toLowerCase();
    switch (p) {
      case "high":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-black bg-rose-50 text-rose-700 border border-rose-200/90 hover:bg-rose-100 hover:text-rose-950 transition-colors shadow-2xs">
            <Flame className="h-3.5 w-3.5 text-rose-600" />
            High
          </span>
        );
      case "low":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-black bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 hover:text-slate-950 transition-colors shadow-2xs">
            Low
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-black bg-amber-50 text-amber-800 border border-amber-200/90 hover:bg-amber-100 hover:text-amber-950 transition-colors shadow-2xs">
            Medium
          </span>
        );
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-6 p-1 sm:p-2 pb-16">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 text-amber-900 text-xs font-bold mb-2 shadow-2xs">
              <Sparkles className="h-3.5 w-3.5 text-amber-600" />
              <span>Agent CRM Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 font-heading tracking-tight">
              My Client Enquiries
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Track customer interest, update deal progress, and connect directly with prospective buyers.
            </p>
          </div>

          <Button
            variant="outline"
            onClick={fetchEnquiries}
            disabled={isLoading}
            className="rounded-2xl border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 font-bold h-11 px-4 shadow-xs transition-all self-start sm:self-auto"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 text-slate-500 ${
                isLoading ? "animate-spin" : ""
              }`}
            />
            Refresh Leads
          </Button>
        </div>

        {/* 4 Soft Stat Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {/* Total Leads */}
          <div
            onClick={() => setStatusFilter("all")}
            className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-sky-50/30 to-blue-50/50 p-4 sm:p-5 border transition-all duration-200 cursor-pointer ${
              statusFilter === "all"
                ? "border-sky-500 ring-2 ring-sky-500/20 shadow-md"
                : "border-sky-100/80 shadow-xs hover:shadow-md"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Total Leads
              </span>
              <div className="h-9 w-9 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center shadow-2xs">
                <MessageCircle className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
                {counts.all}
              </span>
              <span className="text-[11px] font-semibold text-slate-400">
                inquiries
              </span>
            </div>
          </div>

          {/* New Leads */}
          <div
            onClick={() => setStatusFilter("new")}
            className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-emerald-50/30 to-teal-50/50 p-4 sm:p-5 border transition-all duration-200 cursor-pointer ${
              statusFilter === "new"
                ? "border-emerald-500 ring-2 ring-emerald-500/20 shadow-md"
                : "border-emerald-100/80 shadow-xs hover:shadow-md"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                New Leads
              </span>
              <div className="h-9 w-9 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-2xs">
                <Sparkles className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-emerald-950 font-heading">
                {counts.new}
              </span>
              <span className="text-[11px] font-semibold text-emerald-600">
                need response
              </span>
            </div>
          </div>

          {/* In Follow-up */}
          <div
            onClick={() => setStatusFilter("contacted")}
            className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-amber-50/30 to-orange-50/50 p-4 sm:p-5 border transition-all duration-200 cursor-pointer ${
              statusFilter === "contacted"
                ? "border-amber-500 ring-2 ring-amber-500/20 shadow-md"
                : "border-amber-100/80 shadow-xs hover:shadow-md"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                In Follow-up
              </span>
              <div className="h-9 w-9 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-2xs">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-amber-950 font-heading">
                {counts.contacted}
              </span>
              <span className="text-[11px] font-semibold text-amber-600">
                active talks
              </span>
            </div>
          </div>

          {/* Closed Deals */}
          <div
            onClick={() => setStatusFilter("closed")}
            className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-purple-50/30 to-indigo-50/50 p-4 sm:p-5 border transition-all duration-200 cursor-pointer ${
              statusFilter === "closed"
                ? "border-purple-500 ring-2 ring-purple-500/20 shadow-md"
                : "border-purple-100/80 shadow-xs hover:shadow-md"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-800 uppercase tracking-wider">
                Closed Deals
              </span>
              <div className="h-9 w-9 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shadow-2xs">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-purple-950 font-heading">
                {counts.closed}
              </span>
              <span className="text-[11px] font-semibold text-purple-600">
                converted
              </span>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-3xl bg-white p-4 border border-slate-200/80 shadow-xs">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 h-4 w-4 text-slate-500 pointer-events-none" />
              <input
                type="text"
                placeholder="Search leads by customer name, phone, email, property..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-11 pl-10 pr-10 rounded-2xl bg-slate-100 hover:bg-slate-100/90 focus:bg-white border-2 border-slate-200/90 focus:border-primary text-slate-950 font-bold text-xs sm:text-sm placeholder:text-slate-400 placeholder:font-normal focus:ring-4 focus:ring-primary/10 transition-all outline-none"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 h-6 w-6 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors"
                  title="Clear search"
                >
                  <X className="h-3.5 w-3.5 stroke-[2.5]" />
                </button>
              )}
            </div>
          </div>

          {/* Soft Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === "all"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/80"
              }`}
            >
              All ({counts.all})
            </button>
            <button
              onClick={() => setStatusFilter("new")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === "new"
                  ? "bg-sky-600 text-white shadow-xs"
                  : "bg-sky-50 text-sky-700 hover:bg-sky-100"
              }`}
            >
              New ({counts.new})
            </button>
            <button
              onClick={() => setStatusFilter("contacted")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === "contacted"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-amber-50 text-amber-700 hover:bg-amber-100"
              }`}
            >
              Contacted ({counts.contacted})
            </button>
            <button
              onClick={() => setStatusFilter("closed")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === "closed"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              }`}
            >
              Closed ({counts.closed})
            </button>
          </div>
        </div>

        {/* Enquiries Table */}
        {filteredEnquiries.length === 0 ? (
          <div className="rounded-3xl bg-white p-12 text-center border border-slate-200/80 shadow-xs">
            <div className="h-16 w-16 mx-auto mb-4 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-300 border border-slate-100">
              <MessageCircle className="h-8 w-8" />
            </div>
            <h3 className="text-base font-black text-slate-800">
              No Client Enquiries Found
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {searchTerm || statusFilter !== "all"
                ? "No leads matched your search criteria. Try modifying your filter."
                : "You haven't received any buyer inquiries for your properties yet."}
            </p>
          </div>
        ) : (
          <div className="rounded-3xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50/80 border-b border-slate-100">
                <TableRow>
                  <TableHead className="text-xs font-black text-slate-700 py-3.5 pl-6">
                    Customer
                  </TableHead>
                  <TableHead className="text-xs font-black text-slate-700 py-3.5">
                    Contact Details
                  </TableHead>
                  <TableHead className="text-xs font-black text-slate-700 py-3.5">
                    Interested Property
                  </TableHead>
                  <TableHead className="text-xs font-black text-slate-700 py-3.5">
                    Status
                  </TableHead>
                  <TableHead className="text-xs font-black text-slate-700 py-3.5">
                    Priority
                  </TableHead>
                  <TableHead className="text-xs font-black text-slate-700 py-3.5">
                    Date
                  </TableHead>
                  <TableHead className="text-xs font-black text-slate-700 py-3.5 pr-6 text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEnquiries.map((enq) => {
                  const propTitle = getSafeString(
                    enq.property?.name ||
                    enq.property_id?.name ||
                    enq.propertyName,
                    "General Enquiry"
                  );
                  const clientName = getSafeString(enq.name, "Customer");
                  const clientMobile = getSafeString(enq.mobile || enq.phone, "N/A");
                  const clientEmail = getSafeString(enq.email);
                  const clientDesc = getSafeString(enq.description || enq.notes || enq.message);

                  return (
                    <TableRow
                      key={enq._id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Customer Info */}
                      <TableCell className="py-3 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-primary/10 to-amber-100/50 text-primary flex items-center justify-center font-black text-xs shrink-0 shadow-2xs border border-primary/10">
                            {clientName ? clientName.charAt(0).toUpperCase() : "U"}
                          </div>
                          <div>
                            <span className="font-bold text-xs text-slate-900 block group-hover:text-primary transition-colors">
                              {clientName}
                            </span>
                            {clientDesc && (
                              <p className="text-[11px] text-slate-400 truncate max-w-[170px] mt-0.5">
                                "{clientDesc}"
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Contact Info */}
                      <TableCell className="py-3">
                        <div className="space-y-1 text-xs text-slate-600 font-semibold">
                          <div className="flex items-center gap-1.5">
                            <Phone className="h-3 w-3 text-slate-400 shrink-0" />
                            <a
                              href={`tel:${clientMobile}`}
                              className="hover:text-primary hover:underline"
                            >
                              {clientMobile}
                            </a>
                          </div>
                          {clientEmail && (
                            <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                              <Mail className="h-3 w-3 text-slate-400 shrink-0" />
                              <a
                                href={`mailto:${clientEmail}`}
                                className="truncate max-w-[150px] hover:text-primary hover:underline"
                              >
                                {clientEmail}
                              </a>
                            </div>
                          )}
                        </div>
                      </TableCell>

                      {/* Property */}
                      <TableCell className="py-3">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-800 max-w-[200px]">
                          <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{propTitle}</span>
                        </div>
                      </TableCell>

                      {/* Status (Interactive cycle on click) */}
                      <TableCell className="py-3">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              onClick={() => {
                                const cur = getSafeString(
                                  enq.status,
                                  "new"
                                ).toLowerCase();
                                const next =
                                  cur === "new"
                                    ? "contacted"
                                    : cur === "contacted"
                                    ? "in_progress"
                                    : cur === "in_progress"
                                    ? "closed"
                                    : "new";
                                handleUpdateStatus(enq._id, next);
                              }}
                              disabled={isUpdatingStatus}
                              className="transition-transform hover:scale-105 active:scale-95 cursor-pointer focus:outline-none"
                            >
                              {getStatusBadge(enq.status)}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <p className="text-xs font-bold">
                              Click to cycle status (New → Contacted → In Progress → Closed)
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>

                      {/* Priority (Interactive cycle on click) */}
                      <TableCell className="py-3">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              onClick={() => {
                                const cur = getSafeString(
                                  enq.priority,
                                  "medium"
                                ).toLowerCase();
                                const next =
                                  cur === "low"
                                    ? "medium"
                                    : cur === "medium"
                                    ? "high"
                                    : "low";
                                handleUpdatePriority(enq._id, next);
                              }}
                              disabled={isUpdatingPriority}
                              className="transition-transform hover:scale-105 active:scale-95 cursor-pointer focus:outline-none"
                            >
                              {getPriorityBadge(enq.priority)}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <p className="text-xs font-bold">
                              Click to cycle priority (Low → Medium → High)
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>

                      {/* Date */}
                      <TableCell className="py-3 text-xs text-slate-500 font-semibold whitespace-nowrap">
                        {enq.createdAt
                          ? new Date(enq.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "Recently"}
                      </TableCell>

                      {/* Action Button: View Lead Only */}
                      <TableCell className="py-3 pr-6 text-right">
                        <div className="flex items-center justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setViewingEnquiry(enq)}
                            className="h-8.5 px-3 rounded-xl bg-sky-50/80 hover:bg-sky-100 text-sky-800 hover:text-sky-950 border border-sky-200/90 font-bold text-xs shadow-2xs transition-all flex items-center gap-1.5"
                          >
                            <Eye className="h-3.5 w-3.5 text-sky-600" />
                            <span>View Details</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {/* ======================================================== */}
        {/* 1. VIEW ENQUIRY DETAILS MODAL */}
        {/* ======================================================== */}
        <Dialog
          open={Boolean(viewingEnquiry)}
          onOpenChange={(val) => !val && setViewingEnquiry(null)}
        >
          {viewingEnquiry && (
            <DialogContent className="max-w-lg rounded-3xl p-6 sm:p-7 bg-white border border-slate-200 shadow-xl">
              <DialogHeader>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200">
                    <Eye className="h-3.5 w-3.5 text-slate-600" />
                    Enquiry Details
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={() => {
                            const cur = getSafeString(
                              viewingEnquiry.status,
                              "new"
                            ).toLowerCase();
                            const next =
                              cur === "new"
                                ? "contacted"
                                : cur === "contacted"
                                ? "in_progress"
                                : cur === "in_progress"
                                ? "closed"
                                : "new";
                            handleUpdateStatus(viewingEnquiry._id, next);
                          }}
                          disabled={isUpdatingStatus}
                          className="transition-transform hover:scale-105 active:scale-95 cursor-pointer focus:outline-none"
                        >
                          {getStatusBadge(viewingEnquiry.status)}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p className="text-xs font-bold">
                          Click to cycle status
                        </p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={() => {
                            const cur = getSafeString(
                              viewingEnquiry.priority,
                              "medium"
                            ).toLowerCase();
                            const next =
                              cur === "low"
                                ? "medium"
                                : cur === "medium"
                                ? "high"
                                : "low";
                            handleUpdatePriority(viewingEnquiry._id, next);
                          }}
                          disabled={isUpdatingPriority}
                          className="transition-transform hover:scale-105 active:scale-95 cursor-pointer focus:outline-none"
                        >
                          {getPriorityBadge(viewingEnquiry.priority)}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p className="text-xs font-bold">
                          Click to cycle priority
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
                <DialogTitle className="font-heading font-black text-xl text-slate-950 mt-2">
                  {getSafeString(viewingEnquiry.name, "Customer Lead")}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 font-medium">
                  Received on{" "}
                  {viewingEnquiry.createdAt
                    ? new Date(viewingEnquiry.createdAt).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })
                    : "Recently"}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3.5 mt-2">
                {/* Contact Card with Action Buttons - Clean Even Style */}
                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Phone Number
                      </span>
                      <p className="font-extrabold text-slate-900 mt-0.5 text-xs sm:text-sm">
                        {getSafeString(viewingEnquiry.mobile || viewingEnquiry.phone, "N/A")}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Email Address
                      </span>
                      <p className="font-extrabold text-slate-900 truncate mt-0.5 text-xs sm:text-sm">
                        {getSafeString(viewingEnquiry.email, "N/A")}
                      </p>
                    </div>
                  </div>

                  {/* Direct Contact Buttons - Unified Even Design */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-200/70">
                    {(viewingEnquiry.mobile || viewingEnquiry.phone) && (
                      <>
                        <a
                          href={`tel:${viewingEnquiry.mobile || viewingEnquiry.phone}`}
                          className="flex-1"
                        >
                          <button
                            type="button"
                            className="w-full h-9 rounded-xl bg-white hover:bg-slate-100 text-slate-800 hover:text-slate-950 border border-slate-200 font-bold text-xs shadow-2xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Phone className="h-3.5 w-3.5 text-slate-600" />
                            <span>Call Now</span>
                          </button>
                        </a>
                        <a
                          href={`https://wa.me/91${String(
                            viewingEnquiry.mobile || viewingEnquiry.phone
                          ).replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1"
                        >
                          <button
                            type="button"
                            className="w-full h-9 rounded-xl bg-white hover:bg-slate-100 text-slate-800 hover:text-slate-950 border border-slate-200 font-bold text-xs shadow-2xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <MessageSquare className="h-3.5 w-3.5 text-slate-600" />
                            <span>WhatsApp</span>
                          </button>
                        </a>
                      </>
                    )}
                    {viewingEnquiry.email && (
                      <a
                        href={`mailto:${viewingEnquiry.email}`}
                        className="flex-1"
                      >
                        <button
                          type="button"
                          className="w-full h-9 rounded-xl bg-white hover:bg-slate-100 text-slate-800 hover:text-slate-950 border border-slate-200 font-bold text-xs shadow-2xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Mail className="h-3.5 w-3.5 text-slate-600" />
                          <span>Email</span>
                        </button>
                      </a>
                    )}
                  </div>
                </div>

                {/* Target Property Card - Clean Even Style */}
                {(viewingEnquiry.property ||
                  viewingEnquiry.property_id ||
                  viewingEnquiry.propertyName) && (
                  <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 text-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Target Property
                    </span>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <p className="font-black text-slate-900 text-sm">
                        {getSafeString(
                          viewingEnquiry.property?.name ||
                            viewingEnquiry.property_id?.name ||
                            viewingEnquiry.propertyName,
                          "Property"
                        )}
                      </p>
                      {viewingEnquiry.property?.price && (
                        <p className="text-xs font-black text-slate-900">
                          ₹ {Number(viewingEnquiry.property.price).toLocaleString("en-IN")}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Client Message - Clean Even Style */}
                {(viewingEnquiry.description || viewingEnquiry.message) && (
                  <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 text-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Customer Requirement / Remarks
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      "{getSafeString(viewingEnquiry.description || viewingEnquiry.message)}"
                    </p>
                  </div>
                )}

                {/* Quick Pipeline Status Update - Clean Even Style */}
                <div className="pt-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Quick Status Update
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {[
                      { id: "new", label: "New Lead" },
                      { id: "contacted", label: "Contacted" },
                      { id: "in_progress", label: "In Progress" },
                      { id: "closed", label: "Closed" },
                    ].map((st) => {
                      const isActive =
                        getSafeString(viewingEnquiry.status, "new").toLowerCase() ===
                        st.id;
                      return (
                        <button
                          key={st.id}
                          type="button"
                          disabled={isUpdatingStatus}
                          onClick={() =>
                            handleUpdateStatus(viewingEnquiry._id, st.id)
                          }
                          className={`rounded-xl text-[11px] font-bold h-9 border transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 select-none ${
                            isActive
                              ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-950"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isActive ? "bg-white" : "bg-slate-300"
                            }`}
                          />
                          <span>{st.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Quick Priority Update - Clean Even Style */}
                <div className="pt-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Lead Priority
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "low", label: "Low Priority" },
                      { id: "medium", label: "Medium Priority" },
                      { id: "high", label: "High Priority" },
                    ].map((pr) => {
                      const isActive =
                        getSafeString(
                          viewingEnquiry.priority,
                          "medium"
                        ).toLowerCase() === pr.id;
                      return (
                        <button
                          key={pr.id}
                          type="button"
                          disabled={isUpdatingPriority}
                          onClick={() =>
                            handleUpdatePriority(viewingEnquiry._id, pr.id)
                          }
                          className={`rounded-xl text-xs font-bold h-9 border transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 select-none ${
                            isActive
                              ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-950"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isActive ? "bg-white" : "bg-slate-300"
                            }`}
                          />
                          <span>{pr.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Dialog Footer Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const toEdit = viewingEnquiry;
                      setViewingEnquiry(null);
                      handleOpenEdit(toEdit);
                    }}
                    className="flex-1 rounded-2xl font-bold border-slate-200 text-slate-800 hover:bg-slate-100 hover:text-slate-950 h-10 text-xs"
                  >
                    <Edit2 className="h-3.5 w-3.5 mr-1.5 text-slate-600" />
                    Edit Full Lead
                  </Button>
                  <Button
                    onClick={() => setViewingEnquiry(null)}
                    className="flex-1 rounded-2xl font-black bg-slate-900 hover:bg-slate-800 text-white h-10 text-xs shadow-xs"
                  >
                    Done
                  </Button>
                </div>
              </div>
            </DialogContent>
          )}
        </Dialog>

        {/* ======================================================== */}
        {/* 2. EDIT ENQUIRY MODAL */}
        {/* ======================================================== */}
        <Dialog
          open={Boolean(editingEnquiry)}
          onOpenChange={(val) => !val && setEditingEnquiry(null)}
        >
          {editingEnquiry && (
            <DialogContent className="max-w-md rounded-3xl p-6 bg-white border border-slate-100 shadow-xl">
              <DialogHeader>
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-100 self-start">
                  <Edit2 className="h-3.5 w-3.5 text-amber-600" />
                  Edit Enquiry
                </div>
                <DialogTitle className="font-heading font-black text-xl text-slate-950 mt-2">
                  Update Lead for {getSafeString(editingEnquiry.name, "Customer")}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 font-medium">
                  Update pipeline stage, lead priority, contact details, and agent notes.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-2">
                {/* Client Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Customer Name
                  </label>
                  <Input
                    placeholder="Enter customer name..."
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="h-10 rounded-2xl border-slate-200 text-xs font-medium focus-visible:ring-primary/20"
                  />
                </div>

                {/* Phone & Email Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Mobile Number
                    </label>
                    <Input
                      placeholder="9876543210"
                      value={editMobile}
                      maxLength={10}
                      onChange={(e) => setEditMobile(e.target.value.replace(/\D/g, ""))}
                      className="h-10 rounded-2xl border-slate-200 text-xs font-medium focus-visible:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      placeholder="client@example.com"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="h-10 rounded-2xl border-slate-200 text-xs font-medium focus-visible:ring-primary/20"
                    />
                  </div>
                </div>

                {/* Pipeline Status */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Pipeline Status
                  </label>
                  <Select value={editStatus} onValueChange={setEditStatus}>
                    <SelectTrigger className="h-10 rounded-2xl border-slate-200 text-xs font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      <SelectItem value="new" className="text-xs font-bold">
                        New Lead
                      </SelectItem>
                      <SelectItem value="contacted" className="text-xs font-bold">
                        Contacted
                      </SelectItem>
                      <SelectItem value="in_progress" className="text-xs font-bold">
                        In Progress
                      </SelectItem>
                      <SelectItem value="closed" className="text-xs font-bold">
                        Closed / Won
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Priority */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Lead Priority
                  </label>
                  <Select value={editPriority} onValueChange={setEditPriority}>
                    <SelectTrigger className="h-10 rounded-2xl border-slate-200 text-xs font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      <SelectItem value="low" className="text-xs font-bold">
                        Low Priority
                      </SelectItem>
                      <SelectItem value="medium" className="text-xs font-bold">
                        Medium Priority
                      </SelectItem>
                      <SelectItem value="high" className="text-xs font-bold">
                        High Priority 🔥
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Notes / Remarks Textarea */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Agent Follow-up Notes & Preferences
                  </label>
                  <Textarea
                    placeholder="Enter discussion remarks, client budget preference, site visit schedule..."
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    className="min-h-[100px] rounded-2xl border-slate-200 text-xs font-medium focus-visible:ring-primary/20"
                  />
                </div>
              </div>

              <DialogFooter className="mt-4 gap-2 sm:gap-0">
                <Button
                  variant="outline"
                  onClick={() => setEditingEnquiry(null)}
                  disabled={isSubmittingEdit}
                  className="rounded-2xl border-slate-200 font-bold text-xs h-10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveEdit}
                  disabled={isSubmittingEdit}
                  className="rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-xs h-10 px-5 shadow-xs"
                >
                  {isSubmittingEdit ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5 mr-1.5" />
                      Save Changes
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          )}
        </Dialog>

        {/* ======================================================== */}
        {/* 3. DELETE CONFIRMATION MODAL */}
        {/* ======================================================== */}
        <Dialog
          open={Boolean(deletingEnquiry)}
          onOpenChange={(val) => !val && setDeletingEnquiry(null)}
        >
          {deletingEnquiry && (
            <DialogContent className="max-w-md rounded-3xl p-6 bg-white border border-slate-100 shadow-xl">
              <DialogHeader>
                <div className="h-12 w-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mb-2">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <DialogTitle className="font-heading font-black text-xl text-slate-950">
                  Delete Client Enquiry?
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 font-medium">
                  Are you sure you want to remove the enquiry from{" "}
                  <strong className="text-slate-900">
                    "{getSafeString(deletingEnquiry.name, "Customer")}"
                  </strong>
                  ? This action will remove the lead from your CRM pipeline.
                </DialogDescription>
              </DialogHeader>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-1 mt-2">
                <p>
                  <strong>Property:</strong>{" "}
                  {getSafeString(
                    deletingEnquiry.property?.name ||
                      deletingEnquiry.property_id?.name ||
                      deletingEnquiry.propertyName,
                    "General Enquiry"
                  )}
                </p>
                <p>
                  <strong>Phone:</strong> {getSafeString(deletingEnquiry.mobile || deletingEnquiry.phone, "N/A")}
                </p>
              </div>

              <DialogFooter className="mt-4 gap-2 sm:gap-0">
                <Button
                  variant="outline"
                  onClick={() => setDeletingEnquiry(null)}
                  disabled={isDeleting}
                  className="rounded-2xl border-slate-200 font-bold text-xs h-10"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs h-10 px-5 shadow-xs"
                >
                  {isDeleting ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                      Delete Lead
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          )}
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
