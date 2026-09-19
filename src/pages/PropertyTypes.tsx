import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  Plus,
  Edit,
  Trash2,
  Search,
  Sparkles,
  Layers,
  Home,
  CheckCircle2,
  X,
  RefreshCw,
  FolderTree,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { useToast } from "@/hooks/use-toast";
import axiosInstance from "@/lib/axiosInstance";

const PropertyTypes = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Reset form
  const resetForm = () => {
    setEditingType(null);
    setFormData({
      name: "",
      description: "",
    });
  };

  // Open Add Property Type dialog
  const handleAdd = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  // Fetch all property types
  const {
    data: propertyTypes,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ["property-types"],
    queryFn: async () => {
      const res = await axiosInstance.get("/type/property");
      return res.data;
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (newType: { name: string; description: string }) => {
      return axiosInstance.post("/type/property", newType);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["property-types"],
      });
      toast({
        title: "Property Type Created",
        description: "New property category registered successfully.",
      });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Create",
        description: error?.response?.data?.msg || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (updatedType: {
      id: string;
      name: string;
      description: string;
    }) => {
      return axiosInstance.put(`/type/property/${updatedType.id}`, {
        name: updatedType.name,
        description: updatedType.description,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["property-types"],
      });
      toast({
        title: "Property Type Updated",
        description: "Category details updated successfully.",
      });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Update",
        description: error?.response?.data?.msg || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return axiosInstance.delete(`/type/property/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["property-types"],
      });
      toast({
        title: "Property Type Deleted",
        description: "Category removed from system.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Delete",
        description: error?.response?.data?.msg || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  // Submit create/update
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingType) {
      updateMutation.mutate({
        id: editingType._id,
        name: formData.name,
        description: formData.description,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  // Edit Property Type
  const handleEdit = (type: any) => {
    setEditingType(type);
    setFormData({
      name: type.name || "",
      description: type.description || "",
    });
    setIsDialogOpen(true);
  };

  // Delete Property Type
  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this property type?")) {
      deleteMutation.mutate(id);
    }
  };

  // Filter property types with safe string search
  const filteredPropertyTypes = useMemo(() => {
    const list = propertyTypes?.result || [];
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase().trim();
    return list.filter((type: any) => {
      const name = String(type.name || "").toLowerCase();
      const desc = String(type.description || "").toLowerCase();
      return name.includes(q) || desc.includes(q);
    });
  }, [propertyTypes, searchQuery]);

  const totalTypes = propertyTypes?.result?.length || 0;

  return (
    <div className="space-y-7">
      {/* 1. Executive Soft Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-slate-50 to-indigo-50/40 p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 px-3 py-0.5 text-[11px] font-black text-indigo-900 tracking-wide mb-2 shadow-2xs">
              <Sparkles className="h-3 w-3 text-indigo-600" />
              Catalog Architecture
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
              Property Categories & Types
            </h1>
            <p className="mt-1 text-xs font-semibold text-slate-600 max-w-xl">
              Define real estate taxonomies, villa classifications, and asset models used across listings and forms.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="h-10 rounded-2xl border-slate-200 bg-white font-bold text-xs text-slate-700 shadow-xs hover:bg-slate-50 transition"
              title="Refresh property types"
            >
              <RefreshCw
                className={`mr-2 h-3.5 w-3.5 text-slate-600 ${
                  isRefetching ? "animate-spin" : ""
                }`}
              />
              Sync
            </Button>

            <Button
              onClick={handleAdd}
              className="h-10 rounded-2xl bg-gradient-to-r from-primary to-rose-600 px-4 font-black text-xs text-white shadow-md shadow-primary/20 hover:opacity-95"
            >
              <Plus className="mr-1.5 h-4 w-4 stroke-[3]" /> Add Property Type
            </Button>
          </div>
        </div>

        {/* Decorative soft glow */}
        <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-indigo-200/30 blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 h-44 w-44 rounded-full bg-amber-200/20 blur-3xl pointer-events-none" />
      </div>

      {/* 2. Soft Summary KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Total Categories */}
        <div className="overflow-hidden rounded-3xl border border-slate-200/85 bg-white p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-2xs">
              <FolderTree className="h-5 w-5 stroke-[2.5]" />
            </div>
            <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-indigo-700 border border-indigo-200/60">
              Taxonomy
            </span>
          </div>
          <p className="text-[11px] font-black uppercase tracking-wider text-slate-500">
            Total Categories
          </p>
          <h3 className="mt-1 text-3xl font-black text-slate-950 tracking-tight">
            {isLoading ? "—" : totalTypes}
          </h3>
        </div>

        {/* Active Filter Results */}
        <div className="overflow-hidden rounded-3xl border border-slate-200/85 bg-white p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-2xs">
              <CheckCircle2 className="h-5 w-5 stroke-[2.5]" />
            </div>
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-700 border border-emerald-200/60">
              Matches
            </span>
          </div>
          <p className="text-[11px] font-black uppercase tracking-wider text-slate-500">
            Visible Types
          </p>
          <h3 className="mt-1 text-3xl font-black text-slate-950 tracking-tight">
            {isLoading ? "—" : filteredPropertyTypes.length}
          </h3>
        </div>

        {/* Architecture Status */}
        <div className="overflow-hidden rounded-3xl border border-slate-200/85 bg-white p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 shadow-2xs">
              <Building2 className="h-5 w-5 stroke-[2.5]" />
            </div>
            <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-sky-700 border border-sky-200/60">
              Classification
            </span>
          </div>
          <p className="text-[11px] font-black uppercase tracking-wider text-slate-500">
            Form Ready
          </p>
          <h3 className="mt-1 text-3xl font-black text-slate-950 tracking-tight">
            Live
          </h3>
        </div>
      </div>

      {/* 3. Search & Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search property types by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-9 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-primary focus:outline-none transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearchQuery("")}
            className="h-10 rounded-xl font-bold text-xs text-rose-600 hover:bg-rose-50"
          >
            Clear Search
          </Button>
        )}
      </div>

      {/* 4. Property Types Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-200/85 bg-white shadow-xs">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-black text-slate-950">Property Classifications</h2>
            <span className="rounded-full bg-slate-100 text-slate-800 text-[11px] font-black px-2.5 py-0.5 border border-slate-200/70">
              {filteredPropertyTypes.length} {filteredPropertyTypes.length === 1 ? "Type" : "Types"}
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-500 hidden sm:block">
            Used as categories when adding or filtering properties
          </p>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/75">
              <TableRow className="border-b border-slate-200/80 hover:bg-transparent">
                {/* Generous left padding to decouple from corner */}
                <TableHead className="pl-7 pr-4 py-3.5 text-[11px] font-black uppercase tracking-wider text-slate-600">
                  Category Name
                </TableHead>
                <TableHead className="px-4 py-3.5 text-[11px] font-black uppercase tracking-wider text-slate-600">
                  Description
                </TableHead>
                <TableHead className="px-5 py-3.5 text-[11px] font-black uppercase tracking-wider text-slate-600 text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-slate-100">
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-40 text-center text-sm font-bold text-slate-500">
                    Loading property types...
                  </TableCell>
                </TableRow>
              ) : filteredPropertyTypes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-44 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-slate-500">
                      <FolderTree className="h-8 w-8 text-slate-300 stroke-[1.5]" />
                      <p className="text-sm font-bold text-slate-700">
                        No property types found
                      </p>
                      <p className="text-xs text-slate-500">
                        {searchQuery
                          ? "Try a different search keyword."
                          : "Get started by adding your first property type."}
                      </p>
                      {searchQuery ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSearchQuery("")}
                          className="mt-1 rounded-xl font-bold text-xs"
                        >
                          Clear Search
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={handleAdd}
                          className="mt-1 rounded-xl font-black text-xs bg-primary text-white"
                        >
                          <Plus className="mr-1 h-3.5 w-3.5" /> Add Type
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredPropertyTypes.map((type: any) => (
                  <TableRow
                    key={type._id}
                    className="transition-colors hover:bg-slate-50/70 group"
                  >
                    {/* First column with generous pl-7 breathing room away from the left corner */}
                    <TableCell className="pl-7 pr-4 py-4 font-medium">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700 font-black border border-indigo-200/60 shadow-2xs group-hover:scale-105 transition-transform">
                          <Building2 className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-black text-slate-950 text-sm tracking-tight">
                            {type.name}
                          </p>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Property Classification
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="px-4 py-4">
                      <p className="text-xs font-semibold text-slate-600 max-w-xl leading-relaxed">
                        {type.description || "No description provided for this category."}
                      </p>
                    </TableCell>

                    <TableCell className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Edit Property Type"
                          onClick={() => handleEdit(type)}
                          className="h-8.5 w-8.5 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-slate-100"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          title="Delete Property Type"
                          onClick={() => handleDelete(type._id)}
                          className="h-8.5 w-8.5 rounded-xl text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* 5. Modern Add / Edit Dialog */}
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            resetForm();
          }
        }}
      >
        <DialogContent className="sm:max-w-md rounded-3xl p-6 border border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-slate-950">
              {editingType ? "Edit Property Type" : "Add New Property Type"}
            </DialogTitle>
            <DialogDescription className="text-xs font-semibold text-slate-600">
              {editingType
                ? "Update category name and classification details."
                : "Create a new property category for listings."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-1">
              <Label htmlFor="name" className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
                Type Name *
              </Label>
              <Input
                id="name"
                placeholder="e.g. Luxury Villa, Commercial Plot, Penthouse"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                required
                className="h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-900 focus:border-primary"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="desc" className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
                Description *
              </Label>
              <Input
                id="desc"
                placeholder="Brief description of this category..."
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                required
                className="h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-900 focus:border-primary"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  resetForm();
                }}
                className="rounded-xl font-bold text-xs border-slate-300 text-slate-700"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                className="rounded-xl font-black text-xs bg-primary text-white shadow-sm shadow-primary/25"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending
                  ? "Saving..."
                  : editingType
                  ? "Update Category"
                  : "Create Category"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PropertyTypes;