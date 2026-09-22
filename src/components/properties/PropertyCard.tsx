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
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-slate-300">
      {/* Card Photo & Badges */}
      <div className="relative aspect-video w-full h-48 sm:h-52 overflow-hidden bg-slate-950">
        <img
          src={cover.url}
          alt={property.name || "Property Showcase"}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = VILLA_FALLBACKS[0];
          }}
        />

        {/* Minimal delicate top gradient vignette */}
        <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-black/50 via-black/15 to-transparent pointer-events-none" />

        {/* Floating Top Header: Clean, non-intrusive corner chips */}
        <div className="absolute inset-x-3 top-2.5 flex items-center justify-between z-20 pointer-events-none">
          {/* Top Left: Purpose & Status chips */}
          <div className="flex items-center gap-1.5 pointer-events-auto">
            <span className="rounded-full bg-slate-950/80 backdrop-blur-md text-white px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider shadow-sm border border-white/20">
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
              className={`rounded-full border px-2.5 py-0.5 text-[10px] font-black capitalize shadow-sm transition hover:scale-105 active:scale-95 ${getStatusBadgeVariant(
                property.status
              )}`}
            >
              {(property.status || "available").replace(/_/g, " ")}
            </button>
          </div>

          {/* Top Right: Star (Featured) & Shield (Verified) Toggles */}
          <div className="flex items-center gap-1 pointer-events-auto">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFeatured?.(property);
              }}
              title={property.isFeatured ? "Featured listing (Click to remove)" : "Click to feature this property"}
              className={`flex h-6.5 w-6.5 items-center justify-center rounded-full shadow-md backdrop-blur-md transition-all active:scale-90 ${
                property.isFeatured
                  ? "bg-amber-500 text-white ring-2 ring-white/60 shadow-amber-500/40"
                  : "bg-slate-950/60 text-white/80 hover:bg-amber-500 hover:text-white border border-white/20"
              }`}
            >
              <Star
                className={`h-3 w-3 ${
                  property.isFeatured ? "fill-white text-white" : "text-amber-400"
                }`}
              />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleVerified?.(property);
              }}
              title={property.isVerified ? "Verified listing (Click to remove)" : "Click to verify listing"}
              className={`flex h-6.5 w-6.5 items-center justify-center rounded-full shadow-md backdrop-blur-md transition-all active:scale-90 ${
                property.isVerified
                  ? "bg-emerald-600 text-white ring-2 ring-white/60 shadow-emerald-600/40"
                  : "bg-slate-950/60 text-white/80 hover:bg-emerald-600 hover:text-white border border-white/20"
              }`}
            >
              <ShieldCheck className="h-3 w-3 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Amenities counter badge floating at bottom right of image */}
        {amenitiesCount > 0 && (
          <div className="absolute bottom-2 right-2.5 z-10 flex items-center gap-1 rounded-md bg-slate-950/75 backdrop-blur-xs px-2 py-0.5 text-[10px] font-semibold text-white/95 border border-white/15 shadow-xs">
            <Layers className="h-3 w-3 text-white" />
            <span>{amenitiesCount} {amenitiesCount === 1 ? "Amenity" : "Amenities"}</span>
          </div>
        )}
      </div>

      {/* Card Body - Compact and neatly structured */}
      <div className="flex flex-1 flex-col p-3.5 sm:p-4">
        {/* Title, Visual Tag & Subtitle */}
        <div>
          <div className="flex items-start justify-between gap-1.5">
            <h3
              className="line-clamp-1 text-sm font-black text-slate-950 transition hover:text-primary cursor-pointer flex-1"
              onClick={() => onQuickView(property)}
              title={property.name || "Exclusive Property"}
            >
              {property.name || "Exclusive Property"}
            </h3>
            {!cover.isReal && cover.badgeText && (
              <span className="inline-flex shrink-0 items-center gap-1 text-[9px] font-bold text-amber-800 bg-amber-50 border border-amber-300 px-1.5 py-0.5 rounded shadow-2xs">
                <Sparkles className="h-2.5 w-2.5 text-amber-600" />
                {cover.badgeText}
              </span>
            )}
          </div>

          <div className="mt-0.5 flex items-center gap-1.5 text-xs font-semibold text-primary truncate">
            <span>{getPropertyTypeName(property.type)}</span>
            {property.project_name && (
              <>
                <span className="text-slate-300 font-normal">•</span>
                <span className="text-slate-600 font-medium truncate">
                  {property.project_name}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Location */}
        <div className="mt-1 mb-2.5 flex items-center gap-1.5 text-xs text-slate-600">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          <span className="truncate">
            {[property.location?.area, property.location?.city]
              .filter(Boolean)
              .join(", ") ||
              property.location?.address ||
              "Prime Location, Chennai"}
          </span>
        </div>

        {/* Quick Specs Compact Row */}
        <div className="mb-2.5 grid grid-cols-3 divide-x divide-slate-200/90 rounded-xl bg-slate-50/90 border border-slate-200/80 py-1.5 px-1 text-center text-xs">
          <div className="flex flex-col justify-center px-1">
            <span className="block text-[9.5px] font-bold uppercase tracking-wider text-slate-500">
              Area
            </span>
            <span className="font-black text-slate-950 text-xs truncate">
              {property.area_size
                ? `${property.area_size} ${property.area_unit || "sqft"}`
                : "Plot / Site"}
            </span>
          </div>
          <div className="flex flex-col justify-center px-1">
            <span className="block text-[9.5px] font-bold uppercase tracking-wider text-slate-500">
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
            <span className="block text-[9.5px] font-bold uppercase tracking-wider text-slate-500">
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

        {/* Price & Actions Row */}
        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-2.5">
          <div className="min-w-0 pr-2">
            <span className="block text-[9.5px] font-bold uppercase tracking-wider text-slate-400">
              Price
            </span>
            <span className="text-sm font-black text-slate-950 truncate block">
              {property.price !== undefined && property.price !== null
                ? formatIndianCurrency(property.price)
                : "Price on Request"}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {property.status === "draft" && onPublish && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 rounded-lg px-2 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-300 shadow-2xs flex items-center gap-1 mr-0.5"
                onClick={() => onPublish(property)}
                title="Publish Draft"
              >
                <UploadCloud className="h-3.5 w-3.5 text-emerald-600 stroke-[2.5]" />
                Publish
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg text-slate-600 hover:text-slate-950 hover:bg-slate-100"
              onClick={() => onQuickView(property)}
              title="Quick Preview"
            >
              <Eye className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg text-slate-600 hover:text-slate-950 hover:bg-slate-100"
              onClick={() => onEdit(property)}
              title="Edit Property"
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg text-rose-600 hover:bg-rose-50 hover:text-rose-700"
              onClick={() => onDelete(property._id)}
              title="Delete Property"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
