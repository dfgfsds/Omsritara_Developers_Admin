import React from "react";
import {
  Building2,
  CheckCircle2,
  Layers,
  Tag,
  Star,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Stats } from "./types";

interface PropertyStatsCardsProps {
  stats: Stats;
  activeStatusFilter?: string;
  activeHighlightFilter?: string;
  onFilterStatus?: (status: string) => void;
  onFilterHighlight?: (highlight: string) => void;
  onResetFilters?: () => void;
}

export const PropertyStatsCards: React.FC<PropertyStatsCardsProps> = ({
  stats,
  activeStatusFilter = "all",
  activeHighlightFilter = "all",
  onFilterStatus,
  onFilterHighlight,
  onResetFilters,
}) => {
  const isTotalActive =
    activeStatusFilter === "all" && activeHighlightFilter === "all";

  return (
    <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4 lg:grid-cols-5">
      {/* 1. Total Listings */}
      <button
        type="button"
        onClick={() => onResetFilters?.()}
        className={`group relative flex flex-col overflow-hidden rounded-2xl border p-4 text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${
          isTotalActive
            ? "border-primary/40 bg-gradient-to-br from-white via-primary/5 to-primary/10 shadow-md ring-2 ring-primary/20"
            : "border-slate-200/90 bg-white hover:border-slate-300 shadow-xs"
        }`}
      >
        <div className="flex w-full items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-slate-500">
            Total Listings
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-200 group-hover:scale-110 shadow-xs">
            <Building2 className="h-4 w-4 stroke-[2.2]" />
          </div>
        </div>
        <div className="mt-2.5 text-2xl font-black text-slate-950">
          {stats.total}
        </div>
        <p className="mt-0.5 text-[11px] font-semibold text-slate-500">
          Active portfolio
        </p>
        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-primary to-rose-600 opacity-80" />
      </button>

      {/* 2. Available for Sale/Rent */}
      <button
        type="button"
        onClick={() => onFilterStatus?.("available")}
        className={`group relative flex flex-col overflow-hidden rounded-2xl border p-4 text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${
          activeStatusFilter === "available"
            ? "border-emerald-500/50 bg-gradient-to-br from-white via-emerald-500/5 to-emerald-500/15 shadow-md ring-2 ring-emerald-500/20"
            : "border-slate-200/90 bg-white hover:border-slate-300 shadow-xs"
        }`}
      >
        <div className="flex w-full items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-slate-500">
            Available
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 transition-transform duration-200 group-hover:scale-110 shadow-xs">
            <CheckCircle2 className="h-4 w-4 stroke-[2.5]" />
          </div>
        </div>
        <div className="mt-2.5 text-2xl font-black text-emerald-700">
          {stats.available}
        </div>
        <p className="mt-0.5 text-[11px] font-semibold text-slate-500">
          Ready for booking
        </p>
        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-80" />
      </button>

      {/* 3. Under Construction */}
      <button
        type="button"
        onClick={() => onFilterStatus?.("under_construction")}
        className={`group relative flex flex-col overflow-hidden rounded-2xl border p-4 text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${
          activeStatusFilter === "under_construction"
            ? "border-amber-500/50 bg-gradient-to-br from-white via-amber-500/5 to-amber-500/15 shadow-md ring-2 ring-amber-500/20"
            : "border-slate-200/90 bg-white hover:border-slate-300 shadow-xs"
        }`}
      >
        <div className="flex w-full items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-slate-500">
            In Progress
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 transition-transform duration-200 group-hover:scale-110 shadow-xs">
            <Layers className="h-4 w-4 stroke-[2.2]" />
          </div>
        </div>
        <div className="mt-2.5 text-2xl font-black text-amber-700">
          {stats.underConstruction}
        </div>
        <p className="mt-0.5 text-[11px] font-semibold text-slate-500">
          Under construction
        </p>
        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500 opacity-80" />
      </button>

      {/* 4. Sold Out */}
      <button
        type="button"
        onClick={() => onFilterStatus?.("sold")}
        className={`group relative flex flex-col overflow-hidden rounded-2xl border p-4 text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${
          activeStatusFilter === "sold"
            ? "border-rose-500/50 bg-gradient-to-br from-white via-rose-500/5 to-rose-500/15 shadow-md ring-2 ring-rose-500/20"
            : "border-slate-200/90 bg-white hover:border-slate-300 shadow-xs"
        }`}
      >
        <div className="flex w-full items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-slate-500">
            Sold Out
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 transition-transform duration-200 group-hover:scale-110 shadow-xs">
            <Tag className="h-4 w-4 stroke-[2.2]" />
          </div>
        </div>
        <div className="mt-2.5 text-2xl font-black text-rose-700">
          {stats.sold}
        </div>
        <p className="mt-0.5 text-[11px] font-semibold text-slate-500">
          Closed deals
        </p>
        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-rose-500 to-pink-600 opacity-80" />
      </button>

      {/* 5. Spotlight / Verified */}
      <div className="col-span-2 sm:col-span-4 lg:col-span-1 flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-slate-500">
            Highlights
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 shadow-xs">
            <Sparkles className="h-4 w-4 stroke-[2.2]" />
          </div>
        </div>

        <div className="mt-2.5 flex items-center justify-between gap-2">
          {/* Featured pill trigger */}
          <button
            type="button"
            onClick={() =>
              onFilterHighlight?.(
                activeHighlightFilter === "featured" ? "all" : "featured"
              )
            }
            className={`flex flex-1 items-center justify-between gap-1.5 rounded-xl border px-2.5 py-1.5 transition ${
              activeHighlightFilter === "featured"
                ? "border-amber-400 bg-amber-500/15 text-amber-900 ring-2 ring-amber-400/20"
                : "border-slate-200 bg-slate-50/70 hover:bg-slate-100/80 text-slate-700"
            }`}
            title="Filter by Featured listings"
          >
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
              <span className="text-[11px] font-bold">Featured</span>
            </div>
            <span className="text-xs font-black text-slate-950">
              {stats.featured}
            </span>
          </button>

          {/* Verified pill trigger */}
          <button
            type="button"
            onClick={() =>
              onFilterHighlight?.(
                activeHighlightFilter === "verified" ? "all" : "verified"
              )
            }
            className={`flex flex-1 items-center justify-between gap-1.5 rounded-xl border px-2.5 py-1.5 transition ${
              activeHighlightFilter === "verified"
                ? "border-emerald-500 bg-emerald-500/15 text-emerald-900 ring-2 ring-emerald-500/20"
                : "border-slate-200 bg-slate-50/70 hover:bg-slate-100/80 text-slate-700"
            }`}
            title="Filter by Verified listings"
          >
            <div className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 stroke-[2.5]" />
              <span className="text-[11px] font-bold">Verified</span>
            </div>
            <span className="text-xs font-black text-slate-950">
              {stats.verified}
            </span>
          </button>
        </div>

        <p className="mt-1 text-[10px] font-medium text-slate-500 text-center">
          1-Click filter highlights
        </p>
      </div>
    </div>
  );
};
