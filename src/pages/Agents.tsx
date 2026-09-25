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
import {
  Agent,
  AgentProperty,
  AgentEnquiry,
  getStoredAgents,
  addStoredAgent,
  updateStoredAgent,
  softDeleteStoredAgent,
  restoreStoredAgent,
  getAgentProperties,
  getAgentEnquiries,
} from "@/data/mockAgentsData";

export default function Agents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

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

  // Load agents on mount
  const refreshAgents = () => {
    const list = getStoredAgents();
    setAgents(list);
  };

  useEffect(() => {
    refreshAgents();
  }, []);

  // Filtered Agents
  const filteredAgents = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return agents.filter((agent) => {
      const matchesSearch =
        !q ||
        agent.name.toLowerCase().includes(q) ||
        agent.email.toLowerCase().includes(q) ||
        agent.mobile.includes(q) ||
        (agent.city && agent.city.toLowerCase().includes(q));

      const matchesStatus =
        statusFilter === "all" || agent.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [agents, searchTerm, statusFilter]);

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

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgent.name.trim() || !newAgent.email.trim() || !newAgent.mobile.trim() || !newAgent.password.trim()) {
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

    const created = addStoredAgent(newAgent);
    refreshAgents();
    setIsAddOpen(false);

    toast({
      title: "Agent Created Successfully",
      description: `${created.name} has been enrolled with the Agent role.`,
    });
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

  const handleEditSubmit = (e: React.FormEvent) => {
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

    updateStoredAgent(selectedAgent._id, editFormData);
    refreshAgents();
    setIsEditOpen(false);

    toast({
      title: "Agent Updated",
      description: `Details for ${editFormData.name} have been updated.`,
    });
  };

  const handleOpenView = (agent: Agent) => {
    setSelectedAgent(agent);
    setAgentProperties(getAgentProperties(agent._id));
    setAgentEnquiries(getAgentEnquiries(agent._id));
    setIsViewOpen(true);
  };

  const handleOpenDelete = (agent: Agent) => {
    setSelectedAgent(agent);
    setIsDeleteOpen(true);
  };

  const handleConfirmSoftDelete = () => {
    if (!selectedAgent) return;
    softDeleteStoredAgent(selectedAgent._id);
    refreshAgents();
    setIsDeleteOpen(false);

    toast({
      title: "Agent Soft Deleted",
      description: `${selectedAgent.name} has been marked as inactive. Historical records remain preserved.`,
    });
  };

  const handleRestoreAgent = (agent: Agent) => {
    restoreStoredAgent(agent._id);
    refreshAgents();
    toast({
      title: "Agent Reactivated",
      description: `${agent.name} is now active and can access their portal.`,
    });
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Real Estate Agents
            </h1>
            <Badge className="bg-amber-100 text-amber-800 border-amber-300 font-bold hover:bg-amber-100">
              Role: AGENT
            </Badge>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Manage agents, monitor individual property portfolios, and handle permissions.
          </p>
        </div>

        <Button
          onClick={handleOpenAdd}
          className="bg-primary hover:bg-primary/95 text-white font-bold rounded-xl shadow-md flex items-center gap-2 px-4 py-2.5 shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Agent</span>
        </Button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Agents */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Agents</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{metrics.total}</p>
          </div>
        </div>

        {/* Active Agents */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Agents</p>
            <p className="text-2xl font-black text-emerald-700 mt-0.5">{metrics.active}</p>
          </div>
        </div>

        {/* Soft Deleted / Inactive */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Soft Deleted / Inactive</p>
            <p className="text-2xl font-black text-amber-700 mt-0.5">{metrics.inactive}</p>
          </div>
        </div>

        {/* Agent Portfolio Total */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Agent Listings</p>
            <p className="text-2xl font-black text-purple-700 mt-0.5">{metrics.totalListings}</p>
          </div>
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
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-full md:w-auto self-stretch md:self-auto">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              statusFilter === "all"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All ({metrics.total})
          </button>
          <button
            onClick={() => setStatusFilter("active")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              statusFilter === "active"
                ? "bg-white text-emerald-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Active ({metrics.active})
          </button>
          <button
            onClick={() => setStatusFilter("inactive")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              statusFilter === "inactive"
                ? "bg-white text-amber-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Soft Deleted ({metrics.inactive})
          </button>
        </div>
      </div>

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
                    <p className="font-bold text-sm text-slate-600">No agents found</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {searchTerm ? `No results for "${searchTerm}"` : "Try adding a new agent above."}
                    </p>
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
                            className={`h-10 w-10 rounded-full flex items-center justify-center font-black text-sm shrink-0 shadow-sm ${
                              isActive
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
                          <span
                            title="Listed Properties"
                            className="inline-flex items-center gap-1 font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg"
                          >
                            <Building2 className="h-3 w-3 text-purple-600" />
                            {agent.propertiesCount || 0}
                          </span>
                          <span
                            title="Customer Leads"
                            className="inline-flex items-center gap-1 font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg"
                          >
                            <MessageCircle className="h-3 w-3 text-blue-600" />
                            {agent.enquiriesCount || 0}
                          </span>
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell className="py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                            isActive
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isActive ? "bg-emerald-500" : "bg-amber-500"
                            }`}
                          />
                          {isActive ? "Active" : "Soft Deleted"}
                        </span>
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
                            className="h-8 w-8 p-0 rounded-lg text-slate-600 hover:text-slate-900 border-slate-200"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>

                          {/* Edit */}
                          <Button
                            variant="outline"
                            size="sm"
                            title="Edit Agent Details"
                            onClick={() => handleOpenEdit(agent)}
                            className="h-8 w-8 p-0 rounded-lg text-blue-600 hover:text-blue-800 border-slate-200"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>

                          {/* Soft Delete or Restore */}
                          {isActive ? (
                            <Button
                              variant="outline"
                              size="sm"
                              title="Soft Delete (Deactivate) Agent"
                              onClick={() => handleOpenDelete(agent)}
                              className="h-8 w-8 p-0 rounded-lg text-rose-600 hover:text-rose-800 border-slate-200 hover:bg-rose-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              title="Restore Agent"
                              onClick={() => handleRestoreAgent(agent)}
                              className="h-8 w-8 p-0 rounded-lg text-emerald-600 hover:text-emerald-800 border-slate-200 hover:bg-emerald-50"
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
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
                placeholder="e.g. ramesh.agent@omsritara.com"
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
                className="bg-primary hover:bg-primary/95 text-white font-bold rounded-xl"
              >
                Create Agent
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
                <option value="inactive">Inactive (Soft Deleted / Suspended)</option>
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
                className="bg-primary hover:bg-primary/95 text-white font-bold rounded-xl"
              >
                Save Changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* 3. SOFT DELETE CONFIRMATION MODAL */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-md rounded-2xl p-6">
          <DialogHeader>
            <div className="h-12 w-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-2">
              <Trash2 className="h-6 w-6" />
            </div>
            <DialogTitle className="text-xl font-extrabold text-slate-900">
              Soft Delete Agent?
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-600 leading-relaxed mt-1">
              Are you sure you want to soft delete <strong>{selectedAgent?.name}</strong>?
            </DialogDescription>
          </DialogHeader>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs text-slate-700">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Soft Delete Guarantee</span>
            </div>
            <p className="text-[11px] text-slate-500">
              • The agent’s assigned properties ({selectedAgent?.propertiesCount || 0}) will remain intact.
            </p>
            <p className="text-[11px] text-slate-500">
              • All customer leads & enquiries ({selectedAgent?.enquiriesCount || 0}) are kept safely.
            </p>
            <p className="text-[11px] text-slate-500">
              • The agent will be marked as <strong>Inactive</strong> and prevented from logging in.
            </p>
            <p className="text-[11px] text-slate-500">
              • You can reactivate this agent anytime with 1 click.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmSoftDelete}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl"
            >
              Confirm Soft Delete
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
                      {selectedAgent?.status === "active" ? "Active" : "Soft Deleted"}
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
            <TabsContent value="properties" className="mt-4 space-y-2.5">
              {agentProperties.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed text-slate-400 text-xs">
                  No properties currently assigned to this agent.
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
                        className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                          prop.status === "available"
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
                          className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            enq.priority === "High"
                              ? "bg-rose-100 text-rose-800"
                              : enq.priority === "Medium"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {enq.priority}
                        </span>
                        <span
                          className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            enq.status === "New"
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
    </div>
  );
}
