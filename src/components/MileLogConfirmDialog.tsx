import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Footprints, Loader2 } from "lucide-react";

interface MileLogConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  miles: number;
  challengeName?: string;
  isLogging: boolean;
}

export function MileLogConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  miles,
  challengeName,
  isLogging,
}: MileLogConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Footprints className="w-5 h-5 text-primary" />
            Confirm Mile Entry
          </DialogTitle>
          <DialogDescription>
            Please confirm you want to log the following miles.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {challengeName && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Challenge</span>
              <span className="font-medium text-foreground">{challengeName}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Miles to Log</span>
            <span className="font-bold text-primary text-lg">{miles}</span>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLogging}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isLogging}>
            {isLogging ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Logging...
              </>
            ) : (
              `Log ${miles} Miles`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
