import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Building2,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  MapPin,
  Sparkles,
  LayoutGrid,
  Table as TableIcon,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  Tag,
  X,
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
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import axiosInstance from "@/lib/axiosInstance";
import { useAuth } from "@/context/AuthContext";
import { PropertyFormDialog } from "@/components/properties/form/PropertyFormDialog";
import { usePropertyFormState } from "@/components/properties/usePropertyFormState";
import { getAllLocalDrafts, removeLocalDraft } from "@/utils/propertyDraftStorage";

export default function AgentProperties() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { userData, currentAgent } = useAuth();
  const currentAgentId =
    userData?._id ||
    currentAgent?._id ||
    localStorage.getItem("ost_agent_id");

  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(() => {
    const s = searchParams.get("status");
    return s && s !== "all" ? s : "available";
  });

  useEffect(() => {
    const s = searchParams.get("status");
    if (s && s !== "all") {
      setStatusFilter(s);
    }
  }, [searchParams]);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Delete Dialog
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Quick View Dialog
  const [selectedProperty, setSelectedProperty] = useState<any | null>(null);

  // 5-Step Guided Form State & Modal
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const formState = usePropertyFormState({
    isOpen: isFormModalOpen,
    initialAgentId: currentAgentId,
    initialAgentName: currentAgent?.name || userData?.name,
    onSuccess: (savedObj?: any) => {
      setIsFormModalOpen(false);
      if (savedObj?.status === "draft") {
        setStatusFilter("draft");
      } else {
        setStatusFilter("available");
      }
      fetchMyProperties();
    },
  });

  const fetchMyProperties = async () => {
    setIsLoading(true);
    try {
      let myProps: any[] = [];
      try {
        const res = await axiosInstance.get("/property", {
          params: currentAgentId ? { created_by: currentAgentId } : undefined,
          skipAuthRedirect: true,
        } as any);
        const list =
          res.data?.result ||
          res.data?.data ||
          (Array.isArray(res.data) ? res.data : []);
        const allProps = Array.isArray(list) ? list : [];

        // Strict Zero-Trust Client-Side Scoping:
        // Show ONLY properties created by THIS agent
        myProps = currentAgentId
          ? allProps.filter((p: any) => {
              const ownerId = p.created_by?._id || p.created_by;
              return String(ownerId) === String(currentAgentId);
            })
          : allProps;
      } catch (apiErr: any) {
        console.warn("Could not fetch server properties, loading local drafts:", apiErr);
      }

      // Collect all local drafts (stored in localStorage)
      const allDrafts = getAllLocalDrafts();
      const scopedDrafts = allDrafts.filter((d) => {
        if (!currentAgentId) return true;
        if (d.draftId === `agent_${currentAgentId}` || d.draftId === "new") return true;
        if (d.formData?.agent_id && String(d.formData.agent_id) === String(currentAgentId)) return true;
        return !d.draftId.startsWith("agent_") || d.draftId === `agent_${currentAgentId}`;
      });

      const localDraftProperties = scopedDrafts.map((d) => {
        const f = d.formData || ({} as any);
        return {
          _id: d.propertyId || `local_draft_${d.draftId}`,
          name: d.name || f.name || "Untitled Property Draft",
          type: f.type || "Apartment",
          price: f.price ? Number(f.price) : 0,
          location: {
            city: f.city || "Draft City",
            area: f.area || "",
            address: f.address || "",
            state: f.state || "Tamil Nadu",
            country: f.country || "India",
            pincode: f.pincode || "",
          },
          status: "draft",
          listing_type: f.listing_type || "sale",
          area_size: f.area_size || 0,
          area_unit: f.area_unit || "sqft",
          image_url: Array.isArray(f.image_url) ? f.image_url : [],
          created_by: currentAgentId,
          createdAt: d.lastSavedAt || new Date(d.timestamp).toISOString(),
          updatedAt: d.lastSavedAt || new Date(d.timestamp).toISOString(),
          isLocalDraft: true,
          localDraftId: d.draftId,
          localDraftData: d,
        };
      });

      // Avoid duplicates: if server already returned a property that has local draft ID
      const localPropIds = new Set(scopedDrafts.map((d) => d.propertyId).filter(Boolean));
      const remainingServerProps = myProps.filter((p: any) => !localPropIds.has(p._id));

      setProperties([...localDraftProperties, ...remainingServerProps]);
    } catch (err: any) {
      toast({
        title: "Error Loading Properties",
        description: err.response?.data?.msg || err.message || "Failed to load listings.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProperties();
    // Auto-open modal if navigated with ?action=add
    const params = new URLSearchParams(window.location.search);
    if (params.get("action") === "add") {
      formState.resetForm();
      setIsFormModalOpen(true);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [currentAgentId]);

  const handleOpenAdd = () => {
    formState.resetForm();
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = async (prop: any) => {
    await formState.populateForEdit(prop);
    setIsFormModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      // Discard formState draft so it never re-saves
      formState.handleDiscardDraft();

      if (deleteId.startsWith("local_draft_") || deleteId.startsWith("agent_") || deleteId === "new") {
        const cleanKey = deleteId.replace("local_draft_", "");
        removeLocalDraft(cleanKey);
        removeLocalDraft(deleteId);
        removeLocalDraft("new");
        if (currentAgentId) removeLocalDraft(`agent_${currentAgentId}`);
        toast({
          title: "Draft Deleted",
          description: "Local draft listing removed successfully.",
        });
        setDeleteId(null);
        await fetchMyProperties();
        return;
      }
      removeLocalDraft(deleteId);
      removeLocalDraft("new");
      if (currentAgentId) removeLocalDraft(`agent_${currentAgentId}`);
      await axiosInstance.delete(`/property/${deleteId}`, { skipAuthRedirect: true } as any);
      toast({
        title: "Property Deleted",
        description: "The property listing has been removed successfully.",
      });
      setDeleteId(null);
      await fetchMyProperties();
    } catch (err: any) {
      toast({
        title: "Delete Failed",
        description: err.response?.data?.msg || err.message || "Could not delete property.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredProperties = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return properties.filter((p) => {
      const matchesSearch =
        !q ||
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.location?.city && p.location.city.toLowerCase().includes(q)) ||
        (p.location?.area && p.location.area.toLowerCase().includes(q));

      const matchesStatus = p.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [properties, searchTerm, statusFilter]);

  const handlePublish = async (propertyId: string) => {
    const targetProp = properties.find((p) => p._id === propertyId);
    if (!targetProp) return;

    // Direct publish for local drafts
    if (targetProp.isLocalDraft) {
      const f = targetProp.localDraftData?.formData || {};
      // If essential basic fields are missing, open the modal for agent
      if (!f.name?.trim() || !f.city?.trim()) {
        await formState.populateForEdit(targetProp);
        setIsFormModalOpen(true);
        toast({
          title: "Complete Property Details",
          description: "Please enter property name and city location to publish.",
        });
        return;
      }

      try {
        const payload: any = {
          name: f.name.trim(),
          listing_type: f.listing_type || "sale",
          description: f.description?.trim() || undefined,
          location: {
            country: f.country?.trim() || "India",
            state: f.state?.trim() || "Tamil Nadu",
            city: f.city?.trim() || "Chennai",
            area: f.area?.trim() || "",
            address: f.address?.trim() || "",
            pincode: f.pincode?.trim() || undefined,
          },
          area_size: f.area_size ? Number(f.area_size) : 1,
          area_unit: f.area_unit || "sqft",
          price: f.price ? Number(f.price) : 0,
          image_url: Array.isArray(f.image_url) ? f.image_url : [],
          status: "available",
        };
        if (f.type) {
          payload.type = typeof f.type === "object" ? f.type._id : f.type;
        } else if (formState.propertyTypes && formState.propertyTypes.length > 0) {
          payload.type = formState.propertyTypes[0]._id;
        }

        if (currentAgentId && /^[0-9a-fA-F]{24}$/.test(currentAgentId)) {
          payload.created_by = currentAgentId;
        }

        try {
          await axiosInstance.post("/property", payload, { skipAuthRedirect: true } as any);
        } catch (postErr: any) {
          const errMsg = String(postErr?.response?.data?.msg || postErr?.response?.data?.message || "");
          if (errMsg.includes("created_by") && payload.created_by) {
            delete payload.created_by;
            await axiosInstance.post("/property", payload, { skipAuthRedirect: true } as any);
          } else {
            throw postErr;
          }
        }

        // Clean up from localStorage
        removeLocalDraft(targetProp.localDraftId || targetProp._id);
        removeLocalDraft("new");
        if (currentAgentId) removeLocalDraft(`agent_${currentAgentId}`);

        toast({
          title: "Draft Published Successfully!",
          description: `"${payload.name}" is now live under Available listings.`,
        });
        setStatusFilter("available");
        await fetchMyProperties();
        return;
      } catch (err: any) {
        console.warn("Direct publish failed, opening form modal:", err);
        await formState.populateForEdit(targetProp);
        setIsFormModalOpen(true);
        toast({
          title: "Details Needed to Publish",
          description: err.response?.data?.msg || "Please review and complete required details to publish.",
          variant: "destructive",
        });
        return;
      }
    }

    // Direct publish for server drafts
    try {
      try {
        await axiosInstance.put(
          `/property/${propertyId}/publish`,
          { status: "available" },
          { skipAuthRedirect: true } as any
        );
      } catch (e) {
        await axiosInstance.put(
          `/property/${propertyId}`,
          { status: "available" },
          { skipAuthRedirect: true } as any
        );
      }
      removeLocalDraft(propertyId);
      toast({
        title: "Draft Published Successfully!",
        description: "The property has been published and is now live under Available listings.",
      });
      setStatusFilter("available");
      await fetchMyProperties();
    } catch (err: any) {
      toast({
        title: "Publish Failed",
        description: err.response?.data?.msg || err.message || "Failed to publish property.",
        variant: "destructive",
      });
    }
  };

  const counts = useMemo(() => {
    return {
      all: properties.length,
      available: properties.filter((p) => p.status === "available").length,
      under_construction: properties.filter(
        (p) => p.status === "under_construction"
      ).length,
      sold: properties.filter((p) => p.status === "sold").length,
      draft: properties.filter((p) => p.status === "draft").length,
    };
  }, [properties]);

  return (
    <div className="space-y-6 p-1 sm:p-2 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold mb-1.5">
            <Sparkles className="h-3 w-3 text-amber-600" />
            Agent Listings
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 font-heading tracking-tight">
            My Properties
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Manage your personal real estate portfolio and showcase properties to clients.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleOpenAdd}
            className="rounded-2xl bg-primary hover:bg-primary/95 text-white font-black shadow-lg shadow-primary/25 h-11 px-5"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Property
          </Button>
          <Button
            variant="outline"
            onClick={fetchMyProperties}
            disabled={isLoading}
            className="rounded-2xl border-slate-200 text-slate-700 font-bold h-11"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </div>

      {/* 4 Status Metric Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">

        {/* Available Listings */}
        <div
          onClick={() => setStatusFilter("available")}
          className={`rounded-3xl bg-gradient-to-br from-white via-emerald-50/30 to-teal-50/50 p-4 sm:p-5 border transition-all duration-200 cursor-pointer ${
            statusFilter === "available"
              ? "border-emerald-500 ring-2 ring-emerald-500/20 shadow-md"
              : "border-emerald-100/80 shadow-xs hover:shadow-md"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              Available
            </span>
            <div className="h-9 w-9 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-2xs">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-950 font-heading">
              {counts.available}
            </span>
            <span className="text-[11px] font-semibold text-emerald-600">
              active on site
            </span>
          </div>
        </div>

        {/* Under Construction */}
        <div
          onClick={() => setStatusFilter("under_construction")}
          className={`rounded-3xl bg-gradient-to-br from-white via-amber-50/30 to-orange-50/50 p-4 sm:p-5 border transition-all duration-200 cursor-pointer ${
            statusFilter === "under_construction"
              ? "border-amber-500 ring-2 ring-amber-500/20 shadow-md"
              : "border-amber-100/80 shadow-xs hover:shadow-md"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
              Under Dev
            </span>
            <div className="h-9 w-9 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-2xs">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-amber-950 font-heading">
              {counts.under_construction}
            </span>
            <span className="text-[11px] font-semibold text-amber-600">
              ongoing projects
            </span>
          </div>
        </div>

        {/* Draft Listings */}
        <div
          onClick={() => setStatusFilter("draft")}
          className={`rounded-3xl bg-gradient-to-br from-white via-purple-50/30 to-indigo-50/50 p-4 sm:p-5 border transition-all duration-200 cursor-pointer ${
            statusFilter === "draft"
              ? "border-purple-500 ring-2 ring-purple-500/20 shadow-md"
              : "border-purple-100/80 shadow-xs hover:shadow-md"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-800 uppercase tracking-wider">
              Drafts
            </span>
            <div className="h-9 w-9 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shadow-2xs">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-purple-950 font-heading">
              {counts.draft}
            </span>
            <span className="text-[11px] font-semibold text-purple-600">
              in progress
            </span>
          </div>
        </div>

        {/* Sold Listings */}
        <div
          onClick={() => setStatusFilter("sold")}
          className={`rounded-3xl bg-gradient-to-br from-white via-rose-50/30 to-pink-50/50 p-4 sm:p-5 border transition-all duration-200 cursor-pointer ${
            statusFilter === "sold"
              ? "border-rose-500 ring-2 ring-rose-500/20 shadow-md"
              : "border-rose-100/80 shadow-xs hover:shadow-md"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">
              Sold Out
            </span>
            <div className="h-9 w-9 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shadow-2xs">
              <Tag className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-rose-950 font-heading">
              {counts.sold}
            </span>
            <span className="text-[11px] font-semibold text-rose-600">
              completed deals
            </span>
          </div>
        </div>
      </div>

      {/* Controls: Search, Filters & View Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-3xl bg-white p-4 border border-slate-200/80 shadow-xs">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 h-4 w-4 text-slate-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Search properties by title, area, city..."
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

        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setStatusFilter("available")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === "available"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            }`}
          >
            Available ({counts.available})
          </button>
          <button
            onClick={() => setStatusFilter("under_construction")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === "under_construction"
                ? "bg-amber-600 text-white shadow-xs"
                : "bg-amber-50 text-amber-700 hover:bg-amber-100"
            }`}
          >
            Under Construction ({counts.under_construction})
          </button>
          <button
            onClick={() => setStatusFilter("draft")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === "draft"
                ? "bg-purple-600 text-white shadow-xs"
                : "bg-purple-50 text-purple-700 hover:bg-purple-100"
            }`}
          >
            Drafts ({counts.draft})
          </button>
          <button
            onClick={() => setStatusFilter("sold")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === "sold"
                ? "bg-rose-600 text-white shadow-xs"
                : "bg-rose-50 text-rose-700 hover:bg-rose-100"
            }`}
          >
            Sold ({counts.sold})
          </button>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 rounded-2xl bg-slate-100 p-1 border border-slate-200 self-start md:self-auto">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-xl transition-all ${
              viewMode === "grid"
                ? "bg-white text-slate-900 shadow-xs font-bold"
                : "text-slate-500 hover:text-slate-900"
            }`}
            title="Grid View"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`p-1.5 rounded-xl transition-all ${
              viewMode === "table"
                ? "bg-white text-slate-900 shadow-xs font-bold"
                : "text-slate-500 hover:text-slate-900"
            }`}
            title="Table View"
          >
            <TableIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content Rendering: Grid vs Table */}
      {filteredProperties.length === 0 ? (
        <div className="rounded-3xl bg-white p-12 text-center border border-slate-200 shadow-sm">
          <Building2 className="mx-auto h-12 w-12 text-slate-300 mb-3" />
          <h3 className="text-base font-black text-slate-800">
            No Properties Found
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchTerm
              ? "No listings match your search query."
              : `No properties found in ${statusFilter.replace(/_/g, " ")}. Click below to add a property.`}
          </p>
          <Button
            onClick={handleOpenAdd}
            className="mt-4 rounded-2xl bg-primary text-white font-bold text-xs"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Add Property Now
          </Button>
        </div>
      ) : viewMode === "grid" ? (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProperties.map((property) => (
            <div
              key={property._id}
              className="group overflow-hidden rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col"
            >
              {/* Image banner */}
              <div className="relative aspect-video w-full bg-slate-100 overflow-hidden">
                {property.image_url?.[0] ? (
                  <img
                    src={property.image_url[0]}
                    alt={property.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-slate-400">
                    <Building2 className="h-12 w-12" />
                  </div>
                )}
                {/* Status Badge */}
                <Badge
                  className={`absolute top-3 left-3 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-xs ${
                    property.status === "available"
                      ? "bg-emerald-600 text-white"
                      : property.status === "sold"
                      ? "bg-rose-600 text-white"
                      : property.status === "draft"
                      ? "bg-purple-600 text-white"
                      : "bg-amber-600 text-white"
                  }`}
                >
                  {property.status?.replace(/_/g, " ") || "Available"}
                </Badge>
              </div>

              {/* Body */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-heading font-black text-slate-900 text-sm leading-snug line-clamp-1">
                    {property.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mt-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">
                      {property.location?.area
                        ? `${property.location.area}, ${property.location.city || "Chennai"}`
                        : property.location?.city || "Chennai"}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      Price
                    </span>
                    <p className="text-sm font-black text-primary font-heading">
                      ₹
                      {property.price
                        ? Number(property.price).toLocaleString("en-IN")
                        : "Price on Request"}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {property.status === "draft" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePublish(property._id)}
                        className="h-8 w-8 p-0 rounded-xl text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                        title="Publish Draft"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEdit(property)}
                      className="h-8 w-8 p-0 rounded-xl text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      title="Edit Property"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedProperty(property)}
                      className="h-8 w-8 p-0 rounded-xl text-slate-600 hover:text-slate-900"
                      title="Quick View"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteId(property._id)}
                      className="h-8 w-8 p-0 rounded-xl text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                      title="Delete Property"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="rounded-3xl bg-white border border-slate-200/90 shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow>
                <TableHead className="text-xs font-black text-slate-700">
                  Property
                </TableHead>
                <TableHead className="text-xs font-black text-slate-700">
                  Location
                </TableHead>
                <TableHead className="text-xs font-black text-slate-700">
                  Price
                </TableHead>
                <TableHead className="text-xs font-black text-slate-700">
                  Status
                </TableHead>
                <TableHead className="text-xs font-black text-slate-700 text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProperties.map((prop) => (
                <TableRow key={prop._id} className="hover:bg-slate-50/70">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                        {prop.image_url?.[0] ? (
                          <img
                            src={prop.image_url[0]}
                            alt={prop.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Building2 className="h-full w-full p-2 text-slate-400" />
                        )}
                      </div>
                      <span className="font-bold text-xs text-slate-900">
                        {prop.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-slate-600">
                    {prop.location?.area || prop.location?.city || "Chennai"}
                  </TableCell>
                  <TableCell className="text-xs font-black text-primary font-heading">
                    ₹
                    {prop.price
                      ? Number(prop.price).toLocaleString("en-IN")
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                        prop.status === "available"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : prop.status === "sold"
                          ? "bg-rose-50 text-rose-700 border-rose-200"
                          : prop.status === "draft"
                          ? "bg-purple-50 text-purple-700 border-purple-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {prop.status?.replace(/_/g, " ") || "Available"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {prop.status === "draft" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePublish(prop._id)}
                          className="h-8 w-8 p-0 rounded-xl text-emerald-600 hover:bg-emerald-50"
                          title="Publish Draft"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEdit(prop)}
                        className="h-8 w-8 p-0 rounded-xl text-blue-600 hover:bg-blue-50"
                        title="Edit Property"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedProperty(prop)}
                        className="h-8 w-8 p-0 rounded-xl text-slate-600"
                        title="Quick View"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteId(prop._id)}
                        className="h-8 w-8 p-0 rounded-xl text-rose-600 hover:bg-rose-50"
                        title="Delete Property"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={Boolean(deleteId)}
        onOpenChange={(val) => !val && setDeleteId(null)}
      >
        <DialogContent className="max-w-sm rounded-3xl p-6">
          <DialogHeader>
            <div className="h-12 w-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-2 mx-auto">
              <Trash2 className="h-6 w-6" />
            </div>
            <DialogTitle className="text-center font-heading font-black text-lg">
              Delete Property Listing?
            </DialogTitle>
            <DialogDescription className="text-center text-xs text-slate-500">
              This will remove the property listing from your portfolio. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
              className="flex-1 rounded-2xl font-bold text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
              className="flex-1 rounded-2xl font-bold text-xs"
            >
              {isDeleting ? "Deleting..." : "Yes, Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quick View Dialog */}
      <Dialog
        open={Boolean(selectedProperty)}
        onOpenChange={(val) => !val && setSelectedProperty(null)}
      >
        {selectedProperty && (
          <DialogContent className="max-w-md rounded-3xl p-6">
            <div className="space-y-4">
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-100">
                {selectedProperty.image_url?.[0] ? (
                  <img
                    src={selectedProperty.image_url[0]}
                    alt={selectedProperty.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Building2 className="h-full w-full p-8 text-slate-300" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-black font-heading text-slate-900">
                  {selectedProperty.name}
                </h3>
                <p className="text-xs text-slate-500 font-semibold mt-1">
                  {selectedProperty.location?.address},{" "}
                  {selectedProperty.location?.area},{" "}
                  {selectedProperty.location?.city}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 font-bold block text-[10px]">
                    PRICE
                  </span>
                  <span className="font-black text-primary text-sm font-heading">
                    ₹
                    {selectedProperty.price
                      ? Number(selectedProperty.price).toLocaleString("en-IN")
                      : "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px]">
                    STATUS
                  </span>
                  <span className="font-bold text-slate-800 capitalize">
                    {selectedProperty.status?.replace(/_/g, " ") || "Available"}
                  </span>
                </div>
              </div>
              <Button
                onClick={() => setSelectedProperty(null)}
                className="w-full rounded-2xl font-black bg-slate-900 text-white"
              >
                Close
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* 5-Step Guided Property Form Popup Modal (Create & Edit) */}
      <PropertyFormDialog
        open={isFormModalOpen}
        onOpenChange={setIsFormModalOpen}
        editingProperty={formState.editingProperty}
        formData={formState.formData}
        formActiveTab={formState.formActiveTab}
        setFormActiveTab={formState.setFormActiveTab}
        handleSubmit={(e) =>
          formState.handleSubmit(e, currentAgentId, currentAgent?.name || userData?.name)
        }
        handleSaveDraft={() =>
          formState.handleSaveDraft(currentAgentId, currentAgent?.name || userData?.name)
        }
        autoSaveStatus={formState.autoSaveStatus}
        lastSavedTime={formState.lastSavedTime}
        isRestoredDraft={formState.isRestoredDraft}
        onDiscardDraft={() => {
          formState.handleDiscardDraft();
          fetchMyProperties();
        }}
        hasUnsavedChanges={formState.hasUnsavedChanges}
        handleInputChange={formState.handleInputChange}
        handleLocationChange={formState.handleLocationChange}
        handlePropertyTypeChange={formState.handlePropertyTypeChange}
        propertyTypes={formState.propertyTypes}
        propertyTypeFields={formState.propertyTypeFields}
        handleImageUpload={formState.handleImageUpload}
        removeImage={formState.removeImage}
        imageUploading={formState.imageUploading}
        loading={formState.loading}
        resetForm={formState.resetForm}
        amenities={formState.amenities}
        amenityTypes={formState.amenityTypes}
        selectedAmenity={formState.selectedAmenity}
        selectedAmenityTypes={formState.selectedAmenityTypes}
        setSelectedAmenityTypes={formState.setSelectedAmenityTypes}
        amenityDropdownOpen={formState.amenityDropdownOpen}
        setAmenityDropdownOpen={formState.setAmenityDropdownOpen}
        handleAmenitySelect={formState.handleAmenitySelect}
        toggleAmenityType={formState.toggleAmenityType}
        addAmenity={formState.addAmenity}
        editingAmenityIndex={formState.editingAmenityIndex}
        getAmenityTypeName={formState.getAmenityTypeName}
        getAmenityName={formState.getAmenityName}
        removeAmenityType={formState.removeAmenityType}
        viewAmenity={formState.viewAmenity}
        editAmenity={formState.editAmenity}
        removeAmenity={formState.removeAmenity}
        addNearbyPlace={formState.addNearbyPlace}
        updateNearbyPlace={formState.updateNearbyPlace}
        removeNearbyPlace={formState.removeNearbyPlace}
      />
    </div>
  );
}
