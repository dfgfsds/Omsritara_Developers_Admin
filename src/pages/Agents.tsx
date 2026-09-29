// src/pages/Agents.tsx
import React, { useState, useEffect, useMemo } from "react";
import {
  Users,
  Search,
  Plus,
  Mail,
  Phone,
  Building2,
  MessageCircle,
  Eye,
  Edit2,
  Trash2,
  RotateCcw,
  Sparkles,
  MapPin,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  UserCheck,
  UserX,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import axiosInstance from "@/lib/axiosInstance";
import {
  Agent,
  AgentProperty,
  AgentEnquiry,
} from "@/data/mockAgentsData";
import { AgentPropertyFormDialog } from "@/components/agents/AgentPropertyFormDialog";

// Helper to ensure safe string rendering in React JSX and prevent "Objects are not valid as a React child" crashes
const getSafeString = (val: any, fallback = ""): string => {
  if (typeof val === "string") return val;
  if (typeof val === "number" || typeof val === "boolean") return String(val);
  if (val && typeof val === "object") {
    if (typeof val.name === "string") return val.name;
    if (typeof val.title === "string") return val.title;
    if (typeof val.city === "string") return val.city;
    if (typeof val.area === "string") return val.area;
    if (typeof val.locality === "string") return val.locality;
    if (typeof val.address === "string") return val.address;
  }
  return fallback;
};

export default function Agents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "with_listings">("all");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAllListingsOpen, setIsAllListingsOpen] = useState(false);
  const [listingSearchTerm, setListingSearchTerm] = useState("");
  const [isAddPropertyOpen, setIsAddPropertyOpen] = useState(false);
  const [propertyTargetAgent, setPropertyTargetAgent] = useState<Agent | null>(null);

  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [allLiveProperties, setAllLiveProperties] = useState<any[]>([]);
  const [allLiveEnquiries, setAllLiveEnquiries] = useState<any[]>([]);

  // Dialog States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Selected Agent for View / Edit / Delete
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [agentProperties, setAgentProperties] = useState<AgentProperty[]>([]);
  const [agentEnquiries, setAgentEnquiries] = useState<AgentEnquiry[]>([]);

  // Form states
  const [newAgent, setNewAgent] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    city: "Chennai",
    bio: "",
  });

  const [editFormData, setEditFormData] = useState<{
    name: string;
    email: string;
    mobile: string;
    city: string;
    status: "active" | "inactive";
    bio: string;
  }>({
    name: "",
    email: "",
    mobile: "",
    city: "",
    status: "active",
    bio: "",
  });

  // Load agents, properties, and enquiries concurrently
  const refreshAgents = async () => {
    setIsLoading(true);
    try {
      const [userRes, propRes, enqRes] = await Promise.allSettled([
        axiosInstance.get("/user?role=agent"),
        axiosInstance.get("/property"),
        axiosInstance.get("/enquiry"),
      ]);

      let allUsers: any[] = [];
      if (userRes.status === "fulfilled") {
        allUsers =
          userRes.value.data?.result ||
          userRes.value.data?.data ||
          (Array.isArray(userRes.value.data) ? userRes.value.data : []);
      }

      // Fallback to /user if query didn't return users
      if (!allUsers || allUsers.length === 0) {
        try {
          const fallbackRes = await axiosInstance.get("/user");
          allUsers =
            fallbackRes.data?.result ||
            fallbackRes.data?.data ||
            (Array.isArray(fallbackRes.data) ? fallbackRes.data : []);
        } catch {
          // ignore
        }
      }

      let liveProps: any[] = [];
      if (propRes.status === "fulfilled") {
        liveProps =
          propRes.value.data?.result ||
          propRes.value.data?.data ||
          (Array.isArray(propRes.value.data) ? propRes.value.data : []);
      }
      setAllLiveProperties(liveProps);

      let liveEnqs: any[] = [];
      if (enqRes.status === "fulfilled") {
        liveEnqs =
          enqRes.value.data?.result ||
          enqRes.value.data?.data ||
          (Array.isArray(enqRes.value.data) ? enqRes.value.data : []);
      }
      setAllLiveEnquiries(liveEnqs);

      // Filter and display users whose role is AGENT
      const agentUsers = allUsers.filter((u: any) => {
        const roleStr = String(
          u.roleType ||
          (typeof u.role === "object" ? u.role?.name : u.role) ||
          ""
        ).toUpperCase();
        return roleStr.includes("AGENT");
      });

      const effectiveAgents = agentUsers;

      if (effectiveAgents.length > 0) {
        const mapped: Agent[] = effectiveAgents.map((u: any) => {
          // Count properties owned by this agent
          const agentProps = liveProps.filter((p: any) => {
            const ownerId =
              typeof p.created_by === "object"
                ? p.created_by?._id
                : p.created_by || p.agentId || p.userId || "";
            return String(ownerId) === String(u._id);
          });

          // Count enquiries for this agent's properties or direct agentId
          const agentEnqs = liveEnqs.filter((e: any) => {
            const enqPropId = typeof e.propertyId === "object" ? e.propertyId?._id : e.propertyId;
            const matchingProp = liveProps.find((p: any) => String(p._id) === String(enqPropId));
            const propOwnerId = matchingProp
              ? (typeof matchingProp.created_by === "object" ? matchingProp.created_by?._id : matchingProp.created_by || matchingProp.agentId || matchingProp.userId)
              : null;
            const directAgentId = typeof e.agentId === "object" ? e.agentId?._id : e.agentId;
            return String(propOwnerId) === String(u._id) || String(directAgentId) === String(u._id);
          });

          return {
            _id: u._id,
            name: u.name || "Agent",
            email: u.email || "",
            mobile: u.mobile || "",
            city: u.city || "Chennai",
            status:
              u.status === "inactive" || u.isActive === false
                ? "inactive"
                : "active",
            createdAt: u.createdAt || new Date().toISOString(),
            propertiesCount: agentProps.length || u.propertiesCount || 0,
            enquiriesCount: agentEnqs.length || u.enquiriesCount || 0,
          };
        });
        setAgents(mapped);
      } else {
        setAgents([]);
      }
    } catch (err: any) {
      setAgents([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshAgents();
  }, []);

  // Filtered Agents
  const filteredAgents = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    const result = agents.filter((agent) => {
      const matchesSearch =
        !q ||
        agent.name.toLowerCase().includes(q) ||
        agent.email.toLowerCase().includes(q) ||
        agent.mobile.includes(q) ||
        (agent.city && agent.city.toLowerCase().includes(q));

      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "with_listings"
          ? (agent.propertiesCount || 0) > 0
          : agent.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    if (statusFilter === "with_listings") {
      return [...result].sort((a, b) => (b.propertiesCount || 0) - (a.propertiesCount || 0));
    }
    return result;
  }, [agents, searchTerm, statusFilter]);

  // All properties uploaded by registered agents
  const allAgentPropertiesList = useMemo(() => {
    const agentMap = new Map<string, Agent>();
    agents.forEach((a) => agentMap.set(String(a._id), a));

    return allLiveProperties
      .filter((p: any) => {
        const ownerId =
          typeof p.created_by === "object"
            ? p.created_by?._id
            : p.created_by || p.agentId || p.userId || "";
        return agentMap.has(String(ownerId));
      })
      .map((p: any) => {
        const ownerId =
          typeof p.created_by === "object"
            ? p.created_by?._id
            : p.created_by || p.agentId || p.userId || "";
        const agent = agentMap.get(String(ownerId));

        // 1. Safe Property Name
        const propName = getSafeString(p.name || p.title, "Untitled Property");

        // 2. Safe Property Type
        const propType = getSafeString(
          typeof p.type === "object" ? p.type?.name : p.propertyType || p.type,
          "Property"
        );

        // 3. Safe Location (Location in MongoDB is an object with address, locality, area, city)
        let propLocation = "Tamil Nadu";
        if (typeof p.city === "string" && p.city.trim()) {
          propLocation = p.city.trim();
        } else if (p.location && typeof p.location === "object") {
          propLocation =
            getSafeString(p.location.city) ||
            getSafeString(p.location.locality) ||
            getSafeString(p.location.area) ||
            getSafeString(p.location.address) ||
            "Tamil Nadu";
        } else if (typeof p.location === "string" && p.location.trim()) {
          propLocation = p.location.trim();
        } else if (typeof p.address === "string" && p.address.trim()) {
          propLocation = p.address.trim();
        }

        // 4. Safe Price
        let propPrice = "Price on Request";
        if (typeof p.price === "number") {
          propPrice = `₹${p.price.toLocaleString("en-IN")}`;
        } else if (typeof p.price === "string" && p.price.trim()) {
          const num = Number(p.price);
          propPrice = !isNaN(num) && num > 0 ? `₹${num.toLocaleString("en-IN")}` : p.price;
        } else if (p.expectedPrice) {
          const num = Number(p.expectedPrice);
          propPrice = !isNaN(num) && num > 0 ? `₹${num.toLocaleString("en-IN")}` : String(p.expectedPrice);
        }

        // 5. Safe Image
        let propImage: string | null = null;
        if (typeof p.img_url === "string" && p.img_url) {
          propImage = p.img_url;
        } else if (Array.isArray(p.image_url) && p.image_url.length > 0) {
          const firstImg = p.image_url[0];
          propImage = typeof firstImg === "string" ? firstImg : (firstImg?.url || null);
        } else if (Array.isArray(p.images) && p.images.length > 0) {
          const firstImg = p.images[0];
          propImage = typeof firstImg === "string" ? firstImg : (firstImg?.url || null);
        } else if (typeof p.image === "string" && p.image) {
          propImage = p.image;
        }

        // 6. Safe Agent Name
        let agentNameStr = agent?.name;
        if (!agentNameStr && typeof p.created_by === "object" && p.created_by?.name) {
          agentNameStr = p.created_by.name;
        }
        agentNameStr = getSafeString(agentNameStr, "Agent");

        // 7. Safe Status
        const propStatus = getSafeString(
          typeof p.status === "object" ? p.status?.name : p.status,
          "Active"
        );

        return {
          _id: String(p._id || Math.random()),
          name: propName,
          type: propType,
          price: propPrice,
          location: propLocation,
          status: propStatus,
          image: propImage,
          agentName: agentNameStr,
          agentEmail: getSafeString(agent?.email || p.created_by?.email, ""),
          agentMobile: getSafeString(agent?.mobile || p.created_by?.mobile, ""),
          agentId: String(ownerId),
        };
      });
  }, [allLiveProperties, agents]);

  const filteredAgentProperties = useMemo(() => {
    const q = listingSearchTerm.trim().toLowerCase();
    if (!q) return allAgentPropertiesList;
    return allAgentPropertiesList.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.type.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.agentName.toLowerCase().includes(q)
    );
  }, [allAgentPropertiesList, listingSearchTerm]);

  // Metrics
  const metrics = useMemo(() => {
    const total = agents.length;
    const active = agents.filter((a) => a.status === "active").length;
    const inactive = agents.filter((a) => a.status === "inactive").length;
    const totalListings = agents.reduce((acc, curr) => acc + (curr.propertiesCount || 0), 0);
    const totalLeads = agents.reduce((acc, curr) => acc + (curr.enquiriesCount || 0), 0);
    return { total, active, inactive, totalListings, totalLeads };
  }, [agents]);

  // Actions
  const handleOpenAdd = () => {
    setNewAgent({
      name: "",
      email: "",
      mobile: "",
      password: "",
      city: "Chennai",
      bio: "",
    });
    setIsAddOpen(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !newAgent.name.trim() ||
      !newAgent.email.trim() ||
      !newAgent.mobile.trim() ||
      !newAgent.password.trim()
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (Name, Email, Mobile, Password).",
        variant: "destructive",
      });
      return;
    }

    if (!/^[0-9]{10}$/.test(newAgent.mobile.trim())) {
      toast({
        title: "Invalid Mobile",
        description: "Mobile number must be exactly 10 digits.",
        variant: "destructive",
      });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newAgent.email.trim())) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await axiosInstance.post("/agent", {
        name: newAgent.name.trim(),
        email: newAgent.email.trim(),
        mobile: newAgent.mobile.trim(),
        password: newAgent.password.trim(),
      });

      toast({
        title: "Agent Created Successfully",
        description: `${newAgent.name} has been enrolled with the Agent role.`,
      });

      setNewAgent({
        name: "",
        email: "",
        mobile: "",
        password: "",
        city: "Chennai",
        bio: "",
      });
      setIsAddOpen(false);
      await refreshAgents();
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.msg ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to create agent";
      toast({
        title: "Error Creating Agent",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (agent: Agent) => {
    setSelectedAgent(agent);
    setEditFormData({
      name: agent.name,
      email: agent.email,
      mobile: agent.mobile,
      city: agent.city || "Chennai",
      status: agent.status,
      bio: agent.bio || "",
    });
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgent) return;

    if (!editFormData.name.trim() || !editFormData.email.trim() || !editFormData.mobile.trim()) {
      toast({
        title: "Validation Error",
        description: "Name, email, and mobile are required.",
        variant: "destructive",
      });
      return;
    }

    if (!/^[0-9]{10}$/.test(editFormData.mobile.trim())) {
      toast({
        title: "Invalid Mobile",
        description: "Mobile number must contain 10 digits.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await axiosInstance.put(`/user/${selectedAgent._id}`, {
        name: editFormData.name.trim(),
        email: editFormData.email.trim().toLowerCase(),
        mobile: editFormData.mobile.trim(),
        status: editFormData.status,
      });

      await refreshAgents();
      setIsEditOpen(false);

      toast({
        title: "Agent Updated",
        description: `Details for ${editFormData.name} have been updated successfully.`,
      });
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.msg ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update agent";
      toast({
        title: "Update Failed",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenView = (agent: Agent) => {
    setSelectedAgent(agent);

    // Map live properties belonging to this agent
    const liveAgentProps = allLiveProperties
      .filter((p: any) => {
        const ownerId =
          typeof p.created_by === "object"
            ? p.created_by?._id
            : p.created_by || p.agentId || p.userId || "";
        return String(ownerId) === String(agent._id);
      })
      .map((p: any) => {
        let propLocation = "Tamil Nadu";
        if (typeof p.city === "string" && p.city.trim()) {
          propLocation = p.city.trim();
        } else if (p.location && typeof p.location === "object") {
          propLocation =
            getSafeString(p.location.city) ||
            getSafeString(p.location.locality) ||
            getSafeString(p.location.area) ||
            getSafeString(p.location.address) ||
            "Tamil Nadu";
        } else if (typeof p.location === "string" && p.location.trim()) {
          propLocation = p.location.trim();
        } else if (typeof p.address === "string" && p.address.trim()) {
          propLocation = p.address.trim();
        }

        let propImage = "";
        if (typeof p.img_url === "string" && p.img_url) {
          propImage = p.img_url;
        } else if (Array.isArray(p.image_url) && p.image_url.length > 0) {
          const firstImg = p.image_url[0];
          propImage = typeof firstImg === "string" ? firstImg : (firstImg?.url || "");
        } else if (Array.isArray(p.images) && p.images.length > 0) {
          const firstImg = p.images[0];
          propImage = typeof firstImg === "string" ? firstImg : (firstImg?.url || "");
        } else if (typeof p.image === "string") {
          propImage = p.image;
        }

        return {
          _id: String(p._id),
          name: getSafeString(p.name || p.title, "Untitled Property"),
          type: getSafeString(typeof p.type === "object" ? p.type?.name : p.propertyType || p.type, "Residential"),
          price: p.expectedPrice ? `₹${Number(p.expectedPrice).toLocaleString("en-IN")}` : (p.price ? (typeof p.price === 'number' ? `₹${p.price.toLocaleString("en-IN")}` : String(p.price)) : "Price on Request"),
          location: propLocation,
          status: (p.status || "available") as "available" | "under_construction" | "sold",
          agentId: agent._id,
          agentName: agent.name,
          image: propImage,
          createdAt: p.createdAt || new Date().toISOString(),
        };
      });

    // Map live enquiries belonging to this agent's properties
    const liveAgentEnqs = allLiveEnquiries
      .filter((e: any) => {
        const enqPropId = typeof e.propertyId === "object" ? e.propertyId?._id : e.propertyId;
        const matchingProp = allLiveProperties.find((p: any) => String(p._id) === String(enqPropId));
        const propOwnerId = matchingProp
          ? (typeof matchingProp.created_by === "object" ? matchingProp.created_by?._id : matchingProp.created_by || matchingProp.agentId || matchingProp.userId)
          : null;
        const directAgentId = typeof e.agentId === "object" ? e.agentId?._id : e.agentId;
        return String(propOwnerId) === String(agent._id) || String(directAgentId) === String(agent._id);
      })
      .map((e: any) => ({
        _id: e._id,
        name: e.name || e.fullName || "Prospective Buyer",
        email: e.email || "-",
        mobile: e.phone || e.mobile || "-",
        propertyName:
          (typeof e.propertyId === "object" ? (e.propertyId?.title || e.propertyId?.name) : null) ||
          e.propertyName ||
          "Property Enquiry",
        propertyId: typeof e.propertyId === "object" ? e.propertyId?._id : e.propertyId || "",
        status: (e.status || "New") as "New" | "In Progress" | "Closed",
        priority: (e.priority || "Medium") as "High" | "Medium" | "Low",
        createdAt: e.createdAt || new Date().toISOString(),
        message: e.message || e.notes || "Interested in this property.",
        agentId: agent._id,
      }));

    setAgentProperties(liveAgentProps);
    setAgentEnquiries(liveAgentEnqs);
    setIsViewOpen(true);
  };

  const handleOpenDelete = (agent: Agent) => {
    setSelectedAgent(agent);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedAgent) return;
    try {
      setIsSubmitting(true);
      await axiosInstance.delete(`/user/${selectedAgent._id}`);
      await refreshAgents();
      setIsDeleteOpen(false);

      toast({
        title: "Agent Deleted",
        description: `${selectedAgent.name} has been deleted successfully.`,
      });
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.msg ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to delete agent";
      toast({
        title: "Delete Failed",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (agent: Agent) => {
    const nextStatus = agent.status === "active" ? "inactive" : "active";
    const previousStatus = agent.status;

    // Optimistic UI update so the button flips immediately between Active (emerald) and Inactive (amber)
    setAgents((prev) =>
      prev.map((a) => (a._id === agent._id ? { ...a, status: nextStatus } : a))
    );
    setUpdatingStatusId(agent._id);

    try {
      await axiosInstance.put(`/user/${agent._id}`, {
        status: nextStatus,
      });

      toast({
        title: nextStatus === "active" ? "Agent Activated" : "Agent Marked Inactive",
        description:
          nextStatus === "active"
            ? `${agent.name} is now active and can access their portal.`
            : `${agent.name} is now marked as inactive. Portal access suspended.`,
      });
    } catch (err: any) {
      // Revert optimistic update on failure
      setAgents((prev) =>
        prev.map((a) => (a._id === agent._id ? { ...a, status: previousStatus } : a))
      );

      const errorMsg =
        err?.response?.data?.msg ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update agent status";

      toast({
        title: "Status Update Failed",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setUpdatingStatusId(null);
    }
  };

  return (
    <div className="space-y-7 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight font-heading">
              Real Estate Agents
            </h1>
            <Badge className="bg-amber-100 text-amber-900 border-amber-300 font-extrabold hover:bg-amber-100 shadow-2xs">
              Role: AGENT
            </Badge>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm font-semibold mt-1">
            Manage agents, monitor individual property portfolios, and handle portal access permissions.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            type="button"
            onClick={() => {
              setPropertyTargetAgent(null);
              setIsAddPropertyOpen(true);
            }}
            variant="outline"
            className="border-purple-300 text-purple-900 bg-purple-50/70 hover:bg-purple-100/90 font-black text-xs rounded-2xl flex items-center gap-2 px-4 h-11 shrink-0 transition-all shadow-2xs"
          >
            <Building2 className="h-4 w-4 text-purple-600" />
            <span>+ Add Agent Property</span>
          </Button>

          <Button
            onClick={handleOpenAdd}
            className="bg-gradient-to-r from-primary via-rose-700 to-rose-600 hover:opacity-95 text-white font-black text-xs rounded-2xl shadow-md shadow-primary/25 flex items-center gap-2 px-5 h-11 shrink-0 transition-all"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>Add New Agent</span>
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Total Agents */}
        <div
          role="button"
          onClick={() => setStatusFilter("all")}
          className={`group relative overflow-hidden bg-white p-5 rounded-3xl border shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex items-center justify-between cursor-pointer ${
            statusFilter === "all"
              ? "border-blue-400 ring-2 ring-blue-500/80 bg-blue-50/20 shadow-md"
              : "border-slate-200/85 hover:border-blue-300"
          }`}
          title="Click to view all agents"
        >
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-400 to-indigo-600" />
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100/70 shadow-2xs group-hover:scale-110 group-hover:bg-blue-100/70 transition-all">
              <Users className="h-5 w-5 stroke-[2.2]" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-700 uppercase tracking-wider">Total Agents</p>
              <p className="text-2xl sm:text-3xl font-black text-slate-950 mt-0.5 font-heading">{metrics.total}</p>
            </div>
          </div>
          <span
            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full transition-colors ${
              statusFilter === "all"
                ? "bg-blue-100 text-blue-800"
                : "text-slate-400 group-hover:text-blue-600"
            }`}
          >
            {statusFilter === "all" ? "Viewing All" : "Click to view"}
          </span>
        </div>

        {/* Active Agents */}
        <div
          role="button"
          onClick={() => setStatusFilter("active")}
          className={`group relative overflow-hidden bg-white p-5 rounded-3xl border shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex items-center justify-between cursor-pointer ${
            statusFilter === "active"
              ? "border-emerald-400 ring-2 ring-emerald-500/80 bg-emerald-50/20 shadow-md"
              : "border-slate-200/85 hover:border-emerald-300"
          }`}
          title="Click to filter active agents"
        >
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-600" />
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100/70 shadow-2xs group-hover:scale-110 group-hover:bg-emerald-100/70 transition-all">
              <CheckCircle2 className="h-5 w-5 stroke-[2.5]" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-700 uppercase tracking-wider">Active Agents</p>
              <p className="text-2xl sm:text-3xl font-black text-emerald-700 mt-0.5 font-heading">{metrics.active}</p>
            </div>
          </div>
          <span
            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full transition-colors ${
              statusFilter === "active"
                ? "bg-emerald-100 text-emerald-800"
                : "text-slate-400 group-hover:text-emerald-600"
            }`}
          >
            {statusFilter === "active" ? "Filtered Active" : "Click to filter"}
          </span>
        </div>

        {/* Inactive */}
        <div
          role="button"
          onClick={() => setStatusFilter("inactive")}
          className={`group relative overflow-hidden bg-white p-5 rounded-3xl border shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex items-center justify-between cursor-pointer ${
            statusFilter === "inactive"
              ? "border-amber-400 ring-2 ring-amber-500/80 bg-amber-50/20 shadow-md"
              : "border-slate-200/85 hover:border-amber-300"
          }`}
          title="Click to filter inactive agents"
        >
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500" />
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100/70 shadow-2xs group-hover:scale-110 group-hover:bg-amber-100/70 transition-all">
              <AlertCircle className="h-5 w-5 stroke-[2.2]" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-700 uppercase tracking-wider">Inactive</p>
              <p className="text-2xl sm:text-3xl font-black text-amber-700 mt-0.5 font-heading">{metrics.inactive}</p>
            </div>
          </div>
          <span
            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full transition-colors ${
              statusFilter === "inactive"
                ? "bg-amber-100 text-amber-800"
                : "text-slate-400 group-hover:text-amber-600"
            }`}
          >
            {statusFilter === "inactive" ? "Filtered Inactive" : "Click to filter"}
          </span>
        </div>

        {/* Agent Portfolio Total */}
        <div
          role="button"
          onClick={() => {
            setStatusFilter("with_listings");
            setIsAllListingsOpen(true);
          }}
          className={`group relative overflow-hidden bg-white p-5 rounded-3xl border shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex items-center justify-between cursor-pointer ${
            statusFilter === "with_listings"
              ? "border-purple-400 ring-2 ring-purple-500/80 bg-purple-50/20 shadow-md"
              : "border-slate-200/85 hover:border-purple-300"
          }`}
          title="Click to view all agent properties portfolio"
        >
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-400 to-pink-500" />
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100/70 shadow-2xs group-hover:scale-110 group-hover:bg-purple-100/70 transition-all">
              <Building2 className="h-5 w-5 stroke-[2.2]" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-700 uppercase tracking-wider">Agent Listings</p>
              <p className="text-2xl sm:text-3xl font-black text-purple-700 mt-0.5 font-heading">{metrics.totalListings}</p>
            </div>
          </div>
          <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 group-hover:bg-purple-200 transition-colors flex items-center gap-1 shadow-2xs">
            <span>View Listings</span>
            <ChevronRight className="h-3 w-3" />
          </span>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search by agent name, phone, city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10 rounded-xl bg-slate-50/70 border-slate-200 text-sm focus:bg-white"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-full md:w-auto self-stretch md:self-auto overflow-x-auto">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all shrink-0 ${
              statusFilter === "all"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All ({metrics.total})
          </button>
          <button
            onClick={() => setStatusFilter("active")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all shrink-0 ${
              statusFilter === "active"
                ? "bg-white text-emerald-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Active ({metrics.active})
          </button>
          <button
            onClick={() => setStatusFilter("inactive")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all shrink-0 ${
              statusFilter === "inactive"
                ? "bg-white text-amber-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Inactive ({metrics.inactive})
          </button>
          <button
            onClick={() => {
              setStatusFilter("with_listings");
              setIsAllListingsOpen(true);
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all shrink-0 flex items-center gap-1.5 ${
              statusFilter === "with_listings"
                ? "bg-white text-purple-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Building2 className="h-3 w-3 text-purple-600" />
            <span>With Listings ({agents.filter((a) => (a.propertiesCount || 0) > 0).length})</span>
          </button>
        </div>
      </div>

      {/* Active Filter Indicator Banner */}
      {statusFilter !== "all" && (
        <div className="flex items-center justify-between p-3 px-4 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-slate-600">Active Filter:</span>
            <Badge
              className={`font-bold ${
                statusFilter === "active"
                  ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                  : statusFilter === "inactive"
                  ? "bg-amber-100 text-amber-800 border-amber-300"
                  : "bg-purple-100 text-purple-800 border-purple-300"
              }`}
            >
              {statusFilter === "active" && `Active Agents (${filteredAgents.length})`}
              {statusFilter === "inactive" && `Inactive Agents (${filteredAgents.length})`}
              {statusFilter === "with_listings" && `Agents with Listings (${filteredAgents.length})`}
            </Badge>
            <span className="text-slate-400">|</span>
            <span className="text-slate-500 font-medium">
              Showing {filteredAgents.length} of {agents.length} agents
            </span>
          </div>
          <div className="flex items-center gap-2">
            {statusFilter === "with_listings" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsAllListingsOpen(true)}
                className="h-7 text-xs font-bold rounded-lg text-purple-700 border-purple-200 hover:bg-purple-50"
              >
                <Eye className="h-3 w-3 mr-1" />
                View All Listings Modal
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setStatusFilter("all")}
              className="h-7 text-xs font-bold text-slate-500 hover:text-slate-800"
            >
              Reset Filter
            </Button>
          </div>
        </div>
      )}

      {/* Agents Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow className="border-b border-slate-200">
                <TableHead className="font-bold text-slate-700 text-xs py-3.5">Agent Details</TableHead>
                <TableHead className="font-bold text-slate-700 text-xs py-3.5">Contact</TableHead>
                <TableHead className="font-bold text-slate-700 text-xs py-3.5">City</TableHead>
                <TableHead className="font-bold text-slate-700 text-xs py-3.5 text-center">Portfolio</TableHead>
                <TableHead className="font-bold text-slate-700 text-xs py-3.5">Status</TableHead>
                <TableHead className="font-bold text-slate-700 text-xs py-3.5">Enrolled</TableHead>
                <TableHead className="font-bold text-slate-700 text-xs py-3.5 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAgents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-slate-400">
                    <Users className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-bold text-sm text-slate-700">
                      {statusFilter === "inactive"
                        ? "No Inactive Agents"
                        : statusFilter === "with_listings"
                        ? "No Agents With Listings Found"
                        : "No agents found"}
                    </p>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      {statusFilter === "inactive"
                        ? "All registered agents are currently Active with full portal access."
                        : statusFilter === "with_listings"
                        ? "None of the registered agents have uploaded property listings yet."
                        : searchTerm
                        ? `No results matching "${searchTerm}".`
                        : "Try adding a new agent above."}
                    </p>
                    {statusFilter !== "all" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setStatusFilter("all")}
                        className="mt-3 text-xs font-bold rounded-xl"
                      >
                        Show All Agents
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filteredAgents.map((agent) => {
                  const isActive = agent.status === "active";
                  return (
                    <TableRow key={agent._id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-100">
                      {/* Name & Avatar */}
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-10 w-10 rounded-full flex items-center justify-center font-black text-sm shrink-0 shadow-sm ${isActive
                                ? "bg-gradient-to-tr from-amber-500 to-amber-400 text-white"
                                : "bg-slate-200 text-slate-500"
                              }`}
                          >
                            {agent.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-slate-900 leading-tight">
                              {agent.name}
                            </p>
                            <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 mt-0.5 inline-block">
                              AGENT
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Contact */}
                      <TableCell className="py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                            <Mail className="h-3 w-3 text-slate-400" />
                            <span>{agent.email}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                            <Phone className="h-3 w-3 text-slate-400" />
                            <span>{agent.mobile}</span>
                          </div>
                        </div>
                      </TableCell>

                      {/* City */}
                      <TableCell className="py-4 text-xs font-semibold text-slate-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" />
                          <span>{agent.city || "Tamil Nadu"}</span>
                        </div>
                      </TableCell>

                      {/* Portfolio & Leads */}
                      <TableCell className="py-4 text-center">
                        <div className="flex items-center justify-center gap-3 text-xs">
                          <button
                            type="button"
                            onClick={() => handleOpenView(agent)}
                            title="Click to view agent's listed properties"
                            className="inline-flex items-center gap-1 font-bold text-slate-700 bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 hover:scale-105 px-2 py-0.5 rounded-lg cursor-pointer transition-all shadow-2xs"
                          >
                            <Building2 className="h-3 w-3 text-purple-600" />
                            {agent.propertiesCount || 0}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenView(agent)}
                            title="Click to view agent's customer leads"
                            className="inline-flex items-center gap-1 font-bold text-slate-700 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 hover:scale-105 px-2 py-0.5 rounded-lg cursor-pointer transition-all shadow-2xs"
                          >
                            <MessageCircle className="h-3 w-3 text-blue-600" />
                            {agent.enquiriesCount || 0}
                          </button>
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell className="py-4">
                        <button
                          type="button"
                          disabled={updatingStatusId === agent._id}
                          onClick={() => handleToggleStatus(agent)}
                          title={`Status is ${isActive ? "Active" : "Inactive"}. Click to toggle.`}
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer hover:scale-105 shadow-2xs ${isActive
                              ? "bg-emerald-50 text-emerald-800 border-emerald-300 ring-1 ring-emerald-400/25 hover:bg-emerald-100"
                              : "bg-amber-50 text-amber-800 border-amber-300 ring-1 ring-amber-400/25 hover:bg-amber-100"
                            } ${updatingStatusId === agent._id ? "opacity-70 cursor-not-allowed" : ""}`}
                        >
                          {updatingStatusId === agent._id ? (
                            <Loader2 className="h-3 w-3 animate-spin text-slate-600" />
                          ) : (
                            <span
                              className={`h-2 w-2 rounded-full ${isActive
                                  ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"
                                  : "bg-amber-500"
                                }`}
                            />
                          )}
                          {isActive ? "Active" : "Inactive"}
                        </button>
                      </TableCell>

                      {/* Enrolled Date */}
                      <TableCell className="py-4 text-xs text-slate-500 font-medium">
                        {agent.createdAt
                          ? new Date(agent.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                          : "-"}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">

                          {/* View details */}
                          <Button
                            variant="outline"
                            size="sm"
                            title="View Agent Details"
                            onClick={() => handleOpenView(agent)}
                            className="h-8 w-8 p-0 rounded-lg text-slate-600 hover:text-slate-900 border-slate-200 hover:bg-slate-100 shadow-2xs"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>

                          {/* Edit */}
                          <Button
                            variant="outline"
                            size="sm"
                            title="Edit Agent Details"
                            onClick={() => handleOpenEdit(agent)}
                            className="h-8 w-8 p-0 rounded-lg text-blue-600 hover:text-blue-800 border-slate-200 hover:bg-blue-50 shadow-2xs"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>

                          {/* Active / Inactive Status Toggle (Dedicated Button) */}
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={updatingStatusId === agent._id}
                            title={
                              isActive
                                ? "Active: Click to mark Inactive"
                                : "Inactive: Click to mark Active"
                            }
                            onClick={() => handleToggleStatus(agent)}
                            className={`h-8 w-8 p-0 rounded-lg border shadow-2xs transition-all ${isActive
                                ? "text-emerald-700 bg-emerald-50 border-emerald-300 hover:bg-emerald-100 hover:text-emerald-900"
                                : "text-amber-700 bg-amber-50 border-amber-300 hover:bg-amber-100 hover:text-amber-900"
                              } ${updatingStatusId === agent._id ? "opacity-70 cursor-not-allowed" : ""}`}
                          >
                            {updatingStatusId === agent._id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : isActive ? (
                              <UserCheck className="h-3.5 w-3.5 stroke-[2.2]" />
                            ) : (
                              <UserX className="h-3.5 w-3.5 stroke-[2.2]" />
                            )}
                          </Button>

                          {/* Delete Agent (Separate Action) */}
                          <Button
                            variant="outline"
                            size="sm"
                            title="Delete Agent"
                            onClick={() => handleOpenDelete(agent)}
                            className="h-8 w-8 p-0 rounded-lg text-rose-600 border-slate-200 hover:bg-rose-50 hover:text-rose-800 hover:border-rose-300 shadow-2xs"
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

      {/* 1. ADD AGENT MODAL */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-md rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold text-slate-900">
              Add New Real Estate Agent
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              This will create a new agent account with restricted access to their dashboard, properties, and leads.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddSubmit} className="space-y-4 mt-2">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Full Name *
              </label>
              <Input
                required
                placeholder="e.g. Ramesh Kumar"
                value={newAgent.name}
                onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                className="rounded-xl"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Email Address *
              </label>
              <Input
                required
                type="email"
                placeholder="e.g. "
                value={newAgent.email}
                onChange={(e) => setNewAgent({ ...newAgent, email: e.target.value })}
                className="rounded-xl"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Mobile Number (10 digits) *
              </label>
              <Input
                required
                maxLength={10}
                placeholder="e.g. 9876543210"
                value={newAgent.mobile}
                onChange={(e) =>
                  setNewAgent({
                    ...newAgent,
                    mobile: e.target.value.replace(/\D/g, ""),
                  })
                }
                className="rounded-xl"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Password *
              </label>
              <Input
                required
                type="password"
                placeholder="Temporary login password"
                value={newAgent.password}
                onChange={(e) => setNewAgent({ ...newAgent, password: e.target.value })}
                className="rounded-xl"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                City / Operating Region
              </label>
              <Input
                placeholder="e.g. Chennai / Coimbatore"
                value={newAgent.city}
                onChange={(e) => setNewAgent({ ...newAgent, city: e.target.value })}
                className="rounded-xl"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Specialization / Bio (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Luxury villas and commercial plots specialist"
                value={newAgent.bio}
                onChange={(e) => setNewAgent({ ...newAgent, bio: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Role Assignment:</strong> This user will automatically be assigned the <strong>AGENT</strong> role with isolated access.
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddOpen(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary hover:bg-primary/95 text-white font-bold rounded-xl flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <span>Create Agent</span>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* 2. EDIT AGENT MODAL */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold text-slate-900">
              Edit Agent Details
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Update personal information or change account status.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4 mt-2">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Full Name *
              </label>
              <Input
                required
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                className="rounded-xl"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Email Address *
              </label>
              <Input
                required
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                className="rounded-xl"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Mobile Number *
              </label>
              <Input
                required
                maxLength={10}
                value={editFormData.mobile}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    mobile: e.target.value.replace(/\D/g, ""),
                  })
                }
                className="rounded-xl"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                City / Region
              </label>
              <Input
                value={editFormData.city}
                onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                className="rounded-xl"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Account Status
              </label>
              <select
                value={editFormData.status}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    status: e.target.value as "active" | "inactive",
                  })
                }
                className="w-full text-xs h-10 px-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 font-bold"
              >
                <option value="active">Active (Access Allowed)</option>
                <option value="inactive">Inactive / Suspended</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Bio / Specialization
              </label>
              <textarea
                rows={2}
                value={editFormData.bio}
                onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditOpen(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary hover:bg-primary/95 text-white font-bold rounded-xl flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Changes</span>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* 3. DELETE AGENT CONFIRMATION MODAL */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-md rounded-2xl p-6">
          <DialogHeader>
            <div className="h-12 w-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-2">
              <Trash2 className="h-6 w-6" />
            </div>
            <DialogTitle className="text-xl font-extrabold text-slate-900">
              Delete Agent?
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-600 leading-relaxed mt-1">
              Are you sure you want to permanently delete <strong>{selectedAgent?.name}</strong>?
            </DialogDescription>
          </DialogHeader>

          <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-3.5 space-y-2 text-xs text-slate-700">
            <div className="flex items-center gap-2 font-bold text-rose-900">
              <AlertCircle className="h-4 w-4 text-rose-600" />
              <span>Permanent Deletion Warning</span>
            </div>
            <p className="text-[11px] text-slate-600">
              • The agent’s portal access and credentials will be permanently deleted.
            </p>
            <p className="text-[11px] text-slate-600">
              • Assigned properties ({selectedAgent?.propertiesCount || 0}) and customer enquiries ({selectedAgent?.enquiriesCount || 0}) will be safely unassigned.
            </p>
            <p className="text-[11px] text-rose-700 font-bold">
              • This action cannot be undone.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => setIsDeleteOpen(false)}
              className="rounded-xl font-bold"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isSubmitting}
              onClick={handleConfirmDelete}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <span>Delete Agent</span>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 4. VIEW AGENT DETAILS DIALOG */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-3xl rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-white font-black text-xl flex items-center justify-center shadow-md">
                  {selectedAgent?.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <DialogTitle className="text-xl font-extrabold text-slate-900">
                      {selectedAgent?.name}
                    </DialogTitle>
                    <Badge
                      className={
                        selectedAgent?.status === "active"
                          ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                          : "bg-amber-100 text-amber-800 border-amber-300"
                      }
                    >
                      {selectedAgent?.status === "active" ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedAgent?.city || "Tamil Nadu"} • Enrolled:{" "}
                    {selectedAgent?.createdAt
                      ? new Date(selectedAgent.createdAt).toLocaleDateString()
                      : "-"}
                  </p>
                </div>
              </div>
            </div>
          </DialogHeader>

          {/* Contact Details strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 mt-2">
            <div className="flex items-center gap-2 text-xs text-slate-700">
              <Mail className="h-4 w-4 text-slate-400" />
              <span className="font-semibold truncate">{selectedAgent?.email}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-700">
              <Phone className="h-4 w-4 text-slate-400" />
              <span className="font-semibold">{selectedAgent?.mobile}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-700">
              <MapPin className="h-4 w-4 text-slate-400" />
              <span className="font-semibold">{selectedAgent?.city || "Tamil Nadu"}</span>
            </div>
          </div>

          {selectedAgent?.bio && (
            <p className="text-xs text-slate-600 italic px-1">
              "{selectedAgent.bio}"
            </p>
          )}

          {/* Detailed Tabs: Properties & Enquiries */}
          <Tabs defaultValue="properties" className="mt-4">
            <TabsList className="grid w-full grid-cols-2 rounded-xl bg-slate-100 p-1">
              <TabsTrigger value="properties" className="rounded-lg text-xs font-bold">
                Assigned Properties ({agentProperties.length})
              </TabsTrigger>
              <TabsTrigger value="enquiries" className="rounded-lg text-xs font-bold">
                Customer Enquiries ({agentEnquiries.length})
              </TabsTrigger>
            </TabsList>

            {/* Properties Tab Content */}
            <TabsContent value="properties" className="mt-4 space-y-3">
              <div className="flex items-center justify-between p-2.5 px-3.5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200/80 shadow-2xs">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-amber-700" />
                  <span className="text-xs font-black text-amber-950">
                    {selectedAgent?.name}'s Listed Properties ({agentProperties.length})
                  </span>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    setPropertyTargetAgent(selectedAgent);
                    setIsAddPropertyOpen(true);
                  }}
                  className="h-8 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-black text-xs flex items-center gap-1.5 shadow-xs transition-transform hover:scale-105"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>+ Add Property</span>
                </Button>
              </div>

              {agentProperties.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed text-slate-400 text-xs">
                  <Building2 className="h-8 w-8 mx-auto text-slate-300 mb-1.5" />
                  <p className="font-bold text-slate-600">No properties currently assigned to this agent.</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Click the "+ Add Property" button above to publish an exclusive listing.</p>
                </div>
              ) : (
                agentProperties.map((prop) => (
                  <div
                    key={prop._id}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 transition-all bg-white"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                        {prop.image ? (
                          <img
                            src={prop.image}
                            alt={prop.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-slate-400">
                            <Building2 className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 leading-snug">
                          {prop.name}
                        </p>
                        <p className="text-[10px] text-slate-500 font-medium">
                          {prop.location} • {prop.type}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-black text-slate-900">{prop.price}</p>
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block mt-0.5 ${prop.status === "available"
                            ? "bg-emerald-100 text-emerald-800"
                            : prop.status === "under_construction"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-slate-100 text-slate-700"
                          }`}
                      >
                        {prop.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            {/* Enquiries Tab Content */}
            <TabsContent value="enquiries" className="mt-4 space-y-2.5">
              {agentEnquiries.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed text-slate-400 text-xs">
                  No customer leads received for this agent's properties yet.
                </div>
              ) : (
                agentEnquiries.map((enq) => (
                  <div
                    key={enq._id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-900">{enq.name}</p>
                        <p className="text-[10px] text-slate-500">
                          {enq.mobile} • {enq.email}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${enq.priority === "High"
                              ? "bg-rose-100 text-rose-800"
                              : enq.priority === "Medium"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-slate-100 text-slate-700"
                            }`}
                        >
                          {enq.priority}
                        </span>
                        <span
                          className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${enq.status === "New"
                              ? "bg-sky-100 text-sky-800"
                              : enq.status === "In Progress"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                        >
                          {enq.status}
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-2 text-[11px] text-slate-600">
                      <p className="font-semibold text-slate-800 text-[10px] mb-0.5">
                        Property: {enq.propertyName}
                      </p>
                      <p>"{enq.message}"</p>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
      {/* 5. ALL AGENT LISTINGS MODAL */}
      <Dialog open={isAllListingsOpen} onOpenChange={setIsAllListingsOpen}>
        <DialogContent className="max-w-4xl rounded-3xl p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="h-10 w-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-black text-slate-900">
                      All Agent Property Listings
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-500 mt-0.5">
                      Properties published and managed by registered real estate agents.
                    </DialogDescription>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                <Badge className="bg-purple-100 text-purple-800 border-purple-300 font-extrabold px-3 py-1.5 text-xs">
                  {allAgentPropertiesList.length} Total Properties
                </Badge>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    setPropertyTargetAgent(null);
                    setIsAddPropertyOpen(true);
                  }}
                  className="h-8 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs flex items-center gap-1.5 shadow-xs transition-transform hover:scale-105"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>+ Add Agent Property</span>
                </Button>
              </div>
            </div>
          </DialogHeader>

          {/* Search within listings */}
          <div className="mt-4 flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search properties by title, type, city, or agent name..."
                value={listingSearchTerm}
                onChange={(e) => setListingSearchTerm(e.target.value)}
                className="pl-10 h-10 rounded-xl text-xs"
              />
              {listingSearchTerm && (
                <button
                  onClick={() => setListingSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Properties List / Grid */}
          <div className="mt-4 space-y-3">
            {filteredAgentProperties.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Building2 className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                <p className="font-bold text-sm text-slate-700">No agent properties found</p>
                <p className="text-xs text-slate-400 mt-1">
                  {listingSearchTerm
                    ? `No listings matching "${listingSearchTerm}".`
                    : "No properties have been uploaded by agents yet."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredAgentProperties.map((prop) => (
                  <div
                    key={prop._id}
                    className="p-3.5 rounded-2xl border border-slate-200/90 bg-white hover:border-purple-300 hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-16 w-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
                        {prop.image ? (
                          <img
                            src={prop.image}
                            alt={prop.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-slate-400 bg-slate-50">
                            <Building2 className="h-6 w-6" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                            {String(prop.type || "Property")}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500 flex items-center gap-0.5">
                            <MapPin className="h-2.5 w-2.5" />
                            {String(prop.location || "Tamil Nadu")}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 truncate mt-1">
                          {String(prop.name || "Untitled Property")}
                        </h4>
                        <p className="text-xs font-black text-emerald-700 mt-0.5 font-heading">
                          {String(prop.price || "Price on Request")}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <div className="h-5 w-5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black flex items-center justify-center">
                          {(String(prop.agentName || "A")).charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-slate-800 truncate max-w-[130px]">
                          {String(prop.agentName || "Agent")}
                        </span>
                      </div>
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold">
                        {String(prop.status || "Active")}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* 6. PREMIUM 5-STEP AGENT PROPERTY CREATION MODAL */}
      <AgentPropertyFormDialog
        open={isAddPropertyOpen}
        onOpenChange={setIsAddPropertyOpen}
        targetAgent={propertyTargetAgent}
        onSuccess={(created) => {
          // 1. If currently viewing an agent, update their properties list
          if (selectedAgent && selectedAgent._id === created.agentId) {
            setAgentProperties((prev) => [created, ...prev]);
          }
          // 2. Increment propertiesCount in the agents table
          setAgents((prev) =>
            prev.map((ag) =>
              ag._id === created.agentId
                ? { ...ag, propertiesCount: (ag.propertiesCount || 0) + 1 }
                : ag
            )
          );
          // 3. Refresh live properties if needed
          refreshAgents();
        }}
      />
    </div>
  );
}
