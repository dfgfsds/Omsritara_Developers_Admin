import React from "react";
import { Search, X, LayoutGrid, List, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PropertyType } from "./types";

interface PropertyFiltersProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  filterType: string;
  setFilterType: (val: string) => void;
  filterListing: string;
  setFilterListing: (val: string) => void;
  filterStatus: string;
  setFilterStatus: (val: string) => void;
  filterHighlight?: string;
  setFilterHighlight?: (val: string) => void;
  viewMode: "grid" | "table";
  setViewMode: (val: "grid" | "table") => void;
  propertyTypes: PropertyType[];
  filteredCount: number;
  totalCount: number;
  hasActiveFilters: boolean;
  clearFilters: () => void;
}

export const PropertyFilters: React.FC<PropertyFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  filterType,
  setFilterType,
  filterListing,
  setFilterListing,
  filterStatus,
  setFilterStatus,
  filterHighlight = "all",
  setFilterHighlight,
  viewMode,
  setViewMode,
  propertyTypes,
  filteredCount,
  totalCount,
  hasActiveFilters,
  clearFilters,
}) => {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500 stroke-[2.5]" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, location, type, project, or config (e.g. Villa, 3 BHK, OMR)..."
            className="h-10 rounded-xl pl-10 pr-10 text-xs font-semibold text-slate-900 border-slate-200 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-primary/20"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-700"
            >
              <X className="h-4 w-4 stroke-[2.5]" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns & View Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Type Filter */}
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="h-10 w-[130px] rounded-xl text-xs font-bold text-slate-800 border-slate-200 shadow-xs">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent className="rounded-xl shadow-lg border-slate-200">
              <SelectItem value="all" className="font-bold text-slate-900">
                All Types
              </SelectItem>
              {propertyTypes.map((t) => (
                <SelectItem
                  key={t._id}
                  value={t._id}
                  className="font-bold text-slate-900"
                >
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Listing Type Filter */}
          <Select value={filterListing} onValueChange={setFilterListing}>
            <SelectTrigger className="h-10 w-[120px] rounded-xl text-xs font-bold text-slate-800 border-slate-200 shadow-xs">
              <SelectValue placeholder="Listing" />
            </SelectTrigger>
            <SelectContent className="rounded-xl shadow-lg border-slate-200">
              <SelectItem value="all" className="font-bold text-slate-900">
                All Listings
              </SelectItem>
              <SelectItem value="sale" className="font-bold text-slate-900">
                For Sale
              </SelectItem>
              <SelectItem value="rent" className="font-bold text-slate-900">
                For Rent
              </SelectItem>
              <SelectItem value="lease" className="font-bold text-slate-900">
                For Lease
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="h-10 w-[130px] rounded-xl text-xs font-bold text-slate-800 border-slate-200 shadow-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl shadow-lg border-slate-200">
              <SelectItem value="all" className="font-bold text-slate-900">
                All Statuses
              </SelectItem>
              <SelectItem value="available" className="font-bold text-emerald-700">
                Available
              </SelectItem>
              <SelectItem
                value="under_construction"
                className="font-bold text-amber-700"
              >
                Under Const.
              </SelectItem>
              <SelectItem value="sold" className="font-bold text-rose-700">
                Sold Out
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Highlight Spotlight Filter */}
          {setFilterHighlight && (
            <Select value={filterHighlight} onValueChange={setFilterHighlight}>
              <SelectTrigger className="h-10 w-[125px] rounded-xl text-xs font-bold text-slate-800 border-slate-200 shadow-xs">
                <SelectValue placeholder="Highlights" />
              </SelectTrigger>
              <SelectContent className="rounded-xl shadow-lg border-slate-200">
                <SelectItem value="all" className="font-bold text-slate-900">
                  All Items
                </SelectItem>
                <SelectItem value="featured" className="font-bold text-amber-700">
                  Featured Only
                </SelectItem>
                <SelectItem value="verified" className="font-bold text-emerald-700">
                  Verified Only
                </SelectItem>
              </SelectContent>
            </Select>
          )}

          {/* View Mode Toggle */}
          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100 p-0.5 shadow-xs">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`flex h-8.5 w-8.5 items-center justify-center rounded-lg transition ${
                viewMode === "grid"
                  ? "bg-white text-primary shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4 stroke-[2.5]" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`flex h-8.5 w-8.5 items-center justify-center rounded-lg transition ${
                viewMode === "table"
                  ? "bg-white text-primary shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
              title="Table View"
            >
              <List className="h-4 w-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Summary & Reset */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between border-t border-slate-200/80 pt-2.5 text-xs font-semibold text-slate-600">
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Showing <strong className="text-slate-950 font-bold">{filteredCount}</strong> of{" "}
            <strong className="text-slate-950 font-bold">{totalCount}</strong> properties matching filters
          </span>
          <button
            type="button"
            onClick={clearFilters}
            className="font-bold text-primary hover:underline"
          >
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  );
};
