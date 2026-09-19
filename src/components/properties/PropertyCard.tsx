import React from "react";
import {
  MapPin,
  Eye,
  Edit,
  Trash2,
  Star,
  ShieldCheck,
  ImageIcon,
  Sparkles,
  Layers,
  UploadCloud,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Property } from "./types";
import {
  getPropertyCoverInfo,
  getStatusBadgeVariant,
  formatIndianCurrency,
  VILLA_FALLBACKS,
} from "./constants";

interface PropertyCardProps {
  property: Property;
  onQuickView: (property: Property) => void;
  onEdit: (property: Property) => void;
  onDelete: (id: string) => void;
  onStatusChange: (property: Property) => void;
  onToggleFeatured?: (property: Property) => void;
  onToggleVerified?: (property: Property) => void;
  onPublish?: (property: Property) => void;
  getPropertyTypeName: (type: any) => string;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onQuickView,
  onEdit,
  onDelete,
  onStatusChange,
  onToggleFeatured,
  onToggleVerified,
  onPublish,
  getPropertyTypeName,
}) => {
  const cover = getPropertyCoverInfo(property);
  const amenitiesCount = property.amenities_data?.length || 0;

  return (
    <div className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-slate-300">
      {/* Card Photo & Badges */}
      <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-950">
        <img
          src={cover.url}
          alt={property.name || "Property Showcase"}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = VILLA_FALLBACKS[0];
          }}
        />

        {/* Minimal delicate top gradient vignette - never obscures the photo */}
        <div className="absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-black/45 via-black/15 to-transparent pointer-events-none" />

        {/* Floating Top Header: Clean, non-intrusive corner chips with comfortable spacing */}
        <div className="absolute inset-x-3.5 top-3.5 flex items-center justify-between z-20 pointer-events-none">
          {/* Top Left: Purpose & Status chips side-by-side with generous margin from the corner */}
          <div className="flex items-center gap-2 pointer-events-auto">
            <span className="rounded-full bg-slate-950/80 backdrop-blur-md text-white px-3 py-1 text-[10px] font-black uppercase tracking-wider shadow-sm border border-white/20">
              For {property.listing_type || "Sale"}
            </span>

            {/* Clickable cycle status */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onStatusChange(property);
              }}
              title="Click to cycle status (Available / Under Construction / Sold)"
              className={`rounded-full border px-3 py-1 text-[10px] font-black capitalize shadow-sm transition hover:scale-105 active:scale-95 ${getStatusBadgeVariant(
                property.status
              )}`}
            >
              {(property.status || "available").replace(/_/g, " ")}
            </button>
          </div>

          {/* Top Right: Compact Circular Glass Icon Toggles for Feature & Verify */}
          <div className="flex items-center gap-1.5 pointer-events-auto">
            {/* Interactive Featured Toggle */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFeatured?.(property);
              }}
              title={property.isFeatured ? "Featured listing (Click to remove)" : "Click to feature this property"}
              className={`flex h-7 w-7 items-center justify-center rounded-full shadow-md backdrop-blur-md transition-all active:scale-90 ${
                property.isFeatured
                  ? "bg-amber-500 text-white ring-2 ring-white/60 shadow-amber-500/40"
                  : "bg-slate-950/60 text-white/80 hover:bg-amber-500 hover:text-white border border-white/20"
              }`}
            >
              <Star
                className={`h-3.5 w-3.5 ${
                  property.isFeatured ? "fill-white text-white" : "text-amber-400"
                }`}
              />
            </button>

            {/* Interactive Verified Toggle */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleVerified?.(property);
              }}
              title={property.isVerified ? "Verified listing (Click to remove)" : "Click to verify listing"}
              className={`flex h-7 w-7 items-center justify-center rounded-full shadow-md backdrop-blur-md transition-all active:scale-90 ${
                property.isVerified
                  ? "bg-emerald-600 text-white ring-2 ring-white/60 shadow-emerald-600/40"
                  : "bg-slate-950/60 text-white/80 hover:bg-emerald-600 hover:text-white border border-white/20"
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>

      {/* Card Body with generous padding away from all edges */}
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        {/* Title & Type */}
        <div className="mb-2">
          <h3
            className="line-clamp-1 text-sm font-black text-slate-950 transition group-hover:text-primary cursor-pointer"
            onClick={() => onQuickView(property)}
          >
            {property.name || "Exclusive Property"}
          </h3>
          <div className="flex items-center gap-1.5 mt-1.5 text-xs font-bold text-primary flex-wrap">
            <span>{getPropertyTypeName(property.type)}</span>
            {property.project_name && (
              <>
                <span className="text-slate-300">•</span>
                <span className="text-slate-600 font-semibold truncate">
                  {property.project_name}
                </span>
              </>
            )}

            {/* Badges in Card Body: Architectural Visual, Featured, Verified */}
            {!cover.isReal && cover.badgeText && (
              <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-800 bg-amber-50 border border-amber-300 px-2 py-0.5 rounded-md shadow-2xs">
                <Sparkles className="h-2.5 w-2.5 text-amber-600" />
                {cover.badgeText}
              </span>
            )}
            {property.isFeatured && (
              <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-900 bg-amber-100/70 border border-amber-300 px-1.5 py-0.5 rounded-md">
                <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                Featured
              </span>
            )}
            {property.isVerified && (
              <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-900 bg-emerald-100/70 border border-emerald-300 px-1.5 py-0.5 rounded-md">
                <ShieldCheck className="h-2.5 w-2.5 text-emerald-600" />
                Verified
              </span>
            )}
          </div>
        </div>

        {/* Location */}
        <div className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-slate-700">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
          <span className="truncate">
            {[property.location?.area, property.location?.city]
              .filter(Boolean)
              .join(", ") ||
              property.location?.address ||
              "Prime Location, Chennai"}
          </span>
        </div>

        {/* Quick Specs Pill Row */}
        <div className="mb-3.5 grid grid-cols-3 gap-1 rounded-2xl bg-slate-100/90 border border-slate-200/80 p-2 text-center text-xs">
          <div className="flex flex-col justify-center px-1">
            <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-600">
              Area
            </span>
            <span className="font-black text-slate-950 text-xs truncate">
              {property.area_size
                ? `${property.area_size} ${property.area_unit || "sqft"}`
                : "Plot / Site"}
            </span>
          </div>
          <div className="flex flex-col justify-center border-x border-slate-300 px-1">
            <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-600">
              {property.bedrooms ? "Config" : property.facing ? "Facing" : "Category"}
            </span>
            <span className="font-black text-slate-950 text-xs truncate">
              {property.bedrooms
                ? `${property.bedrooms} BHK`
                : property.facing
                ? `${property.facing}`
                : getPropertyTypeName(property.type)}
            </span>
          </div>
          <div className="flex flex-col justify-center px-1">
            <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-600">
              {property.bathrooms ? "Baths" : "Status"}
            </span>
            <span className="font-black text-slate-950 text-xs truncate capitalize">
              {property.bathrooms
                ? `${property.bathrooms} Bath`
                : property.construction_status
                ? property.construction_status.replace(/_/g, " ")
                : (property.status || "Ready")}
            </span>
          </div>
        </div>

        {/* Amenities Badge Tag */}
        {amenitiesCount > 0 && (
          <div className="mb-3.5 flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 border border-slate-200/90 px-2 py-0.5 text-[10px] font-bold text-slate-700">
              <Layers className="h-3 w-3 text-primary" />
              {amenitiesCount} {amenitiesCount === 1 ? "Amenity" : "Amenities"} Attached
            </span>
          </div>
        )}

        {/* Price & Actions Row */}
        <div className="mt-auto flex items-center justify-between border-t border-slate-200 pt-3">
          <div>
            <span className="block text-[10px] font-black uppercase tracking-wider text-slate-500">
              Valuation
            </span>
            <span className="text-base font-black text-slate-950">
              {property.price !== undefined && property.price !== null
                ? formatIndianCurrency(property.price)
                : "Price on Request"}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {property.status === "draft" && onPublish && (
              <Button
                variant="outline"
                size="sm"
                className="h-8.5 rounded-xl px-2.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-300 shadow-xs flex items-center gap-1 mr-1"
                onClick={() => onPublish(property)}
                title="Publish Draft to Live Catalog"
              >
                <UploadCloud className="h-3.5 w-3.5 text-emerald-600 stroke-[2.5]" />
                Publish
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8.5 w-8.5 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-slate-100"
              onClick={() => onQuickView(property)}
              title="Quick Preview"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8.5 w-8.5 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-slate-100"
              onClick={() => onEdit(property)}
              title="Edit Property"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8.5 w-8.5 rounded-xl text-rose-600 hover:bg-rose-100"
              onClick={() => onDelete(property._id)}
              title="Delete Property"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
