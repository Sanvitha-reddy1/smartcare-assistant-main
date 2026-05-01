import { useNavigate } from "react-router-dom";
import { LogOut, Activity, User, Package, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

const initialMockOrders = [
  { id: "ORD-1234", patient: "John Doe", items: "Paracetamol, Cetirizine", status: "pending" },
  { id: "ORD-1235", patient: "Alice Brown", items: "Omeprazole", status: "pending" },
];

const PharmacistDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState(initialMockOrders);
  const [activeTab, setActiveTab] = useState<"orders" | "history">("orders");
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (user?.id) {
      fetch(`http://127.0.0.1:5000/pharmacist/history/${user.id}`)
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

  const handleDispatch = async (id: string) => {
    const order = orders.find(o => o.id === id);
    if (!order) return;

    try {
      const res = await fetch("http://127.0.0.1:5000/pharmacist/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pharmacistId: user?.id,
          orderId: order.id,
          patientName: order.patient,
          items: order.items,
          status: "dispatched"
        })
      });

      if (res.ok) {
        setOrders(prev => prev.filter(o => o.id !== id));
        // Refresh history
        const newHist = await fetch(`http://127.0.0.1:5000/pharmacist/history/${user?.id}`).then(r => r.json());
        setHistory(newHist);

        toast({
          title: "Order Dispatched",
          description: `Order ${id} has been dispatched successfully.`,
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-semibold text-foreground">SmartCare Pharmacy</h1>
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
              <div className="w-20 h-20 mx-auto rounded-full bg-secondary/10 flex items-center justify-center mb-4">
                <User className="w-8 h-8 text-secondary" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">{user.fullName}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <p className="text-xs font-medium text-secondary mt-2 px-3 py-1 bg-secondary/10 rounded-full inline-block">Pharmacist</p>
            </div>
          </div>
          
          <div className="md:col-span-2 space-y-6">
            <div className="bg-card rounded-2xl card-shadow p-6">
              <div className="flex items-center gap-4 border-b border-border mb-4">
                <button 
                  className={`pb-3 text-sm font-medium transition-colors ${activeTab === 'orders' ? 'border-b-2 border-primary text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  onClick={() => setActiveTab('orders')}
                >
                  <span className="flex items-center gap-1"><Package className="w-4 h-4" /> Pending Orders</span>
                </button>
                <button 
                  className={`pb-3 text-sm font-medium transition-colors ${activeTab === 'history' ? 'border-b-2 border-primary text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  onClick={() => setActiveTab('history')}
                >
                  Delivery History
                </button>
              </div>

              {activeTab === 'orders' ? (
                <div className="space-y-4">
                {orders.length === 0 ? (
                  <p className="text-sm text-muted-foreground p-4 text-center">No pending orders.</p>
                ) : (
                  orders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/30">
                      <div>
                        <p className="font-medium text-foreground">{order.id} - {order.patient}</p>
                        <p className="text-sm text-muted-foreground mt-1">Items: {order.items}</p>
                      </div>
                      <div>
                        <Button size="sm" className="rounded-xl" onClick={() => handleDispatch(order.id)}>
                          <Check className="w-4 h-4 mr-1" /> Dispatch
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              ) : (
                <div className="space-y-4">
                  {history.length === 0 ? (
                    <p className="text-sm text-muted-foreground p-4 text-center">No delivery history found.</p>
                  ) : (
                    history.map((hist, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/10">
                        <div>
                          <p className="font-medium text-foreground">{hist.orderId} - {hist.patientName}</p>
                          <p className="text-sm text-muted-foreground mt-1">Items: {hist.items}</p>
                        </div>
                        <div>
                          <span className="text-xs font-medium px-2 py-1 rounded-full bg-severity-mild/10 text-severity-mild">
                            Dispatched
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

export default PharmacistDashboard;
