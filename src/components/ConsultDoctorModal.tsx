import { useState, useEffect } from "react";
import { UserCheck, MapPin, Clock, Star, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getDoctors, type Doctor } from "@/lib/mockDoctors";
import { saveAppointment, getHistory } from "@/lib/analysisHistory";
import { useToast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctorType: string;
}

const timeSlots = ["09:00 AM", "10:30 AM", "11:00 AM", "01:00 PM", "02:30 PM", "04:00 PM", "05:30 PM"];

function generateRandomSlots() {
  const shuffled = [...timeSlots].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 4).sort();
}

const ConsultDoctorModal = ({ open, onOpenChange, doctorType }: Props) => {
  const { toast } = useToast();
  
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [step, setStep] = useState(1);
  const [selectedDoc, setSelectedDoc] = useState<Doctor | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [consultationFee, setConsultationFee] = useState<number>(500);

  useEffect(() => {
    if (open) {
      setDoctors(getDoctors(doctorType));
    }
  }, [open, doctorType]);

  const handleOpenChange = (v: boolean) => {
    onOpenChange(v);
    if (!v) {
      setTimeout(() => {
        setStep(1);
        setSelectedDoc(null);
        setSelectedSlot("");
        setIsSuccess(false);
        setIsProcessing(false);
      }, 300);
    }
  };

  const handleSelectDoctor = (doctor: Doctor) => {
    setSelectedDoc(doctor);
    setAvailableSlots(generateRandomSlots());
    setConsultationFee(Math.floor(Math.random() * 800) + 200); // INR 200-1000
    setStep(2);
  };

  const handleSelectSlot = (slot: string) => {
    setSelectedSlot(slot);
    setStep(3);
  };

  const confirmBooking = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      
      const latestAnalysis = getHistory()[0];
      const symptomsList = latestAnalysis ? latestAnalysis.symptoms : [];
      
      if (selectedDoc) {
        saveAppointment({
          doctorName: selectedDoc.name,
          specialization: selectedDoc.specialization,
          selectedTime: selectedSlot,
          symptoms: symptomsList
        });
      }

      toast({
        title: "Appointment Confirmed!",
        description: `Your appointment with ${selectedDoc?.name} at ${selectedSlot} is confirmed.`,
      });
      setTimeout(() => handleOpenChange(false), 3000);
    }, 2000);
  };

  const formatDate = () => {
    const d = new Date();
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step > 1 && !isSuccess && !isProcessing && (
              <button onClick={() => setStep(step - 1)} className="hover:bg-muted p-1 rounded transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <UserCheck className="w-5 h-5 text-primary" />
            {isSuccess ? "Booking Confirmed" : 
             step === 1 ? `Available Doctors — ${doctorType}` : 
             step === 2 ? "Select Time Slot" : 
             "Confirm Booking"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 mt-2">
          {isSuccess ? (
            <div className="py-8 text-center animate-fade-in">
              <CheckCircle2 className="w-12 h-12 text-[hsl(var(--severity-mild))] mx-auto mb-3" />
              <h3 className="font-semibold text-foreground text-lg">Appointment Booked!</h3>
              <p className="text-sm text-foreground mt-4">Doctor: <span className="font-medium">{selectedDoc?.name}</span></p>
              <p className="text-sm text-foreground mt-1">Time: <span className="font-medium">{selectedSlot}</span> on {formatDate()}</p>
              <p className="text-xs text-muted-foreground mt-4">You will receive a confirmation message shortly.</p>
            </div>
          ) : step === 1 ? (
            doctors.map((doc) => (
              <div 
                key={doc.id} 
                className="p-4 rounded-xl bg-muted/50 space-y-2 cursor-pointer hover:bg-muted transition-colors border border-transparent hover:border-border" 
                onClick={() => handleSelectDoctor(doc)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-foreground text-sm">{doc.name}</p>
                    <p className="text-xs text-primary">{doc.specialization}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground bg-background px-2 py-1 rounded-md shadow-sm">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    {doc.rating}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" /> {doc.location}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" /> {doc.availability}
                </div>
              </div>
            ))
          ) : step === 2 ? (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                <p className="font-semibold text-foreground text-sm">{selectedDoc?.name}</p>
                <p className="text-xs text-muted-foreground">{selectedDoc?.location}</p>
              </div>
              <div>
                <p className="font-medium text-sm mb-3">Available Slots (Today - {formatDate()})</p>
                <div className="grid grid-cols-2 gap-3">
                  {availableSlots.map(slot => (
                    <Button 
                      key={slot} 
                      variant="outline" 
                      className="rounded-xl w-full h-11"
                      onClick={() => handleSelectSlot(slot)}
                    >
                      {slot}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5 animate-fade-in">
              <div className="p-5 rounded-xl bg-muted/30 border space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground">Doctor</p>
                  <p className="font-medium text-sm text-foreground">{selectedDoc?.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedDoc?.specialization}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 border-t pt-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Time Slot</p>
                    <p className="font-medium text-sm text-foreground">{selectedSlot}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Consultation Fee</p>
                    <p className="font-medium text-sm text-primary">₹{consultationFee}</p>
                  </div>
                </div>
              </div>
              <Button 
                className="w-full rounded-xl h-11" 
                onClick={confirmBooking} 
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Booking in progress...</>
                ) : (
                  "Confirm Appointment"
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConsultDoctorModal;
