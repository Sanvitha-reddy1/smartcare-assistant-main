import { useNavigate } from "react-router-dom";
import { LogOut, Activity, User, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

const initialMockRequests = [
  { id: 1, patient: "John Doe", time: "10:00 AM", status: "pending" },
  { id: 2, patient: "Sarah Smith", time: "11:30 AM", status: "pending" },
];

const DoctorDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [requests, setRequests] = useState(initialMockRequests);
  const [activeTab, setActiveTab] = useState<"requests" | "history">("requests");
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (user?.id) {
      fetch(`http://127.0.0.1:5000/doctor/history/${user.id}`)
        .then(res => res.json())
        .then(data => setHistory(data))
        .catch(err => console.error("Failed to load history", err));
    }
  }, [user]);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleAccept = async (id: number) => {
    const req = requests.find(r => r.id === id);
    if (!req) return;

    try {
      const res = await fetch("http://127.0.0.1:5000/doctor/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: user?.id,
          patientName: req.patient,
          time: req.time,
          status: "accepted"
        })
      });

      if (res.ok) {
        setRequests(prev => prev.filter(r => r.id !== id));
        // Refresh history
        const newHist = await fetch(`http://127.0.0.1:5000/doctor/history/${user?.id}`).then(r => r.json());
        setHistory(newHist);

        toast({
          title: "Appointment Accepted",
          description: "The patient has been notified.",
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleReject = (id: number) => {
    setRequests(prev => prev.filter(r => r.id !== id));
    toast({
      title: "Appointment Rejected",
      description: "The request was successfully removed.",
      variant: "destructive"
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-semibold text-foreground">SmartCare Doctor</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={handleLogout} className="rounded-xl text-muted-foreground">
              <LogOut className="w-4 h-4 mr-1" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-6">
            <div className="bg-card rounded-2xl card-shadow p-6 text-center">
              <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <User className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Dr. {user.fullName}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          
          <div className="md:col-span-2 space-y-6">
            <div className="bg-card rounded-2xl card-shadow p-6">
              <div className="flex items-center gap-4 border-b border-border mb-4">
                <button 
                  className={`pb-3 text-sm font-medium transition-colors ${activeTab === 'requests' ? 'border-b-2 border-primary text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  onClick={() => setActiveTab('requests')}
                >
                  Consultation Requests
                </button>
                <button 
                  className={`pb-3 text-sm font-medium transition-colors ${activeTab === 'history' ? 'border-b-2 border-primary text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  onClick={() => setActiveTab('history')}
                >
                  Appointment History
                </button>
              </div>

              {activeTab === 'requests' ? (
                <div className="space-y-4">
                {requests.length === 0 ? (
                  <p className="text-sm text-muted-foreground p-4 text-center">No pending consultation requests.</p>
                ) : (
                  requests.map((req) => (
                    <div key={req.id} className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/30">
                      <div>
                        <p className="font-medium text-foreground">{req.patient}</p>
                        <p className="text-sm text-muted-foreground">Requested for: {req.time}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="rounded-xl border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground" onClick={() => handleReject(req.id)}>
                          <X className="w-4 h-4 mr-1" /> Reject
                        </Button>
                        <Button size="sm" className="rounded-xl" onClick={() => handleAccept(req.id)}>
                          <Check className="w-4 h-4 mr-1" /> Accept
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              ) : (
                <div className="space-y-4">
                  {history.length === 0 ? (
                    <p className="text-sm text-muted-foreground p-4 text-center">No appointment history found.</p>
                  ) : (
                    history.map((hist, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/10">
                        <div>
                          <p className="font-medium text-foreground">{hist.patientName}</p>
                          <p className="text-sm text-muted-foreground">Time: {hist.time}</p>
                        </div>
                        <div>
                          <span className="text-xs font-medium px-2 py-1 rounded-full bg-severity-mild/10 text-severity-mild">
                            Accepted
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DoctorDashboard;
