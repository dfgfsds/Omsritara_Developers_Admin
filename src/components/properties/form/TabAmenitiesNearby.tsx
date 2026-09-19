import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  MapPin,
  Plus,
  X,
  Trash2,
  Check,
  ChevronDown,
  Search,
  CheckSquare,
  Square,
  Eye,
  Edit,
  Shield,
  Droplets,
  Car,
  GraduationCap,
  Activity,
  HeartPulse,
  ShoppingBag,
  Layers,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PropertyFormData,
  Amenity,
  AmenityType,
  FormAmenityData,
} from "../types";
import { NEARBY_PRESETS } from "../constants";

interface TabAmenitiesNearbyProps {
  formData: PropertyFormData;
  handleInputChange?: (field: keyof PropertyFormData, value: any) => void;
  amenities: Amenity[];
  amenityTypes?: AmenityType[];
  selectedAmenity?: string;
  selectedAmenityTypes?: string[];
  setSelectedAmenityTypes?: React.Dispatch<React.SetStateAction<string[]>>;
  amenityDropdownOpen?: boolean;
  setAmenityDropdownOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  handleAmenitySelect?: (val: string) => void;
  toggleAmenityType?: (id: string) => void;
  addAmenity?: () => void;
  editingAmenityIndex?: number | null;
  getAmenityTypeName?: (amenityId: string, typeId: string) => string;
  getAmenityName?: (amenityId: string) => string;
  removeAmenityType?: (amenityId: string, typeId: string) => void;
  viewAmenity?: (item: FormAmenityData) => void;
  editAmenity?: (index: number) => void;
  removeAmenity?: (amenityId: string) => void;
  addNearbyPlace: (presetType?: string) => void;
  updateNearbyPlace: (index: number, field: string, value: string) => void;
  removeNearbyPlace: (index: number) => void;
}

// Icon helper for standard amenities categories
const getAmenityCategoryIcon = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes("security") || lower.includes("guard")) return Shield;
  if (lower.includes("water")) return Droplets;
  if (lower.includes("transport") || lower.includes("road") || lower.includes("bus")) return Car;
  if (lower.includes("education") || lower.includes("school")) return GraduationCap;
  if (lower.includes("recreation") || lower.includes("sport") || lower.includes("pool") || lower.includes("club")) return Activity;
  if (lower.includes("health") || lower.includes("hospital") || lower.includes("medical")) return HeartPulse;
  if (lower.includes("shop") || lower.includes("retail") || lower.includes("mall")) return ShoppingBag;
  return Sparkles;
};

