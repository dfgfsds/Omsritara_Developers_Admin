import React from "react";
import { MapPin, X, Sparkles, Edit } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Property } from "./types";
import {
  getPropertyCoverInfo,
  getStatusBadgeVariant,
  VILLA_FALLBACKS,
} from "./constants";

interface PropertyQuickViewDialogProps {
  property: Property | null;
  activeImage: number;
  setActiveImage: (idx: number) => void;
  onClose: () => void;
  onEdit: (property: Property) => void;
  getPropertyTypeName: (type: any) => string;
  getAmenityName: (amenityId: string) => string;
  getAmenityTypeName?: (amenityId: string, typeId: string) => string;
  allAmenities?: any[];
}

export const PropertyQuickViewDialog: React.FC<PropertyQuickViewDialogProps> = ({
  property,
  activeImage,
  setActiveImage,
  onClose,
  onEdit,
  getPropertyTypeName,
  getAmenityName,
  getAmenityTypeName,
  allAmenities,
}) => {
  if (!property) return null;

  return (
    <Dialog open={Boolean(property)} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-h-[92vh] w-[95vw] max-w-3xl overflow-y-auto rounded-3xl p-0 border border-slate-200">
        <div>
          {/* Hero Image / Showcase */}
          <div className="relative h-56 sm:h-64 md:h-72 w-full bg-slate-950 overflow-hidden">
            <img
              src={
                property.image_url?.[activeImage] ||
                getPropertyCoverInfo(property).url
              }
              alt={property.name || "Property Showcase"}
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = VILLA_FALLBACKS[0];
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-black/30 pointer-events-none" />

            {/* Floating Top Badges */}
            <div className="absolute left-4 top-4 flex items-center gap-2 z-20">
              <Badge className="bg-white/95 text-slate-950 font-black border border-slate-200 shadow-md backdrop-blur-sm">
                For {property.listing_type || "Sale"}
              </Badge>
              <span
                className={`rounded-full border px-2.5 py-0.5 text-xs font-black capitalize backdrop-blur-sm shadow-md ${getStatusBadgeVariant(
                  property.status
                )}`}
              >
                {(property.status || "available").replace(/_/g, " ")}
              </span>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 z-20 flex h-8.5 w-8.5 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur-sm hover:bg-black/90 shadow-md transition"
            >
              <X className="h-4 w-4 stroke-[3]" />
            </button>

            {/* Gallery Thumbnails Overlay */}
            {property.image_url && property.image_url.length > 1 && (
              <div className="absolute bottom-2.5 left-3.5 right-3.5 z-20 flex items-center gap-2 overflow-x-auto rounded-2xl bg-black/60 p-1.5 backdrop-blur-md">
                {property.image_url.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImage(idx)}
                    className={`relative h-10 w-14 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                      activeImage === idx
                        ? "border-primary scale-105"
                        : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="Thumbnail" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Content */}
          <div className="space-y-6 p-7">
            <div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-950">
                    {property.name}
                  </h2>
                  <p className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mt-1">
                    <MapPin className="h-4 w-4 text-primary shrink-0" />
                    {[
                      property.location?.address,
                      property.location?.area,
                      property.location?.city,
                      property.location?.state,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <span className="block text-[11px] font-black uppercase tracking-wider text-slate-600">Price</span>
                  <span className="text-2xl font-black text-primary">
                    {property.price !== undefined
                      ? `₹${property.price.toLocaleString("en-IN")}`
                      : "Price on Request"}
                  </span>
                </div>
              </div>
            </div>

            {/* Key Specs Grid */}
            <div className="grid grid-cols-2 gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4.5 sm:grid-cols-4">
              <div>
                <span className="text-[11px] font-black text-slate-600 uppercase tracking-wider">Type</span>
                <p className="text-xs font-black text-slate-950">
                  {getPropertyTypeName(property.type)}
                </p>
              </div>
              <div>
                <span className="text-[11px] font-black text-slate-600 uppercase tracking-wider">Area</span>
                <p className="text-xs font-black text-slate-950">
                  {property.area_size
                    ? `${property.area_size} ${property.area_unit || "sqft"}`
                    : "-"}
                </p>
              </div>
              <div>
                <span className="text-[11px] font-black text-slate-600 uppercase tracking-wider">Bedrooms</span>
                <p className="text-xs font-black text-slate-950">
                  {property.bedrooms ? `${property.bedrooms} BHK` : "-"}
                </p>
              </div>
              <div>
                <span className="text-[11px] font-black text-slate-600 uppercase tracking-wider">Bathrooms</span>
                <p className="text-xs font-black text-slate-950">
                  {property.bathrooms ? `${property.bathrooms} Baths` : "-"}
                </p>
              </div>
              <div>
                <span className="text-[11px] font-black text-slate-600 uppercase tracking-wider">Furnishing</span>
                <p className="text-xs font-black capitalize text-slate-950">
                  {property.furnishing?.replace(/_/g, " ") || "-"}
                </p>
              </div>
              <div>
                <span className="text-[11px] font-black text-slate-600 uppercase tracking-wider">Facing</span>
                <p className="text-xs font-black text-slate-950">
                  {property.facing || "-"}
                </p>
              </div>
              <div>
                <span className="text-[11px] font-black text-slate-600 uppercase tracking-wider">Construction</span>
                <p className="text-xs font-black capitalize text-slate-950">
                  {property.construction_status?.replace(/_/g, " ") || "-"}
                </p>
              </div>
              <div>
                <span className="text-[11px] font-black text-slate-600 uppercase tracking-wider">Parking</span>
                <p className="text-xs font-black text-slate-950">
                  {property.parking || "-"}
                </p>
              </div>
            </div>

            {/* Description */}
            {property.description && (
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  Description
                </h4>
                <p className="mt-1 text-xs font-semibold leading-relaxed text-slate-800">
                  {property.description}
                </p>
              </div>
            )}

            {/* Featured Amenities Section */}
            {property.amenities_data && property.amenities_data.length > 0 && (() => {
              // Group amenities by category / type name
              const groupsMap = new Map<string, Set<string>>();

              const isHexId = (str: string) => /^[0-9a-fA-F]{24}$/.test(str);

              const resolveCatName = (catRef: any): string => {
                if (!catRef) return "";
                if (typeof catRef === "object" && catRef?.name) return catRef.name.trim();
                const id = typeof catRef === "string" ? catRef : catRef?._id || catRef?.id;
                if (!id) return "";
                let name = getAmenityName ? getAmenityName(id) : "";
                if (name && name !== id && !isHexId(name)) return name.trim();
                const matchedAmenity = allAmenities?.find((a) => a._id === id);
                if (matchedAmenity?.amenities_type?.name) {
                  return matchedAmenity.amenities_type.name.trim();
                }
                return "";
              };

              const resolveAmenityName = (subRef: any, catId?: string): string => {
                if (!subRef) return "";
                if (typeof subRef === "object" && subRef?.name) return subRef.name.trim();
                const id = typeof subRef === "string" ? subRef : subRef?._id || subRef?.id;
                if (!id) return "";
                const matched = allAmenities?.find((a) => a._id === id);
                if (matched?.name) return matched.name.trim();
                if (getAmenityTypeName) {
                  const typeName = getAmenityTypeName(catId || "", id);
                  if (typeName && typeName !== id && !isHexId(typeName)) return typeName.trim();
                }
                if (getAmenityName) {
                  const aName = getAmenityName(id);
                  if (aName && aName !== id && !isHexId(aName)) return aName.trim();
                }
                return "";
              };

              property.amenities_data.forEach((item: any) => {
                if (!item) return;

                const rawTypes = Array.isArray(item.amenity_types)
                  ? item.amenity_types
                  : Array.isArray(item.amenities)
                  ? item.amenities
                  : [];

                // Case A: Frontend format (item.amenities is category, item.amenity_types is sub-amenities)
                if (rawTypes.length > 1) {
                  let categoryName = resolveCatName(item.amenities);
                  if (!categoryName) categoryName = "General Features";

                  if (!groupsMap.has(categoryName)) {
                    groupsMap.set(categoryName, new Set<string>());
                  }
                  const set = groupsMap.get(categoryName)!;

                  rawTypes.forEach((sub: any) => {
                    const aName = resolveAmenityName(
                      sub,
                      typeof item.amenities === "string" ? item.amenities : item.amenities?._id
                    );
                    if (aName) set.add(aName);
                  });
                  return;
                }

                // Case B: Backend format (item.amenities is amenity, item.amenity_types is [category])
                const rawAmenity = item.amenities;
                const rawCat = rawTypes[0];

                let categoryName = resolveCatName(rawCat);
                const rawAmenityId = typeof rawAmenity === "object" ? rawAmenity?._id : rawAmenity;
                const amenityName = resolveAmenityName(
                  rawAmenity,
                  typeof rawCat === "string" ? rawCat : rawCat?._id
                );

                if (!categoryName && rawAmenityId) {
                  const matched = allAmenities?.find((a) => a._id === rawAmenityId);
                  if (matched?.amenities_type) {
                    categoryName = resolveCatName(matched.amenities_type);
                  }
                }

                if (!categoryName) categoryName = "General Features";

                if (amenityName) {
                  if (!groupsMap.has(categoryName)) {
                    groupsMap.set(categoryName, new Set<string>());
                  }
                  groupsMap.get(categoryName)!.add(amenityName);
                }
              });

              // Filter out empty groups
              const validGroups: { category: string; items: string[] }[] = [];
              groupsMap.forEach((itemsSet, category) => {
                if (itemsSet.size > 0) {
                  validGroups.push({
                    category,
                    items: Array.from(itemsSet),
                  });
                }
              });

              if (validGroups.length === 0) return null;

              return (
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-3">
                    Featured Amenities
                  </h4>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {validGroups.map((group, gIdx) => (
                      <div
                        key={gIdx}
                        className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-4 space-y-2.5 transition-all hover:bg-slate-50 hover:border-slate-300"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-primary">
                              <Sparkles className="h-3.5 w-3.5" />
                            </div>
                            <span className="text-xs font-black text-slate-900 uppercase tracking-wide">
                              {group.category}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                            {group.items.length}
                          </span>
                        </div>

                        {/* Badges for Amenities under this category */}
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {group.items.map((amenityName, aIdx) => (
                            <Badge
                              key={aIdx}
                              variant="secondary"
                              className="rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 bg-white border border-slate-200/90 shadow-2xs hover:bg-slate-100"
                            >
                              {amenityName}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Nearby Places */}
            {property.nearby_places && property.nearby_places.length > 0 && (
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  Nearby Landmarks
                </h4>
                <div className="mt-2 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                  {property.nearby_places.map((place, i) => (
                    <div
                      key={i}
                      className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3 text-xs shadow-xs"
                    >
                      <p className="font-black text-slate-950">{place.name}</p>
                      <p className="text-[11px] font-bold text-slate-700 mt-0.5">
                        {place.type} • {place.distance} {place.distance_unit || "km"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer Edit Shortcut */}
            <div className="flex justify-end gap-2.5 border-t border-slate-200 pt-5">
              <Button
                variant="outline"
                className="rounded-2xl border-slate-300 font-bold text-slate-800"
                onClick={onClose}
              >
                Close
              </Button>
              <Button
                className="rounded-2xl bg-gradient-to-r from-primary to-rose-600 font-black text-white shadow-md"
                onClick={() => {
                  onClose();
                  onEdit(property);
                }}
              >
                <Edit className="mr-1.5 h-4 w-4 stroke-[2.5]" />
                Edit This Property
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
