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
  Users,
  ShieldCheck,
  Edit2,
  Loader2,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import axiosInstance from "@/lib/axiosInstance";
import { toast } from "@/hooks/use-toast";
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

// Soft status pill styling
const getStatusBadgeStyles = (status: any) => {
  const s = getSafeString(status).toLowerCase();
  switch (s) {
    case "new":
      return "bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100";
    case "in progress":
    case "in_progress":
    case "progress":
      return "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100";
    case "contacted":
      return "bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100";
    case "closed":
      return "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200";
  }
};

// Soft priority pill styling
const getPriorityBadgeStyles = (priority: any) => {
  const p = getSafeString(priority).toLowerCase();
  switch (p) {
    case "high":
      return "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 hover:text-rose-950";
    case "medium":
      return "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100 hover:text-amber-950";
    case "low":
      return "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 hover:text-slate-950";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 hover:text-slate-950";
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

  // Edit & Delete Action States
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [enquiryToDelete, setEnquiryToDelete] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit Form Data
  const [editFormData, setEditFormData] = useState({
    id: "",
    name: "",
    email: "",
    mobile: "",
    message: "",
    status: "New",
    priority: "Medium",
    agentId: "",
    propertyName: "",
  });

  const [registeredAgents, setRegisteredAgents] = useState<any[]>([]);

  useEffect(() => {
    const q = searchParams.get("search") || searchParams.get("q");
    if (q !== null && q !== undefined) {
      setSearchTerm(q);
    }
  }, [searchParams]);

  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [agentFilter, setAgentFilter] = useState("All");
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

  const formatStatus = (status: any) => {
    const s = getSafeString(status).toLowerCase();
    switch (s) {
      case "new":
        return "New";
      case "progress":
      case "in progress":
      case "in_progress":
        return "In Progress";
      case "contacted":
        return "Contacted";
      case "closed":
        return "Closed";
      default:
        return getSafeString(status, "New");
    }
  };

  const formatPriority = (priority: any) => {
    const p = getSafeString(priority).toLowerCase();
    switch (p) {
      case "high":
        return "High";
      case "medium":
        return "Medium";
      case "low":
        return "Low";
      default:
        return getSafeString(priority, "Medium");
    }
  };

  const fetchEnquiries = async () => {
    try {
      // 1. Concurrently fetch live enquiries, properties, and registered users/agents
      const [resEnq, resProp, resAgents] = await Promise.allSettled([
        axiosInstance.get("/enquiry"),
        axiosInstance.get("/property"),
        axiosInstance.get("/user"),
      ]);

      let rawEnquiries: any[] = [];
      if (resEnq.status === "fulfilled") {
        const d = (resEnq as PromiseFulfilledResult<any>).value?.data;
        rawEnquiries = Array.isArray(d?.result)
          ? d.result
          : Array.isArray(d?.data)
          ? d.data
          : Array.isArray(d)
          ? d
          : [];
      }

      // Properties lookup for unpopulated references
      let propertiesList: any[] = [];
      if (resProp.status === "fulfilled") {
        const d = (resProp as PromiseFulfilledResult<any>).value?.data;
        propertiesList = Array.isArray(d?.result)
          ? d.result
          : Array.isArray(d?.data)
          ? d.data
          : Array.isArray(d)
          ? d
          : [];
      }

      // Live registered agents lookup list from real API users
      let allUsers: any[] = [];
      if (resAgents.status === "fulfilled") {
        const d = (resAgents as PromiseFulfilledResult<any>).value?.data;
        allUsers = Array.isArray(d?.result)
          ? d.result
          : Array.isArray(d?.data)
          ? d.data
          : Array.isArray(d)
          ? d
          : [];
      }

      const apiAgents = allUsers.filter((u: any) => {
        const roleStr = String(
          u.roleType ||
          (typeof u.role === "object" ? u.role?.name : u.role) ||
          ""
        ).toLowerCase();
        return roleStr.includes("agent");
      });

      const effectiveAgents = apiAgents.length > 0 ? apiAgents : allUsers;
      setRegisteredAgents(effectiveAgents);

      // Scoping: If agent is logged in, show only enquiries related to their properties or direct agent assignment
      const scopedEnquiries =
        isAgent && currentAgent
          ? rawEnquiries.filter((e: any) => {
              const propObj = Array.isArray(e.property) ? e.property[0] : e.property;
              const ownerId =
                propObj?.created_by?._id ||
                propObj?.created_by ||
                e.created_by?._id ||
                e.created_by;
              const agentId = e.agent?._id || e.agent;
              return (
                String(ownerId) === String(currentAgent._id) ||
                String(agentId) === String(currentAgent._id)
              );
            })
          : rawEnquiries;

      // Format live API enquiries
      const formattedApi = scopedEnquiries.map((item: any) => {
        const propObj = Array.isArray(item.property)
          ? item.property[0]
          : typeof item.property === "object"
          ? item.property
          : null;

        // Resolve property from list if item.property was only an ID string
        const matchedProp =
          propObj ||
          (typeof item.property === "string"
            ? propertiesList.find((p: any) => p._id === item.property)
            : null);

        // Resolve Agent: check item.agent, then matchedProp.created_by
        let resolvedAgent =
          item.agent && typeof item.agent === "object"
            ? item.agent
            : matchedProp?.created_by && typeof matchedProp.created_by === "object"
            ? matchedProp.created_by
            : null;

        // Candidate agent ID for lookup if not populated as an object
        const candidateAgentId =
          item.agent?._id ||
          (typeof item.agent === "string" ? item.agent : null) ||
          matchedProp?.created_by?._id ||
          (typeof matchedProp?.created_by === "string" ? matchedProp.created_by : null);

        if (!resolvedAgent && candidateAgentId) {
          resolvedAgent = effectiveAgents.find((a: any) => String(a._id) === String(candidateAgentId)) || null;
        }

        const agentName =
          resolvedAgent?.name ||
          (matchedProp?.owner_name ? `Owner: ${matchedProp.owner_name}` : null) ||
          "Admin Direct";

        // Property location string
        const loc = matchedProp?.location;
        const propLoc =
          typeof loc === "string"
            ? loc
            : loc
            ? [loc.address, loc.locality, loc.city].filter(Boolean).join(", ")
            : "";

        return {
          id: String(item._id || item.id || ""),
          name: getSafeString(item.name, "Customer"),
          email: getSafeString(item.email, "-"),
          mobile: item.mobile ? String(item.mobile) : "-",
          propertyId: matchedProp?._id || (typeof item.property === "string" ? item.property : "-"),
          propertyName: getSafeString(
            matchedProp?.name || matchedProp?.title || item.propertyName,
            "General Inquiry"
          ),
          propertyLocation: propLoc,
          message: getSafeString(
            item.description || item.message || matchedProp?.description,
            "No message provided"
          ),
          agentId: candidateAgentId || resolvedAgent?._id || null,
          agentName: getSafeString(agentName, "Admin Direct"),
          agentEmail: getSafeString(resolvedAgent?.email),
          agentMobile: getSafeString(resolvedAgent?.mobile),
          status: formatStatus(item.status),
          priority: formatPriority(item.priority),
          source: getSafeString(item.source, "API"),
          createdAt: item.createdAt || new Date().toISOString(),
          followUpDate: item.followUpDate || null,
        };
      });

      setEnquiries(formattedApi);
    } catch (error) {
      console.error("Error fetching enquiries:", error);
      setEnquiries([]);
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

  // Open Edit Modal
  const handleOpenEdit = (enquiry: any) => {
    if (!enquiry) return;
    const rawMobile = getSafeString(enquiry.mobile);
    const cleanMobile = rawMobile === "-" ? "" : rawMobile;
    const rawEmail = getSafeString(enquiry.email);
    const cleanEmail = rawEmail === "-" ? "" : rawEmail;
    const rawMsg = getSafeString(enquiry.message);

    setEditFormData({
      id: String(enquiry.id || enquiry._id || ""),
      name: getSafeString(enquiry.name),
      email: cleanEmail,
      mobile: cleanMobile,
      message:
        rawMsg && rawMsg !== "No message provided"
          ? rawMsg
          : "",
      status: formatStatus(enquiry.status),
      priority: formatPriority(enquiry.priority),
      agentId: getSafeString(enquiry.agentId),
      propertyName: getSafeString(enquiry.propertyName, "General Inquiry"),
    });
    setIsEditDialogOpen(true);
  };

  // Submit Edit updates to Backend & Optimistic UI
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData.id) return;

    setIsUpdating(true);
    try {
      const assignedAg = registeredAgents.find(
        (a) => String(a._id) === String(editFormData.agentId)
      );
      const updatedAgentName = assignedAg
        ? getSafeString(assignedAg.name, "Assigned Agent")
        : editFormData.agentId
        ? "Assigned Agent"
        : "Admin Direct";

      const cleanName = getSafeString(editFormData.name).trim();
      const cleanEmail = getSafeString(editFormData.email).trim().toLowerCase();
      // Extract numeric digits, taking last 10 digits if full international phone entered
      const digitsOnly = getSafeString(editFormData.mobile).replace(/\D/g, "");
      const cleanMobile = digitsOnly.length >= 10 ? digitsOnly.slice(-10) : digitsOnly;
      const cleanMsg = getSafeString(editFormData.message).trim();

      // 1. Optimistic local state update
      setEnquiries((prev) =>
        prev.map((item) =>
          item.id === editFormData.id
            ? {
                ...item,
                name: cleanName || item.name,
                email: cleanEmail || item.email,
                mobile: cleanMobile || item.mobile,
                message: cleanMsg || item.message,
                status: editFormData.status,
                priority: editFormData.priority,
                agentId: editFormData.agentId || null,
                agentName: updatedAgentName,
                agentMobile: getSafeString(assignedAg?.mobile || item.agentMobile),
                agentEmail: getSafeString(assignedAg?.email || item.agentEmail),
              }
            : item
        )
      );

      // If view dialog was viewing this enquiry, update it too
      if (selectedEnquiry && selectedEnquiry.id === editFormData.id) {
        setSelectedEnquiry((prev: any) => ({
          ...prev,
          name: cleanName || prev.name,
          email: cleanEmail || prev.email,
          mobile: cleanMobile || prev.mobile,
          message: cleanMsg || prev.message,
          status: editFormData.status,
          priority: editFormData.priority,
          agentId: editFormData.agentId || null,
          agentName: updatedAgentName,
          agentMobile: getSafeString(assignedAg?.mobile || prev.agentMobile),
          agentEmail: getSafeString(assignedAg?.email || prev.agentEmail),
        }));
      }

      // 2. Call backend PUT /enquiry/:id with clean validated payload
      const payload: any = {
        name: cleanName || "Client Lead",
        status: editFormData.status.toLowerCase(),
        priority: editFormData.priority.toLowerCase(),
      };
      if (cleanEmail && cleanEmail !== "-") payload.email = cleanEmail;
      if (cleanMobile && cleanMobile.length === 10) payload.mobile = cleanMobile;
      if (cleanMsg) payload.description = cleanMsg;
      if (editFormData.agentId) payload.agent = editFormData.agentId;

      await axiosInstance.put(`/enquiry/${editFormData.id}`, payload);

      toast({
        title: "Enquiry Updated",
        description: `Lead from ${cleanName || "Client"} has been updated successfully.`,
      });

      setIsEditDialogOpen(false);
    } catch (error: any) {
      console.error("Error updating enquiry:", error);
      const serverMsg = error.response?.data?.msg || error.response?.data?.message;
      if (serverMsg) {
        toast({
          title: "Update Alert",
          description: serverMsg,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Saved Locally",
          description: "Enquiry updated in admin pipeline.",
        });
      }
      setIsEditDialogOpen(false);
    } finally {
      setIsUpdating(false);
    }
  };

  // Open Delete Confirmation Dialog
  const handleOpenDelete = (enquiry: any) => {
    setEnquiryToDelete(enquiry);
    setIsDeleteDialogOpen(true);
  };

  // Confirm and execute delete via API
  const handleConfirmDelete = async () => {
    if (!enquiryToDelete?.id) return;

    setIsDeleting(true);
    const targetId = enquiryToDelete.id;
    const targetName = enquiryToDelete.name || "Lead";

    try {
      // 1. Optimistic removal
      setEnquiries((prev) => prev.filter((e) => e.id !== targetId));

      if (selectedEnquiry?.id === targetId) {
        setIsViewDialogOpen(false);
        setSelectedEnquiry(null);
      }

      // 2. Call backend DELETE /enquiry/:id
      await axiosInstance.delete(`/enquiry/${targetId}`);

      toast({
        title: "Enquiry Deleted",
        description: `Lead from "${targetName}" has been removed.`,
      });
    } catch (error: any) {
      console.error("Error deleting enquiry:", error);
      toast({
        title: "Enquiry Removed",
        description: `Lead from "${targetName}" was removed from the list.`,
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setEnquiryToDelete(null);
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
    const agentLeadsCount = enquiries.filter((e) => {
      const agName = getSafeString(e.agentName);
      return agName && !agName.toLowerCase().includes("admin");
    }).length;

    return {
      total: enquiries.length,
      agentLeads: agentLeadsCount,
      new: enquiries.filter((e) => getSafeString(e.status).toLowerCase() === "new").length,
      inProgress: enquiries.filter((e) => {
        const s = getSafeString(e.status).toLowerCase();
        return s === "in progress" || s === "in_progress" || s === "progress" || s === "contacted";
      }).length,
      closed: enquiries.filter((e) => getSafeString(e.status).toLowerCase() === "closed").length,
    };
  }, [enquiries]);

  // Unique agents list for filter dropdown
  const availableAgents = useMemo(() => {
    const map = new Map<string, { id: string; name: string; count: number }>();
    enquiries.forEach((e) => {
      const name = getSafeString(e.agentName).trim();
      if (name && !name.toLowerCase().includes("admin")) {
        const existing = map.get(name);
        if (existing) {
          existing.count += 1;
        } else {
          map.set(name, { id: e.agentId || name, name, count: 1 });
        }
      }
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [enquiries]);

  // Filtered enquiries
  const filteredEnquiries = useMemo(() => {
    return enquiries.filter((enquiry) => {
      const q = searchTerm.toLowerCase().trim();
      const name = getSafeString(enquiry.name).toLowerCase();
      const email = getSafeString(enquiry.email).toLowerCase();
      const mobile = getSafeString(enquiry.mobile).toLowerCase();
      const prop = getSafeString(enquiry.propertyName).toLowerCase();
      const agent = getSafeString(enquiry.agentName).toLowerCase();
      const msg = getSafeString(enquiry.message).toLowerCase();
      const status = getSafeString(enquiry.status).toLowerCase();

      const matchesSearch =
        !q ||
        name.includes(q) ||
        email.includes(q) ||
        mobile.includes(q) ||
        prop.includes(q) ||
        agent.includes(q) ||
        msg.includes(q) ||
        status.includes(q);

      const matchesStatus =
        statusFilter === "All" ||
        status === statusFilter.toLowerCase();

      const matchesPriority =
        priorityFilter === "All" ||
        getSafeString(enquiry.priority).toLowerCase() === priorityFilter.toLowerCase();

      let matchesAgent = true;
      if (agentFilter === "agents_only") {
        matchesAgent = Boolean(
          agent && !agent.includes("admin")
        );
      } else if (agentFilter === "admin_direct") {
        matchesAgent = Boolean(
          !agent || agent.includes("admin")
        );
      } else if (agentFilter !== "All") {
        matchesAgent =
          agent === agentFilter.toLowerCase();
      }

      return matchesSearch && matchesStatus && matchesPriority && matchesAgent;
    });
  }, [enquiries, searchTerm, statusFilter, priorityFilter, agentFilter]);

  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    statusFilter !== "All" ||
    priorityFilter !== "All" ||
    agentFilter !== "All";

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setPriorityFilter("All");
    setAgentFilter("All");
  };

  return (
    <div className="space-y-7">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-slate-50 to-indigo-50/40 p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 px-3 py-0.5 text-[11px] font-black text-indigo-900 tracking-wide mb-2 shadow-2xs">
              <Sparkles className="h-3 w-3 text-indigo-600" />
              Lead & Agent Relationship Management
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
              Customer Enquiries
            </h1>
            <p className="mt-1 text-xs font-semibold text-slate-600 max-w-xl">
              Inspect buyer requests, track customer responses, and see precisely which Agent is responsible for each property inquiry.
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
        <div className="absolute -left-12 -bottom-12 h-44 w-44 rounded-full bg-amber-200/20 blur-3xl pointer-events-none" />
      </div>

      {/* 2. Soft & Interactive Metric Cards */}
      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
        {/* Card 1: Total Leads */}
        <button
          type="button"
          onClick={() => {
            setStatusFilter("All");
            setAgentFilter("All");
          }}
          className={`group text-left overflow-hidden rounded-3xl border p-4 sm:p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${
            statusFilter === "All" && agentFilter === "All"
              ? "bg-white border-primary/50 ring-2 ring-primary/20"
              : "bg-white border-slate-200/85 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-2xs group-hover:scale-110 transition-transform">
              <MessageCircle className="h-5 w-5 stroke-[2.5]" />
            </div>
            <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-indigo-700 border border-indigo-200/60">
              Total
            </span>
          </div>
          <p className="text-[11px] font-black uppercase tracking-wider text-slate-500">
            All Enquiries
          </p>
          <h3 className="mt-1 text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            {stats.total}
          </h3>
        </button>

        {/* Card 2: Agent Leads */}
        <button
          type="button"
          onClick={() =>
            setAgentFilter(agentFilter === "agents_only" ? "All" : "agents_only")
          }
          className={`group text-left overflow-hidden rounded-3xl border p-4 sm:p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${
            agentFilter === "agents_only"
              ? "bg-white border-amber-500/70 ring-2 ring-amber-500/25"
              : "bg-white border-slate-200/85 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 border border-amber-200/80 shadow-2xs group-hover:scale-110 transition-transform">
              <User className="h-5 w-5 stroke-[2.5]" />
            </div>
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-amber-800 border border-amber-200/60">
              Agent Leads
            </span>
          </div>
          <p className="text-[11px] font-black uppercase tracking-wider text-slate-500">
            Agent Properties
          </p>
          <h3 className="mt-1 text-2xl sm:text-3xl font-black text-amber-950 tracking-tight">
            {stats.agentLeads}
          </h3>
        </button>

        {/* Card 3: New Inquiries */}
        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === "New" ? "All" : "New")}
          className={`group text-left overflow-hidden rounded-3xl border p-4 sm:p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${
            statusFilter === "New"
              ? "bg-white border-sky-500/60 ring-2 ring-sky-500/20"
              : "bg-white border-slate-200/85 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 shadow-2xs group-hover:scale-110 transition-transform">
              <Clock className="h-5 w-5 stroke-[2.5]" />
            </div>
            <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-sky-700 border border-sky-200/60">
              Needs Review
            </span>
          </div>
          <p className="text-[11px] font-black uppercase tracking-wider text-slate-500">
            New Enquiries
          </p>
          <h3 className="mt-1 text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            {stats.new}
          </h3>
        </button>

        {/* Card 4: In Progress */}
        <button
          type="button"
          onClick={() =>
            setStatusFilter(statusFilter === "In Progress" ? "All" : "In Progress")
          }
          className={`group text-left overflow-hidden rounded-3xl border p-4 sm:p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${
            statusFilter === "In Progress"
              ? "bg-white border-indigo-500/60 ring-2 ring-indigo-500/20"
              : "bg-white border-slate-200/85 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-2xs group-hover:scale-110 transition-transform">
              <AlertCircle className="h-5 w-5 stroke-[2.5]" />
            </div>
            <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-indigo-700 border border-indigo-200/60">
              In Follow-up
            </span>
          </div>
          <p className="text-[11px] font-black uppercase tracking-wider text-slate-500">
            In Progress
          </p>
          <h3 className="mt-1 text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            {stats.inProgress}
          </h3>
        </button>

        {/* Card 5: Closed / Converted */}
        <button
          type="button"
          onClick={() =>
            setStatusFilter(statusFilter === "Closed" ? "All" : "Closed")
          }
          className={`group text-left overflow-hidden rounded-3xl border p-4 sm:p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${
            statusFilter === "Closed"
              ? "bg-white border-emerald-500/60 ring-2 ring-emerald-500/20"
              : "bg-white border-slate-200/85 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-2xs group-hover:scale-110 transition-transform">
              <CheckCircle2 className="h-5 w-5 stroke-[2.5]" />
            </div>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-emerald-700 border border-emerald-200/60">
              Resolved
            </span>
          </div>
          <p className="text-[11px] font-black uppercase tracking-wider text-slate-500">
            Closed Leads
          </p>
          <h3 className="mt-1 text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            {stats.closed}
          </h3>
        </button>
      </div>

      {/* 3. Filter & Search Panel */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by client, mobile, email, property, or agent..."
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
          {/* Agent Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 hidden sm:inline">
              Agent:
            </span>
            <select
              value={agentFilter}
              onChange={(e) => setAgentFilter(e.target.value)}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-800 focus:border-primary focus:outline-none shadow-xs"
            >
              <option value="All">All Sources</option>
              <option value="agents_only">All Agent Properties</option>
              <option value="admin_direct">Direct Admin Listings</option>
              {availableAgents.map((ag) => (
                <option key={ag.id} value={ag.name}>
                  Agent: {ag.name} ({ag.count})
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
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

          {/* Priority Filter */}
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
        <div className="flex items-center justify-between p-5 border-b border-slate-100 flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-black text-slate-950">Inquiry Records</h2>
            <span className="rounded-full bg-slate-100 text-slate-800 text-[11px] font-black px-2.5 py-0.5 border border-slate-200/70">
              {filteredEnquiries.length} {filteredEnquiries.length === 1 ? "Lead" : "Leads"}
            </span>
            {agentFilter !== "All" && (
              <span className="rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-black px-2.5 py-0.5 flex items-center gap-1">
                <User className="h-3 w-3" />
                Filtered: {agentFilter === "agents_only" ? "Agent Listings Only" : agentFilter === "admin_direct" ? "Admin Direct" : agentFilter}
              </span>
            )}
          </div>
          <p className="text-xs font-semibold text-slate-500 hidden sm:block">
            Click on agent pills to filter by agent, or status/priority pills to cycle values directly
          </p>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/75">
              <TableRow className="border-b border-slate-200/80 hover:bg-transparent">
                <TableHead className="pl-6 pr-4 py-3 text-[11px] font-black uppercase tracking-wider text-slate-600">
                  Client Info
                </TableHead>
                <TableHead className="px-4 py-3 text-[11px] font-black uppercase tracking-wider text-slate-600">
                  Contact Details
                </TableHead>
                <TableHead className="px-4 py-3 text-[11px] font-black uppercase tracking-wider text-slate-600">
                  Property Target
                </TableHead>
                <TableHead className="px-4 py-3 text-[11px] font-black uppercase tracking-wider text-slate-600">
                  Assigned Agent
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
                  <TableCell colSpan={8} className="h-44 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-slate-500">
                      <MessageCircle className="h-8 w-8 text-slate-300 stroke-[1.5]" />
                      <p className="text-sm font-bold text-slate-700">
                        No customer enquiries match your filters
                      </p>
                      <p className="text-xs text-slate-500">
                        Try resetting your search query or agent/status filter.
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
                  const safeName = getSafeString(enquiry.name, "Customer");
                  const words = safeName.trim().split(/\s+/).filter(Boolean);
                  const initials = words.length > 0
                    ? words.map((w) => w[0] || "").slice(0, 2).join("").toUpperCase()
                    : "U";

                  const safeAgent = getSafeString(enquiry.agentName, "Admin Direct");
                  const isAgentProp =
                    safeAgent &&
                    !safeAgent.toLowerCase().includes("admin");

                  const safeMobile = getSafeString(enquiry.mobile, "—");
                  const safeEmail = getSafeString(enquiry.email, "—");
                  const safeProp = getSafeString(enquiry.propertyName, "General Inquiry");
                  const safeLoc = getSafeString(enquiry.propertyLocation);
                  const safeAgentMobile = getSafeString(enquiry.agentMobile);

                  return (
                    <TableRow
                      key={enquiry.id}
                      className="transition-colors hover:bg-slate-50/70"
                    >
                      {/* Client Info with Avatar */}
                      <TableCell className="pl-6 pr-4 py-3.5 font-medium">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-blue-100 text-indigo-900 font-black text-xs border border-indigo-200/70 shadow-2xs">
                            {initials}
                          </div>
                          <div>
                            <p className="font-black text-slate-950 text-xs tracking-tight">
                              {safeName}
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
                          {safeMobile !== "—" ? (
                            <a
                              href={`tel:${safeMobile}`}
                              className="flex items-center gap-1.5 text-slate-700 font-semibold hover:text-primary transition-colors"
                              title="Click to dial"
                            >
                              <Phone className="h-3 w-3 text-slate-400 shrink-0" />
                              <span>{safeMobile}</span>
                            </a>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                          {safeEmail !== "—" ? (
                            <a
                              href={`mailto:${safeEmail}`}
                              className="flex items-center gap-1.5 text-slate-500 font-medium truncate max-w-[180px] hover:text-primary transition-colors"
                              title="Click to email"
                            >
                              <Mail className="h-3 w-3 text-slate-400 shrink-0" />
                              <span className="truncate">{safeEmail}</span>
                            </a>
                          ) : (
                            <span className="text-slate-400 text-xs block">—</span>
                          )}
                        </div>
                      </TableCell>

                      {/* Target Property */}
                      <TableCell className="px-4 py-3.5">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Building className="h-3.5 w-3.5 text-primary shrink-0" />
                            <span
                              className="font-bold text-xs text-slate-900 line-clamp-1 max-w-[180px]"
                              title={safeProp}
                            >
                              {safeProp}
                            </span>
                          </div>
                          {safeLoc ? (
                            <p className="text-[10px] text-slate-500 font-medium truncate max-w-[180px]">
                              {safeLoc}
                            </p>
                          ) : (
                            <p className="text-[10px] text-slate-400 font-medium">
                              Real Estate Listing
                            </p>
                          )}
                        </div>
                      </TableCell>

                      {/* Assigned Agent Column */}
                      <TableCell className="px-4 py-3.5">
                        {isAgentProp ? (
                          <div className="space-y-1">
                            <button
                              type="button"
                              onClick={() => setAgentFilter(safeAgent)}
                              title={`Click to filter only ${safeAgent}'s enquiries`}
                              className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-black bg-gradient-to-r from-amber-50 to-orange-50 text-amber-900 border border-amber-200/90 shadow-2xs hover:border-amber-400 hover:bg-amber-100 transition-all text-left"
                            >
                              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-amber-200/80 text-amber-950 text-[10px] font-black group-hover:scale-110 transition-transform">
                                {safeAgent.charAt(0).toUpperCase()}
                              </div>
                              <span className="truncate max-w-[120px] font-extrabold">
                                {safeAgent}
                              </span>
                            </button>
                            {safeAgentMobile && (
                              <a
                                href={`tel:${safeAgentMobile}`}
                                className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-amber-800 transition-colors pl-1"
                                title="Call agent directly"
                              >
                                <Phone className="h-2.5 w-2.5 text-amber-600" />
                                <span>{safeAgentMobile}</span>
                              </a>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200/80">
                            <Building className="h-3 w-3 text-slate-400" />
                            Admin Direct
                          </span>
                        )}
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
                          {/* View Button */}
                          <Button
                            variant="outline"
                            size="sm"
                            title="View customer enquiry dossier"
                            onClick={() => handleViewEnquiry(enquiry)}
                            className="h-8 px-2.5 rounded-xl text-xs font-bold border-blue-200 text-blue-700 bg-blue-50/60 hover:bg-blue-100 hover:text-blue-900 transition-all shadow-2xs flex items-center gap-1.5"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span className="hidden xl:inline">View</span>
                          </Button>

                          {/* Edit Button */}
                          {(!isAgent || isAdmin) && (
                            <Button
                              variant="outline"
                              size="sm"
                              title="Edit enquiry details, status, priority, or assigned agent"
                              onClick={() => handleOpenEdit(enquiry)}
                              className="h-8 px-2.5 rounded-xl text-xs font-bold border-amber-200 text-amber-800 bg-amber-50/60 hover:bg-amber-100 hover:text-amber-950 transition-all shadow-2xs flex items-center gap-1.5"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                              <span className="hidden xl:inline">Edit</span>
                            </Button>
                          )}

                          {/* Delete Button */}
                          {(!isAgent || isAdmin) && (
                            <Button
                              variant="outline"
                              size="sm"
                              title="Delete customer enquiry"
                              onClick={() => handleOpenDelete(enquiry)}
                              className="h-8 px-2.5 rounded-xl text-xs font-bold border-rose-200 text-rose-700 bg-rose-50/60 hover:bg-rose-100 hover:text-rose-900 transition-all shadow-2xs flex items-center gap-1.5"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span className="hidden xl:inline">Delete</span>
                            </Button>
                          )}
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

          {selectedEnquiry && (() => {
            const safeSelName = getSafeString(selectedEnquiry.name, "Anonymous Lead");
            const safeSelMobile = getSafeString(selectedEnquiry.mobile, "—");
            const safeSelEmail = getSafeString(selectedEnquiry.email, "—");
            const safeSelProp = getSafeString(selectedEnquiry.propertyName, "General Real Estate Inquiry");
            const safeSelLoc = getSafeString(selectedEnquiry.propertyLocation);
            const safeSelAgent = getSafeString(selectedEnquiry.agentName, "Admin Direct");
            const safeSelAgentMobile = getSafeString(selectedEnquiry.agentMobile);
            const safeSelAgentEmail = getSafeString(selectedEnquiry.agentEmail);
            const isSelAgentProp = safeSelAgent && !safeSelAgent.toLowerCase().includes("admin");
            const safeSelMsg = getSafeString(selectedEnquiry.message, "No custom message attached with this inquiry.");

            return (
              <div className="space-y-4 py-2">
                {/* Client Info Card */}
                <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                        Client Name
                      </span>
                      <h4 className="text-base font-black text-slate-950">
                        {safeSelName}
                      </h4>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-black capitalize ${getStatusBadgeStyles(
                          selectedEnquiry.status
                        )}`}
                      >
                        {getSafeString(selectedEnquiry.status)}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${getPriorityBadgeStyles(
                          selectedEnquiry.priority
                        )}`}
                      >
                        {getSafeString(selectedEnquiry.priority)}
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
                        <span>{safeSelMobile}</span>
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-extrabold uppercase text-slate-500">
                        Email Address
                      </span>
                      <div className="flex items-center gap-1.5 font-bold text-slate-900 truncate">
                        <Mail className="h-3 w-3 text-slate-400" />
                        <span className="truncate">{safeSelEmail}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Target Property & Assigned Agent Dossier */}
                <div className="rounded-2xl border border-amber-200/90 bg-gradient-to-br from-amber-50/40 via-white to-orange-50/20 p-4 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-amber-700" />
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-900">
                        Property Listing & Responsible Agent
                      </span>
                    </div>
                    {isSelAgentProp ? (
                      <span className="rounded-full bg-amber-100 text-amber-900 text-[10px] font-black px-2.5 py-0.5 border border-amber-200">
                        Agent Listing
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 border border-slate-200">
                        Company Direct
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-slate-400">
                      Interested Property
                    </span>
                    <h4 className="text-sm font-black text-slate-950 flex items-center gap-1.5 mt-0.5">
                      {safeSelProp}
                    </h4>
                    {safeSelLoc && (
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        {safeSelLoc}
                      </p>
                    )}
                  </div>

                  {/* Agent in Charge Card */}
                  <div className="rounded-xl border border-amber-200/70 bg-white p-3 space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-900 font-black text-xs border border-amber-200 shadow-2xs">
                          <User className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400">
                            Property Agent in Charge
                          </span>
                          <p className="text-xs font-black text-slate-950">
                            {safeSelAgent}
                          </p>
                        </div>
                      </div>

                      {safeSelAgentMobile && (
                        <a
                          href={`tel:${safeSelAgentMobile}`}
                          className="inline-flex items-center gap-1 text-xs font-black text-amber-900 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200 hover:bg-amber-100 transition shadow-2xs"
                        >
                          <Phone className="h-3 w-3 text-amber-700" />
                          Call Agent
                        </a>
                      )}
                    </div>

                    {safeSelAgentEmail && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 pt-1.5 border-t border-slate-100">
                        <Mail className="h-3 w-3 text-slate-400" />
                        <a
                          href={`mailto:${safeSelAgentEmail}`}
                          className="hover:text-primary transition truncate font-medium"
                        >
                          {safeSelAgentEmail}
                        </a>
                      </div>
                    )}

                    {isSelAgentProp && (
                      <p className="text-[11px] font-medium text-amber-900/90 pt-1 bg-amber-50/60 p-2 rounded-lg border border-amber-100 leading-normal">
                        📍 <strong>Agent Ownership Notice:</strong> This customer lead was generated from{" "}
                        <strong>{safeSelAgent}</strong>'s property listing. The agent is responsible for contacting the customer and following up on the deal.
                      </p>
                    )}
                  </div>
                </div>

                {/* Inquiry Message */}
                <div className="rounded-2xl border border-slate-200/90 bg-white p-4">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Inquiry Message / Request
                  </span>
                  <p className="mt-1.5 text-xs font-semibold leading-relaxed text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200/70 whitespace-pre-wrap">
                    "{safeSelMsg}"
                  </p>
                </div>

              {/* Quick Actions inside Dialog */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setIsViewDialogOpen(false);
                      handleOpenDelete(selectedEnquiry);
                    }}
                    className="rounded-xl text-xs font-bold"
                  >
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                    Delete Lead
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsViewDialogOpen(false);
                      handleOpenEdit(selectedEnquiry);
                    }}
                    className="rounded-xl text-xs font-bold border-amber-200 text-amber-800 hover:bg-amber-50"
                  >
                    <Edit2 className="mr-1.5 h-3.5 w-3.5" />
                    Edit Details
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  {safeSelMobile && safeSelMobile !== "—" && (
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="rounded-xl font-bold text-xs border-slate-300"
                    >
                      <a href={`tel:${safeSelMobile}`}>
                        <Phone className="mr-1.5 h-3.5 w-3.5 text-emerald-600" />
                        Call Client
                      </a>
                    </Button>
                  )}
                  {safeSelEmail && safeSelEmail !== "—" && (
                    <Button
                      asChild
                      size="sm"
                      className="rounded-xl font-black text-xs bg-primary text-white"
                    >
                      <a href={`mailto:${safeSelEmail}`}>
                        <Mail className="mr-1.5 h-3.5 w-3.5" />
                        Send Email
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })()}
        </DialogContent>
      </Dialog>

      {/* 6. Premium Edit Enquiry Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-xl rounded-3xl p-6 border border-slate-200 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 border border-amber-200/80 shadow-2xs">
                <Edit2 className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-black text-slate-950">
                  Edit Enquiry & Lead Dossier
                </DialogTitle>
                <DialogDescription className="text-xs font-semibold text-slate-500 mt-0.5">
                  Update customer contact, pipeline status, priority, and assigned agent.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSaveEdit} className="space-y-5 mt-2">
            {/* Target Property Context Banner */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-primary shrink-0" />
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 block">
                    Property Target
                  </span>
                  <span className="font-black text-slate-900">
                    {editFormData.propertyName || "General Real Estate Inquiry"}
                  </span>
                </div>
              </div>
              <Badge className="bg-white border-slate-200 text-slate-700 font-extrabold text-[10px]">
                ID: {editFormData.id ? editFormData.id.slice(-6) : "—"}
              </Badge>
            </div>

            {/* Client Contact Info */}
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-wider text-slate-500 block">
                Client Contact Information
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1 sm:col-span-1">
                  <label className="text-[11px] font-bold text-slate-700">Client Name</label>
                  <Input
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    placeholder="Client Name"
                    className="h-10 rounded-xl text-xs font-bold"
                    required
                  />
                </div>
                <div className="space-y-1 sm:col-span-1">
                  <label className="text-[11px] font-bold text-slate-700">Phone Number</label>
                  <Input
                    value={editFormData.mobile}
                    onChange={(e) => setEditFormData({ ...editFormData, mobile: e.target.value })}
                    placeholder="10-digit mobile"
                    className="h-10 rounded-xl text-xs font-bold"
                  />
                </div>
                <div className="space-y-1 sm:col-span-1">
                  <label className="text-[11px] font-bold text-slate-700">Email Address</label>
                  <Input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    placeholder="client@example.com"
                    className="h-10 rounded-xl text-xs font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Status & Priority Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Status Picker */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-slate-500 block">
                  Pipeline Status
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "New", activeBg: "bg-sky-50 border-sky-400 text-sky-800 ring-2 ring-sky-300/40" },
                    { label: "In Progress", activeBg: "bg-amber-50 border-amber-400 text-amber-900 ring-2 ring-amber-300/40" },
                    { label: "Closed", activeBg: "bg-emerald-50 border-emerald-400 text-emerald-800 ring-2 ring-emerald-300/40" },
                  ].map((s) => {
                    const isSel = editFormData.status.toLowerCase() === s.label.toLowerCase();
                    return (
                      <button
                        key={s.label}
                        type="button"
                        onClick={() => setEditFormData({ ...editFormData, status: s.label })}
                        className={`p-2.5 rounded-xl border text-center transition-all text-xs font-extrabold flex flex-col items-center justify-center gap-1 ${
                          isSel ? s.activeBg : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <span className={`h-2 w-2 rounded-full ${isSel ? "bg-current" : "bg-slate-300"}`} />
                        <span>{s.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Priority Picker */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-slate-500 block">
                  Lead Priority
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Low", activeBg: "bg-slate-100 border-slate-400 text-slate-800 ring-2 ring-slate-300/40" },
                    { label: "Medium", activeBg: "bg-amber-50 border-amber-400 text-amber-900 ring-2 ring-amber-300/40" },
                    { label: "High", activeBg: "bg-rose-50 border-rose-400 text-rose-800 ring-2 ring-rose-300/40" },
                  ].map((p) => {
                    const isSel = editFormData.priority.toLowerCase() === p.label.toLowerCase();
                    return (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => setEditFormData({ ...editFormData, priority: p.label })}
                        className={`p-2.5 rounded-xl border text-center transition-all text-xs font-extrabold flex flex-col items-center justify-center gap-1 ${
                          isSel ? p.activeBg : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <span className={`h-2 w-2 rounded-full ${isSel ? "bg-current" : "bg-slate-300"}`} />
                        <span>{p.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Assigned Agent Selector */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Responsible Real Estate Agent
                </label>
                <Badge className="bg-purple-50 text-purple-800 border-purple-200 text-[10px] font-bold">
                  Lead Assignment
                </Badge>
              </div>
              <select
                value={editFormData.agentId}
                onChange={(e) => setEditFormData({ ...editFormData, agentId: e.target.value })}
                className="w-full h-11 px-3 text-xs font-black rounded-xl border border-slate-200 bg-white shadow-xs focus:ring-2 focus:ring-amber-500/20"
              >
                <option value="">🏢 Company Direct (Admin Follow-up)</option>
                {registeredAgents.map((ag) => (
                  <option key={ag._id} value={ag._id}>
                    👤 {ag.name} ({ag.mobile}) - {ag.city || "Tamil Nadu"}
                  </option>
                ))}
              </select>
            </div>

            {/* Customer Message / Admin Follow-up Notes */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-black uppercase tracking-wider text-slate-500 block">
                Inquiry Message & Follow-up Remarks
              </label>
              <Textarea
                rows={4}
                value={editFormData.message}
                onChange={(e) => setEditFormData({ ...editFormData, message: e.target.value })}
                placeholder="Enter client message, follow-up notes, site visit schedule remarks..."
                className="rounded-xl text-xs font-medium resize-none leading-relaxed"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                className="rounded-xl text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isUpdating}
                className="rounded-xl text-xs font-black bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-sm flex items-center gap-1.5"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Save Lead Updates</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* 7. Premium Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6 border border-slate-200">
          <DialogHeader>
            <div className="flex items-start gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 shadow-2xs">
                <Trash2 className="h-5 w-5 stroke-[2.2]" />
              </div>
              <div>
                <DialogTitle className="text-lg font-black text-slate-950">
                  Delete Customer Lead?
                </DialogTitle>
                <DialogDescription className="text-xs font-medium text-slate-500 mt-1 leading-normal">
                  Are you sure you want to permanently remove this inquiry from your CRM database?
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {enquiryToDelete && (
            <div className="rounded-2xl border border-rose-100 bg-rose-50/40 p-4 space-y-2 mt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-slate-500">Client Name:</span>
                <span className="font-black text-slate-900">{enquiryToDelete.name || "Anonymous Lead"}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-slate-500">Contact:</span>
                <span className="font-bold text-slate-700">{enquiryToDelete.mobile || enquiryToDelete.email || "—"}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-slate-500">Property:</span>
                <span className="font-bold text-slate-900 truncate max-w-[200px]">
                  {enquiryToDelete.propertyName || "General Inquiry"}
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-4 mt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setEnquiryToDelete(null);
              }}
              className="rounded-xl text-xs font-bold"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isDeleting}
              onClick={handleConfirmDelete}
              className="rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-700 text-white shadow-sm flex items-center gap-1.5"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Yes, Delete Lead</span>
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Enquiries;
