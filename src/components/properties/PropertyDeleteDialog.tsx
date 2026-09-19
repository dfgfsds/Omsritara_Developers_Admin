import React from "react";
import { Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PropertyDeleteDialogProps {
  open: boolean;
  onOpenChange: (val: boolean) => void;
  onConfirm: () => void;
  loading: boolean;
}

export const PropertyDeleteDialog: React.FC<PropertyDeleteDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  loading,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[92vw] max-w-sm rounded-3xl p-6 border border-slate-200">
        <div className="flex flex-col items-center text-center">
          <div className="mb-3.5 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600">
            <Trash2 className="h-7 w-7 stroke-[2.5]" />
          </div>
          <DialogTitle className="text-lg font-black text-slate-950">Delete Property?</DialogTitle>
          <p className="mt-2 text-xs font-semibold text-slate-700 leading-relaxed">
            Are you sure you want to delete this property? This action will remove the listing from public search.
          </p>

          <div className="mt-6 flex w-full justify-center gap-3">
            <Button
              variant="outline"
              className="flex-1 rounded-2xl border-slate-300 font-bold text-slate-800"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1 rounded-2xl font-black bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/25"
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? "Deleting..." : "Confirm Delete"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
