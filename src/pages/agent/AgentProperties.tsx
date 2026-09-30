import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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

export default function AgentProperties() {
  const navigate = useNavigate();
  const { userData, currentAgent } = useAuth();
  const currentAgentId =
    userData?._id ||
    currentAgent?._id ||
    localStorage.getItem("ost_agent_id");

  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Delete Dialog
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Quick View Dialog
  const [selectedProperty, setSelectedProperty] = useState<any | null>(null);

  // 5-Step Guided Form State & Modal
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const formState = usePropertyFormState({
    initialAgentId: currentAgentId,
    initialAgentName: currentAgent?.name || userData?.name,
    onSuccess: () => {
      setIsFormModalOpen(false);
      fetchMyProperties();
    },
  });

  const fetchMyProperties = async () => {
    setIsLoading(true);
    try {
      const res = await axiosInstance.get("/property", {
        params: currentAgentId ? { created_by: currentAgentId } : undefined,
      });
      const list =
        res.data?.result ||
        res.data?.data ||
        (Array.isArray(res.data) ? res.data : []);
      const allProps = Array.isArray(list) ? list : [];

      // Strict Zero-Trust Client-Side Scoping:
      // Show ONLY properties created by THIS agent
      const myProps = currentAgentId
        ? allProps.filter((p: any) => {
            const ownerId = p.created_by?._id || p.created_by;
            return String(ownerId) === String(currentAgentId);
          })
        : allProps;

      setProperties(myProps);
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
      await axiosInstance.delete(`/property/${deleteId}`);
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

      const matchesStatus =
        statusFilter === "all" || p.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [properties, searchTerm, statusFilter]);

  const counts = useMemo(() => {
    return {
      all: properties.length,
      available: properties.filter((p) => p.status === "available").length,
      under_construction: properties.filter(
        (p) => p.status === "under_construction"
      ).length,
      sold: properties.filter((p) => p.status === "sold").length,
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

      {/* 4 Soft Metric Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Total Listings */}
        <div className="rounded-3xl bg-gradient-to-br from-white via-sky-50/30 to-blue-50/50 p-4 sm:p-5 border border-sky-100/80 shadow-xs hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Portfolio
            </span>
            <div className="h-9 w-9 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center shadow-2xs">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
              {counts.all}
            </span>
            <span className="text-[11px] font-semibold text-slate-400">
              listings
            </span>
          </div>
        </div>

        {/* Available Listings */}
        <div className="rounded-3xl bg-gradient-to-br from-white via-emerald-50/30 to-teal-50/50 p-4 sm:p-5 border border-emerald-100/80 shadow-xs hover:shadow-md transition-all duration-200">
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
        <div className="rounded-3xl bg-gradient-to-br from-white via-amber-50/30 to-orange-50/50 p-4 sm:p-5 border border-amber-100/80 shadow-xs hover:shadow-md transition-all duration-200">
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

        {/* Sold Listings */}
        <div className="rounded-3xl bg-gradient-to-br from-white via-rose-50/30 to-pink-50/50 p-4 sm:p-5 border border-rose-100/80 shadow-xs hover:shadow-md transition-all duration-200">
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
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search your properties by title, area, city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10 rounded-2xl border-slate-200 text-xs font-medium"
          />
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === "all"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All ({counts.all})
          </button>
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
            {searchTerm || statusFilter !== "all"
              ? "No listings match your current filters. Try resetting search."
              : "You haven't added any properties yet. Click below to add your first property."}
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
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {prop.status?.replace(/_/g, " ") || "Available"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
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
