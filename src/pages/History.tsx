import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, Clock, Trash2, CalendarCheck, ShoppingCart, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getHistory, getAppointments, getOrders, clearHistory, type HistoryEntry, type AppointmentHistory, type OrderHistory } from "@/lib/analysisHistory";
import { useToast } from "@/hooks/use-toast";

const severityConfig = {
  mild: { label: "Mild", color: "text-severity-mild", bg: "bg-severity-mild/10", dot: "bg-[hsl(var(--severity-mild))]" },
  moderate: { label: "Moderate", color: "text-severity-moderate", bg: "bg-severity-moderate/10", dot: "bg-[hsl(var(--severity-moderate))]" },
  critical: { label: "Critical", color: "text-severity-critical", bg: "bg-severity-critical/10", dot: "bg-[hsl(var(--severity-critical))]" },
};

const History = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState<"analysis" | "appointments" | "orders">("analysis");
  const [history, setHistory] = useState<HistoryEntry[]>(getHistory());
  const [appointments, setAppointments] = useState<AppointmentHistory[]>(getAppointments());
  const [orders, setOrders] = useState<OrderHistory[]>(getOrders());

  const handleClear = () => {
    clearHistory();
    setHistory([]);
    setAppointments([]);
    setOrders([]);
    toast({ title: "History cleared", description: "All past data has been removed." });
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
      " at " + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-semibold text-foreground">SmartCare</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="rounded-xl" onClick={() => navigate("/dashboard")}>
              Profile
            </Button>
            <Button variant="outline" size="sm" className="rounded-xl" onClick={() => navigate("/analyze")}>
              Symptom Analysis
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Your History</h2>
          </div>
          {(history.length > 0 || appointments.length > 0 || orders.length > 0) && (
            <Button variant="ghost" size="sm" className="rounded-xl text-muted-foreground" onClick={handleClear}>
              <Trash2 className="w-4 h-4 mr-1" /> Clear All
            </Button>
          )}
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <Button 
            variant={activeTab === "analysis" ? "default" : "outline"} 
            className="rounded-xl"
            onClick={() => setActiveTab("analysis")}
          >
            <Stethoscope className="w-4 h-4 mr-2" /> Analysis ({history.length})
          </Button>
          <Button 
            variant={activeTab === "appointments" ? "default" : "outline"} 
            className="rounded-xl"
            onClick={() => setActiveTab("appointments")}
          >
            <CalendarCheck className="w-4 h-4 mr-2" /> Appointments ({appointments.length})
          </Button>
          <Button 
            variant={activeTab === "orders" ? "default" : "outline"} 
            className="rounded-xl"
            onClick={() => setActiveTab("orders")}
          >
            <ShoppingCart className="w-4 h-4 mr-2" /> Orders ({orders.length})
          </Button>
        </div>

        {activeTab === "analysis" && (
          history.length === 0 ? (
            <div className="bg-card rounded-2xl card-shadow p-12 text-center">
              <Stethoscope className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">No analysis history</h3>
              <p className="text-sm text-muted-foreground/70 mt-1">Your past symptom analyses will appear here</p>
              <Button className="mt-4 rounded-xl" onClick={() => navigate("/analyze")}>Start Analysis</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((entry) => {
                const sev = severityConfig[entry.severity] || severityConfig.mild;
                return (
                  <div key={entry.id} className="bg-card rounded-2xl card-shadow p-5 hover:card-shadow-hover transition-shadow border border-transparent hover:border-border">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground text-md">{entry.disease}</h3>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {entry.symptoms.map((s) => (
                            <span key={s} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">{s}</span>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-3">{formatDate(entry.date)}</p>
                      </div>
                      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${sev.bg} shrink-0`}>
                        <div className={`w-2 h-2 rounded-full ${sev.dot}`} />
                        <span className={`text-xs font-medium ${sev.color}`}>{sev.label}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

        {activeTab === "appointments" && (
          appointments.length === 0 ? (
            <div className="bg-card rounded-2xl card-shadow p-12 text-center">
              <CalendarCheck className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">No appointments booked</h3>
              <p className="text-sm text-muted-foreground/70 mt-1">Your past consultations will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((entry) => (
                <div key={entry.id} className="bg-card rounded-2xl card-shadow p-5 hover:card-shadow-hover transition-shadow border border-transparent hover:border-border">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground text-md">{entry.doctorName}</h3>
                      <p className="text-sm text-primary font-medium mt-0.5">{entry.specialization}</p>
                      <div className="mt-2 text-sm text-muted-foreground flex gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
                        <span className="font-medium text-foreground">Symptoms:</span>
                        {entry.symptoms.length > 0 ? entry.symptoms.join(", ") : "None specified"}
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <span className="bg-muted px-2 py-1 rounded-md text-foreground font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {entry.selectedTime}
                        </span>
                        <span>{formatDate(entry.date)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {activeTab === "orders" && (
          orders.length === 0 ? (
            <div className="bg-card rounded-2xl card-shadow p-12 text-center">
              <ShoppingCart className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">No medicine orders</h3>
              <p className="text-sm text-muted-foreground/70 mt-1">Your past pharmacy orders will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((entry) => (
                <div key={entry.id} className="bg-card rounded-2xl card-shadow p-5 hover:card-shadow-hover transition-shadow border border-transparent hover:border-border">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <h3 className="font-semibold text-foreground text-md">{entry.pharmacyName}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{formatDate(entry.date)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary text-base">₹{entry.totalPrice}</p>
                      <p className="text-xs text-muted-foreground">
                        {entry.deliveryAddress === "In-store Pickup" ? "Pickup" : "Delivery"}
                      </p>
                    </div>
                  </div>
                  <div className="bg-muted/30 rounded-xl p-3 space-y-2">
                    {entry.medicines.map((m, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-foreground">{m.quantity}x {m.name}</span>
                        <span className="text-muted-foreground font-medium">₹{m.price * m.quantity}</span>
                      </div>
                    ))}
                  </div>
                  {entry.deliveryAddress !== "In-store Pickup" && (
                    <p className="text-xs text-muted-foreground mt-3">
                      <span className="font-medium text-foreground">Delivered to:</span> {entry.deliveryAddress}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )
        )}
      </main>
    </div>
  );
};

export default History;
