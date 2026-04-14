import { useState } from "react";
import { UserCheck, MapPin, Clock, Star, CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getDoctors, type Doctor } from "@/lib/mockDoctors";
import { useToast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctorType: string;
}

const ConsultDoctorModal = ({ open, onOpenChange, doctorType }: Props) => {
  const { toast } = useToast();
  const doctors = getDoctors(doctorType);
  const [booked, setBooked] = useState<string | null>(null);

  const handleBook = (doctor: Doctor) => {
    setBooked(doctor.id);
    toast({
      title: "Appointment Booked!",
      description: `Your appointment with ${doctor.name} has been confirmed.`,
    });
    setTimeout(() => setBooked(null), 3000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-primary" />
            Available Doctors — {doctorType}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          {doctors.map((doc) => (
            <div key={doc.id} className="p-4 rounded-xl bg-muted/50 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-foreground text-sm">{doc.name}</p>
                  <p className="text-xs text-primary">{doc.specialization}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
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
              <Button
                size="sm"
                className="rounded-xl mt-1 w-full"
                disabled={booked === doc.id}
                onClick={() => handleBook(doc)}
              >
                {booked === doc.id ? (
                  <><CalendarCheck className="w-4 h-4 mr-1" /> Booked!</>
                ) : (
                  "Book Appointment"
                )}
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConsultDoctorModal;
