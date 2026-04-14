import { MapPin, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getPharmacies } from "@/lib/mockDoctors";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PharmacyModal = ({ open, onOpenChange }: Props) => {
  const pharmacies = getPharmacies();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-secondary" />
            Nearby Pharmacies
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          {pharmacies.map((p) => (
            <div key={p.id} className="p-4 rounded-xl bg-muted/50 flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground text-sm">{p.name}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3" /> {p.location} • {p.distance}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span className={`text-xs font-medium ${p.open ? "text-[hsl(var(--severity-mild))]" : "text-destructive"}`}>
                  {p.open ? "Open" : "Closed"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PharmacyModal;
