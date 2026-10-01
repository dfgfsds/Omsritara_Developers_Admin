import { useState, useEffect, useMemo, useRef } from "react";
import axiosInstance from "@/lib/axiosInstance";
import {
  Property,
  PropertyFormData,
  PropertyType,
  PropertyTypeFields,
  Amenity,
  AmenityType,
  FormAmenityData,
  FormNearbyPlace,
} from "./types";
import { emptyFormData } from "./constants";
import { toast } from "@/hooks/use-toast";
import {
  saveLocalDraft,
  getLocalDraft,
  removeLocalDraft,
  formatDraftTime,
  isFormDirtyOrHasContent,
} from "@/utils/propertyDraftStorage";

interface UsePropertyFormStateProps {
  initialAgentId?: string | null;
  initialAgentName?: string | null;
  isOpen?: boolean;
  onSuccess?: (createdOrUpdatedProperty: any) => void;
}

export function usePropertyFormState({
  initialAgentId,
  initialAgentName,
  isOpen,
  onSuccess,
}: UsePropertyFormStateProps = {}) {
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  const [formData, setFormData] = useState<PropertyFormData>(() => ({
    ...emptyFormData,
    developer_name: initialAgentName ? `Agent: ${initialAgentName}` : "",
    agent_id: initialAgentId || "",
  }));

  const [formActiveTab, setFormActiveTab] = useState<string>("basic");
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  const initialFormDataRef = useRef<PropertyFormData>(emptyFormData);
  const [autoSaveStatus, setAutoSaveStatus] = useState<
    "saved" | "saving" | "local" | "idle"
  >("idle");
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [isRestoredDraft, setIsRestoredDraft] = useState(false);

  // Property Types
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);

  // Amenities & Types (Loaded from Real APIs)
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [allAmenities, setAllAmenities] = useState<any[]>([]);
  const [amenityTypes, setAmenityTypes] = useState<AmenityType[]>([]);
  const [amenityTypeCache, setAmenityTypeCache] = useState<Record<string, AmenityType[]>>({});

  const [selectedAmenity, setSelectedAmenity] = useState<string>("");
  const [selectedAmenityTypes, setSelectedAmenityTypes] = useState<string[]>([]);
  const [amenityDropdownOpen, setAmenityDropdownOpen] = useState(false);
  const [editingAmenityIndex, setEditingAmenityIndex] = useState<number | null>(null);

  // Fetch real property types from /type/property
  const fetchPropertyTypes = async () => {
    try {
      const response = await axiosInstance.get("/type/property");
      const result = response?.data?.result || response?.data?.data || response?.data;
      const list = Array.isArray(result) ? result : [];
      setPropertyTypes(list);
      if (list.length > 0 && !formData.type && isOpen !== false) {
        setFormData((prev) => ({ ...prev, type: list[0]._id }));
      }
    } catch (error) {
      console.warn("Failed to fetch property types:", error);
    }
  };

  // Fetch parent amenity categories from /amenitiestype
  const fetchAmenities = async () => {
    try {
      const response = await axiosInstance.get("/amenitiestype");
      const result = response?.data?.result || response?.data?.data || response?.data;
      const list = Array.isArray(result) ? result : [];

      const mappedTypes: Amenity[] = list
        .filter((item: any) => item?._id && item?.name)
        .map((item: any) => ({
          _id: item._id,
          name: item.name,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

      setAmenities(mappedTypes);
    } catch (error) {
      console.warn("Failed to fetch amenity categories:", error);
      setAmenities([]);
    }
  };

  // Fetch all sub-amenities from /amenities
  const fetchAllAmenities = async () => {
    try {
      const response = await axiosInstance.get("/amenities");
      const result = response?.data?.result || response?.data?.data || response?.data;
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
      console.warn("Failed to fetch all sub-amenities:", error);
    }
  };

  const fetchAmenityTypes = async (amenityId: string, updateCurrent = true) => {
    if (!amenityId) {
      if (updateCurrent) setAmenityTypes([]);
      return [];
    }

    try {
      const response = await axiosInstance.get(`/amenities?amenities_type=${amenityId}`);
      const result = response?.data?.result || response?.data?.data || response?.data;
      const list = Array.isArray(result) ? result : [];

      const mapped: AmenityType[] = list
        .filter((item: any) => item?._id && item?.name)
        .map((item: any) => ({
          _id: item._id,
          name: item.name,
          amenity_id: item?.amenities_type?._id || item?.amenities_type || amenityId,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

      setAmenityTypeCache((prev) => ({ ...prev, [amenityId]: mapped }));
      if (updateCurrent) setAmenityTypes(mapped);
      return mapped;
    } catch {
      if (updateCurrent) setAmenityTypes([]);
      return [];
    }
  };

  useEffect(() => {
    fetchPropertyTypes();
    fetchAmenities();
    fetchAllAmenities();
  }, []);

  // Update initial agent if changed
  useEffect(() => {
    if (initialAgentName && !editingProperty) {
      setFormData((prev) => ({
        ...prev,
        developer_name: `Agent: ${initialAgentName}`,
      }));
    }
  }, [initialAgentName, editingProperty]);

  const selectedPropertyType = useMemo(
    () => propertyTypes.find((type) => type._id === formData.type)?.name || "",
    [propertyTypes, formData.type]
  );

  const propertyTypeFields: PropertyTypeFields = useMemo(() => {
    const type = selectedPropertyType.toLowerCase().trim();
    const isLand = /plot|land|site|farm|agricultural/.test(type);
    const isCommercial =
      /office|shop|showroom|warehouse|commercial|retail|industrial|godown/.test(type);

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

  const handleInputChange = (field: keyof PropertyFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLocationChange = (
    field: "address" | "area" | "city" | "state" | "country" | "pincode",
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePropertyTypeChange = (value: string) => {
    const propType = propertyTypes.find((type) => type._id === value);
    const name = propType?.name?.toLowerCase() || "";
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

  // Amenities logic
  const resetAmenitySelector = () => {
    setSelectedAmenity("");
    setSelectedAmenityTypes([]);
    setAmenityDropdownOpen(false);
    setAmenityTypes([]);
    setEditingAmenityIndex(null);
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
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
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

  const removeAmenity = (amenityId: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities_data: prev.amenities_data.filter((item) => item.amenities !== amenityId),
    }));
    if (selectedAmenity === amenityId) resetAmenitySelector();
  };

  const removeAmenityType = (amenityId: string, amenityTypeId: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities_data: prev.amenities_data
        .map((item) =>
          item.amenities !== amenityId
            ? item
            : {
                ...item,
                amenity_types: item.amenity_types.filter((id) => id !== amenityTypeId),
              }
        )
        .filter((item) => item.amenity_types.length > 0),
    }));
  };

  const viewAmenity = (item: FormAmenityData) => {
    setSelectedAmenity(item.amenities);
    setSelectedAmenityTypes(item.amenity_types);
    setAmenityDropdownOpen(true);
    const cached = amenityTypeCache[item.amenities];
    if (cached) setAmenityTypes(cached);
    else fetchAmenityTypes(item.amenities);
  };

  const editAmenity = (index: number) => {
    const item = formData.amenities_data[index];
    if (!item) return;
    setEditingAmenityIndex(index);
    setSelectedAmenity(item.amenities);
    setSelectedAmenityTypes(item.amenity_types);
    setAmenityDropdownOpen(true);
    const cached = amenityTypeCache[item.amenities];
    if (cached) setAmenityTypes(cached);
    else fetchAmenityTypes(item.amenities);
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

  // Nearby Places
  const addNearbyPlace = (defaultType = "") => {
    setFormData((prev) => ({
      ...prev,
      nearby_places: [
        ...prev.nearby_places,
        {
          name: "",
          type: defaultType || "Landmark",
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
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, nearby_places: updated };
    });
  };

  const removeNearbyPlace = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      nearby_places: prev.nearby_places.filter((_, i) => i !== index),
    }));
  };

  // Images upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;

    try {
      setImageUploading(true);
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          const uploadData = new FormData();
          uploadData.append("image", file);
          const response = await axiosInstance.post("/upload/property", uploadData);
          const url =
            response?.data?.result?.image ||
            response?.data?.result?.url ||
            response?.data?.result?.path ||
            response?.data?.image ||
            response?.data?.url;

          if (url) {
            uploadedUrls.push(url);
          }
        } catch {
          // If upload endpoint fails, fallback to local base64 preview
          const reader = new FileReader();
          reader.readAsDataURL(file);
          await new Promise((resolve) => {
            reader.onload = () => {
              if (reader.result) uploadedUrls.push(reader.result as string);
              resolve(true);
            };
          });
        }
      }

      setFormData((prev) => ({
        ...prev,
        image_url: [...prev.image_url, ...uploadedUrls],
      }));

      toast({
        title: "Photos Added",
        description: `${uploadedUrls.length} photograph(s) successfully added.`,
      });
    } catch {
      toast({
        title: "Upload Warning",
        description: "Could not upload image file. You can also paste an image URL directly.",
        variant: "destructive",
      });
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

  // Populate existing property details for editing
  const populateForEdit = async (property: any) => {
    if (!property) return;

    if (property.localDraftData?.formData) {
      setEditingProperty(property.localDraftData.editingProperty || null);
      setFormData(property.localDraftData.formData);
      initialFormDataRef.current = property.localDraftData.formData;
      setIsRestoredDraft(true);
      setAutoSaveStatus("saved");
      setFormActiveTab(property.localDraftData.formActiveTab || "basic");
      return;
    }

    setEditingProperty(property);
    const toStr = (v: any) => (v !== undefined && v !== null ? String(v) : "");

    // 1. Group amenities by parent category and prime name cache
    const initialCache: Record<string, AmenityType[]> = {};
    const grouped: Record<string, Set<string>> = {};

    (property.amenities_data || []).forEach((item: any) => {
      if (!item) return;

      const rawAmenity = item.amenity || item.amenities;
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
        // Grouped format: rawAmenityId is category, rawTypes is list of sub-amenities
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
        // Backend single format: rawAmenityId is amenity ID, rawTypes[0] is category ID
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
          // If rawAmenityId is actually category
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

    if (Object.keys(initialCache).length > 0) {
      setAmenityTypeCache((prev) => ({ ...prev, ...initialCache }));
    }

    const mappedAmenities: FormAmenityData[] = Object.keys(grouped)
      .map((catId) => ({
        amenities: catId,
        amenity_types: Array.from(grouped[catId]),
      }))
      .filter((item) => item.amenities && item.amenity_types.length > 0);

    const typeId =
      typeof property.type === "string" ? property.type : property.type?._id || "";

    const possessionDate = property.possession_date
      ? new Date(property.possession_date).toISOString().split("T")[0]
      : "";

    const editData: PropertyFormData = {
      name: property.name || "",
      type: typeId,
      listing_type: property.listing_type || "sale",
      description: property.description || "",
      address: property.location?.address || "",
      area: property.location?.area || "",
      city: property.location?.city || "Chennai",
      state: property.location?.state || "Tamil Nadu",
      country: property.location?.country || "India",
      pincode: property.location?.pincode || property.pincode || "",
      area_size: toStr(property.area_size),
      area_unit: property.area_unit || "sqft",
      price: toStr(property.price),
      price_per_sqft: toStr(property.price_per_sqft),
      bedrooms: toStr(property.bedrooms),
      bathrooms: toStr(property.bathrooms),
      balconies: toStr(property.balconies),
      floor_number: toStr(property.floor_number),
      total_floors: toStr(property.total_floors),
      furnishing: property.furnishing || "",
      facing: property.facing || "",
      construction_status: property.construction_status || "",
      possession_date: possessionDate,
      property_age: toStr(property.property_age),
      parking: toStr(property.parking),
      image_url: Array.isArray(property.image_url)
        ? property.image_url
        : property.image_url
        ? [property.image_url]
        : property.image
        ? [property.image]
        : [],
      map_url: property.map_url || "",
      media_url: property.media_url || "",
      amenities_data: mappedAmenities,
      nearby_places: Array.isArray(property.nearby_places)
        ? property.nearby_places.map((place: any) => ({
            name: place.name || "",
            type: place.type || "Landmark",
            distance: toStr(place.distance),
            distance_unit: place.distance_unit || "km",
          }))
        : [],
      owner_name: property.owner_name || "",
      developer_name:
        property.developer_name || (initialAgentName ? `Agent: ${initialAgentName}` : ""),
      project_name: property.project_name || "",
      status: property.status || "available",
      isFeatured: Boolean(property.isFeatured),
      isVerified: Boolean(property.isVerified),
      agent_id:
        property.agent_id ||
        (typeof property.created_by === "object" ? property.created_by?._id : property.created_by) ||
        "",
    };

    setEditingProperty(property);
    setFormData(editData);
    initialFormDataRef.current = editData;
    setIsRestoredDraft(false);
    setAutoSaveStatus("idle");
    setFormActiveTab("basic");
    resetAmenitySelector();

    // Warm cache for any amenities present in property
    await Promise.all(
      mappedAmenities.map((item) => fetchAmenityTypes(item.amenities, false))
    );
  };

  const getDraftKey = (propId?: string | null) => {
    if (propId) return propId;
    return initialAgentId ? `agent_${initialAgentId}` : "new";
  };

  // Check if form has unsaved changes
  const hasUnsavedChanges = useMemo(() => {
    // If modal/dialog is explicitly closed, do NOT treat as unsaved changes
    if (isOpen === false) return false;
    return isFormDirtyOrHasContent(
      formData,
      editingProperty ? initialFormDataRef.current : null
    );
  }, [formData, editingProperty, isOpen]);

  // Real-time Local Storage Auto-Save (800ms debounce)
  useEffect(() => {
    if (isOpen === false) return;
    if (!hasUnsavedChanges) return;

    const draftKey = getDraftKey(editingProperty?._id);
    const timer = setTimeout(() => {
      const saved = saveLocalDraft(draftKey, {
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
        } else {
          setAutoSaveStatus("saved");
        }
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [formData, formActiveTab, editingProperty, hasUnsavedChanges, initialAgentId, isOpen]);

  const handleDiscardDraft = () => {
    const draftKey = getDraftKey(editingProperty?._id);
    removeLocalDraft(draftKey);
    removeLocalDraft("new");
    if (initialAgentId) removeLocalDraft(`agent_${initialAgentId}`);
    setIsRestoredDraft(false);
    setLastSavedTime(null);
    setAutoSaveStatus("idle");
    setEditingProperty(null);
    setFormData({
      ...emptyFormData,
      developer_name: initialAgentName ? `Agent: ${initialAgentName}` : "",
      agent_id: initialAgentId || "",
      image_url: [],
      amenities_data: [],
      nearby_places: [],
    });
    initialFormDataRef.current = emptyFormData;
    setFormActiveTab("basic");
    resetAmenitySelector();
  };

  const resetForm = () => {
    const draftKey = getDraftKey();
    const existingDraft = getLocalDraft(draftKey);

    if (existingDraft && isFormDirtyOrHasContent(existingDraft.formData)) {
      setEditingProperty(null);
      setFormData(existingDraft.formData);
      setFormActiveTab(existingDraft.formActiveTab || "basic");
      setIsRestoredDraft(true);
      setLastSavedTime(formatDraftTime(existingDraft.timestamp));
      setAutoSaveStatus("saved");
      resetAmenitySelector();
      return;
    }

    setEditingProperty(null);
    setFormData({
      ...emptyFormData,
      developer_name: initialAgentName ? `Agent: ${initialAgentName}` : "",
      agent_id: initialAgentId || "",
      image_url: [],
      amenities_data: [],
      nearby_places: [],
    });
    initialFormDataRef.current = emptyFormData;
    setIsRestoredDraft(false);
    setLastSavedTime(null);
    setAutoSaveStatus("idle");
    setFormActiveTab("basic");
    resetAmenitySelector();
  };

  // Submit Handler (Supports both Create, Edit, and Save as Draft)
  const handleSubmit = async (
    e?: React.FormEvent,
    targetAgentId?: string,
    targetAgentName?: string,
    overrideStatus?: "available" | "draft"
  ) => {
    if (e && e.preventDefault) e.preventDefault();

    const isDraft = overrideStatus === "draft";

    if (!isDraft) {
      if (!formData.name.trim()) {
        setFormActiveTab("basic");
        toast({
          title: "Required Field",
          description: "Please enter the property name.",
          variant: "destructive",
        });
        return null;
      }

      if (!formData.type) {
        setFormActiveTab("basic");
        toast({
          title: "Required Field",
          description: "Please select a property type.",
          variant: "destructive",
        });
        return null;
      }

      if (!formData.city.trim()) {
        setFormActiveTab("basic");
        toast({
          title: "Required Field",
          description: "Please enter the city location.",
          variant: "destructive",
        });
        return null;
      }
    }

    setLoading(true);
    try {
      const toNum = (v: any) =>
        v === "" || v === undefined || v === null || isNaN(Number(v)) ? undefined : Number(v);

      const combinedAmenities = [...formData.amenities_data];
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

      const isObjectId = (id: any): boolean =>
        typeof id === "string" && /^[0-9a-fA-F]{24}$/.test(id.trim());

      const activeAgentId =
        formData.agent_id ||
        targetAgentId ||
        initialAgentId ||
        (editingProperty?.created_by
          ? typeof editingProperty.created_by === "object"
            ? editingProperty.created_by._id
            : editingProperty.created_by
          : undefined);
      const activeAgentName =
        targetAgentName ||
        initialAgentName ||
        (editingProperty?.created_by && typeof editingProperty.created_by === "object"
          ? editingProperty.created_by.name
          : "");

      const devName =
        formData.developer_name?.trim() ||
        (activeAgentName ? `Agent: ${activeAgentName}` : "Omsritara Developers");

      // Resolve valid 24-character ObjectId for type
      let cleanTypeId = formData.type;
      if (typeof cleanTypeId === "object" && cleanTypeId !== null) {
        cleanTypeId = (cleanTypeId as any)._id;
      }
      if (!isObjectId(cleanTypeId)) {
        const found = propertyTypes.find(
          (t) =>
            t._id === cleanTypeId ||
            t.name.toLowerCase() === String(cleanTypeId).toLowerCase()
        );
        if (found && isObjectId(found._id)) {
          cleanTypeId = found._id;
        }
      }

      // Sanitize Amenities Data (ensure valid 24-hex ObjectIds)
      const cleanAmenitiesData = (() => {
        const list: { amenities: string; amenity_types: string[] }[] = [];
        combinedAmenities.forEach((group) => {
          const catId =
            typeof group.amenities === "string"
              ? group.amenities.trim()
              : (group.amenities as any)?._id || "";
          const subList = Array.isArray(group.amenity_types) ? group.amenity_types : [];
          subList.forEach((sub: any) => {
            const amenityId = typeof sub === "string" ? sub.trim() : sub?._id || sub?.id || "";
            if (isObjectId(amenityId)) {
              list.push({
                amenities: amenityId,
                amenity_types: isObjectId(catId) ? [catId] : [],
              });
            } else if (isObjectId(catId)) {
              list.push({
                amenities: catId,
                amenity_types: [],
              });
            }
          });
        });
        return list;
      })();

      // Sanitize Nearby Places
      const cleanNearbyPlaces = (formData.nearby_places || [])
        .filter((p) => p && p.name && p.name.trim() !== "")
        .map((p) => {
          const item: any = {
            name: p.name.trim(),
            type: p.type || "Landmark",
            distance_unit: p.distance_unit || "km",
          };
          if (
            p.distance !== "" &&
            p.distance !== null &&
            p.distance !== undefined &&
            !isNaN(Number(p.distance))
          ) {
            item.distance = Number(p.distance);
          }
          return item;
        });

      // Sanitize Possession Date
      const cleanPossessionDate =
        propertyTypeFields.possession_date &&
        formData.possession_date &&
        !isNaN(new Date(formData.possession_date).getTime())
          ? formData.possession_date
          : undefined;

      // Sanitize Construction Status
      const validStatuses = [
        "ready_to_move",
        "under_construction",
        "new_launch",
        "resale",
      ];
      const cleanConstructionStatus =
        propertyTypeFields.construction_status &&
        validStatuses.includes(formData.construction_status)
          ? formData.construction_status
          : undefined;

      const resolvedDraftType =
        cleanTypeId ||
        (propertyTypes.length > 0 ? propertyTypes[0]._id : undefined);

      // Clean Location Object
      const cleanLocation: any = {
        country: formData.country?.trim() || "India",
      };
      if (formData.address?.trim() || isDraft) cleanLocation.address = formData.address?.trim() || "Draft Address";
      if (formData.area?.trim()) cleanLocation.area = formData.area.trim();
      if (formData.city?.trim() || isDraft) cleanLocation.city = formData.city?.trim() || "Draft City";
      if (formData.state?.trim() || isDraft) cleanLocation.state = formData.state?.trim() || "Tamil Nadu";
      if (formData.pincode?.trim()) cleanLocation.pincode = formData.pincode.trim();

      // Common validated property payload matching backend Joi schema
      const propertyData: any = {
        name: formData.name.trim() || (isDraft ? "Untitled Property Draft" : "Untitled Property"),
        listing_type: formData.listing_type || "sale",
        description: formData.description?.trim() || undefined,
        location: cleanLocation,
        area_size: toNum(formData.area_size) || (isDraft ? 1 : undefined),
        area_unit: formData.area_unit || "sqft",
        price: toNum(formData.price) !== undefined ? toNum(formData.price) : (isDraft ? 0 : undefined),
        price_per_sqft: toNum(formData.price_per_sqft),
        bedrooms: propertyTypeFields.bedrooms ? toNum(formData.bedrooms) : undefined,
        bathrooms: propertyTypeFields.bathrooms ? toNum(formData.bathrooms) : undefined,
        balconies: propertyTypeFields.balconies ? toNum(formData.balconies) : undefined,
        floor_number: propertyTypeFields.floor_number ? toNum(formData.floor_number) : undefined,
        total_floors: propertyTypeFields.total_floors ? toNum(formData.total_floors) : undefined,
        furnishing:
          propertyTypeFields.furnishing && formData.furnishing
            ? formData.furnishing
            : undefined,
        facing:
          propertyTypeFields.facing && formData.facing ? formData.facing : undefined,
        construction_status: cleanConstructionStatus,
        possession_date: cleanPossessionDate,
        property_age: propertyTypeFields.property_age
          ? toNum(formData.property_age)
          : undefined,
        parking:
          propertyTypeFields.parking && formData.parking
            ? Number(formData.parking)
            : undefined,
        amenities_data: cleanAmenitiesData.length > 0 ? cleanAmenitiesData : undefined,
        nearby_places: cleanNearbyPlaces.length > 0 ? cleanNearbyPlaces : undefined,
        image_url: Array.isArray(formData.image_url) ? formData.image_url : [],
        map_url: formData.map_url?.trim().startsWith("http")
          ? formData.map_url.trim()
          : undefined,
        media_url: formData.media_url?.trim().startsWith("http")
          ? formData.media_url.trim()
          : undefined,
        pincode: formData.pincode?.trim() || undefined,
        owner_name: formData.owner_name?.trim() || undefined,
        developer_name: devName || undefined,
        project_name: formData.project_name?.trim() || undefined,
        status: isDraft
          ? "draft"
          : formData.status === "draft"
          ? "available"
          : formData.status || "available",
        isFeatured: Boolean(formData.isFeatured),
        isVerified: Boolean(formData.isVerified),
      };

      if (isObjectId(resolvedDraftType)) {
        propertyData.type = resolvedDraftType;
      }

      let res;
      if (editingProperty?._id) {
        // UPDATE EXISTING PROPERTY:
        // Do NOT send created_by, agent_id, or _id as backend Joi validator strictly rejects unknown fields
        res = await axiosInstance.put(`/property/${editingProperty._id}`, propertyData, {
          skipAuthRedirect: true,
        } as any);
        const updated = res.data?.result || res.data?.data || res.data || propertyData;

        const draftKey = getDraftKey(editingProperty._id);
        removeLocalDraft(draftKey);
        removeLocalDraft("new");
        if (initialAgentId) removeLocalDraft(`agent_${initialAgentId}`);
        setIsRestoredDraft(false);
        setAutoSaveStatus("idle");

        toast({
          title: isDraft
            ? "Property Draft Saved!"
            : editingProperty.status === "draft" || isRestoredDraft
            ? "Draft Published Successfully!"
            : "Property Listing Updated!",
          description: `"${propertyData.name}" has been ${
            isDraft ? "saved as a draft." : "published successfully to Available listings."
          }`,
        });

        if (onSuccess) {
          onSuccess(updated);
        }
        return updated;
      } else {
        // CREATE NEW PROPERTY:
        // Include created_by if valid ObjectId
        const createPayload: any = {
          ...propertyData,
          ...(isObjectId(activeAgentId) ? { created_by: activeAgentId } : {}),
        };

        try {
          res = await axiosInstance.post("/property", createPayload, {
            skipAuthRedirect: true,
          } as any);
        } catch (postErr: any) {
          const errMsg = String(postErr?.response?.data?.msg || postErr?.response?.data?.message || "");
          if (errMsg.includes("created_by") && createPayload.created_by) {
            delete createPayload.created_by;
            res = await axiosInstance.post("/property", createPayload, {
              skipAuthRedirect: true,
            } as any);
          } else {
            throw postErr;
          }
        }

        const created = res.data?.result || res.data?.data || res.data || createPayload;

        const draftKey = getDraftKey();
        removeLocalDraft(draftKey);
        removeLocalDraft("new");
        if (initialAgentId) removeLocalDraft(`agent_${initialAgentId}`);
        setIsRestoredDraft(false);
        setAutoSaveStatus("idle");

        toast({
          title: isDraft
            ? "Property Draft Saved!"
            : isRestoredDraft
            ? "Draft Published Successfully!"
            : "Agent Property Published!",
          description: `"${propertyData.name}" has been ${
            isDraft ? "saved as draft." : "successfully published to Available listings."
          }`,
        });

        if (onSuccess) {
          onSuccess(created);
        }
        return created;
      }
    } catch (err: any) {
      console.warn("Failed to save property via API, saving to local state:", err);
      const isDraft = overrideStatus === "draft";
      const draftKey = getDraftKey(editingProperty?._id);

      // Always save draft locally in localStorage so agent work is NEVER lost
      saveLocalDraft(draftKey, {
        propertyId: editingProperty?._id || null,
        editingProperty,
        formData: { ...formData, status: isDraft ? "draft" : formData.status || "available" },
        formActiveTab,
        name: formData.name,
      });
      setIsRestoredDraft(true);
      setAutoSaveStatus("saved");

      const errStatus = err?.response?.status;
      const errMsg = err?.response?.data?.msg || err?.response?.data?.message || err?.message || "";
      const isAuthIssue = errStatus === 401 || errStatus === 403;

      const fallbackObj = {
        _id: editingProperty?._id || `local_draft_${draftKey}`,
        name: formData.name || "Untitled Property Draft",
        type: formData.type || (propertyTypes[0]?._id) || "Apartment",
        price: formData.price ? Number(formData.price) : 0,
        location: {
          city: formData.city || "Draft City",
          area: formData.area || "",
          address: formData.address || "",
        },
        status: isDraft ? "draft" : formData.status || "available",
        agentId: targetAgentId || initialAgentId || "",
        agentName: targetAgentName || initialAgentName || "Agent",
        image_url: Array.isArray(formData.image_url) ? formData.image_url : [],
        isLocalDraft: true,
        localDraftId: draftKey,
        localDraftData: {
          draftId: draftKey,
          propertyId: editingProperty?._id || null,
          editingProperty,
          formData: { ...formData, status: "draft" },
          formActiveTab,
          name: formData.name,
          timestamp: Date.now(),
          lastSavedAt: new Date().toISOString(),
        },
      };

      toast({
        title: isDraft ? "Draft Saved Successfully!" : "Saved Locally (Offline)",
        description: isAuthIssue
          ? `Draft is stored and ready in your Drafts tab.`
          : isDraft
          ? `Draft stored in your Drafts tab.`
          : `Property saved: "${formData.name}".`,
      });

      if (onSuccess) {
        onSuccess(fallbackObj);
      }
      return fallbackObj;
    } finally {
      setLoading(false);
    }
  };

  // Stepper navigation helpers
  const stepIds = ["basic", "specs", "media", "amenities", "settings"];
  const currentStepIdx = stepIds.indexOf(formActiveTab);
  const progressPercent = Math.round(((currentStepIdx + 1) / stepIds.length) * 100);

  const handleNext = () => {
    if (currentStepIdx < stepIds.length - 1) {
      setFormActiveTab(stepIds[currentStepIdx + 1]);
    }
  };

  const handlePrev = () => {
    if (currentStepIdx > 0) {
      setFormActiveTab(stepIds[currentStepIdx - 1]);
    }
  };

  const handleSaveDraft = async (
    targetAgentId?: string,
    targetAgentName?: string
  ) => {
    return handleSubmit(undefined, targetAgentId, targetAgentName, "draft");
  };

  return {
    editingProperty,
    setEditingProperty,
    populateForEdit,
    formData,
    setFormData,
    formActiveTab,
    setFormActiveTab,
    loading,
    imageUploading,
    propertyTypes,
    propertyTypeFields,
    amenities,
    amenityTypes,
    selectedAmenity,
    selectedAmenityTypes,
    setSelectedAmenityTypes,
    amenityDropdownOpen,
    setAmenityDropdownOpen,
    handleInputChange,
    handleLocationChange,
    handlePropertyTypeChange,
    handleAmenitySelect,
    toggleAmenityType,
    addAmenity,
    removeAmenity,
    removeAmenityType,
    viewAmenity,
    editAmenity,
    editingAmenityIndex,
    getAmenityName,
    getAmenityTypeName,
    addNearbyPlace,
    updateNearbyPlace,
    removeNearbyPlace,
    handleImageUpload,
    removeImage,
    resetForm,
    handleSubmit,
    handleSaveDraft,
    autoSaveStatus,
    lastSavedTime,
    isRestoredDraft,
    handleDiscardDraft,
    hasUnsavedChanges,
    stepIds,
    currentStepIdx,
    progressPercent,
    handleNext,
    handlePrev,
  };
}
