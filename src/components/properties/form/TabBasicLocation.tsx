import React from "react";
import {
  Building2,
  MapPin,
  FileText,
  Tag,
  Key,
  ScrollText,
  Globe,
  Navigation,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PropertyFormData, PropertyType } from "../types";

interface TabBasicLocationProps {
  formData: PropertyFormData;
  handleInputChange: (field: keyof PropertyFormData, value: any) => void;
  handleLocationChange: (field: string, value: any) => void;
  handlePropertyTypeChange: (typeId: string) => void;
  propertyTypes: PropertyType[];
}

export const TabBasicLocation: React.FC<TabBasicLocationProps> = ({
  formData,
  handleInputChange,
  handleLocationChange,
  handlePropertyTypeChange,
  propertyTypes,
}) => {
  return (
    <div className="space-y-6">
      {/* Primary Info Card */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 md:p-6 shadow-xs">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-xs">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Primary Property Profile</h3>
              <p className="text-xs text-slate-500">
                Headline title, listing purpose, and comprehensive description
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4.5">
          {/* Interactive Listing Purpose Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Listing Purpose <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  value: "sale",
                  label: "For Sale",
                  icon: Tag,
                  desc: "Direct buyer ownership",
                  activeClass: "border-primary bg-primary/5 text-primary ring-1 ring-primary/20",
                },
                {
                  value: "rent",
                  label: "For Rent",
                  icon: Key,
                  desc: "Monthly rental contract",
                  activeClass: "border-blue-600 bg-blue-50/60 text-blue-700 ring-1 ring-blue-500/20",
                },
                {
                  value: "lease",
                  label: "For Lease",
                  icon: ScrollText,
                  desc: "Commercial lease agreement",
                  activeClass: "border-purple-600 bg-purple-50/60 text-purple-700 ring-1 ring-purple-500/20",
                },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = formData.listing_type === item.value;
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => handleInputChange("listing_type", item.value)}
                    className={`flex flex-col items-start rounded-xl border p-3 text-left transition-all ${
                      isSelected
                        ? item.activeClass
                        : "border-slate-200 bg-slate-50/50 text-slate-700 hover:border-slate-300 hover:bg-slate-100/60"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Icon className="h-3.5 w-3.5 shrink-0" />
                      <span className="text-xs font-bold">{item.label}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 leading-tight">
                      {item.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Property Title */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700">
                Property Title <span className="text-rose-500">*</span>
              </label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="e.g. Royal Palms Luxury 3BHK Sea-Facing Villa"
                className="h-10 rounded-xl border-slate-200 text-sm font-medium text-slate-900 shadow-xs focus-visible:ring-2 focus-visible:ring-primary/20"
                required
              />
            </div>

            {/* Property Type Dropdown */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <Tag className="h-3.5 w-3.5 text-primary" /> Property Category <span className="text-rose-500">*</span>
              </label>
              <Select value={formData.type} onValueChange={handlePropertyTypeChange} required>
                <SelectTrigger className="h-10 rounded-xl border-slate-200 text-sm font-medium text-slate-900 shadow-xs focus:ring-2 focus:ring-primary/20">
                  <SelectValue placeholder="Select property category" />
                </SelectTrigger>
                <SelectContent className="rounded-xl max-h-60">
                  {propertyTypes.map((type) => (
                    <SelectItem key={type._id} value={type._id} className="text-sm font-medium text-slate-900">
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Marketing Description */}
            <div className="space-y-1.5 sm:col-span-2">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <FileText className="h-3.5 w-3.5 text-primary" /> Property Description
                </label>
                <span className="text-[11px] text-slate-500">
                  {formData.description.length} characters
                </span>
              </div>
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Describe architectural features, room dimensions, ventilation, lighting, and locality highlights..."
                rows={3}
                className="rounded-xl border-slate-200 text-sm font-medium text-slate-900 shadow-xs placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-primary/20"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Location & Address Card */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 md:p-6 shadow-xs">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700 shadow-xs">
            <MapPin className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Geographic Location & Address</h3>
            <p className="text-xs text-slate-500">
              Precise street address, locality, city, and postal code for buyer visits
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {/* Full Street Address */}
          <div className="space-y-1.5 sm:col-span-2 md:col-span-3">
            <label className="text-xs font-bold text-slate-700">
              Full Street Address
            </label>
            <Input
              value={formData.address}
              onChange={(e) => handleLocationChange("address", e.target.value)}
              placeholder="e.g. Plot No 42, Green Valley Avenue, Near IT Expressway"
              className="h-10 rounded-xl border-slate-200 text-sm font-medium text-slate-900 shadow-xs placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-primary/20"
            />
          </div>

          {/* Neighborhood / Locality */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <Navigation className="h-3 w-3 text-slate-400" /> Locality / Neighborhood
            </label>
            <Input
              value={formData.area}
              onChange={(e) => handleLocationChange("area", e.target.value)}
              placeholder="e.g. Sholinganallur"
              className="h-10 rounded-xl border-slate-200 text-sm font-medium text-slate-900 shadow-xs placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-primary/20"
            />
          </div>

          {/* City */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <Building2 className="h-3 w-3 text-slate-400" /> City <span className="text-rose-500">*</span>
            </label>
            <Input
              value={formData.city}
              onChange={(e) => handleLocationChange("city", e.target.value)}
              placeholder="e.g. Chennai"
              className="h-10 rounded-xl border-slate-200 text-sm font-medium text-slate-900 shadow-xs placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-primary/20"
              required
            />
          </div>

          {/* State */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              State / Province
            </label>
            <Input
              value={formData.state}
              onChange={(e) => handleLocationChange("state", e.target.value)}
              placeholder="e.g. Tamil Nadu"
              className="h-10 rounded-xl border-slate-200 text-sm font-medium text-slate-900 shadow-xs placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-primary/20"
            />
          </div>

          {/* Pincode */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Pincode / Postal Code
            </label>
            <Input
              value={formData.pincode}
              onChange={(e) => handleLocationChange("pincode", e.target.value)}
              placeholder="e.g. 600119"
              className="h-10 rounded-xl border-slate-200 text-sm font-medium text-slate-900 shadow-xs placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-primary/20"
            />
          </div>

          {/* Country */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <Globe className="h-3 w-3 text-slate-400" /> Country
            </label>
            <Input
              value={formData.country}
              onChange={(e) => handleLocationChange("country", e.target.value)}
              placeholder="e.g. India"
              className="h-10 rounded-xl border-slate-200 text-sm font-medium text-slate-900 shadow-xs placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-primary/20"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
