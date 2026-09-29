import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Loader2,
  CheckCircle2,
  Building2,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FORM_STEPS } from "@/components/properties/constants";
import { TabBasicLocation } from "@/components/properties/form/TabBasicLocation";
import { TabSpecsPricing } from "@/components/properties/form/TabSpecsPricing";
import { TabMediaLinks } from "@/components/properties/form/TabMediaLinks";
import { TabAmenitiesNearby } from "@/components/properties/form/TabAmenitiesNearby";
import { TabOwnershipStatus } from "@/components/properties/form/TabOwnershipStatus";
import { usePropertyFormState } from "@/components/properties/usePropertyFormState";
import { useAuth } from "@/context/AuthContext";

export default function AgentPropertyAdd() {
  const navigate = useNavigate();
  const { currentAgent, userData } = useAuth();

  const activeAgentId = currentAgent?._id || userData?._id || userData?.user_id;
  const activeAgentName = currentAgent?.name || userData?.name || "Agent";

  const formState = usePropertyFormState({
    initialAgentId: activeAgentId,
    initialAgentName: activeAgentName,
    onSuccess: () => {
      navigate("/agent/properties");
    },
  });

  const onSubmit = (e: React.FormEvent) => {
    formState.handleSubmit(e, activeAgentId, activeAgentName);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Top Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate("/agent/properties")}
            className="h-9 rounded-xl font-bold text-xs border-slate-200 hover:bg-slate-100"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Properties
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight flex items-center gap-2">
              <Building2 className="h-6 w-6 text-primary" />
              <span>Add New Property Listing</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              5-step guided portfolio creation with live specs, real amenities, and media.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Badge className="bg-purple-100 text-purple-900 border-purple-200 font-black text-xs px-3 py-1 flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-purple-700" />
            <span>Agent: {activeAgentName}</span>
          </Badge>
        </div>
      </div>

      {/* Main Guided Stepper Form */}
      <form onSubmit={onSubmit} className="space-y-6">
        <Tabs
          value={formState.formActiveTab}
          onValueChange={formState.setFormActiveTab}
          className="w-full"
        >
          {/* Stepper Tabs Bar */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-2 shadow-xs">
            <TabsList className="grid grid-cols-2 md:grid-cols-5 h-auto gap-2 bg-transparent p-0">
              {FORM_STEPS.map((step, idx) => {
                const isCurrent = formState.formActiveTab === step.id;
                const isPassed = formState.currentStepIdx > idx;
                const IconComponent = step.icon;

                return (
                  <TabsTrigger
                    key={step.id}
                    value={step.id}
                    className={`flex items-center gap-2.5 p-3 rounded-2xl transition-all border text-left data-[state=active]:shadow-sm ${
                      isCurrent
                        ? "bg-amber-500/10 border-amber-300 text-amber-950 font-black ring-1 ring-amber-400/40"
                        : isPassed
                        ? "bg-emerald-50/60 border-emerald-200 text-emerald-900 font-bold"
                        : "bg-slate-50 border-slate-200 text-slate-600 font-semibold hover:bg-slate-100"
                    }`}
                  >
                    <div
                      className={`h-7 w-7 rounded-xl flex items-center justify-center shrink-0 text-xs font-black ${
                        isCurrent
                          ? "bg-amber-600 text-white"
                          : isPassed
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="h-4 w-4" /> : step.step}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-extrabold truncate leading-tight">
                        {step.label}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate hidden sm:block">
                        {step.desc}
                      </p>
                    </div>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          {/* Stepper Content Panels */}
          <div className="mt-6">
            <TabsContent value="basic" className="mt-0 space-y-6">
              <TabBasicLocation
                formData={formState.formData}
                handleInputChange={formState.handleInputChange}
                handleLocationChange={formState.handleLocationChange}
                handlePropertyTypeChange={formState.handlePropertyTypeChange}
                propertyTypes={formState.propertyTypes}
              />
            </TabsContent>

            <TabsContent value="specs" className="mt-0 space-y-6">
              <TabSpecsPricing
                formData={formState.formData}
                handleInputChange={formState.handleInputChange}
                propertyTypeFields={formState.propertyTypeFields}
              />
            </TabsContent>

            <TabsContent value="media" className="mt-0 space-y-6">
              <TabMediaLinks
                formData={formState.formData}
                handleInputChange={formState.handleInputChange}
                handleImageUpload={formState.handleImageUpload}
                removeImage={formState.removeImage}
                imageUploading={formState.imageUploading}
              />
            </TabsContent>

            <TabsContent value="amenities" className="mt-0 space-y-6">
              <TabAmenitiesNearby
                formData={formState.formData}
                handleInputChange={formState.handleInputChange}
                amenities={formState.amenities}
                amenityTypes={formState.amenityTypes}
                selectedAmenity={formState.selectedAmenity}
                selectedAmenityTypes={formState.selectedAmenityTypes}
                setSelectedAmenityTypes={formState.setSelectedAmenityTypes}
                amenityDropdownOpen={formState.amenityDropdownOpen}
                setAmenityDropdownOpen={formState.setAmenityDropdownOpen}
                handleAmenitySelect={formState.handleAmenitySelect}
                toggleAmenityType={formState.toggleAmenityType}
                addAmenity={formState.addAmenity}
                editingAmenityIndex={formState.editingAmenityIndex}
                getAmenityTypeName={formState.getAmenityTypeName}
                getAmenityName={formState.getAmenityName}
                removeAmenityType={formState.removeAmenityType}
                viewAmenity={formState.viewAmenity}
                editAmenity={formState.editAmenity}
                removeAmenity={formState.removeAmenity}
                addNearbyPlace={formState.addNearbyPlace}
                updateNearbyPlace={formState.updateNearbyPlace}
                removeNearbyPlace={formState.removeNearbyPlace}
              />
            </TabsContent>

            <TabsContent value="settings" className="mt-0 space-y-6">
              <TabOwnershipStatus
                formData={formState.formData}
                handleInputChange={formState.handleInputChange}
              />
            </TabsContent>
          </div>
        </Tabs>

        {/* Sticky Bottom Action Controls */}
        <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur-md p-4 sm:px-6 rounded-2xl border border-slate-200/90 shadow-xl flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-600">
              Step {formState.currentStepIdx + 1} of 5 ({formState.progressPercent}%)
            </span>
            <div className="w-28 h-2 bg-slate-200 rounded-full overflow-hidden hidden sm:block">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300"
                style={{ width: `${formState.progressPercent}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {formState.currentStepIdx > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={formState.handlePrev}
                className="rounded-xl font-bold text-xs"
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
              </Button>
            )}

            {formState.currentStepIdx < formState.stepIds.length - 1 ? (
              <Button
                type="button"
                size="sm"
                onClick={formState.handleNext}
                className="rounded-xl font-black text-xs bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
              >
                Next Step <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={formState.loading}
                size="sm"
                className="rounded-xl font-black text-xs bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-md flex items-center gap-1.5 px-5"
              >
                {formState.loading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Publishing Listing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Publish Agent Property</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
