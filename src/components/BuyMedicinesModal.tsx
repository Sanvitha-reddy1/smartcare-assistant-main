import { useState } from "react";
import { ShoppingCart, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface Medicine {
  name: string;
  usage: string;
  timing: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medicines: Medicine[];
}

const BuyMedicinesModal = ({ open, onOpenChange, medicines }: Props) => {
  const { toast } = useToast();
  const [ordered, setOrdered] = useState(false);

  const handleOrder = () => {
    setOrdered(true);
    toast({
      title: "Order Placed!",
      description: "Your medicines will be delivered within 30–60 minutes.",
    });
    setTimeout(() => {
      setOrdered(false);
      onOpenChange(false);
    }, 3000);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setOrdered(false); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" />
            Buy Medicines
          </DialogTitle>
        </DialogHeader>

        {ordered ? (
          <div className="py-8 text-center animate-fade-in">
            <CheckCircle2 className="w-12 h-12 text-[hsl(var(--severity-mild))] mx-auto mb-3" />
            <h3 className="font-semibold text-foreground">Order Confirmed!</h3>
            <p className="text-sm text-muted-foreground mt-1">Estimated delivery: 30–60 minutes</p>
          </div>
        ) : (
          <div className="space-y-3 mt-2">
            {medicines.map((m, i) => (
              <div key={i} className="p-3 rounded-xl bg-muted/50">
                <p className="font-medium text-foreground text-sm">{m.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{m.usage}</p>
                <p className="text-xs text-primary mt-1">⏰ {m.timing}</p>
              </div>
            ))}
            <Button className="w-full rounded-xl mt-2" onClick={handleOrder}>
              <ShoppingCart className="w-4 h-4 mr-1" /> Order Now
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BuyMedicinesModal;
