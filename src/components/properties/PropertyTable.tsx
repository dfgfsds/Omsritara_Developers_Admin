import React from "react";
import {
  MapPin,
  Eye,
  Edit,
  Trash2,
  Star,
  ShieldCheck,
  Layers,
  UploadCloud,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Property } from "./types";
import {
  getPropertyCoverInfo,
  getStatusBadgeVariant,
  formatIndianCurrency,
  VILLA_FALLBACKS,
} from "./constants";

interface PropertyTableProps {
  properties: Property[];
  onQuickView: (property: Property) => void;
  onEdit: (property: Property) => void;
  onDelete: (id: string) => void;
  onStatusChange: (property: Property) => void;
  onToggleFeatured?: (property: Property) => void;
  onToggleVerified?: (property: Property) => void;
  onPublish?: (property: Property) => void;
  getPropertyTypeName: (type: any) => string;
}

export const PropertyTable: React.FC<PropertyTableProps> = ({
  properties,
  onQuickView,
  onEdit,
  onDelete,
  onStatusChange,
  onToggleFeatured,
  onToggleVerified,
  onPublish,
  getPropertyTypeName,
}) => {
  return (
    <Card className="overflow-hidden rounded-3xl border border-slate-200/90 shadow-xs bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200 bg-slate-100/90 text-[11px] font-black uppercase tracking-wider text-slate-800">
            <tr>
              <th className="px-7 py-4.5 text-slate-900">Property</th>
              <th className="px-4 py-4.5">Type & Purpose</th>
              <th className="px-4 py-4.5">Location</th>
              <th className="px-4 py-4.5">Specs & Area</th>
              <th className="px-4 py-4.5">Price</th>
              <th className="px-4 py-4.5 text-center">Badges</th>
              <th className="px-4 py-4.5">Status</th>
              <th className="px-6 py-4.5 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200/80 bg-white">
            {properties.map((property) => {
              const amenitiesCount = property.amenities_data?.length || 0;

              return (
                <tr
                  key={property._id}
                  className="group transition-colors duration-150 hover:bg-slate-50/90"
                >
                  {/* Property Thumbnail & Title */}
                  <td className="px-7 py-4">
                    <div className="flex items-center gap-4">
                      <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-xs group-hover:shadow-md transition">
                        <img
                          src={getPropertyCoverInfo(property).url}
                          alt={property.name || "Property"}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              VILLA_FALLBACKS[0];
                          }}
                        />
                      </div>

                      <div className="min-w-0 pl-1">
                        <button
                          type="button"
                          onClick={() => onQuickView(property)}
                          className="text-left font-black text-slate-950 hover:text-primary transition"
                        >
                          <p className="max-w-[240px] truncate text-xs font-black text-slate-950">
                            {property.name}
                          </p>
                        </button>
                        <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
                          {property.project_name || property.owner_name || "Direct Listing"}
                        </p>
                        {amenitiesCount > 0 && (
                          <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-slate-500">
                            <Layers className="h-2.5 w-2.5 text-primary" />
                            {amenitiesCount} Amenities
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Type & Purpose */}
                  <td className="px-4 py-4">
                    <span className="font-black text-slate-950 block">
                      {getPropertyTypeName(property.type)}
                    </span>
                    <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-slate-700 mt-1 border border-slate-200">
                      For {property.listing_type || "Sale"}
                    </span>
                  </td>

                  {/* Location */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
                      <div>
                        <p className="font-bold text-slate-950">
                          {property.location?.city || "-"}
                        </p>
                        <p className="text-[11px] font-semibold text-slate-500 max-w-[140px] truncate">
                          {[property.location?.area, property.location?.state]
                            .filter(Boolean)
                            .join(", ") || "-"}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Specifications */}
                  <td className="px-4 py-4">
                    <div className="space-y-0.5 text-xs">
                      <p className="font-black text-slate-950">
                        {property.area_size
                          ? `${property.area_size} ${property.area_unit || "sqft"}`
                          : "Site / Land"}
                      </p>
                      <p className="text-[11px] font-semibold text-slate-600">
                        {[
                          property.bedrooms ? `${property.bedrooms} Beds` : null,
                          property.bathrooms ? `${property.bathrooms} Baths` : null,
                        ]
                          .filter(Boolean)
                          .join(" • ") || (property.facing ? `${property.facing} Facing` : "General")}
                      </p>
                    </div>
                  </td>

                  {/* Price */}
                  <td className="px-4 py-4">
                    <span className="font-black text-slate-950 text-sm block">
                      {property.price !== undefined && property.price !== null
                        ? formatIndianCurrency(property.price)
                        : "On Request"}
                    </span>
                    {property.price_per_sqft && (
                      <span className="text-[11px] font-semibold text-slate-500">
                        ₹{property.price_per_sqft}/sqft
                      </span>
                    )}
                  </td>

                  {/* Featured & Verified 1-Click Badges */}
                  <td className="px-4 py-4 text-center">
                    <div className="inline-flex items-center gap-1.5 justify-center">
                      <button
                        type="button"
                        onClick={() => onToggleFeatured?.(property)}
                        title={property.isFeatured ? "Featured listing (Click to remove)" : "Click to feature"}
                        className={`flex h-7 w-7 items-center justify-center rounded-lg border transition ${
                          property.isFeatured
                            ? "bg-amber-500 text-white border-amber-400 shadow-sm"
                            : "bg-slate-100 text-slate-400 hover:text-amber-500 hover:bg-amber-50 border-slate-200"
                        }`}
                      >
                        <Star className={`h-3.5 w-3.5 ${property.isFeatured ? "fill-white" : ""}`} />
                      </button>

                      <button
                        type="button"
                        onClick={() => onToggleVerified?.(property)}
                        title={property.isVerified ? "Verified listing (Click to remove)" : "Click to verify"}
                        className={`flex h-7 w-7 items-center justify-center rounded-lg border transition ${
                          property.isVerified
                            ? "bg-emerald-600 text-white border-emerald-500 shadow-sm"
                            : "bg-slate-100 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 border-slate-200"
                        }`}
                      >
                        <ShieldCheck className="h-3.5 w-3.5 stroke-[2.5]" />
                      </button>
                    </div>
                  </td>

                  {/* Status Toggle */}
                  <td className="px-4 py-4">
                    <button
                      type="button"
                      onClick={() => onStatusChange(property)}
                      title="Click to cycle status"
                      className={`rounded-full border px-2.5 py-1 text-[10px] font-black capitalize transition hover:scale-105 active:scale-95 ${getStatusBadgeVariant(
                        property.status
                      )}`}
                    >
                      {(property.status || "available").replace(/_/g, " ")}
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {property.status === "draft" && onPublish && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 rounded-xl px-2.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-300 shadow-xs flex items-center gap-1 mr-1"
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
                        className="h-8.5 w-8.5 rounded-xl text-slate-600 hover:text-slate-950 hover:bg-slate-100"
                        onClick={() => onQuickView(property)}
                        title="Quick View"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8.5 w-8.5 rounded-xl text-slate-600 hover:text-slate-950 hover:bg-slate-100"
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
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
