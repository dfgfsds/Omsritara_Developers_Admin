import React from "react";
import {
  ImageIcon,
  UploadCloud,
  Loader2,
  X,
  ExternalLink,
  Crown,
  Video,
  MapPin,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PropertyFormData } from "../types";

interface TabMediaLinksProps {
  formData: PropertyFormData;
  handleInputChange: (field: keyof PropertyFormData, value: any) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeImage: (index: number) => void;
  imageUploading: boolean;
}

export const TabMediaLinks: React.FC<TabMediaLinksProps> = ({
  formData,
  handleInputChange,
  handleImageUpload,
  removeImage,
  imageUploading,
}) => {
  const setAsCover = (index: number) => {
    if (index === 0) return;
    const current = [...formData.image_url];
    const [selected] = current.splice(index, 1);
    current.unshift(selected);
    handleInputChange("image_url", current);
  };

  return (
    <div className="space-y-6">
      {/* Image Upload Dropzone Card */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 md:p-6 shadow-xs">
        <div className="mb-5 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-xs">
              <ImageIcon className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Property Visual Showcase</h3>
              <p className="text-xs text-slate-500">
                Upload crisp exterior, interior, and floorplan photographs
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className="border-slate-200 bg-slate-100 text-slate-700 text-xs font-semibold px-3 py-1 rounded-xl shadow-xs"
          >
            {formData.image_url.length} Photos Added
          </Badge>
        </div>

        {/* Luxury Dropzone */}
        <label className="group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 p-9 text-center transition-all hover:border-primary hover:bg-rose-50/20">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            disabled={imageUploading}
            className="hidden"
          />
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3 transition group-hover:scale-110 shadow-xs">
            {imageUploading ? (
              <Loader2 className="h-7 w-7 animate-spin" />
            ) : (
              <UploadCloud className="h-7 w-7 stroke-[2.2]" />
            )}
          </div>
          <p className="text-sm font-bold text-slate-900">
            {imageUploading ? "Uploading photographs to server..." : "Click or drag photos to upload"}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Supports High-Res JPG, PNG, WEBP • Select multiple photos at once
          </p>
        </label>

        {/* Image Preview Gallery Grid */}
        {formData.image_url.length > 0 && (
          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-bold text-slate-700">
                Photo Gallery (First photo is set as Main Cover)
              </p>
              <span className="text-[11px] text-slate-500">
                Hover to set cover or delete
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {formData.image_url.map((url, idx) => (
                <div
                  key={`${url}-${idx}`}
                  className="group relative aspect-4/3 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-xs transition duration-200 hover:border-primary hover:shadow-md"
                >
                  <img
                    src={url}
                    alt={`Property photo ${idx + 1}`}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />

                  {/* Main Cover Badge */}
                  {idx === 0 ? (
                    <span className="absolute left-2 top-2 flex items-center gap-1 rounded-md bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-md">
                      <Crown className="h-3 w-3 fill-white stroke-none" /> Main Cover
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setAsCover(idx)}
                      className="absolute left-2 top-2 hidden group-hover:flex items-center gap-1 rounded-md bg-slate-900/80 px-2 py-0.5 text-[10px] font-bold text-white shadow-md backdrop-blur-xs hover:bg-slate-950"
                    >
                      Set Cover
                    </button>
                  )}

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-rose-600 text-white opacity-90 transition hover:scale-110 hover:opacity-100 shadow-md"
                  >
                    <X className="h-3.5 w-3.5 stroke-[2.5]" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Map & Media Links Card */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 md:p-6 shadow-xs">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-700 shadow-xs">
            <Video className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Virtual Tour & Direction Links</h3>
            <p className="text-xs text-slate-500">
              Provide walkthrough video URLs and interactive Google Maps embed links
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Virtual Tour Video URL */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <Video className="h-3.5 w-3.5 text-primary" /> Video Tour URL (YouTube / Vimeo)
              </label>
              {formData.media_url && (
                <a
                  href={formData.media_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
                >
                  <ExternalLink className="h-3 w-3" /> Test Link
                </a>
              )}
            </div>
            <Input
              value={formData.media_url}
              onChange={(e) => {
                let val = e.target.value;
                if (val.includes("<iframe")) {
                  const match = val.match(/src=["']([^"']+)["']/i);
                  if (match) val = match[1];
                }
                handleInputChange("media_url", val);
              }}
              placeholder="https://www.youtube.com/watch?v=..."
              className="h-10 rounded-xl border-slate-200 text-sm font-medium text-slate-900 shadow-xs focus-visible:ring-2 focus-visible:ring-primary/20"
            />
            <p className="text-[10px] text-slate-400 font-medium">
              Paste a full YouTube video link (e.g. watch?v=... or youtu.be/...) or embed code
            </p>
          </div>

          {/* Google Maps Link */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <MapPin className="h-3.5 w-3.5 text-emerald-600" /> Google Maps Link
              </label>
              {formData.map_url && (
                <a
                  href={formData.map_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:underline"
                >
                  <ExternalLink className="h-3 w-3" /> View Map
                </a>
              )}
            </div>
            <Input
              value={formData.map_url}
              onChange={(e) => {
                let val = e.target.value;
                if (val.includes("<iframe")) {
                  const match = val.match(/src=["']([^"']+)["']/i);
                  if (match) val = match[1];
                }
                handleInputChange("map_url", val);
              }}
              placeholder="https://maps.google.com/?q=..."
              className="h-10 rounded-xl border-slate-200 text-sm font-medium text-slate-900 shadow-xs focus-visible:ring-2 focus-visible:ring-primary/20"
            />
            <p className="text-[10px] text-slate-400 font-medium">
              Paste a Google Maps share link, embed code, or location query
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
