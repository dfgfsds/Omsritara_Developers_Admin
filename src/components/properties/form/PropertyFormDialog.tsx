import React, { useState } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Sparkles,
  Check,
  CheckCircle2,
  Building2,
  FileText,
  CloudOff,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  PropertyFormData,
  Property,
  PropertyType,
  PropertyTypeFields,
  Amenity,
  AmenityType,
  FormAmenityData,
} from "../types";
import { FORM_STEPS } from "../constants";
import { TabBasicLocation } from "./TabBasicLocation";
import { TabSpecsPricing } from "./TabSpecsPricing";
import { TabMediaLinks } from "./TabMediaLinks";
import { TabAmenitiesNearby } from "./TabAmenitiesNearby";
import { TabOwnershipStatus } from "./TabOwnershipStatus";

interface PropertyFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingProperty: Property | null;
  formData: PropertyFormData;
  formActiveTab: string;
  setFormActiveTab: (tab: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  handleSaveDraft?: () => void;
  handleInputChange: (field: keyof PropertyFormData, value: any) => void;
  handleLocationChange: (field: string, value: any) => void;
  handlePropertyTypeChange: (typeId: string) => void;
  propertyTypes: PropertyType[];
  propertyTypeFields: PropertyTypeFields;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeImage: (index: number) => void;
  imageUploading: boolean;
  loading: boolean;
  resetForm: () => void;
  amenities: Amenity[];
  amenityTypes: AmenityType[];
  selectedAmenity: string;
  selectedAmenityTypes: string[];
  setSelectedAmenityTypes?: React.Dispatch<React.SetStateAction<string[]>>;
  amenityDropdownOpen: boolean;
  setAmenityDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleAmenitySelect: (val: string) => void;
  toggleAmenityType: (id: string) => void;
  addAmenity: () => void;
  editingAmenityIndex: number | null;
  getAmenityTypeName: (amenityId: string, typeId: string) => string;
  getAmenityName: (amenityId: string) => string;
  removeAmenityType: (amenityId: string, typeId: string) => void;
  viewAmenity: (item: FormAmenityData) => void;
  editAmenity: (index: number) => void;
  removeAmenity: (amenityId: string) => void;
  addNearbyPlace: (presetType?: string) => void;
  updateNearbyPlace: (index: number, field: string, value: string) => void;
  removeNearbyPlace: (index: number) => void;
  autoSaveStatus?: "saved" | "saving" | "local" | "idle";
  lastSavedTime?: string | null;
  isRestoredDraft?: boolean;
  onDiscardDraft?: () => void;
  hasUnsavedChanges?: boolean;
}

