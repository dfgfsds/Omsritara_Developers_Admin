import React, { useEffect, useState } from "react";
import { PropertyFormDialog } from "@/components/properties/form/PropertyFormDialog";
import { usePropertyFormState } from "@/components/properties/usePropertyFormState";
import { Agent, AgentProperty } from "@/data/mockAgentsData";

interface AgentPropertyFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetAgent?: Agent | null;
  onSuccess?: (createdProperty: any) => void;
}

export const AgentPropertyFormDialog: React.FC<AgentPropertyFormDialogProps> = ({
  open,
  onOpenChange,
  targetAgent,
  onSuccess,
}) => {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(targetAgent || null);

  useEffect(() => {
    if (targetAgent) {
      setSelectedAgent(targetAgent);
    }
  }, [targetAgent, open]);

  const formState = usePropertyFormState({
    initialAgentId: selectedAgent?._id,
    initialAgentName: selectedAgent?.name,
    onSuccess: (created) => {
      if (onSuccess) {
        onSuccess(created);
      }
      onOpenChange(false);
      formState.resetForm();
    },
  });

  return (
    <PropertyFormDialog
      open={open}
      onOpenChange={onOpenChange}
      editingProperty={null}
      formData={formState.formData}
      formActiveTab={formState.formActiveTab}
      setFormActiveTab={formState.setFormActiveTab}
      handleSubmit={(e) =>
        formState.handleSubmit(e, selectedAgent?._id, selectedAgent?.name)
      }
      handleInputChange={formState.handleInputChange}
      handleLocationChange={formState.handleLocationChange}
      handlePropertyTypeChange={formState.handlePropertyTypeChange}
      propertyTypes={formState.propertyTypes}
      propertyTypeFields={formState.propertyTypeFields}
      handleImageUpload={formState.handleImageUpload}
      removeImage={formState.removeImage}
      imageUploading={formState.imageUploading}
      loading={formState.loading}
      resetForm={formState.resetForm}
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
  );
};
