import React from "react";
import {
  Coins,
  SlidersHorizontal,
  Home,
  Bath,
  Maximize2,
  Calendar,
  Layers,
  Car,
  Compass,
  Clock,
  Check,
  Building2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PropertyFormData, PropertyTypeFields } from "../types";
import { formatIndianCurrency } from "../constants";

interface TabSpecsPricingProps {
  formData: PropertyFormData;
  handleInputChange: (field: keyof PropertyFormData, value: any) => void;
  propertyTypeFields: PropertyTypeFields;
}

export const TabSpecsPricing: React.FC<TabSpecsPricingProps> = ({
  formData,
  handleInputChange,
  propertyTypeFields,
}) => {
  const formattedPrice = formatIndianCurrency(formData.price);
  const formattedRate = formatIndianCurrency(formData.price_per_sqft);

  return (
    <div className="space-y-6">
      {/* Price & Area Card */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 md:p-6 shadow-xs">
        <div className="mb-5 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-700 shadow-xs">
              <Coins className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Valuation & Dimension Metrics</h3>
              <p className="text-xs text-slate-500">
                Total pricing, rate per unit, and measured carpet / plot dimensions
              </p>
            </div>
          </div>

          {formattedPrice && (
            <div className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-200/80 px-3 py-1 shadow-xs">
              <span className="text-xs font-semibold text-emerald-700">Valuation Preview:</span>
              <span className="text-xs font-bold text-emerald-800">{formattedPrice}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
          {/* Total Price */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Total Price (INR) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 font-bold text-sm">
                ₹
              </div>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange("price", e.target.value)}
                placeholder="e.g. 7500000"
                className="h-10 rounded-xl border-slate-200 pl-7 text-sm font-medium text-slate-900 shadow-xs focus-visible:ring-2 focus-visible:ring-primary/20"
                required
              />
            </div>
            {formattedPrice && (
              <p className="text-[11px] font-semibold text-emerald-600">{formattedPrice}</p>
            )}
          </div>

          {/* Price per Sq.Ft */}
          {propertyTypeFields.price_per_sqft && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Price Per Sq.Ft
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 font-bold text-sm">
                  ₹
                </div>
                <Input
                  type="number"
                  value={formData.price_per_sqft}
                  onChange={(e) => handleInputChange("price_per_sqft", e.target.value)}
                  placeholder="e.g. 5200"
                  className="h-10 rounded-xl border-slate-200 pl-7 text-sm font-medium text-slate-900 shadow-xs focus-visible:ring-2 focus-visible:ring-primary/20"
                />
              </div>
              {formattedRate && (
                <p className="text-[11px] font-medium text-slate-500">{formattedRate} / sqft</p>
              )}
            </div>
          )}

          {/* Area Dimension */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Area Dimension <span className="text-rose-500">*</span>
            </label>
            <Input
              type="number"
              value={formData.area_size}
              onChange={(e) => handleInputChange("area_size", e.target.value)}
              placeholder="e.g. 1450"
              className="h-10 rounded-xl border-slate-200 text-sm font-medium text-slate-900 shadow-xs focus-visible:ring-2 focus-visible:ring-primary/20"
              required
            />
          </div>

          {/* Area Unit Switcher */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Measurement Unit
            </label>
            <div className="grid grid-cols-2 gap-1.5 pt-0.5">
              {[
                { value: "sqft", label: "Sq.Ft" },
                { value: "sqm", label: "Sq.M" },
                { value: "acre", label: "Acre" },
                { value: "cent", label: "Cent" },
              ].map((unit) => {
                const isSelected = formData.area_unit === unit.value;
                return (
                  <button
                    key={unit.value}
                    type="button"
                    onClick={() => handleInputChange("area_unit", unit.value)}
                    className={`rounded-lg py-1.5 text-xs font-semibold transition-all ${isSelected
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                  >
                    {unit.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Structural & Architecture Specs Card */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 md:p-6 shadow-xs">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-xs">
            <SlidersHorizontal className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Structural & Interior Architecture</h3>
            <p className="text-xs text-slate-500">
              Adaptive floor configurations, furnishing state, and room counts
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Bedrooms & Bathrooms Row */}
          {(propertyTypeFields.bedrooms || propertyTypeFields.bathrooms) && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Bedrooms Quick Pills */}
              {propertyTypeFields.bedrooms && (
                <div className="space-y-2 rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                      <Home className="h-3.5 w-3.5 text-primary" /> Bedrooms (BHK)
                    </label>
                    <span className="text-xs font-bold text-primary">
                      {formData.bedrooms ? `${formData.bedrooms} BHK` : "Not specified"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {["1", "2", "3", "4", "5"].map((bhk) => {
                      const isSelected = formData.bedrooms === bhk;
                      return (
                        <button
                          key={bhk}
                          type="button"
                          onClick={() => handleInputChange("bedrooms", bhk)}
                          className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${isSelected
                            ? "bg-primary text-white shadow-xs"
                            : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                            }`}
                        >
                          {bhk} BHK
                        </button>
                      );
                    })}
                    <Input
                      type="number"
                      value={formData.bedrooms}
                      onChange={(e) => handleInputChange("bedrooms", e.target.value)}
                      placeholder="Custom"
                      className="h-7 w-20 rounded-lg border-slate-200 text-center text-xs font-medium text-slate-900 bg-white"
                    />
                  </div>
                </div>
              )}

              {/* Bathrooms Quick Pills */}
              {propertyTypeFields.bathrooms && (
                <div className="space-y-2 rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                      <Bath className="h-3.5 w-3.5 text-primary" /> Bathrooms
                    </label>
                    <span className="text-xs font-bold text-primary">
                      {formData.bathrooms ? `${formData.bathrooms} Baths` : "Not specified"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {["1", "2", "3", "4", "5"].map((count) => {
                      const isSelected = formData.bathrooms === count;
                      return (
                        <button
                          key={count}
                          type="button"
                          onClick={() => handleInputChange("bathrooms", count)}
                          className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${isSelected
                            ? "bg-primary text-white shadow-xs"
                            : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                            }`}
                        >
                          {count}
                        </button>
                      );
                    })}
                    <Input
                      type="number"
                      value={formData.bathrooms}
                      onChange={(e) => handleInputChange("bathrooms", e.target.value)}
                      placeholder="Custom"
                      className="h-7 w-20 rounded-lg border-slate-200 text-center text-xs font-medium text-slate-900 bg-white"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Furnishing State 3 Interactive Cards */}
          {propertyTypeFields.furnishing && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Furnishing Condition
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    value: "unfurnished",
                    label: "Unfurnished",
                    icon: "🪑",
                    desc: "Bare walls, zero fixtures",
                  },
                  {
                    value: "semi_furnished",
                    label: "Semi Furnished",
                    icon: "🛋️",
                    desc: "Wardrobes, modular kitchen",
                  },
                  {
                    value: "fully_furnished",
                    label: "Fully Furnished",
                    icon: "✨",
                    desc: "Complete furniture & appliances",
                  },
                ].map((item) => {
                  const isSelected = formData.furnishing === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => handleInputChange("furnishing", item.value)}
                      className={`flex flex-col items-start rounded-xl border p-3.5 text-left transition-all ${isSelected
                        ? "border-primary bg-primary/5 ring-1 ring-primary/20 text-slate-900"
                        : "border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-slate-100/70"
                        }`}
                    >
                      <span className="text-lg mb-1">{item.icon}</span>
                      <span className="text-xs font-bold text-slate-900">{item.label}</span>
                      <span className="text-[11px] text-slate-500 leading-tight mt-0.5">
                        {item.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Floors, Facing, Age & Parking */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
            {propertyTypeFields.floor_number && (
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <Layers className="h-3.5 w-3.5 text-slate-400" /> Floor Number
                </label>
                <Input
                  type="number"
                  value={formData.floor_number}
                  onChange={(e) => handleInputChange("floor_number", e.target.value)}
                  placeholder="e.g. 4"
                  className="h-10 rounded-xl border-slate-200 text-sm font-medium text-slate-900 shadow-xs focus-visible:ring-2 focus-visible:ring-primary/20"
                />
              </div>
            )}

            {propertyTypeFields.total_floors && (
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <Building2 className="h-3.5 w-3.5 text-slate-400" /> Total Floors
                </label>
                <Input
                  type="number"
                  value={formData.total_floors}
                  onChange={(e) => handleInputChange("total_floors", e.target.value)}
                  placeholder="e.g. 14"
                  className="h-10 rounded-xl border-slate-200 text-sm font-medium text-slate-900 shadow-xs focus-visible:ring-2 focus-visible:ring-primary/20"
                />
              </div>
            )}

            {propertyTypeFields.facing && (
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <Compass className="h-3.5 w-3.5 text-primary" /> Facing Direction
                </label>
                <Select
                  value={formData.facing}
                  onValueChange={(val) => handleInputChange("facing", val)}
                >
                  <SelectTrigger className="h-10 rounded-xl border-slate-200 text-sm font-medium text-slate-900 shadow-xs focus:ring-2 focus:ring-primary/20">
                    <SelectValue placeholder="Select facing" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {["North", "East", "West", "South", "North-East", "North-West", "South-East", "South-West"].map((dir) => (
                      <SelectItem key={dir} value={dir} className="text-sm font-medium text-slate-900">
                        {dir} Facing
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {propertyTypeFields.parking && (
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <Car className="h-3.5 w-3.5 text-primary" /> Reserved Parking
                </label>
                <Input
                  type="number"
                  value={formData.parking}
                  onChange={(e) => handleInputChange("parking", e.target.value)}
                  placeholder="e.g. 2 slots"
                  className="h-10 rounded-xl border-slate-200 text-sm font-medium text-slate-900 shadow-xs focus-visible:ring-2 focus-visible:ring-primary/20"
                />
              </div>
            )}

            {propertyTypeFields.balconies && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Balconies
                </label>
                <Input
                  type="number"
                  value={formData.balconies}
                  onChange={(e) => handleInputChange("balconies", e.target.value)}
                  placeholder="e.g. 2"
                  className="h-10 rounded-xl border-slate-200 text-sm font-medium text-slate-900 shadow-xs focus-visible:ring-2 focus-visible:ring-primary/20"
                />
              </div>
            )}

            {propertyTypeFields.property_age && (
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <Clock className="h-3.5 w-3.5 text-slate-400" /> Property Age (Yrs)
                </label>
                <Input
                  type="number"
                  value={formData.property_age}
                  onChange={(e) => handleInputChange("property_age", e.target.value)}
                  placeholder="e.g. 2"
                  className="h-10 rounded-xl border-slate-200 text-sm font-medium text-slate-900 shadow-xs focus-visible:ring-2 focus-visible:ring-primary/20"
                />
              </div>
            )}

            {propertyTypeFields.construction_status && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Construction Stage
                </label>
                <Select
                  value={formData.construction_status}
                  onValueChange={(val: any) => handleInputChange("construction_status", val)}
                >
                  <SelectTrigger className="h-10 rounded-xl border-slate-200 text-sm font-medium text-slate-900 shadow-xs focus:ring-2 focus:ring-primary/20">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="ready_to_move" className="text-sm font-medium text-slate-900">Ready To Move</SelectItem>
                    <SelectItem value="under_construction" className="text-sm font-medium text-slate-900">Under Construction</SelectItem>
                    <SelectItem value="new_launch" className="text-sm font-medium text-slate-900">New Launch</SelectItem>
                    <SelectItem value="resale" className="text-sm font-medium text-slate-900">Resale Property</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {propertyTypeFields.possession_date && (
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" /> Possession Date
                </label>
                <Input
                  type="date"
                  value={formData.possession_date}
                  onChange={(e) => handleInputChange("possession_date", e.target.value)}
                  className="h-10 rounded-xl border-slate-200 text-sm font-medium text-slate-900 shadow-xs focus-visible:ring-2 focus-visible:ring-primary/20"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
