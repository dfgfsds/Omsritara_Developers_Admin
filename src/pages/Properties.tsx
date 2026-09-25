import React, { useEffect, useState, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import axiosInstance from "@/lib/axiosInstance";
import {
  Plus,
  Building2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sparkles,
  CloudOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

import {
  Property,
  PropertyType,
  Amenity,
  AmenityType,
  PropertyFormData,
  FormAmenityData,
  FormNearbyPlace,
  Stats,
} from "@/components/properties/types";
import { emptyFormData } from "@/components/properties/constants";
import { PropertyStatsCards } from "@/components/properties/PropertyStatsCards";
import { PropertyFilters } from "@/components/properties/PropertyFilters";
import { PropertyCard } from "@/components/properties/PropertyCard";
import { PropertyTable } from "@/components/properties/PropertyTable";
import { PropertyQuickViewDialog } from "@/components/properties/PropertyQuickViewDialog";
import { PropertyDeleteDialog } from "@/components/properties/PropertyDeleteDialog";
import { AmenityDetailsDialog } from "@/components/properties/AmenityDetailsDialog";
import { PropertyFormDialog } from "@/components/properties/form/PropertyFormDialog";
import {
  saveLocalDraft,
  getLocalDraft,
  removeLocalDraft,
  getLatestActiveDraft,
  formatDraftTime,
  isFormDirtyOrHasContent,
  StoredPropertyDraft,
} from "@/utils/propertyDraftStorage";
import { useAuth } from "@/context/AuthContext";
import { getAgentProperties } from "@/data/mockAgentsData";

const propertyStatusCycle: Record<
  string,
  "available" | "under_construction" | "sold"
> = {
  available: "under_construction",
  under_construction: "sold",
  sold: "available",
};

const str = (v: any) => (v !== undefined && v !== null ? String(v) : "");

const Properties = () => {
  const { role, isAgent, isAdmin, currentAgent } = useAuth();
  const [searchParams] = useSearchParams();
  const urlSearch = searchParams.get("search") || searchParams.get("q") || "";

  const [properties, setProperties] = useState<Property[]>([]);
  const [isDraftView, setIsDraftView] = useState(false);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    available: 0,
    sold: 0,
    underConstruction: 0,
    featured: 0,
    verified: 0,
  });
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [amenityTypes, setAmenityTypes] = useState<AmenityType[]>([]);
  const [allAmenities, setAllAmenities] = useState<any[]>([]);
  const [amenityTypeCache, setAmenityTypeCache] = useState<
    Record<string, AmenityType[]>
  >({});
  const [selectedAmenity, setSelectedAmenity] = useState("");
  const [selectedAmenityTypes, setSelectedAmenityTypes] = useState<string[]>(
    []
  );
  const [amenityDropdownOpen, setAmenityDropdownOpen] = useState(false);
  const [amenityDetailsOpen, setAmenityDetailsOpen] = useState(false);
  const [viewingAmenity, setViewingAmenity] =
    useState<FormAmenityData | null>(null);
  const [editingAmenityIndex, setEditingAmenityIndex] = useState<number | null>(
    null
  );

  const [formData, setFormData] =
    useState<PropertyFormData>(emptyFormData);
  const [formActiveTab, setFormActiveTab] = useState("basic");
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [open, setOpen] = useState(false);

  // Auto-save & Draft Recovery state
  const [autoSaveStatus, setAutoSaveStatus] = useState<
    "saved" | "saving" | "local" | "idle"
  >("idle");
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [isRestoredDraft, setIsRestoredDraft] = useState(false);
  const [pendingGlobalDraft, setPendingGlobalDraft] =
    useState<StoredPropertyDraft | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const initialFormDataRef = useRef<PropertyFormData>(emptyFormData);

  const [quickViewProperty, setQuickViewProperty] =
    useState<Property | null>(null);
  const [quickViewActiveImage, setQuickViewActiveImage] = useState(0);

  const [searchQuery, setSearchQuery] = useState(urlSearch);

  useEffect(() => {
    const q = searchParams.get("search") || searchParams.get("q");
    if (q !== null && q !== undefined) setSearchQuery(q);
  }, [searchParams]);

  const [filterType, setFilterType] = useState("all");
  const [filterListing, setFilterListing] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterHighlight, setFilterHighlight] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [messageOpen, setMessageOpen] = useState(false);
  const [messageTitle, setMessageTitle] = useState("");
  const [messageText, setMessageText] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success"
  );

  const showMessage = (
    type: "success" | "error",
    title: string,
    text: string
  ) => {
    setMessageType(type);
    setMessageTitle(title);
    setMessageText(text);
    setMessageOpen(true);
  };

  const getErrorMessage = (error: any, fallback: string) => {
    // 1. Joi validation error details array: msg.details[0].message
    if (
      Array.isArray(error?.response?.data?.msg?.details) &&
      error.response.data.msg.details.length > 0
    ) {
      return error.response.data.msg.details
        .map((d: any) => d.message)
        .join(", ");
    }
    // 2. Direct details array
    if (
      Array.isArray(error?.response?.data?.details) &&
      error.response.data.details.length > 0
    ) {
      return error.response.data.details
        .map((d: any) => d.message)
        .join(", ");
    }
    // 3. String msg
    if (typeof error?.response?.data?.msg === "string") {
      return error.response.data.msg;
    }
    // 4. String message
    if (typeof error?.response?.data?.message === "string")
      return error.response.data.message;
    // 5. String error
    if (typeof error?.response?.data?.error === "string")
      return error.response.data.error;
    if (typeof error?.message === "string") return error.message;
    return fallback;
  };

  const fetchPropertyTypes = async () => {
    try {
      const response = await axiosInstance.get("/type/property");
      const result =
        response?.data?.result || response?.data?.data || response?.data;
      setPropertyTypes(Array.isArray(result) ? result : []);
    } catch (error: any) {
      showMessage(
        "error",
        "Property Types Error",
        getErrorMessage(error, "Failed to fetch property types.")
      );
    }
  };

  const fetchAmenities = async () => {
    try {
      const response = await axiosInstance.get("/amenitiestype");
      const result =
        response?.data?.result || response?.data?.data || response?.data;
      const list = Array.isArray(result) ? result : [];

      const mappedTypes: Amenity[] = list
        .filter((item: any) => item?._id && item?.name)
        .map((item: any) => ({
          _id: item._id,
          name: item.name,
        }))
        .sort((a: Amenity, b: Amenity) => a.name.localeCompare(b.name));

      setAmenities(mappedTypes);
    } catch (error: any) {
      setAmenities([]);
      showMessage(
        "error",
        "Amenities Type Error",
        getErrorMessage(error, "Failed to fetch amenities types.")
      );
    }
  };

  const fetchAllAmenities = async () => {
    try {
      const response = await axiosInstance.get("/amenities");
      const result =
        response?.data?.result || response?.data?.data || response?.data;
      const list = Array.isArray(result) ? result : [];
      setAllAmenities(list);

      const cacheByCat: Record<string, AmenityType[]> = {};
      list.forEach((item: any) => {
        if (!item?._id || !item?.name) return;
        const catId =
          typeof item.amenities_type === "object"
            ? item.amenities_type?._id || item.amenities_type?.id
            : item.amenities_type;
        if (catId) {
          if (!cacheByCat[catId]) cacheByCat[catId] = [];
          cacheByCat[catId].push({
            _id: item._id,
            name: item.name,
            amenity_id: catId,
          });
        }
      });
      setAmenityTypeCache((prev) => ({ ...cacheByCat, ...prev }));
    } catch (error) {
      console.error("Failed to fetch all amenities:", error);
    }
  };

  const fetchAmenityTypes = async (
    amenityId: string,
    updateCurrent = true
  ) => {
    if (!amenityId) {
      if (updateCurrent) setAmenityTypes([]);
      return [];
    }

    try {
      const response = await axiosInstance.get(
        `/amenities?amenities_type=${amenityId}`
      );
      const result =
        response?.data?.result || response?.data?.data || response?.data;
      const list = Array.isArray(result) ? result : [];

      const mappedAmenities: AmenityType[] = list
        .filter((item: any) => item?._id && item?.name)
        .map((item: any) => ({
          _id: item._id,
          name: item.name,
          amenity_id:
            item?.amenities_type?._id ||
            item?.amenities_type ||
            amenityId,
        }))
        .sort((a: AmenityType, b: AmenityType) =>
          a.name.localeCompare(b.name)
        );

      setAmenityTypeCache((prev) => ({
        ...prev,
        [amenityId]: mappedAmenities,
      }));

      if (updateCurrent) setAmenityTypes(mappedAmenities);
      return mappedAmenities;
    } catch (error: any) {
      if (updateCurrent) setAmenityTypes([]);

      showMessage(
        "error",
        "Amenities Error",
        getErrorMessage(
          error,
          "Failed to fetch amenities for the selected type."
        )
      );
      return [];
    }
  };

  const fetchProperties = async (draftMode = isDraftView) => {
    if (isAgent && currentAgent) {
      setLoading(true);
      const agentProps = getAgentProperties(currentAgent._id);
      const mappedProps: Property[] = agentProps.map((p) => ({
        _id: p._id,
        name: p.name,
        type: { name: p.type },
        location: { address: p.location, city: p.location.split(",").pop()?.trim() || "Chennai" },
        status: p.status,
        price: parseInt(p.price.replace(/[^\d]/g, "")) || 1000000,
        image_url: p.image ? [p.image] : [],
        isFeatured: true,
        isVerified: true,
        createdAt: p.createdAt,
      }));
      setProperties(mappedProps);
      setStats({
        total: mappedProps.length,
        available: mappedProps.filter((p) => p.status === "available").length,
        underConstruction: mappedProps.filter((p) => p.status === "under_construction").length,
        sold: mappedProps.filter((p) => p.status === "sold").length,
        featured: mappedProps.length,
        verified: mappedProps.length,
        draft: 0,
      });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const url = draftMode ? "/property?status=draft" : "/property";
      const response = await axiosInstance.get(url);
      const result =
        response?.data?.result || response?.data?.data || response?.data;
      setProperties(Array.isArray(result) ? result : []);
    } catch (error: any) {
      showMessage(
        "error",
        "Properties Error",
        getErrorMessage(error, "Failed to fetch properties.")
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchPropertyStats = async () => {
    if (isAgent) return; // Handled directly in fetchProperties for agent
    try {
      const response = await axiosInstance.get("/property/stats");
      const result =
        response?.data?.result || response?.data?.data || response?.data;

      if (result) {
        setStats({
          total: Number(result.total) || 0,
          available: Number(result.available) || 0,
          underConstruction: Number(result.under_construction) || 0,
          sold: Number(result.sold) || 0,
          featured: Number(result.featured) || 0,
          verified: Number(result.verified) || 0,
          draft: Number(result.draft) || 0,
        });
      }
    } catch (error: any) {
      console.error(
        "Property Stats Error:",
        getErrorMessage(error, "Failed to fetch property stats.")
      );
    }
  };

  useEffect(() => {
    fetchPropertyTypes();
    fetchAmenities();
    fetchAllAmenities();
    fetchPropertyStats();
  }, [isAgent, currentAgent?._id]);

  useEffect(() => {
    fetchProperties(isDraftView);
  }, [isDraftView, isAgent, currentAgent?._id]);

  const resetAmenitySelector = () => {
    setSelectedAmenity("");
    setSelectedAmenityTypes([]);
    setAmenityDropdownOpen(false);
    setAmenityTypes([]);
    setEditingAmenityIndex(null);
  };

  const resetForm = () => {
    setFormData({
      ...emptyFormData,
      image_url: [],
      amenities_data: [],
      nearby_places: [],
    });
    initialFormDataRef.current = emptyFormData;
    setFormActiveTab("basic");
    resetAmenitySelector();
    setAmenityTypeCache({});
    setEditingProperty(null);
    setIsRestoredDraft(false);
    setAutoSaveStatus("idle");
    setLastSavedTime(null);
  };

  const handleInputChange = (
    field: keyof PropertyFormData,
    value: any
  ) => setFormData((prev) => ({ ...prev, [field]: value }));

  const handleLocationChange = (
    field: "address" | "area" | "city" | "state" | "country" | "pincode",
    value: string
  ) => setFormData((prev) => ({ ...prev, [field]: value }));

  const selectedPropertyType = useMemo(
    () =>
      propertyTypes.find((type) => type._id === formData.type)?.name || "",
    [propertyTypes, formData.type]
  );

  const propertyTypeFields = useMemo(() => {
    const type = selectedPropertyType.toLowerCase().trim();
    const isLand = /plot|land|site|farm|agricultural/.test(type);
    const isCommercial =
      /office|shop|showroom|warehouse|commercial|retail|industrial|godown/.test(
        type
      );

    if (!type || isLand) {
      return {
        category: isLand ? "land" : "general",
        bedrooms: false,
        bathrooms: false,
        balconies: false,
        floor_number: false,
        total_floors: false,
        property_age: false,
        furnishing: false,
        facing: false,
        construction_status: false,
        possession_date: false,
        parking: true,
        price_per_sqft: true,
      };
    }

    if (isCommercial) {
      return {
        category: "commercial",
        bedrooms: false,
        bathrooms: false,
        balconies: false,
        floor_number: true,
        total_floors: true,
        property_age: true,
        furnishing: false,
        facing: true,
        construction_status: true,
        possession_date: true,
        parking: true,
        price_per_sqft: true,
      };
    }

    return {
      category: "residential",
      bedrooms: true,
      bathrooms: true,
      balconies: true,
      floor_number: true,
      total_floors: true,
      property_age: true,
      furnishing: true,
      facing: true,
      construction_status: true,
      possession_date: true,
      parking: true,
      price_per_sqft: true,
    };
  }, [selectedPropertyType]);

  const handlePropertyTypeChange = (value: string) => {
    const propertyType = propertyTypes.find((type) => type._id === value);
    const name = propertyType?.name?.toLowerCase() || "";
    const isLand = /plot|land|site|farm|agricultural/.test(name);
    const isCommercial =
      /office|shop|showroom|warehouse|commercial|retail|industrial/.test(name);

    setFormData((prev) => ({
      ...prev,
      type: value,
      ...(isLand
        ? {
          bedrooms: "",
          bathrooms: "",
          balconies: "",
          floor_number: "",
          total_floors: "",
          property_age: "",
          furnishing: "",
          facing: "",
          construction_status: "",
          possession_date: "",
        }
        : isCommercial
          ? { bedrooms: "", bathrooms: "", balconies: "", furnishing: "" }
          : {}),
    }));

    resetAmenitySelector();
  };

  const handleAmenitySelect = async (amenityId: string) => {
    setSelectedAmenity(amenityId);
    setSelectedAmenityTypes([]);
    setAmenityDropdownOpen(false);

    const cached = amenityTypeCache[amenityId];
    if (cached) {
      setAmenityTypes(cached);
    } else {
      await fetchAmenityTypes(amenityId);
    }
  };

  const toggleAmenityType = (id: string) => {
    setSelectedAmenityTypes((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  const addAmenity = () => {
    if (!selectedAmenity || selectedAmenityTypes.length === 0) return;

    setFormData((prev) => {
      const updated = [...prev.amenities_data];
      const existingIndex =
        editingAmenityIndex !== null
          ? editingAmenityIndex
          : updated.findIndex((item) => item.amenities === selectedAmenity);

      if (existingIndex > -1) {
        updated[existingIndex] = {
          amenities: selectedAmenity,
          amenity_types: selectedAmenityTypes,
        };
        return { ...prev, amenities_data: updated };
      }

      return {
        ...prev,
        amenities_data: [
          ...updated,
          {
            amenities: selectedAmenity,
            amenity_types: selectedAmenityTypes,
          },
        ],
      };
    });

    resetAmenitySelector();
  };

  const editAmenity = async (index: number) => {
    const item = formData.amenities_data[index];
    if (!item) return;

    setEditingAmenityIndex(index);
    setSelectedAmenity(item.amenities);

    const cached = amenityTypeCache[item.amenities];
    if (cached) {
      setAmenityTypes(cached);
    } else {
      await fetchAmenityTypes(item.amenities);
    }

    setSelectedAmenityTypes([...item.amenity_types]);
    setAmenityDropdownOpen(false);
  };

  const viewAmenity = (item: FormAmenityData) => {
    setViewingAmenity(item);
    setAmenityDetailsOpen(true);
  };

  const removeAmenity = (amenityId: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities_data: prev.amenities_data.filter(
        (item) => item.amenities !== amenityId
      ),
    }));

    if (selectedAmenity === amenityId) resetAmenitySelector();
  };

  const removeAmenityType = (
    amenityId: string,
    amenityTypeId: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      amenities_data: prev.amenities_data
        .map((item) =>
          item.amenities !== amenityId
            ? item
            : {
              ...item,
              amenity_types: item.amenity_types.filter(
                (id) => id !== amenityTypeId
              ),
            }
        )
        .filter((item) => item.amenity_types.length > 0),
    }));
  };

  const getAmenityName = (id: string) => {
    if (!id) return "";
    const cat = amenities.find((item) => item._id === id);
    if (cat?.name) return cat.name;
    const directAmenity = allAmenities.find((item) => item._id === id);
    if (directAmenity?.name) return directAmenity.name;
    for (const catId of Object.keys(amenityTypeCache)) {
      const found = (amenityTypeCache[catId] || []).find((t) => t._id === id);
      if (found?.name) return found.name;
    }
    return id;
  };

  const getAmenityTypeName = (amenityId: string, typeId: string) => {
    if (!typeId) return "";
    if (amenityId && amenityTypeCache[amenityId]) {
      const found = amenityTypeCache[amenityId].find((type) => type._id === typeId);
      if (found?.name) return found.name;
    }
    if (amenityId === selectedAmenity) {
      const found = amenityTypes.find((type) => type._id === typeId);
      if (found?.name) return found.name;
    }
    for (const catId of Object.keys(amenityTypeCache)) {
      const found = (amenityTypeCache[catId] || []).find((type) => type._id === typeId);
      if (found?.name) return found.name;
    }
    const directAmenity = allAmenities.find((item) => item._id === typeId);
    if (directAmenity?.name) return directAmenity.name;
    const cat = amenities.find((item) => item._id === typeId);
    if (cat?.name) return cat.name;
    return typeId;
  };

  const hasUnsavedChanges = useMemo(() => {
    if (!open) return false;
    return isFormDirtyOrHasContent(
      formData,
      editingProperty ? initialFormDataRef.current : null
    );
  }, [open, formData, editingProperty]);

  const buildDraftDataPayload = () => {
    const toNum = (v: any) =>
      v === "" || v === undefined || v === null || isNaN(Number(v))
        ? undefined
        : Number(v);

    const draftName =
      formData.name.trim() ||
      (editingProperty?.name ? editingProperty.name : "Untitled Draft");

    let combinedAmenities = [...formData.amenities_data];
    if (selectedAmenity && selectedAmenityTypes.length > 0) {
      const existIdx = combinedAmenities.findIndex(
        (a) => a.amenities === selectedAmenity
      );
      if (existIdx > -1) {
        combinedAmenities[existIdx] = {
          amenities: selectedAmenity,
          amenity_types: Array.from(
            new Set([
              ...combinedAmenities[existIdx].amenity_types,
              ...selectedAmenityTypes,
            ])
          ),
        };
      } else {
        combinedAmenities.push({
          amenities: selectedAmenity,
          amenity_types: selectedAmenityTypes,
        });
      }
    }

    const draftData: any = {
      name: draftName,
      type: formData.type || undefined,
      listing_type: formData.listing_type || undefined,
      description: formData.description || undefined,
      location: {
        address: formData.address || undefined,
        area: formData.area || undefined,
        city: formData.city || undefined,
        state: formData.state || undefined,
        country: formData.country || undefined,
        pincode: formData.pincode || undefined,
      },
      area_size: toNum(formData.area_size),
      area_unit: formData.area_unit,
      price: toNum(formData.price),
      price_per_sqft: toNum(formData.price_per_sqft),
      bedrooms: propertyTypeFields.bedrooms
        ? toNum(formData.bedrooms)
        : undefined,
      bathrooms: propertyTypeFields.bathrooms
        ? toNum(formData.bathrooms)
        : undefined,
      balconies: propertyTypeFields.balconies
        ? toNum(formData.balconies)
        : undefined,
      floor_number: propertyTypeFields.floor_number
        ? toNum(formData.floor_number)
        : undefined,
      total_floors: propertyTypeFields.total_floors
        ? toNum(formData.total_floors)
        : undefined,
      furnishing:
        propertyTypeFields.furnishing &&
        formData.furnishing &&
        formData.furnishing.trim() !== ""
          ? formData.furnishing.trim()
          : undefined,
      facing:
        propertyTypeFields.facing &&
        formData.facing &&
        formData.facing.trim() !== ""
          ? formData.facing.trim()
          : undefined,
      construction_status:
        propertyTypeFields.construction_status &&
        formData.construction_status &&
        formData.construction_status.trim() !== ""
          ? formData.construction_status.trim()
          : undefined,
      possession_date:
        propertyTypeFields.possession_date &&
        formData.possession_date &&
        formData.possession_date.trim() !== ""
          ? formData.possession_date.trim()
          : undefined,
      property_age: propertyTypeFields.property_age
        ? toNum(formData.property_age)
        : undefined,
      parking:
        propertyTypeFields.parking &&
        formData.parking &&
        !isNaN(Number(formData.parking))
          ? Number(formData.parking)
          : undefined,
      amenities_data: (() => {
        const backendList: { amenities: string; amenity_types: string[] }[] = [];
        combinedAmenities.forEach((group) => {
          const catId =
            typeof group.amenities === "string"
              ? group.amenities.trim()
              : (group.amenities as any)?._id || "";
          const subList = Array.isArray(group.amenity_types)
            ? group.amenity_types
            : [];
          subList.forEach((sub: any) => {
            const amenityId =
              typeof sub === "string" ? sub : sub?._id || sub?.id;
            if (
              amenityId &&
              typeof amenityId === "string" &&
              amenityId.trim() !== ""
            ) {
              backendList.push({
                amenities: amenityId.trim(),
                amenity_types: catId ? [catId] : [],
              });
            }
          });
        });
        return backendList;
      })(),
      nearby_places: (formData.nearby_places || [])
        .filter((p) => p && p.name && p.name.trim() !== "")
        .map((p) => ({
          name: p.name.trim(),
          type: p.type || "Landmark",
          distance:
            p.distance !== "" && p.distance !== null && p.distance !== undefined && !isNaN(Number(p.distance))
              ? Number(p.distance)
              : undefined,
          distance_unit: p.distance_unit || "km",
        })),
      image_url: Array.isArray(formData.image_url) ? formData.image_url : [],
      map_url:
        formData.map_url && formData.map_url.trim().startsWith("http")
          ? formData.map_url.trim()
          : undefined,
      media_url:
        formData.media_url && formData.media_url.trim().startsWith("http")
          ? formData.media_url.trim()
          : undefined,
      pincode: formData.pincode || undefined,
      owner_name: formData.owner_name || undefined,
      developer_name: formData.developer_name || undefined,
      project_name: formData.project_name || undefined,
      status: "draft",
      isFeatured: formData.isFeatured,
      isVerified: formData.isVerified,
    };

    return draftData;
  };

  // Real-time Local Storage Auto-Save (800ms debounce)
  useEffect(() => {
    if (!open) return;
    if (!hasUnsavedChanges) return;

    const draftId = editingProperty?._id || "new";
    const timer = setTimeout(() => {
      const saved = saveLocalDraft(draftId, {
        propertyId: editingProperty?._id || null,
        editingProperty,
        formData,
        formActiveTab,
        name: formData.name,
      });

      if (saved) {
        setLastSavedTime(formatDraftTime(saved.timestamp));
        if (!navigator.onLine) {
          setAutoSaveStatus("local");
        } else if (autoSaveStatus !== "saving") {
          setAutoSaveStatus("saved");
        }
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [open, formData, formActiveTab, editingProperty, hasUnsavedChanges]);

  // Background Server Auto-Sync (3500ms debounce) for new properties or existing drafts
  useEffect(() => {
    if (!open) return;
    if (!hasUnsavedChanges) return;
    if (!navigator.onLine) return;
    // Do not downgrade a live property to draft on backend automatically
    if (editingProperty && editingProperty.status !== "draft") return;
    // Require minimal content before syncing to backend
    if (!formData.name?.trim() && !formData.type) return;

    const timer = setTimeout(async () => {
      try {
        setAutoSaveStatus("saving");
        const draftPayload = buildDraftDataPayload();

        if (editingProperty?._id) {
          await axiosInstance.put(
            `/property/${editingProperty._id}`,
            draftPayload
          );
          setAutoSaveStatus("saved");
          setLastSavedTime(formatDraftTime(Date.now()));
        } else {
          const response = await axiosInstance.post("/property", draftPayload);
          const created =
            response?.data?.result ||
            response?.data?.data ||
            response?.data;
          if (created?._id) {
            setEditingProperty(created);
            removeLocalDraft("new");
            saveLocalDraft(created._id, {
              propertyId: created._id,
              editingProperty: created,
              formData,
              formActiveTab,
              name: formData.name,
            });
          }
          setAutoSaveStatus("saved");
          setLastSavedTime(formatDraftTime(Date.now()));
          fetchPropertyStats();
        }
      } catch (err) {
        console.warn("Silent server draft sync failed, saved locally:", err);
        setAutoSaveStatus("local");
      }
    }, 3500);

    return () => clearTimeout(timer);
  }, [open, formData, formActiveTab, editingProperty, hasUnsavedChanges]);

  // Check for pending active draft when outside the dialog
  useEffect(() => {
    const checkPendingDraft = () => {
      if (open) return;
      const latest = getLatestActiveDraft();
      if (latest && isFormDirtyOrHasContent(latest.formData)) {
        setPendingGlobalDraft(latest);
      } else {
        setPendingGlobalDraft(null);
      }
    };

    checkPendingDraft();
    window.addEventListener("focus", checkPendingDraft);
    return () => window.removeEventListener("focus", checkPendingDraft);
  }, [open]);

  // Online / Offline & BeforeUnload listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (open && hasUnsavedChanges) {
        setAutoSaveStatus("saved");
      }
    };
    const handleOffline = () => {
      setIsOnline(false);
      if (open) setAutoSaveStatus("local");
    };
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (open && hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
        return "";
      }
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [open, hasUnsavedChanges]);

  // Resumes an unsaved draft
  const resumeDraft = async (draft: StoredPropertyDraft) => {
    const sanitizedNearbyPlaces = Array.isArray(draft.formData?.nearby_places)
      ? draft.formData.nearby_places.map((place: any) => ({
          name: place.name || "",
          type: place.type || "",
          distance: str(place.distance),
          distance_unit: place.distance_unit || "km",
        }))
      : [];

    setFormData({
      ...draft.formData,
      nearby_places: sanitizedNearbyPlaces,
    });
    setFormActiveTab(draft.formActiveTab || "basic");
    setEditingProperty(draft.editingProperty);
    setIsRestoredDraft(true);
    setLastSavedTime(formatDraftTime(draft.timestamp));
    setAutoSaveStatus(navigator.onLine ? "saved" : "local");
    initialFormDataRef.current = draft.editingProperty
      ? { ...draft.formData }
      : emptyFormData;
    setPendingGlobalDraft(null);

    // Warm cache for any amenities in the draft
    if (Array.isArray(draft.formData.amenities_data)) {
      await Promise.all(
        draft.formData.amenities_data.map((item) =>
          fetchAmenityTypes(item.amenities, false)
        )
      );
    }

    setOpen(true);
  };

  // Discards active restored draft and starts clean
  const handleDiscardDraft = () => {
    const draftId = editingProperty?._id || "new";
    removeLocalDraft(draftId);
    setIsRestoredDraft(false);
    setLastSavedTime(null);
    setAutoSaveStatus("idle");
    if (editingProperty) {
      handleEdit(editingProperty);
    } else {
      resetForm();
    }
    if (pendingGlobalDraft?.draftId === draftId) {
      setPendingGlobalDraft(null);
    }
  };

  // Opens form for new property, restoring unsaved draft if found
  const handleAddNewProperty = async () => {
    const existingNewDraft = getLocalDraft("new");
    if (
      existingNewDraft &&
      isFormDirtyOrHasContent(existingNewDraft.formData)
    ) {
      await resumeDraft(existingNewDraft);
    } else {
      resetForm();
      setIsRestoredDraft(false);
      setLastSavedTime(null);
      setAutoSaveStatus("idle");
      initialFormDataRef.current = emptyFormData;
      setOpen(true);
    }
  };

  const handleEdit = async (property: Property) => {
    // Check if user has an unsaved local draft for this specific property
    const existingDraft = getLocalDraft(property._id);
    if (existingDraft && isFormDirtyOrHasContent(existingDraft.formData)) {
      await resumeDraft(existingDraft);
      return;
    }

    setEditingProperty(property);

    const initialCache: Record<string, AmenityType[]> = {};
    const grouped: Record<string, Set<string>> = {};

    (property.amenities_data || []).forEach((item: any) => {
      if (!item) return;

      const rawAmenity = item.amenities;
      const rawAmenityId =
        typeof rawAmenity === "object"
          ? rawAmenity?._id || rawAmenity?.id
          : rawAmenity;

      const rawTypes = Array.isArray(item.amenity_types)
        ? item.amenity_types
        : Array.isArray(item.amenities)
        ? item.amenities
        : [];

      if (rawTypes.length > 1) {
        // Frontend grouped legacy format: item.amenities is category, item.amenity_types is array of amenities
        const catId = rawAmenityId;
        if (catId) {
          if (!grouped[catId]) grouped[catId] = new Set();
          rawTypes.forEach((t: any) => {
            const id = typeof t === "object" ? t?._id || t?.id : t;
            if (id) {
              grouped[catId].add(id);
              if (typeof t === "object" && t?.name) {
                if (!initialCache[catId]) initialCache[catId] = [];
                if (!initialCache[catId].some((c) => c._id === id)) {
                  initialCache[catId].push({
                    _id: id,
                    name: t.name,
                    amenity_id: catId,
                  });
                }
              }
            }
          });
        }
      } else if (rawAmenityId) {
        // Backend format: item.amenities is amenity, item.amenity_types is [category]
        const firstCat = rawTypes[0];
        let catId =
          typeof firstCat === "object"
            ? firstCat?._id || firstCat?.id
            : firstCat;

        const matchedAmenity = allAmenities.find(
          (a) => a._id === rawAmenityId
        );
        let amenityId = rawAmenityId;

        if (matchedAmenity) {
          amenityId = matchedAmenity._id;
          if (!catId) {
            catId =
              typeof matchedAmenity.amenities_type === "object"
                ? matchedAmenity.amenities_type?._id || matchedAmenity.amenities_type?.id
                : matchedAmenity.amenities_type;
          }
        } else {
          // If rawAmenityId is actually a category
          const matchedCat = amenities.find((c) => c._id === rawAmenityId);
          if (matchedCat) {
            catId = matchedCat._id;
            if (rawTypes.length > 0) {
              if (!grouped[catId]) grouped[catId] = new Set();
              rawTypes.forEach((t: any) => {
                const id = typeof t === "object" ? t?._id || t?.id : t;
                if (id) grouped[catId].add(id);
              });
              return;
            }
          }
        }

        if (catId && amenityId) {
          if (!grouped[catId]) grouped[catId] = new Set();
          grouped[catId].add(amenityId);

          if (typeof rawAmenity === "object" && rawAmenity?.name) {
            if (!initialCache[catId]) initialCache[catId] = [];
            if (!initialCache[catId].some((c) => c._id === amenityId)) {
              initialCache[catId].push({
                _id: amenityId,
                name: rawAmenity.name,
                amenity_id: catId,
              });
            }
          }
        }
      }
    });

    const mappedAmenities: FormAmenityData[] = Object.keys(grouped)
      .map((catId) => ({
        amenities: catId,
        amenity_types: Array.from(grouped[catId]),
      }))
      .filter((item) => item.amenities && item.amenity_types.length > 0);

    const possessionDate = property?.possession_date
      ? new Date(property.possession_date).toISOString().split("T")[0]
      : "";

    const str = (v: any) =>
      v !== undefined && v !== null ? String(v) : "";

    const initialData: PropertyFormData = {
      name: property.name || "",
      type:
        typeof property.type === "string"
          ? property.type
          : property.type?._id || "",
      listing_type: property.listing_type || "sale",
      description: property.description || "",
      address: property.location?.address || "",
      area: property.location?.area || "",
      city: property.location?.city || "",
      state: property.location?.state || "",
      country: property.location?.country || "",
      pincode: property.location?.pincode || property.pincode || "",
      area_size: str(property.area_size),
      area_unit: property.area_unit || "sqft",
      price: str(property.price),
      price_per_sqft: str(property.price_per_sqft),
      bedrooms: str(property.bedrooms),
      bathrooms: str(property.bathrooms),
      balconies: str(property.balconies),
      floor_number: str(property.floor_number),
      total_floors: str(property.total_floors),
      furnishing: property.furnishing || "",
      facing: property.facing || "",
      construction_status: property.construction_status || "",
      possession_date: possessionDate,
      property_age: str(property.property_age),
      parking: str(property.parking),
      image_url: Array.isArray(property.image_url)
        ? property.image_url
        : [],
      map_url: property.map_url || "",
      media_url: property.media_url || "",
      amenities_data: mappedAmenities,
      nearby_places: Array.isArray(property.nearby_places)
        ? property.nearby_places.map((place) => ({
          name: place.name || "",
          type: place.type || "",
          distance: str(place.distance),
          distance_unit: place.distance_unit || "km",
        }))
        : [],
      owner_name: property.owner_name || "",
      developer_name: property.developer_name || "",
      project_name: property.project_name || "",
      status: property.status || "available",
      isFeatured: Boolean(property.isFeatured),
      isVerified: Boolean(property.isVerified),
    };

    setFormData(initialData);
    initialFormDataRef.current = initialData;
    setIsRestoredDraft(false);
    setAutoSaveStatus("idle");
    setLastSavedTime(null);

    setAmenityTypeCache(initialCache);
    setSelectedAmenity("");
    setSelectedAmenityTypes([]);
    setAmenityTypes([]);
    setEditingAmenityIndex(null);
    setFormActiveTab("basic");

    await Promise.all(
      mappedAmenities.map((item) =>
        fetchAmenityTypes(item.amenities, false)
      )
    );

    setOpen(true);
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files?.length) return;

    try {
      setImageUploading(true);

      const uploadedUrls = await Promise.all(
        Array.from(files).map(async (file) => {
          const uploadData = new FormData();
          uploadData.append("image", file);

          const response = await axiosInstance.post(
            "/upload/property",
            uploadData
          );

          const url =
            response?.data?.result?.image ||
            response?.data?.result?.url ||
            response?.data?.result?.path ||
            response?.data?.image ||
            response?.data?.url;

          if (!url) {
            throw new Error("Image URL not received from upload API.");
          }

          return url;
        })
      );

      setFormData((prev) => ({
        ...prev,
        image_url: [...prev.image_url, ...uploadedUrls],
      }));

      showMessage(
        "success",
        "Images Uploaded",
        `${uploadedUrls.length} image${uploadedUrls.length > 1 ? "s" : ""
        } uploaded successfully.`
      );
    } catch (error: any) {
      showMessage(
        "error",
        "Upload Failed",
        getErrorMessage(error, "Image upload failed.")
      );
    } finally {
      setImageUploading(false);
      event.target.value = "";
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      image_url: prev.image_url.filter((_, i) => i !== index),
    }));
  };

  const addNearbyPlace = (defaultType = "") => {
    setFormData((prev) => ({
      ...prev,
      nearby_places: [
        ...prev.nearby_places,
        {
          name: "",
          type: defaultType,
          distance: "",
          distance_unit: "km",
        },
      ],
    }));
  };

  const updateNearbyPlace = (
    index: number,
    field: keyof FormNearbyPlace,
    value: string
  ) => {
    setFormData((prev) => {
      const updated = [...prev.nearby_places];
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
      return {
        ...prev,
        nearby_places: updated,
      };
    });
  };

  const removeNearbyPlace = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      nearby_places: prev.nearby_places.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      setFormActiveTab("basic");
      showMessage(
        "error",
        "Required Field",
        "Please enter the property name in Basic Details."
      );
      return;
    }

    if (!formData.type) {
      setFormActiveTab("basic");
      showMessage(
        "error",
        "Required Field",
        "Please select a property type."
      );
      return;
    }

    if (!formData.city.trim()) {
      setFormActiveTab("basic");
      showMessage(
        "error",
        "Required Field",
        "Please enter the city in Location Details."
      );
      return;
    }

    try {
      setLoading(true);

      const toNum = (v: any) =>
        v === "" || v === undefined || v === null || isNaN(Number(v)) ? undefined : Number(v);

      // Merge any pending amenities selection from dropdowns
      let combinedAmenities = [...formData.amenities_data];
      if (selectedAmenity && selectedAmenityTypes.length > 0) {
        const existIdx = combinedAmenities.findIndex(
          (a) => a.amenities === selectedAmenity
        );
        if (existIdx > -1) {
          combinedAmenities[existIdx] = {
            amenities: selectedAmenity,
            amenity_types: Array.from(
              new Set([
                ...combinedAmenities[existIdx].amenity_types,
                ...selectedAmenityTypes,
              ])
            ),
          };
        } else {
          combinedAmenities.push({
            amenities: selectedAmenity,
            amenity_types: selectedAmenityTypes,
          });
        }
      }

      const propertyData: any = {
        name: formData.name.trim(),
        type: formData.type,
        listing_type: formData.listing_type || "sale",
        description: formData.description || "",
        location: {
          address: formData.address || "",
          area: formData.area || "",
          city: formData.city.trim(),
          state: formData.state || "",
          country: formData.country || "India",
          pincode: formData.pincode || "",
        },
        area_size: toNum(formData.area_size),
        area_unit: formData.area_unit || "sqft",
        price: toNum(formData.price),
        price_per_sqft: toNum(formData.price_per_sqft),
        bedrooms: propertyTypeFields.bedrooms
          ? toNum(formData.bedrooms)
          : undefined,
        bathrooms: propertyTypeFields.bathrooms
          ? toNum(formData.bathrooms)
          : undefined,
        balconies: propertyTypeFields.balconies
          ? toNum(formData.balconies)
          : undefined,
        floor_number: propertyTypeFields.floor_number
          ? toNum(formData.floor_number)
          : undefined,
        total_floors: propertyTypeFields.total_floors
          ? toNum(formData.total_floors)
          : undefined,
        furnishing: propertyTypeFields.furnishing && formData.furnishing && formData.furnishing.trim() !== ""
          ? formData.furnishing.trim()
          : undefined,
        facing: propertyTypeFields.facing && formData.facing && formData.facing.trim() !== ""
          ? formData.facing.trim()
          : undefined,
        construction_status: propertyTypeFields.construction_status && formData.construction_status && formData.construction_status.trim() !== ""
          ? formData.construction_status.trim()
          : undefined,
        possession_date: propertyTypeFields.possession_date && formData.possession_date && formData.possession_date.trim() !== ""
          ? formData.possession_date.trim()
          : undefined,
        property_age: propertyTypeFields.property_age
          ? toNum(formData.property_age)
          : undefined,
        parking: propertyTypeFields.parking && formData.parking && !isNaN(Number(formData.parking))
          ? Number(formData.parking)
          : undefined,
        amenities_data: (() => {
          const backendList: { amenities: string; amenity_types: string[] }[] = [];
          combinedAmenities.forEach((group) => {
            const catId = typeof group.amenities === "string" ? group.amenities.trim() : (group.amenities as any)?._id || "";
            const subList = Array.isArray(group.amenity_types) ? group.amenity_types : [];
            subList.forEach((sub: any) => {
              const amenityId = typeof sub === "string" ? sub : sub?._id || sub?.id;
              if (amenityId && typeof amenityId === "string" && amenityId.trim() !== "") {
                backendList.push({
                  amenities: amenityId.trim(),
                  amenity_types: catId ? [catId] : [],
                });
              }
            });
          });
          return backendList;
        })(),
        nearby_places: (formData.nearby_places || [])
          .filter((p) => p && p.name && p.name.trim() !== "")
          .map((p) => ({
            name: p.name.trim(),
            type: p.type || "Landmark",
            distance:
              p.distance !== "" && p.distance !== null && p.distance !== undefined && !isNaN(Number(p.distance))
                ? Number(p.distance)
                : undefined,
            distance_unit: p.distance_unit || "km",
          })),
        image_url: Array.isArray(formData.image_url) ? formData.image_url : [],
        map_url: formData.map_url && formData.map_url.trim().startsWith("http") ? formData.map_url.trim() : undefined,
        media_url: formData.media_url && formData.media_url.trim().startsWith("http") ? formData.media_url.trim() : undefined,
        pincode: formData.pincode || undefined,
        owner_name: formData.owner_name || undefined,
        developer_name: formData.developer_name || undefined,
        project_name: formData.project_name || undefined,
        status: formData.status || "available",
        isFeatured: formData.isFeatured,
        isVerified: formData.isVerified,
      };

      if (editingProperty?._id) {
        if (editingProperty.status === "draft") {
          await axiosInstance.put(
            `/property/${editingProperty._id}/publish`,
            propertyData
          );
          removeLocalDraft(editingProperty._id);
          setIsRestoredDraft(false);
          setPendingGlobalDraft(null);
          setOpen(false);
          resetForm();
          showMessage(
            "success",
            "Property Published",
            "Draft property is now live and published successfully."
          );
        } else {
          await axiosInstance.put(
            `/property/${editingProperty._id}`,
            propertyData
          );
          removeLocalDraft(editingProperty._id);
          setIsRestoredDraft(false);
          setPendingGlobalDraft(null);
          setOpen(false);
          resetForm();
          showMessage(
            "success",
            "Property Updated",
            "Property details updated successfully."
          );
        }
      } else {
        await axiosInstance.post("/property", propertyData);
        removeLocalDraft("new");
        setIsRestoredDraft(false);
        setPendingGlobalDraft(null);
        setOpen(false);
        resetForm();
        showMessage(
          "success",
          "Property Created",
          "New property added successfully."
        );
      }

      await fetchProperties(isDraftView);
      await fetchPropertyStats();
    } catch (error: any) {
      showMessage(
        "error",
        "Save Failed",
        getErrorMessage(
          error,
          "Something went wrong while saving the property."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    try {
      setLoading(true);
      const draftData = buildDraftDataPayload();

      if (editingProperty?._id) {
        await axiosInstance.put(
          `/property/${editingProperty._id}`,
          draftData
        );
        removeLocalDraft(editingProperty._id);
        setIsRestoredDraft(false);
        setPendingGlobalDraft(null);
        setOpen(false);
        resetForm();
        showMessage(
          "success",
          "Draft Updated",
          "Property draft updated successfully."
        );
      } else {
        await axiosInstance.post("/property", draftData);
        removeLocalDraft("new");
        setIsRestoredDraft(false);
        setPendingGlobalDraft(null);
        setOpen(false);
        resetForm();
        showMessage(
          "success",
          "Draft Saved",
          "Property saved as draft successfully."
        );
      }

      await fetchProperties(isDraftView);
      await fetchPropertyStats();
    } catch (error: any) {
      showMessage(
        "error",
        "Save Draft Failed",
        getErrorMessage(
          error,
          "Something went wrong while saving the property draft."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePublishDraft = async (property: Property) => {
    const hasType =
      property.type &&
      (typeof property.type === "object"
        ? property.type._id
        : property.type);

    const hasName =
      property.name &&
      property.name.trim() !== "" &&
      property.name !== "Untitled Draft";

    if (!hasType || !hasName) {
      await handleEdit(property);
      showMessage(
        "error",
        "Details Required",
        "Please provide a property title and category type before publishing."
      );
      return;
    }

    try {
      setLoading(true);
      const cleanNearbyPlaces = Array.isArray(property.nearby_places)
        ? property.nearby_places
            .filter((p) => p && p.name && p.name.trim() !== "")
            .map((p) => ({
              name: p.name.trim(),
              type: p.type || "Landmark",
              distance:
                p.distance !== null &&
                p.distance !== undefined &&
                (p.distance as any) !== "" &&
                !isNaN(Number(p.distance))
                  ? Number(p.distance)
                  : undefined,
              distance_unit: p.distance_unit || "km",
            }))
        : [];

      await axiosInstance.put(`/property/${property._id}/publish`, {
        status: "available",
        nearby_places: cleanNearbyPlaces,
      });
      removeLocalDraft(property._id);
      setIsRestoredDraft(false);

      showMessage(
        "success",
        "Property Published",
        `"${property.name}" is now live and published successfully.`
      );

      await fetchProperties(isDraftView);
      await fetchPropertyStats();
    } catch (error: any) {
      showMessage(
        "error",
        "Publish Failed",
        getErrorMessage(error, "Failed to publish draft property.")
      );
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      setLoading(true);
      await axiosInstance.delete(`/property/${deleteId}`);
      removeLocalDraft(deleteId);
      if (pendingGlobalDraft?.draftId === deleteId) {
        setPendingGlobalDraft(null);
      }
      setDeleteId(null);

      showMessage(
        "success",
        "Property Deleted",
        "Property deleted successfully."
      );

      await fetchProperties();
      await fetchPropertyStats();
    } catch (error: any) {
      showMessage(
        "error",
        "Delete Failed",
        getErrorMessage(error, "Failed to delete property.")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (property: Property) => {
    try {
      const nextStatus =
        propertyStatusCycle[property.status || "available"];

      await axiosInstance.put(`/property/${property._id}`, {
        status: nextStatus,
      });

      showMessage(
        "success",
        "Status Updated",
        `Property status changed to ${nextStatus.replace(/_/g, " ")}.`
      );

      await fetchProperties();
      await fetchPropertyStats();
    } catch (error: any) {
      showMessage(
        "error",
        "Status Update Failed",
        getErrorMessage(error, "Failed to update property status.")
      );
    }
  };

  const handleToggleFeatured = async (property: Property) => {
    const nextVal = !property.isFeatured;

    setProperties((prev) =>
      prev.map((p) =>
        p._id === property._id
          ? { ...p, isFeatured: nextVal }
          : p
      )
    );

    try {
      await axiosInstance.put(`/property/${property._id}`, {
        isFeatured: nextVal,
      });

      showMessage(
        "success",
        nextVal ? "Featured Added" : "Featured Removed",
        `"${property.name}" is ${nextVal
          ? "now featured on showcase"
          : "no longer featured"
        }.`
      );

      await fetchPropertyStats();
    } catch (error: any) {
      setProperties((prev) =>
        prev.map((p) =>
          p._id === property._id
            ? { ...p, isFeatured: !nextVal }
            : p
        )
      );

      showMessage(
        "error",
        "Update Failed",
        getErrorMessage(error, "Failed to update featured status.")
      );
    }
  };

  const handleToggleVerified = async (property: Property) => {
    const nextVal = !property.isVerified;

    setProperties((prev) =>
      prev.map((p) =>
        p._id === property._id
          ? { ...p, isVerified: nextVal }
          : p
      )
    );

    try {
      await axiosInstance.put(`/property/${property._id}`, {
        isVerified: nextVal,
      });

      showMessage(
        "success",
        nextVal ? "Listing Verified" : "Verification Removed",
        `"${property.name}" verification badge ${nextVal ? "enabled" : "removed"
        }.`
      );

      await fetchPropertyStats();
    } catch (error: any) {
      setProperties((prev) =>
        prev.map((p) =>
          p._id === property._id
            ? { ...p, isVerified: !nextVal }
            : p
        )
      );

      showMessage(
        "error",
        "Update Failed",
        getErrorMessage(
          error,
          "Failed to update verification status."
        )
      );
    }
  };

  const getPropertyTypeName = (type: any) => {
    if (!type) return "Property";
    if (typeof type === "object") return type.name || "Property";

    const found = propertyTypes.find((item) => item._id === type);
    return found?.name || "Property";
  };

  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const typeName = getPropertyTypeName(property.type).toLowerCase();
        const matchesName = (property.name || "")
          .toLowerCase()
          .includes(q);
        const matchesCity = (property.location?.city || "")
          .toLowerCase()
          .includes(q);
        const matchesArea = (property.location?.area || "")
          .toLowerCase()
          .includes(q);
        const matchesProject = (property.project_name || "")
          .toLowerCase()
          .includes(q);
        const matchesOwner = (property.owner_name || "")
          .toLowerCase()
          .includes(q);
        const matchesType = typeName.includes(q);
        const matchesConfig = property.bedrooms
          ? `${property.bedrooms} bhk`.includes(q)
          : false;

        if (
          !matchesName &&
          !matchesCity &&
          !matchesArea &&
          !matchesProject &&
          !matchesOwner &&
          !matchesType &&
          !matchesConfig
        ) {
          return false;
        }
      }

      if (filterType !== "all") {
        const typeId =
          typeof property.type === "object"
            ? property.type?._id
            : property.type;

        if (typeId !== filterType) return false;
      }

      if (
        filterListing !== "all" &&
        (property.listing_type || "sale") !== filterListing
      ) {
        return false;
      }

      if (
        filterStatus !== "all" &&
        (property.status || "available") !== filterStatus
      ) {
        return false;
      }

      if (filterHighlight === "featured" && !property.isFeatured)
        return false;

      if (filterHighlight === "verified" && !property.isVerified)
        return false;

      return true;
    });
  }, [
    properties,
    searchQuery,
    filterType,
    filterListing,
    filterStatus,
    filterHighlight,
    propertyTypes,
  ]);

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    filterType !== "all" ||
    filterListing !== "all" ||
    filterStatus !== "all" ||
    filterHighlight !== "all";

  const clearFilters = () => {
    setSearchQuery("");
    setFilterType("all");
    setFilterListing("all");
    setFilterStatus("all");
    setFilterHighlight("all");
  };

  return (
    <div className="space-y-7">
      {/* Unsaved Draft Recovery Top Banner */}
      {pendingGlobalDraft && !open && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border-2 border-amber-300/90 bg-gradient-to-r from-amber-50 via-orange-50/60 to-amber-100/70 p-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-xs">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm font-black text-amber-950">
                  Unsaved Property Draft Found
                </h4>
                <span className="rounded-full bg-amber-200/90 border border-amber-300 px-2.5 py-0.5 text-[10px] font-black text-amber-900">
                  {formatDraftTime(pendingGlobalDraft.timestamp)}
                </span>
              </div>
              <p className="text-xs text-amber-900 font-semibold mt-0.5">
                You were editing <strong>"{pendingGlobalDraft.name}"</strong> before leaving. Would you like to resume editing where you left off?
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                removeLocalDraft(pendingGlobalDraft.draftId);
                setPendingGlobalDraft(null);
              }}
              className="h-9 rounded-xl text-xs font-bold text-amber-900 hover:bg-amber-200/70 hover:text-amber-950"
            >
              Discard Draft
            </Button>
            <Button
              size="sm"
              onClick={() => resumeDraft(pendingGlobalDraft)}
              className="h-9 rounded-xl text-xs font-black bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
            >
              Resume Editing
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black tracking-tight text-slate-950">
              {isDraftView ? "Draft Properties" : "Properties Portfolio"}
            </h1>

            {isDraftView && (
              <span className="rounded-full bg-purple-900 text-white border border-purple-950 text-[11px] font-black px-3 py-0.5 shadow-xs uppercase tracking-wider">
                Admin Drafts Only
              </span>
            )}
          </div>

          <p className="mt-1 text-xs font-semibold text-slate-600">
            {isDraftView
              ? "Review, edit, and publish saved property drafts before they go live."
              : "Manage, publish, inspect, and verify real estate listings with rich multi-media showcase."}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            onClick={handleAddNewProperty}
            className="h-11 rounded-2xl bg-gradient-to-r from-primary to-rose-600 px-5 font-black text-white shadow-md shadow-primary/25 hover:opacity-95"
          >
            <Plus className="mr-2 h-4 w-4 stroke-[3]" />
            Add Property
          </Button>

          <Button
            variant={isDraftView ? "default" : "outline"}
            onClick={() => {
              setIsDraftView(!isDraftView);
              clearFilters();
            }}
            className={`h-11 rounded-2xl px-4 font-black transition flex items-center gap-2 ${isDraftView
              ? "bg-purple-900 text-white hover:bg-purple-950 shadow-md shadow-purple-900/30 border border-purple-950"
              : "border-2 border-purple-800 text-purple-900 hover:bg-purple-100/70 hover:text-purple-950 bg-purple-50 shadow-xs"
              }`}
            title={
              isDraftView
                ? "Return to active portfolio"
                : "View unpublished draft properties"
            }
          >
            <FileText
              className={`h-4 w-4 stroke-[2.5] ${isDraftView ? "text-amber-300" : "text-purple-800"
                }`}
            />

            <span>
              {isDraftView
                ? "Live Portfolio"
                : `Drafts${stats.draft ? ` (${stats.draft})` : ""}`}
            </span>
          </Button>
        </div>
      </div>

      {isDraftView && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border-2 border-purple-300 bg-gradient-to-r from-purple-100 via-purple-50 to-indigo-50 px-5 py-3.5 text-xs shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-800 text-white font-black text-xs shrink-0 shadow-sm">
              <FileText className="h-5 w-5 text-amber-300" />
            </div>

            <div>
              <p className="font-black text-purple-950 text-sm">
                Admin Drafts Archive ({properties.length}{" "}
                {properties.length === 1
                  ? "draft listing"
                  : "draft listings"})
              </p>

              <p className="text-xs text-purple-900 font-semibold mt-0.5">
                Drafts are confidential for internal editing and are
                completely hidden from the public website until published.
              </p>
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsDraftView(false)}
            className="h-8.5 rounded-xl text-xs font-black border-2 border-purple-800 text-purple-900 bg-white hover:bg-purple-100 shadow-xs shrink-0"
          >
            Back to Live Properties
          </Button>
        </div>
      )}

      <PropertyStatsCards
        stats={stats}
        activeStatusFilter={filterStatus}
        activeHighlightFilter={filterHighlight}
        onFilterStatus={(s) =>
          setFilterStatus(filterStatus === s ? "all" : s)
        }
        onFilterHighlight={(h) =>
          setFilterHighlight(filterHighlight === h ? "all" : h)
        }
        onResetFilters={clearFilters}
      />

      <PropertyFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterType={filterType}
        setFilterType={setFilterType}
        filterListing={filterListing}
        setFilterListing={setFilterListing}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterHighlight={filterHighlight}
        setFilterHighlight={setFilterHighlight}
        viewMode={viewMode}
        setViewMode={setViewMode}
        propertyTypes={propertyTypes}
        filteredCount={filteredProperties.length}
        totalCount={properties.length}
        hasActiveFilters={hasActiveFilters}
        clearFilters={clearFilters}
      />

      {loading && properties.length === 0 ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-card p-12 text-center shadow-xs">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-bold text-slate-800">
            Loading properties...
          </p>
        </div>
      ) : filteredProperties.length === 0 ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-card p-12 text-center shadow-xs">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
            <Building2 className="h-7 w-7" />
          </div>

          <div>
            <h3 className="text-base font-black text-slate-950">
              {isDraftView
                ? "No draft properties found"
                : "No properties match your query"}
            </h3>

            <p className="mt-1 text-xs font-semibold text-slate-600">
              {isDraftView
                ? "You don't have any saved drafts. Create a property and click 'Save as Draft' to store it here."
                : hasActiveFilters
                  ? "Try adjusting your search criteria or clearing filters."
                  : "Get started by publishing your first property listing."}
            </p>
          </div>

          {hasActiveFilters ? (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="mt-2 rounded-xl font-bold border-slate-300 text-slate-800"
            >
              Clear Filters
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleAddNewProperty}
              className="mt-2 rounded-xl font-bold bg-primary text-primary-foreground"
            >
              <Plus className="mr-1.5 h-4 w-4 stroke-[2.5]" />
              Add Property
            </Button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProperties.map((property) => (
            <PropertyCard
              key={property._id}
              property={property}
              onQuickView={(p) => {
                setQuickViewProperty(p);
                setQuickViewActiveImage(0);
                (p.amenities_data || []).forEach((item: any) => {
                  const catId = typeof item.amenities === "string" ? item.amenities : item.amenities?._id || item.amenities_type?._id || item.amenities_type;
                  if (catId && !amenityTypeCache[catId]) {
                    fetchAmenityTypes(catId, false);
                  }
                });
              }}
              onEdit={handleEdit}
              onDelete={setDeleteId}
              onStatusChange={handleStatusChange}
              onToggleFeatured={handleToggleFeatured}
              onToggleVerified={handleToggleVerified}
              onPublish={handlePublishDraft}
              getPropertyTypeName={getPropertyTypeName}
            />
          ))}
        </div>
      ) : (
        <PropertyTable
          properties={filteredProperties}
          onQuickView={(p) => {
            setQuickViewProperty(p);
            setQuickViewActiveImage(0);
            (p.amenities_data || []).forEach((item: any) => {
              const catId = typeof item.amenities === "string" ? item.amenities : item.amenities?._id || item.amenities_type?._id || item.amenities_type;
              if (catId && !amenityTypeCache[catId]) {
                fetchAmenityTypes(catId, false);
              }
            });
          }}
          onEdit={handleEdit}
          onDelete={setDeleteId}
          onStatusChange={handleStatusChange}
          onToggleFeatured={handleToggleFeatured}
          onToggleVerified={handleToggleVerified}
          onPublish={handlePublishDraft}
          getPropertyTypeName={getPropertyTypeName}
        />
      )}

      <PropertyFormDialog
        open={open}
        onOpenChange={(val) => {
          setOpen(val);
          if (!val) resetForm();
        }}
        editingProperty={editingProperty}
        formData={formData}
        formActiveTab={formActiveTab}
        setFormActiveTab={setFormActiveTab}
        handleSubmit={handleSubmit}
        handleSaveDraft={handleSaveDraft}
        handleInputChange={handleInputChange}
        handleLocationChange={handleLocationChange}
        handlePropertyTypeChange={handlePropertyTypeChange}
        propertyTypes={propertyTypes}
        propertyTypeFields={propertyTypeFields}
        handleImageUpload={handleImageUpload}
        removeImage={removeImage}
        imageUploading={imageUploading}
        loading={loading}
        resetForm={resetForm}
        amenities={amenities}
        amenityTypes={amenityTypes}
        selectedAmenity={selectedAmenity}
        selectedAmenityTypes={selectedAmenityTypes}
        setSelectedAmenityTypes={setSelectedAmenityTypes}
        amenityDropdownOpen={amenityDropdownOpen}
        setAmenityDropdownOpen={setAmenityDropdownOpen}
        handleAmenitySelect={handleAmenitySelect}
        toggleAmenityType={toggleAmenityType}
        addAmenity={addAmenity}
        editingAmenityIndex={editingAmenityIndex}
        getAmenityTypeName={getAmenityTypeName}
        getAmenityName={getAmenityName}
        removeAmenityType={removeAmenityType}
        viewAmenity={viewAmenity}
        editAmenity={editAmenity}
        removeAmenity={removeAmenity}
        addNearbyPlace={addNearbyPlace}
        updateNearbyPlace={updateNearbyPlace}
        removeNearbyPlace={removeNearbyPlace}
        autoSaveStatus={autoSaveStatus}
        lastSavedTime={lastSavedTime}
        isRestoredDraft={isRestoredDraft}
        onDiscardDraft={handleDiscardDraft}
        hasUnsavedChanges={hasUnsavedChanges}
      />

      <PropertyQuickViewDialog
        property={quickViewProperty}
        activeImage={quickViewActiveImage}
        setActiveImage={setQuickViewActiveImage}
        onClose={() => setQuickViewProperty(null)}
        onEdit={handleEdit}
        getPropertyTypeName={getPropertyTypeName}
        getAmenityName={getAmenityName}
        getAmenityTypeName={getAmenityTypeName}
        allAmenities={allAmenities}
      />

      <AmenityDetailsDialog
        open={amenityDetailsOpen}
        onOpenChange={setAmenityDetailsOpen}
        viewingAmenity={viewingAmenity}
        getAmenityName={getAmenityName}
        getAmenityTypeName={getAmenityTypeName}
      />

      <PropertyDeleteDialog
        open={Boolean(deleteId)}
        onOpenChange={(val) => !val && setDeleteId(null)}
        onConfirm={confirmDelete}
        loading={loading}
      />

      <Dialog open={messageOpen} onOpenChange={setMessageOpen}>
        <DialogContent className="w-[92vw] max-w-sm rounded-3xl p-6 border border-slate-200">
          <div className="flex flex-col items-center text-center">
            <div
              className={`mb-3.5 flex h-14 w-14 items-center justify-center rounded-2xl ${messageType === "success"
                ? "bg-emerald-500/10 text-emerald-600"
                : "bg-rose-500/10 text-rose-600"
                }`}
            >
              {messageType === "success" ? (
                <CheckCircle2 className="h-7 w-7 stroke-[2.5]" />
              ) : (
                <AlertCircle className="h-7 w-7 stroke-[2.5]" />
              )}
            </div>

            <DialogTitle className="text-lg font-black text-slate-950">
              {messageTitle}
            </DialogTitle>

            <p className="mt-2 text-xs font-semibold leading-relaxed text-slate-700">
              {messageText}
            </p>

            <Button
              className="mt-6 w-full rounded-2xl font-black bg-primary text-white shadow-md shadow-primary/25"
              onClick={() => setMessageOpen(false)}
            >
              Okay
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Properties;