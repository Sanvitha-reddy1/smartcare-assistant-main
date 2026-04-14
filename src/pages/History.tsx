import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, ArrowLeft, Clock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getHistory, clearHistory, type HistoryEntry } from "@/lib/analysisHistory";
import { useToast } from "@/hooks/use-toast";

const severityConfig = {
  mild: { label: "Mild", color: "text-severity-mild", bg: "bg-severity-mild/10", dot: "bg-[hsl(var(--severity-mild))]" },
  moderate: { label: "Moderate", color: "text-severity-moderate", bg: "bg-severity-moderate/10", dot: "bg-[hsl(var(--severity-moderate))]" },
  critical: { label: "Critical", color: "text-severity-critical", bg: "bg-severity-critical/10", dot: "bg-[hsl(var(--severity-critical))]" },
};

const History = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [history, setHistory] = useState<HistoryEntry[]>(getHistory());

  const handleClear = () => {
    clearHistory();
    setHistory([]);
    toast({ title: "History cleared", description: "All past analyses have been removed." });
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
            <h2 className="text-xl font-semibold text-foreground">Analysis History</h2>
          </div>
          {history.length > 0 && (
            <Button variant="ghost" size="sm" className="rounded-xl text-muted-foreground" onClick={handleClear}>
              <Trash2 className="w-4 h-4 mr-1" /> Clear All
            </Button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="bg-card rounded-2xl card-shadow p-12 text-center">
            <Clock className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground">No history yet</h3>
            <p className="text-sm text-muted-foreground/70 mt-1">Your past analyses will appear here</p>
            <Button className="mt-4 rounded-xl" onClick={() => navigate("/analyze")}>Start Analysis</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((entry) => {
              const sev = severityConfig[entry.severity];
              return (
                <div key={entry.id} className="bg-card rounded-2xl card-shadow p-5 hover:card-shadow-hover transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground">{entry.disease}</h3>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {entry.symptoms.map((s) => (
                          <span key={s} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">{s}</span>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">{formatDate(entry.date)}</p>
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
        )}
      </main>
    </div>
  );
};

export default History;
