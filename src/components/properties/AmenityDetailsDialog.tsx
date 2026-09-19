import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormAmenityData } from "./types";

interface AmenityDetailsDialogProps {
  open: boolean;
  onOpenChange: (val: boolean) => void;
  viewingAmenity: FormAmenityData | null;
  getAmenityName: (amenityId: string) => string;
  getAmenityTypeName: (amenityId: string, typeId: string) => string;
}

export const AmenityDetailsDialog: React.FC<AmenityDetailsDialogProps> = ({
  open,
  onOpenChange,
  viewingAmenity,
  getAmenityName,
  getAmenityTypeName,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[92vw] max-w-md rounded-3xl border border-slate-200">
        <DialogHeader>
          <DialogTitle className="text-base font-black text-slate-950">Amenities Group Details</DialogTitle>
        </DialogHeader>

        {viewingAmenity && (
          <div className="space-y-4 pt-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-600">Category</span>
              <p className="mt-1 text-sm font-black text-slate-950">{getAmenityName(viewingAmenity.amenities)}</p>
            </div>

            <div>
              <p className="mb-2 text-xs font-black text-slate-950">Included Amenities</p>
              <div className="flex flex-wrap gap-2">
                {viewingAmenity.amenity_types.map((typeId) => (
                  <span key={typeId} className="rounded-xl border border-slate-300 bg-background px-3 py-1.5 text-xs font-bold text-slate-900 shadow-xs">
                    {getAmenityTypeName(viewingAmenity.amenities, typeId)}
                  </span>
                ))}
              </div>
            </div>

            <Button className="w-full rounded-2xl font-black bg-primary text-white" onClick={() => onOpenChange(false)}>
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