export const PropertyFormDialog: React.FC<PropertyFormDialogProps> = ({
  open,
  onOpenChange,
  editingProperty,
  formData,
  formActiveTab,
  setFormActiveTab,
  handleSubmit,
  handleSaveDraft,
  handleInputChange,
  handleLocationChange,
  handlePropertyTypeChange,
  propertyTypes,
  propertyTypeFields,
  handleImageUpload,
  removeImage,
  imageUploading,
  loading,
  resetForm,
  amenities,
  amenityTypes,
  selectedAmenity,
  selectedAmenityTypes,
  setSelectedAmenityTypes,
  amenityDropdownOpen,
  setAmenityDropdownOpen,
  handleAmenitySelect,
  toggleAmenityType,
  addAmenity,
  editingAmenityIndex,
  getAmenityTypeName,
  getAmenityName,
  removeAmenityType,
  viewAmenity,
  editAmenity,
  removeAmenity,
  addNearbyPlace,
  updateNearbyPlace,
  removeNearbyPlace,
  autoSaveStatus = "idle",
  lastSavedTime = null,
  isRestoredDraft = false,
  onDiscardDraft,
  hasUnsavedChanges = false,
}) => {
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const stepIds = ["basic", "specs", "media", "amenities", "settings"];
  const currentStepIdx = stepIds.indexOf(formActiveTab);
  const progressPercent = Math.round(((currentStepIdx + 1) / stepIds.length) * 100);

  const handleAttemptClose = () => {
    if (hasUnsavedChanges) {
      setShowExitConfirm(true);
    } else {
      onOpenChange(false);
      resetForm();
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            handleAttemptClose();
          } else {
            onOpenChange(true);
          }
        }}
      >
        <DialogContent
          onPointerDownOutside={(e) => {
            if (hasUnsavedChanges) {
              e.preventDefault();
              setShowExitConfirm(true);
            }
          }}
          onEscapeKeyDown={(e) => {
            if (hasUnsavedChanges) {
              e.preventDefault();
              setShowExitConfirm(true);
            }
          }}
          className="flex h-[94vh] w-[96vw] max-w-5xl flex-col p-0 border border-slate-200/90 shadow-2xl rounded-3xl overflow-hidden bg-slate-50/70 backdrop-blur-xl"
        >
          <form onSubmit={handleSubmit} className="flex h-full flex-col overflow-hidden">
            {/* Top Decorative Gradient Strip */}
            <div className="h-1.5 w-full bg-gradient-to-r from-primary via-rose-500 to-amber-500 shrink-0" />

            {/* Modal Header */}
            <DialogHeader className="border-b border-slate-200/80 bg-white/95 backdrop-blur-sm px-6 py-4 md:px-8 shrink-0">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-xs">
                        {editingProperty ? (
                          <Building2 className="h-4 w-4" />
                        ) : (
                          <Sparkles className="h-4 w-4" />
                        )}
                      </div>
                      {editingProperty ? "Edit Property Listing" : "Create New Property"}
                    </DialogTitle>

                    {editingProperty && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                        {formData.name || "ID: " + editingProperty._id.slice(-6)}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500">
                    {editingProperty
                      ? "Update architecture details, price valuation, gallery photos, and lifestyle amenities."
                      : "Complete all 5 guided steps to showcase and publish this listing to buyers."}
                  </p>
                </div>

                {/* Auto-Save & Status Badge */}
                <div className="flex items-center gap-2 shrink-0">
                  {autoSaveStatus === "saving" && (
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-[11px] font-bold text-blue-700 shadow-xs animate-pulse">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
                      Saving draft...
                    </div>
                  )}

                  {autoSaveStatus === "saved" && (
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-[11px] font-bold text-emerald-800 shadow-xs">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Draft auto-saved {lastSavedTime ? `• ${lastSavedTime}` : ""}</span>
                    </div>
                  )}

                  {autoSaveStatus === "local" && (
                    <div
                      className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-[11px] font-bold text-amber-900 shadow-xs"
                      title="Changes are securely auto-saved locally on your device (Offline / Network drop resilient)"
                    >
                      <CloudOff className="h-3.5 w-3.5 text-amber-600" />
                      <span>Saved locally (Offline) {lastSavedTime ? `• ${lastSavedTime}` : ""}</span>
                    </div>
                  )}
                </div>
              </div>
            </DialogHeader>

            {/* Restored Draft Recovery Notification */}
            {isRestoredDraft && (
              <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100/70 border-b border-amber-200/90 px-6 py-2.5 flex items-center justify-between gap-3 text-xs text-amber-950 shrink-0 shadow-inner">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-600 shrink-0" />
                  <span>
                    <strong>Draft Restored:</strong> Your unsaved edits {lastSavedTime ? `from ${lastSavedTime}` : ""} were automatically recovered so you can continue editing.
                  </span>
                </div>
                {onDiscardDraft && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onDiscardDraft}
                    className="h-6.5 text-[11px] font-black text-rose-700 hover:text-rose-900 hover:bg-rose-100/70 rounded-lg px-2"
                  >
                    Discard & Start Fresh
                  </Button>
                )}
              </div>
            )}

          {/* Stepper Tabs */}
          <Tabs
            value={formActiveTab}
            onValueChange={setFormActiveTab}
            className="flex flex-1 flex-col overflow-hidden"
          >
            {/* Steps Progress Navigation */}
            <div className="border-b border-slate-200/90 bg-white/90 backdrop-blur-sm px-6 py-3.5 md:px-8 shrink-0">
              <TabsList className="grid w-full grid-cols-5 h-auto gap-2 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200">
                {FORM_STEPS.map((step, idx) => {
                  const Icon = step.icon;
                  const isActive = formActiveTab === step.id;
                  const isCompleted = idx < currentStepIdx;

                  return (
                    <TabsTrigger
                      key={step.id}
                      value={step.id}
                      className={`relative flex items-center justify-center gap-2 rounded-xl py-2 px-1 text-xs font-bold transition-all ${
                        isActive
                          ? "bg-white text-primary shadow-xs ring-1 ring-slate-200/80"
                          : isCompleted
                          ? "text-slate-800 hover:bg-white/50"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      {/* Step Circle Badge */}
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold transition-all ${
                          isActive
                            ? "bg-gradient-to-tr from-primary to-rose-600 text-white shadow-xs shadow-primary/30"
                            : isCompleted
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                        ) : (
                          step.step
                        )}
                      </div>

                      <div className="text-left hidden lg:block">
                        <div className="text-xs font-bold leading-tight flex items-center gap-1">
                          <Icon className="h-3 w-3 inline-block" />
                          <span>{step.label}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 leading-tight">
                          {step.desc}
                        </div>
                      </div>

                      <span className="hidden sm:inline-block lg:hidden text-xs font-bold">
                        {step.shortLabel}
                      </span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>

            {/* Scrollable Tab Content Panels */}
            <div className="flex-1 overflow-y-auto p-5 md:p-8">
              {/* TAB 1: Basic & Location */}
              <TabsContent value="basic" className="m-0 focus-visible:outline-none">
                <TabBasicLocation
                  formData={formData}
                  handleInputChange={handleInputChange}
                  handleLocationChange={handleLocationChange}
                  handlePropertyTypeChange={handlePropertyTypeChange}
                  propertyTypes={propertyTypes}
                />
              </TabsContent>

              {/* TAB 2: Pricing & Specs */}
              <TabsContent value="specs" className="m-0 focus-visible:outline-none">
                <TabSpecsPricing
                  formData={formData}
                  handleInputChange={handleInputChange}
                  propertyTypeFields={propertyTypeFields}
                />
              </TabsContent>

              {/* TAB 3: Media & Links */}
              <TabsContent value="media" className="m-0 focus-visible:outline-none">
                <TabMediaLinks
                  formData={formData}
                  handleInputChange={handleInputChange}
                  handleImageUpload={handleImageUpload}
                  removeImage={removeImage}
                  imageUploading={imageUploading}
                />
              </TabsContent>

              {/* TAB 4: Amenities & Nearby */}
              <TabsContent value="amenities" className="m-0 focus-visible:outline-none">
                <TabAmenitiesNearby
                  formData={formData}
                  handleInputChange={handleInputChange}
                  amenities={amenities}
                  amenityTypes={amenityTypes}
                  selectedAmenity={selectedAmenity}
                  selectedAmenityTypes={selectedAmenityTypes}
                  setSelectedAmenityTypes={setSelectedAmenityTypes}
                  amenityDropdownOpen={amenityDropdownOpen}
                  setAmenityDropdownOpen={setAmenityDropdownOpen}
                  handleAmenitySelect={handleAmenitySelect}
                  toggleAmenityType={toggleAmenityType}
                  addAmenity={addAmenity}
                  editingAmenityIndex={editingAmenityIndex}
                  getAmenityTypeName={getAmenityTypeName}
                  getAmenityName={getAmenityName}
                  removeAmenityType={removeAmenityType}
                  viewAmenity={viewAmenity}
                  editAmenity={editAmenity}
                  removeAmenity={removeAmenity}
                  addNearbyPlace={addNearbyPlace}
                  updateNearbyPlace={updateNearbyPlace}
                  removeNearbyPlace={removeNearbyPlace}
                />
              </TabsContent>

              {/* TAB 5: Owner & Status */}
              <TabsContent value="settings" className="m-0 focus-visible:outline-none">
                <TabOwnershipStatus
                  formData={formData}
                  handleInputChange={handleInputChange}
                />
              </TabsContent>
            </div>

            {/* Modal Floating Footer Controls */}
            <div className="flex items-center justify-between border-t border-slate-200/90 bg-white px-6 py-4 md:px-8 shadow-sm shrink-0">
              {/* Left: Progress bar & Cancel */}
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="ghost"
                  className="rounded-2xl text-xs font-bold text-slate-600 hover:text-slate-950 hover:bg-slate-100"
                  onClick={handleAttemptClose}
                >
                  Cancel
                </Button>

                <div className="hidden sm:flex items-center gap-3 border-l border-slate-200 pl-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[11px] font-black text-slate-900">
                      <span>Step {currentStepIdx + 1} of 5</span>
                      <span className="text-slate-600 font-semibold">• {progressPercent}% Done</span>
                    </div>
                    <div className="h-1.5 w-32 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-rose-600 transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Previous, Next & Submit controls */}
              <div className="flex items-center gap-2">
                {formActiveTab !== "basic" && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9.5 rounded-xl text-xs font-bold border-slate-200 text-slate-700 hover:bg-slate-100 px-3.5"
                    onClick={() => {
                      if (currentStepIdx > 0) setFormActiveTab(stepIds[currentStepIdx - 1]);
                    }}
                  >
                    <ChevronLeft className="mr-1 h-3.5 w-3.5 stroke-[2.5]" /> Previous
                  </Button>
                )}

                {formActiveTab !== "settings" ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9.5 rounded-xl text-xs font-bold border-slate-200 text-slate-900 bg-slate-50 hover:bg-slate-100 px-4 shadow-xs"
                    onClick={() => {
                      if (currentStepIdx < stepIds.length - 1) {
                        setFormActiveTab(stepIds[currentStepIdx + 1]);
                      }
                    }}
                  >
                    Next Step <ChevronRight className="ml-1 h-3.5 w-3.5 stroke-[2.5]" />
                  </Button>
                ) : null}

                {handleSaveDraft && (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={loading || imageUploading}
                    onClick={handleSaveDraft}
                    className="h-9.5 rounded-xl border-purple-300 dark:border-purple-800 text-purple-700 dark:text-purple-300 bg-purple-50/70 hover:bg-purple-100/90 px-4 text-xs font-bold shadow-xs transition flex items-center gap-1.5"
                  >
                    <FileText className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                    Save as Draft
                  </Button>
                )}

                <Button
                  type="submit"
                  disabled={loading || imageUploading}
                  className="h-9.5 rounded-xl bg-gradient-to-r from-primary to-rose-600 px-5 text-xs font-bold text-white shadow-md shadow-primary/25 hover:opacity-95 transition"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Saving...
                    </>
                  ) : editingProperty ? (
                    editingProperty.status === "draft" ? (
                      "Publish Property"
                    ) : (
                      "Save Changes"
                    )
                  ) : (
                    "Publish Property"
                  )}
                </Button>
              </div>
            </div>
          </Tabs>
        </form>
      </DialogContent>
    </Dialog>

    <AlertDialog open={showExitConfirm} onOpenChange={setShowExitConfirm}>
      <AlertDialogContent className="rounded-3xl max-w-md border border-slate-200/90 shadow-2xl p-6 bg-white">
        <AlertDialogHeader>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-800 mb-2">
            <FileText className="h-6 w-6 text-amber-700" />
          </div>
          <AlertDialogTitle className="text-lg font-black text-slate-950">
            Unsaved Property Changes
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-slate-600 leading-relaxed font-medium">
            You have active edits in this listing. Don't worry, your progress is automatically cached, but would you like to save it to your drafts before leaving?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2 mt-4">
          <AlertDialogCancel
            onClick={() => setShowExitConfirm(false)}
            className="rounded-xl text-xs font-bold border-slate-200 text-slate-700 hover:bg-slate-100"
          >
            Keep Editing
          </AlertDialogCancel>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setShowExitConfirm(false);
              if (onDiscardDraft) onDiscardDraft();
              onOpenChange(false);
              resetForm();
            }}
            className="rounded-xl text-xs font-bold text-rose-700 hover:text-rose-800 hover:bg-rose-50 border-rose-200"
          >
            Discard Changes
          </Button>
          {handleSaveDraft && (
            <Button
              type="button"
              onClick={async () => {
                setShowExitConfirm(false);
                await handleSaveDraft();
                onOpenChange(false);
                resetForm();
              }}
              className="rounded-xl text-xs font-bold bg-purple-700 hover:bg-purple-800 text-white shadow-xs"
            >
              Save as Draft & Exit
            </Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </>
  );
};