export const TabAmenitiesNearby: React.FC<TabAmenitiesNearbyProps> = ({
  formData,
  handleInputChange,
  amenities,
  amenityTypes = [],
  selectedAmenity = "",
  selectedAmenityTypes = [],
  setSelectedAmenityTypes,
  amenityDropdownOpen = false,
  setAmenityDropdownOpen,
  handleAmenitySelect,
  toggleAmenityType,
  addAmenity,
  editingAmenityIndex = null,
  getAmenityTypeName,
  getAmenityName,
  removeAmenityType,
  viewAmenity,
  editAmenity,
  removeAmenity,
  addNearbyPlace,
  updateNearbyPlace,
  removeNearbyPlace,
}) => {
  const [searchFilter, setSearchFilter] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        if (setAmenityDropdownOpen) {
          setAmenityDropdownOpen(false);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setAmenityDropdownOpen]);

  // Resolve Category Name
  const resolveCategoryName = (id: string) => {
    if (getAmenityName) return getAmenityName(id);
    return amenities.find((a) => a._id === id)?.name || id;
  };

  // Resolve Sub-amenity Name
  const resolveSubAmenityName = (amenityId: string, typeId: string) => {
    if (getAmenityTypeName) return getAmenityTypeName(amenityId, typeId);
    return (
      amenityTypes.find((t) => t._id === typeId)?.name || typeId
    );
  };

  // Filter amenities list inside the multi-select dropdown
  const filteredAmenityTypes = amenityTypes.filter((type) =>
    type.name.toLowerCase().includes(searchFilter.toLowerCase().trim())
  );

  // Toggle single amenity checkbox
  const handleToggle = (id: string) => {
    if (toggleAmenityType) {
      toggleAmenityType(id);
    }
  };

  // Select all filtered amenities
  const handleSelectAll = () => {
    if (!setSelectedAmenityTypes) return;
    const allIds = Array.from(
      new Set([...selectedAmenityTypes, ...filteredAmenityTypes.map((t) => t._id)])
    );
    setSelectedAmenityTypes(allIds);
  };

  // Clear all selected amenities for current category
  const handleClearAll = () => {
    if (setSelectedAmenityTypes) {
      setSelectedAmenityTypes([]);
    }
  };

  const selectedCategoryObj = amenities.find((a) => a._id === selectedAmenity);
  const SelectedCategoryIcon = selectedCategoryObj
    ? getAmenityCategoryIcon(selectedCategoryObj.name)
    : Sparkles;

  return (
    <div className="space-y-6">
      {/* Amenities & Lifestyle Features Card */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 md:p-6 shadow-xs">
        <div className="mb-5 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-xs">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Amenities & Lifestyle Features
              </h3>
              <p className="text-xs text-slate-500">
                Select an Amenities Type first, then multi-select the amenities available for this property
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className="border-slate-200 bg-slate-100 text-slate-700 text-xs font-semibold px-3 py-1 rounded-xl shadow-xs"
          >
            {formData.amenities_data.length} {formData.amenities_data.length === 1 ? "Type" : "Types"} Configured
          </Badge>
        </div>

        {/* 2-Dropdown Interactive Selector Box */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 md:p-5 shadow-xs">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_2fr_auto] lg:items-end">
            {/* DROPDOWN 1: Amenities Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span>1. Select Amenities Type</span>
                <span className="text-[10px] font-semibold text-primary bg-primary/10 px-1.5 py-0.2 rounded-md">
                  Category
                </span>
              </label>
              <Select
                value={selectedAmenity || undefined}
                onValueChange={(val) => {
                  if (handleAmenitySelect) handleAmenitySelect(val);
                }}
              >
                <SelectTrigger className="h-10 rounded-xl border-slate-200 bg-white text-xs font-semibold text-slate-900 shadow-xs hover:border-slate-300 focus:ring-1 focus:ring-primary">
                  <div className="flex items-center gap-2 truncate">
                    {selectedAmenity ? (
                      <>
                        <SelectedCategoryIcon className="h-4 w-4 text-primary shrink-0" />
                        <span className="truncate">{resolveCategoryName(selectedAmenity)}</span>
                      </>
                    ) : (
                      <span className="text-slate-400 font-normal">
                        Choose Amenities Type (e.g. Recreation, Security...)
                      </span>
                    )}
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-xl max-h-64 shadow-xl border-slate-200">
                  {amenities.map((item) => {
                    const Icon = getAmenityCategoryIcon(item.name);
                    return (
                      <SelectItem
                        key={item._id}
                        value={item._id}
                        className="text-xs font-semibold text-slate-800 py-2.5 px-3 rounded-lg cursor-pointer transition-colors focus:bg-slate-100 focus:text-slate-950 data-[highlighted]:bg-slate-100 data-[highlighted]:text-slate-950"
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="h-4 w-4 text-primary shrink-0" />
                          <span className="font-semibold text-slate-900">{item.name}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* DROPDOWN 2: Amenities (Multi-Select) */}
            <div className="relative space-y-1.5" ref={dropdownRef}>
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span>2. Select Amenities</span>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-md">
                    Multi-Select
                  </span>
                </label>
                {selectedAmenity && selectedAmenityTypes.length > 0 && (
                  <span className="text-[11px] font-bold text-primary">
                    {selectedAmenityTypes.length} Selected
                  </span>
                )}
              </div>

              {/* Multi-Select Trigger Button */}
              <button
                type="button"
                disabled={!selectedAmenity}
                onClick={() => {
                  if (setAmenityDropdownOpen) {
                    setAmenityDropdownOpen(!amenityDropdownOpen);
                  }
                }}
                className={`flex h-10 w-full items-center justify-between rounded-xl border bg-white px-3 text-xs font-semibold shadow-xs transition ${
                  !selectedAmenity
                    ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                    : "border-slate-200 text-slate-900 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-primary"
                }`}
              >
                <span className="truncate">
                  {!selectedAmenity
                    ? "Select Amenities Type first"
                    : selectedAmenityTypes.length === 0
                    ? "Choose Amenities (Click to open list)..."
                    : `${selectedAmenityTypes.length} Amenities Selected`}
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-slate-400 shrink-0 transition-transform ${
                    amenityDropdownOpen ? "rotate-180 text-primary" : ""
                  }`}
                />
              </button>

              {/* Multi-Select Dropdown Menu Popover */}
              {amenityDropdownOpen && selectedAmenity && (
                <div className="absolute left-0 right-0 top-full z-50 mt-1.5 max-h-72 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl animate-in fade-in-0 zoom-in-95">
                  {/* Search and Action Bar */}
                  <div className="border-b border-slate-100 bg-slate-50/90 p-2.5 space-y-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                      <Input
                        value={searchFilter}
                        onChange={(e) => setSearchFilter(e.target.value)}
                        placeholder="Search amenities in this type..."
                        className="h-8 pl-8 text-xs bg-white border-slate-200 rounded-lg"
                        autoFocus
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 px-1">
                      <span>
                        {filteredAmenityTypes.length} Available
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleSelectAll}
                          className="text-primary hover:underline font-bold"
                        >
                          Select All
                        </button>
                        <span>•</span>
                        <button
                          type="button"
                          onClick={handleClearAll}
                          className="text-rose-600 hover:underline font-bold"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Amenities Checkbox List */}
                  <div className="max-h-48 overflow-y-auto p-1.5 space-y-0.5">
                    {filteredAmenityTypes.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-500">
                        {searchFilter
                          ? "No matching amenities found."
                          : "No amenities currently listed for this type."}
                      </div>
                    ) : (
                      filteredAmenityTypes.map((type) => {
                        const isChecked = selectedAmenityTypes.includes(type._id);
                        return (
                          <button
                            key={type._id}
                            type="button"
                            onClick={() => handleToggle(type._id)}
                            className={`group flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all border ${
                              isChecked
                                ? "bg-primary/10 text-primary border-primary/25 font-bold shadow-xs hover:bg-primary/15 hover:text-primary"
                                : "text-slate-800 border-transparent hover:bg-slate-100 hover:text-slate-950"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              {isChecked ? (
                                <CheckSquare className="h-4 w-4 text-primary shrink-0" />
                              ) : (
                                <Square className="h-4 w-4 text-slate-300 group-hover:text-slate-500 shrink-0" />
                              )}
                              <span className={isChecked ? "text-primary font-bold" : "text-slate-800 group-hover:text-slate-950 font-medium"}>
                                {type.name}
                              </span>
                            </div>
                            {isChecked && (
                              <Check className="h-3.5 w-3.5 text-primary stroke-[3] shrink-0" />
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ACTION BUTTON: Add to Listing / Update */}
            <div>
              <Button
                type="button"
                onClick={() => {
                  if (addAmenity) addAmenity();
                }}
                disabled={!selectedAmenity || selectedAmenityTypes.length === 0}
                className="h-10 w-full sm:w-auto rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 shadow-xs disabled:opacity-40"
              >
                <Plus className="mr-1.5 h-3.5 w-3.5 stroke-[3]" />
                {editingAmenityIndex !== null ? "Update Amenities" : "Add to Listing"}
              </Button>
            </div>
          </div>

          {/* Live Badges Preview of Selected Amenities */}
          {selectedAmenity && selectedAmenityTypes.length > 0 && (
            <div className="mt-3.5 border-t border-slate-200/80 pt-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700">
                  Ready to add under {resolveCategoryName(selectedAmenity)}:
                </span>
                <span className="text-[11px] font-semibold text-slate-500">
                  {selectedAmenityTypes.length} amenities chosen
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selectedAmenityTypes.map((typeId) => (
                  <span
                    key={typeId}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-800 shadow-xs"
                  >
                    <span>{resolveSubAmenityName(selectedAmenity, typeId)}</span>
                    <button
                      type="button"
                      onClick={() => handleToggle(typeId)}
                      className="text-slate-400 hover:text-rose-600 ml-0.5"
                      title="Deselect"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Configured Amenities Groups List */}
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">
              Assigned Amenities to this Property:
            </span>
            <span className="text-xs font-semibold text-slate-500">
              {formData.amenities_data.length} Group{formData.amenities_data.length === 1 ? "" : "s"}
            </span>
          </div>

          {formData.amenities_data.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {formData.amenities_data.map((item, idx) => {
                const categoryName = resolveCategoryName(item.amenities);
                const Icon = getAmenityCategoryIcon(categoryName);
                const typesList = Array.isArray(item.amenity_types)
                  ? item.amenity_types
                  : [];

                return (
                  <div
                    key={`${item.amenities}-${idx}`}
                    className="flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs transition hover:border-slate-300"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <span className="text-xs font-bold text-slate-900">
                            {categoryName}
                          </span>
                        </div>
                        <Badge
                          variant="secondary"
                          className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md"
                        >
                          {typesList.length} {typesList.length === 1 ? "Amenity" : "Amenities"}
                        </Badge>
                      </div>

                      {/* Attached Amenities Pills */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {typesList.map((typeId) => (
                          <span
                            key={typeId}
                            className="inline-flex items-center gap-1 rounded-md bg-slate-50 border border-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-700"
                          >
                            <span>{resolveSubAmenityName(item.amenities, typeId)}</span>
                            {removeAmenityType && (
                              <button
                                type="button"
                                onClick={() => removeAmenityType(item.amenities, typeId)}
                                className="text-slate-400 hover:text-rose-600 transition"
                                title="Remove this amenity"
                              >
                                <X className="h-2.5 w-2.5" />
                              </button>
                            )}
                          </span>
                        ))}
                        {typesList.length === 0 && (
                          <span className="text-[11px] font-normal text-slate-400 italic">
                            Category added without specific sub-amenities
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons Row */}
                    <div className="mt-3 flex items-center justify-end gap-1 border-t border-slate-100 pt-2.5">
                      {viewAmenity && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                          onClick={() => viewAmenity(item)}
                          title="View Details"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      {editAmenity && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50"
                          onClick={() => editAmenity(idx)}
                          title="Edit Amenities"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      {removeAmenity && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                          onClick={() => removeAmenity(item.amenities)}
                          title="Delete Group"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 p-5 text-center text-xs text-slate-500">
              No amenities configured for this property yet. Select an Amenities Type above and pick its amenities to attach them.
            </div>
          )}
        </div>
      </div>

      {/* Nearby Landmarks & Connectivity Card (Undisturbed) */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 md:p-6 shadow-xs">
        <div className="mb-5 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700 shadow-xs">
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Nearby Places & Connectivity
              </h3>
              <p className="text-xs text-slate-500">
                1-Click presets for nearby hospitals, schools, metro stations, and hubs
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addNearbyPlace()}
            className="h-8 rounded-xl border-slate-200 font-semibold text-xs text-slate-700 hover:bg-slate-100"
          >
            <Plus className="mr-1 h-3 w-3" /> Add Place
          </Button>
        </div>

        {/* 1-Click Preset Chips */}
        <div className="mb-5">
          <p className="mb-2 text-xs font-bold text-slate-700">
            Quick 1-Click Landmarks:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {NEARBY_PRESETS.map((preset) => (
              <button
                key={preset.type}
                type="button"
                onClick={() => addNearbyPlace(preset.type)}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:border-primary hover:bg-primary/5 hover:text-primary shadow-xs"
              >
                <Plus className="h-2.5 w-2.5 text-primary" />
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Configured Nearby Places List */}
        {formData.nearby_places.length > 0 ? (
          <div className="space-y-2.5">
            {formData.nearby_places.map((place, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 gap-2.5 rounded-xl border border-slate-200 bg-slate-50/50 p-3 sm:grid-cols-[1.5fr_1.5fr_1fr_1fr_auto] sm:items-center"
              >
                <Input
                  value={place.name}
                  onChange={(e) => updateNearbyPlace(idx, "name", e.target.value)}
                  placeholder="Landmark name (e.g. Apollo Hospital)"
                  className="h-9 rounded-lg border-slate-200 text-xs font-medium text-slate-900 bg-white"
                />

                <Input
                  value={place.type}
                  onChange={(e) => updateNearbyPlace(idx, "type", e.target.value)}
                  placeholder="Place type (e.g. Hospital)"
                  className="h-9 rounded-lg border-slate-200 text-xs font-medium text-slate-900 bg-white"
                />

                <Input
                  type="number"
                  value={place.distance}
                  onChange={(e) => updateNearbyPlace(idx, "distance", e.target.value)}
                  placeholder="Distance"
                  className="h-9 rounded-lg border-slate-200 text-xs font-medium text-slate-900 bg-white"
                />

                <Select
                  value={place.distance_unit || "km"}
                  onValueChange={(val) => updateNearbyPlace(idx, "distance_unit", val)}
                >
                  <SelectTrigger className="h-9 rounded-lg border-slate-200 text-xs font-medium text-slate-900 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="km" className="text-xs font-medium text-slate-900">
                      km (Kilometers)
                    </SelectItem>
                    <SelectItem value="meters" className="text-xs font-medium text-slate-900">
                      m (Meters)
                    </SelectItem>
                    <SelectItem value="miles" className="text-xs font-medium text-slate-900">
                      miles
                    </SelectItem>
                    <SelectItem value="mins" className="text-xs font-medium text-slate-900">
                      mins walk
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                  onClick={() => removeNearbyPlace(idx)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 p-5 text-center text-xs text-slate-500">
            No nearby landmarks added yet. Use the 1-click presets above to quickly add school, hospital, metro, or mall.
          </div>
        )}
      </div>
    </div>
  );
};
