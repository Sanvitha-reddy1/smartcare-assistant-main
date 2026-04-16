import { useState, useEffect, useMemo } from "react";
import { ShoppingCart, CheckCircle2, MapPin, Loader2, ArrowLeft, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { getPharmacies, type Pharmacy } from "@/lib/mockDoctors";
import { saveOrder } from "@/lib/analysisHistory";

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

interface CartItem extends Medicine {
  price: number;
  quantity: number;
}

const BuyMedicinesModal = ({ open, onOpenChange, medicines }: Props) => {
  const { toast } = useToast();
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  
  const [step, setStep] = useState(1);
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  
  useEffect(() => {
    if (open) {
      setPharmacies(getPharmacies());
    }
  }, [open]);

  // Assign random prices (INR 20 - 500)
  const initialCart = useMemo(() => {
    return medicines.map(m => ({
      ...m,
      price: Math.floor(Math.random() * 480) + 20,
      quantity: 1
    })) as CartItem[];
  }, [medicines]);

  const [cart, setCart] = useState<CartItem[]>(initialCart);
  
  useEffect(() => {
    if (open) {
      setCart(initialCart);
    }
  }, [open, initialCart]);

  const [deliveryType, setDeliveryType] = useState("home");
  const [address, setAddress] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleOpenChange = (v: boolean) => {
    onOpenChange(v);
    if (!v) {
      setTimeout(() => {
        setStep(1);
        setSelectedPharmacy(null);
        setCart(initialCart);
        setAddress("");
        setIsSuccess(false);
        setIsProcessing(false);
      }, 300);
    }
  };

  const updateQuantity = (index: number, delta: number) => {
    setCart(prev => {
      const newCart = [...prev];
      const newQty = newCart[index].quantity + delta;
      if (newQty > 0) newCart[index].quantity = newQty;
      return newCart;
    });
  };

  const totalPrice = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const deliveryFee = deliveryType === "home" ? 50 : 0;
  const finalTotal = totalPrice + deliveryFee;

  const handleConfirm = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      
      if (selectedPharmacy) {
        saveOrder({
          pharmacyName: selectedPharmacy.name,
          medicines: cart.map(item => ({ name: item.name, quantity: item.quantity, price: item.price })),
          totalPrice: finalTotal,
          deliveryAddress: deliveryType === "home" ? address : "In-store Pickup"
        });
      }

      toast({
        title: "Order Placed successfully!",
        description: `Your medicines will be ${deliveryType === "home" ? "delivered to you" : "ready for pickup"} shortly.`,
      });
      setTimeout(() => handleOpenChange(false), 3500);
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step > 1 && !isSuccess && !isProcessing && (
              <button onClick={() => setStep(step - 1)} className="hover:bg-muted p-1 rounded transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <ShoppingCart className="w-5 h-5 text-primary" />
            {isSuccess ? "Order Confirmed" : 
             step === 1 ? "Select Pharmacy" : 
             step === 2 ? "Your Cart & Medicines" : 
             "Checkout Details"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {isSuccess ? (
            <div className="py-8 text-center animate-fade-in">
              <CheckCircle2 className="w-12 h-12 text-[hsl(var(--severity-mild))] mx-auto mb-3" />
              <h3 className="font-semibold text-foreground text-lg">Order Successfully Placed!</h3>
              <div className="mt-4 p-4 rounded-xl bg-muted/30 border inline-block text-left mx-auto">
                <p className="text-sm text-foreground">Pharmacy: <span className="font-medium">{selectedPharmacy?.name}</span></p>
                <p className="text-sm text-foreground mt-1 text-primary font-medium">
                  {deliveryType === "home" ? "Estimated delivery: 30-45 mins" : "Pickup ready in: 15 mins"}
                </p>
              </div>
            </div>
          ) : step === 1 ? (
            <div className="space-y-3">
              {pharmacies.map((p) => (
                <div 
                  key={p.id} 
                  className={`p-4 rounded-xl border transition-colors ${p.open ? "cursor-pointer hover:bg-muted/80 bg-muted/10 border-border" : "opacity-60 bg-muted/20 border-transparent cursor-not-allowed"}`}
                  onClick={() => {
                    if (p.open) {
                      setSelectedPharmacy(p);
                      setStep(2);
                    }
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-foreground text-sm">{p.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" /> {p.location} • {p.distance}
                      </p>
                    </div>
                    <div>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${p.open ? "bg-[hsl(var(--severity-mild))]/10 text-[hsl(var(--severity-mild))]" : "bg-destructive/10 text-destructive"}`}>
                        {p.open ? "Open" : "Closed"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : step === 2 ? (
            <div className="space-y-4 animate-fade-in">
              <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                <p className="text-xs text-muted-foreground">Ordering from</p>
                <p className="font-medium text-sm text-foreground">{selectedPharmacy?.name}</p>
              </div>
              
              <div className="space-y-3">
                {cart.map((item, index) => (
                  <div key={index} className="p-3 rounded-xl border bg-card flex justify-between items-center">
                    <div className="w-[65%]">
                      <p className="font-medium text-foreground text-sm leading-tight">{item.name}</p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{item.usage}</p>
                      <p className="text-sm font-semibold text-primary mt-1.5">₹{item.price}</p>
                    </div>
                    <div className="flex items-center gap-3 bg-muted/50 p-1 rounded-lg">
                      <button onClick={() => updateQuantity(index, -1)} className="p-1.5 bg-background rounded-md shadow-sm hover:bg-muted transition-colors"><Minus className="w-3 h-3" /></button>
                      <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(index, 1)} className="p-1.5 bg-background rounded-md shadow-sm hover:bg-muted transition-colors"><Plus className="w-3 h-3" /></button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center border-t pt-4 px-1">
                <span className="font-medium text-foreground">Subtotal</span>
                <span className="font-semibold text-lg text-foreground">₹{totalPrice}</span>
              </div>
              
              <Button className="w-full rounded-xl h-11" onClick={() => setStep(3)}>Proceed to Checkout</Button>
            </div>
          ) : (
            <div className="space-y-5 animate-fade-in mt-1">
              <div className="space-y-3">
                <Label>Delivery Method</Label>
                <RadioGroup value={deliveryType} onValueChange={setDeliveryType} className="grid grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2 border p-3 rounded-xl hover:bg-muted/50 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5 cursor-pointer transition-colors">
                    <RadioGroupItem value="home" id="home" />
                    <Label htmlFor="home" className="cursor-pointer">Home Delivery</Label>
                  </div>
                  <div className="flex items-center space-x-2 border p-3 rounded-xl hover:bg-muted/50 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5 cursor-pointer transition-colors">
                    <RadioGroupItem value="pickup" id="pickup" />
                    <Label htmlFor="pickup" className="cursor-pointer">Store Pickup</Label>
                  </div>
                </RadioGroup>
              </div>

              {deliveryType === "home" && (
                <div className="space-y-2 animate-fade-in">
                  <Label>Delivery Address</Label>
                  <Input 
                    placeholder="Enter your full address" 
                    value={address} 
                    onChange={(e) => setAddress(e.target.value)}
                    className="h-11 rounded-xl"
                  />
                </div>
              )}

              <div className="p-4 rounded-xl bg-muted/30 border space-y-3 mt-4">
                <h4 className="font-medium text-sm">Order Summary</h4>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">₹{totalPrice}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span className="font-medium">₹{deliveryFee}</span>
                </div>
                <div className="flex justify-between font-semibold border-t pt-3 mt-1">
                  <span>Total Payable</span>
                  <span className="text-primary text-base">₹{finalTotal}</span>
                </div>
              </div>

              <Button 
                className="w-full rounded-xl h-11" 
                onClick={handleConfirm}
                disabled={isProcessing || (deliveryType === "home" && address.trim().length < 5)}
              >
                {isProcessing ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing Order...</>
                ) : (
                  `Confirm & Pay ₹${finalTotal}`
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BuyMedicinesModal;
