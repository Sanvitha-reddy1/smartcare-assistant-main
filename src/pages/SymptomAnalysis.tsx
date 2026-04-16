
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, ArrowLeft, Search, Stethoscope, Pill, Home, MapPin, UserCheck, AlertTriangle, Loader2, ShoppingCart, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
// import { getSuggestions, analyzeSymptoms } from "@/lib/symptomData";
import { getSuggestions, analyzeSymptoms } from "../lib/symptomData";
import { addToHistory } from "@/lib/analysisHistory";
import ConsultDoctorModal from "@/components/ConsultDoctorModal";
import PharmacyModal from "@/components/PharmacyModal";
import BuyMedicinesModal from "@/components/BuyMedicinesModal";

type Severity = "mild" | "moderate" | "critical";

const severityConfig: Record<Severity, { label: string; color: string; bg: string }> = {
  mild: { label: "Mild (Normal)", color: "text-severity-mild", bg: "bg-severity-mild/10" },
  moderate: { label: "Moderate", color: "text-severity-moderate", bg: "bg-severity-moderate/10" },
  critical: { label: "Critical", color: "text-severity-critical", bg: "bg-severity-critical/10" },
};

const SymptomAnalysis = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [symptomInput, setSymptomInput] = useState("");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [age, setAge] = useState(user?.age?.toString() || "");
  const [weight, setWeight] = useState(user?.weight || "");
  const [duration, setDuration] = useState("");
  const [durationUnit, setDurationUnit] = useState("days");
  const [severity, setSeverity] = useState("");
  const [results, setResults] = useState<ReturnType<typeof analyzeSymptoms> | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  // Modal states
  const [consultOpen, setConsultOpen] = useState(false);
  const [pharmacyOpen, setPharmacyOpen] = useState(false);
  const [buyOpen, setBuyOpen] = useState(false);

  const handleInputChange = (value: string) => {
    setSymptomInput(value);
    if (value.length > 1 || selectedSymptoms.length > 0) {
      setSuggestions(getSuggestions(value, selectedSymptoms));
    } else {
      setSuggestions([]);
    }
  };

  const toggleSymptom = (symptom: string) => {
    const updated = selectedSymptoms.includes(symptom)
      ? selectedSymptoms.filter((s) => s !== symptom)
      : [...selectedSymptoms, symptom];
    setSelectedSymptoms(updated);
    // Re-generate suggestions based on new selection
    setSuggestions(getSuggestions(symptomInput, updated));
  };

  const addCustomSymptom = () => {
    if (symptomInput.trim() && !selectedSymptoms.includes(symptomInput.trim())) {
      setSelectedSymptoms((prev) => [...prev, symptomInput.trim()]);
      setSymptomInput("");
      setSuggestions([]);
    }
  };

  const handleAnalyze = async () => {
    const all = [...selectedSymptoms];
    if (symptomInput.trim()) all.push(symptomInput.trim());
    if (all.length === 0) return;
    setAnalyzing(true);
    await new Promise((r) => setTimeout(r, 1500));
    const analysisResults = analyzeSymptoms(all);
    setResults(analysisResults);
    addToHistory({
      symptoms: all,
      disease: analysisResults.disease,
      severity: analysisResults.severity,
      doctorType: analysisResults.doctorType,
    });
    setAnalyzing(false);
  };

  const sev = results ? severityConfig[results.severity] : null;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-semibold text-foreground">SmartCare</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="rounded-xl" onClick={() => navigate("/history")}>
              <Clock className="w-4 h-4 mr-1" /> History
            </Button>
            <Button variant="ghost" size="sm" className="rounded-xl" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Profile
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* LEFT PANEL */}
          <div className="lg:col-span-2 space-y-5 animate-fade-in">
            <div className="bg-card rounded-2xl card-shadow p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Search className="w-5 h-5 text-primary" /> Describe Your Symptoms
              </h2>
              <div className="space-y-4">
                <div>
                  <Input
                    placeholder="Enter symptoms (e.g., fever, cough, headache)"
                    value={symptomInput}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addCustomSymptom()}
                    className="h-11 rounded-xl"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Type naturally: "I have stomach pain and feel tired"
                  </p>
                </div>

                {suggestions.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Related symptoms:</p>
                    <div className="space-y-1.5">
                      {suggestions.map((s) => (
                        <label key={s} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors">
                          <Checkbox checked={selectedSymptoms.includes(s)} onCheckedChange={() => toggleSymptom(s)} />
                          <span className="text-sm text-foreground capitalize">{s}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {selectedSymptoms.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Selected:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedSymptoms.map((s) => (
                        <span key={s} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                          {s}
                          <button onClick={() => toggleSymptom(s)} className="ml-1 hover:text-destructive">×</button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-card rounded-2xl card-shadow p-6">
              <h3 className="text-base font-semibold text-foreground mb-4">Follow-up Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Age</Label>
                  <Input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="28" className="h-10 rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label>Weight (kg)</Label>
                  <Input value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="70" className="h-10 rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label>Duration</Label>
                  <Input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="3" className="h-10 rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label>Unit</Label>
                  <Select value={durationUnit} onValueChange={setDurationUnit}>
                    <SelectTrigger className="h-10 rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["minutes", "hours", "days", "weeks", "months"].map((u) => (
                        <SelectItem key={u} value={u} className="capitalize">{u}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-4 space-y-1.5">
                <Label>Severity (optional)</Label>
                <div className="flex gap-2">
                  {(["mild", "moderate", "severe"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setSeverity(severity === s ? "" : s)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors capitalize ${
                        severity === s
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card text-foreground border-border hover:bg-muted"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <Button
                className="w-full mt-6 h-11 rounded-xl text-base"
                onClick={handleAnalyze}
                disabled={analyzing || (selectedSymptoms.length === 0 && !symptomInput.trim())}
              >
                {analyzing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Stethoscope className="w-4 h-4 mr-2" />}
                {analyzing ? "Analyzing..." : "Analyze Symptoms"}
              </Button>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="lg:col-span-3 space-y-5">
            {!results && !analyzing && (
              <div className="bg-card rounded-2xl card-shadow p-12 text-center animate-fade-in">
                <Stethoscope className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground">Enter your symptoms</h3>
                <p className="text-sm text-muted-foreground/70 mt-1">Results will appear here after analysis</p>
              </div>
            )}

            {analyzing && (
              <div className="bg-card rounded-2xl card-shadow p-12 text-center animate-fade-in">
                <Loader2 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
                <h3 className="text-lg font-medium text-foreground">Analyzing your symptoms...</h3>
                <p className="text-sm text-muted-foreground mt-1">This may take a moment</p>
              </div>
            )}

            {results && sev && (
              <div className="space-y-4 animate-fade-in">
                <div className="bg-card rounded-2xl card-shadow p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Possible Condition</p>
                      <h3 className="text-lg font-semibold text-foreground">{results.disease}</h3>
                    </div>
                  </div>
                </div>

                <div className={`rounded-2xl card-shadow p-5 ${sev.bg}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: `hsl(var(--severity-${results.severity}))` }} />
                    <div>
                      <p className="text-sm text-muted-foreground">Severity Level</p>
                      <p className={`text-base font-semibold ${sev.color}`}>{sev.label}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-2xl card-shadow p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Home className="w-5 h-5 text-secondary" />
                    <h3 className="font-semibold text-foreground">Home Remedies</h3>
                  </div>
                  <div className="space-y-3">
                    {results.remedies.map((r, i) => (
                      <div key={i} className="p-3 rounded-xl bg-muted/50">
                        <p className="font-medium text-foreground text-sm">{r.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">{r.preparation}</p>
                        <p className="text-xs text-primary mt-1">📏 {r.measurement}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-card rounded-2xl card-shadow p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Pill className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-foreground">Medicines</h3>
                  </div>
                  <div className="space-y-3">
                    {results.medicines.map((m, i) => (
                      <div key={i} className="p-3 rounded-xl bg-muted/50">
                        <p className="font-medium text-foreground text-sm">{m.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">{m.usage}</p>
                        <p className="text-xs text-primary mt-1">⏰ {m.timing}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-card rounded-2xl card-shadow p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <UserCheck className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-foreground">Doctor Consultation</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">Recommended specialist: <span className="font-medium text-foreground">{results.doctorType}</span></p>
                  <Button className="rounded-xl" size="sm" onClick={() => setConsultOpen(true)}>Consult Now</Button>
                </div>

                <div className="bg-card rounded-2xl card-shadow p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-5 h-5 text-secondary" />
                    <h3 className="font-semibold text-foreground">Pharmacy</h3>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" className="rounded-xl" size="sm" onClick={() => setPharmacyOpen(true)}>
                      <MapPin className="w-4 h-4 mr-1" /> Find Pharmacy
                    </Button>
                    <Button variant="outline" className="rounded-xl" size="sm" onClick={() => setBuyOpen(true)}>
                      <ShoppingCart className="w-4 h-4 mr-1" /> Buy Medicines
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      {results && (
        <>
          <ConsultDoctorModal open={consultOpen} onOpenChange={setConsultOpen} doctorType={results.doctorType} />
          <PharmacyModal open={pharmacyOpen} onOpenChange={setPharmacyOpen} />
          <BuyMedicinesModal open={buyOpen} onOpenChange={setBuyOpen} medicines={results.medicines} />
        </>
      )}
    </div>
  );
};

export default SymptomAnalysis;

// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { Activity, ArrowLeft, Search, Stethoscope, Pill, Home, MapPin, UserCheck, AlertTriangle, Loader2, ShoppingCart, Clock } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { useAuth } from "@/contexts/AuthContext";
// //import { getSuggestions, analyzeSymptoms } from "@/lib/symptomData";
// import { analyzeSymptoms } from "@/lib/symptomData";
// import { addToHistory } from "@/lib/analysisHistory";
// import ConsultDoctorModal from "@/components/ConsultDoctorModal";
// import PharmacyModal from "@/components/PharmacyModal";
// import BuyMedicinesModal from "@/components/BuyMedicinesModal";

// type Severity = "mild" | "moderate" | "critical";

// const severityConfig: Record<Severity, { label: string; color: string; bg: string }> = {
//   mild: { label: "Mild (Normal)", color: "text-severity-mild", bg: "bg-severity-mild/10" },
//   moderate: { label: "Moderate", color: "text-severity-moderate", bg: "bg-severity-moderate/10" },
//   critical: { label: "Critical", color: "text-severity-critical", bg: "bg-severity-critical/10" },
// };

// const SymptomAnalysis = () => {
//   const navigate = useNavigate();
//   const { user } = useAuth();
//   const [symptomInput, setSymptomInput] = useState("");
//   const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
//   const [suggestions, setSuggestions] = useState<string[]>([]);
//   const [age, setAge] = useState(user?.age?.toString() || "");
//   const [weight, setWeight] = useState(user?.weight || "");
//   const [duration, setDuration] = useState("");
//   const [durationUnit, setDurationUnit] = useState("days");
//   const [severity, setSeverity] = useState("");
//   const [results, setResults] = useState<ReturnType<typeof analyzeSymptoms> | null>(null);
//   const [analyzing, setAnalyzing] = useState(false);

//   // Modal states
//   const [consultOpen, setConsultOpen] = useState(false);
//   const [pharmacyOpen, setPharmacyOpen] = useState(false);
//   const [buyOpen, setBuyOpen] = useState(false);

//   // const handleInputChange = (value: string) => {
//   //   setSymptomInput(value);
//   //   if (value.length > 1 || selectedSymptoms.length > 0) {
//   //     setSuggestions(getSuggestions(value, selectedSymptoms));
//   //   } else {
//   //     setSuggestions([]);
//   //   }
//   // };
//   const handleInputChange = (value: string) => {
//   setSymptomInput(value);
//   };

//   // const toggleSymptom = (symptom: string) => {
//   //   const updated = selectedSymptoms.includes(symptom)
//   //     ? selectedSymptoms.filter((s) => s !== symptom)
//   //     : [...selectedSymptoms, symptom];
//   //   setSelectedSymptoms(updated);
//   //   // Re-generate suggestions based on new selection
//   //   setSuggestions(getSuggestions(symptomInput, updated));
//   // };
//   const toggleSymptom = (symptom: string) => {
//   const updated = selectedSymptoms.includes(symptom)
//     ? selectedSymptoms.filter((s) => s !== symptom)
//     : [...selectedSymptoms, symptom];

//   setSelectedSymptoms(updated);
//   };

//   const addCustomSymptom = () => {
//     if (symptomInput.trim() && !selectedSymptoms.includes(symptomInput.trim())) {
//       setSelectedSymptoms((prev) => [...prev, symptomInput.trim()]);
//       setSymptomInput("");
//       setSuggestions([]);
//     }
//   };

//   const handleAnalyze = async () => {
//     console.log("Button clicked");
//     const all = [...selectedSymptoms];
//     if (symptomInput.trim()) all.push(symptomInput.trim());
//     if (all.length === 0) return;
//     setAnalyzing(true);
//   try {
//   const res = await fetch("http://127.0.0.1:5000/analyze", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({ symptoms: all }),
//   });

//   const data = await res.json();

//   setResults(data);
//   setSuggestions(data.relatedSymptoms || []);
  
//   addToHistory({
//     symptoms: all,
//     disease: data.disease,
//     severity: data.severity,
//     doctorType: data.doctorType || "General Physician",
//   });

//  } catch (error) {
//   console.error("Error:", error);
// }
//     setAnalyzing(false);
//   };

//   const sev = results ? severityConfig[results.severity] : null;

//   return (
//     <div className="min-h-screen bg-background">
//       <header className="bg-card border-b border-border px-6 py-4">
//         <div className="max-w-6xl mx-auto flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <Activity className="w-6 h-6 text-primary" />
//             <h1 className="text-xl font-semibold text-foreground">SmartCare</h1>
//           </div>
//           <div className="flex items-center gap-3">
//             <Button variant="ghost" size="sm" className="rounded-xl" onClick={() => navigate("/history")}>
//               <Clock className="w-4 h-4 mr-1" /> History
//             </Button>
//             <Button variant="ghost" size="sm" className="rounded-xl" onClick={() => navigate("/dashboard")}>
//               <ArrowLeft className="w-4 h-4 mr-1" /> Profile
//             </Button>
//           </div>
//         </div>
//       </header>

//       <main className="max-w-6xl mx-auto p-6">
//         <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
//           {/* LEFT PANEL */}
//           <div className="lg:col-span-2 space-y-5 animate-fade-in">
//             <div className="bg-card rounded-2xl card-shadow p-6">
//               <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
//                 <Search className="w-5 h-5 text-primary" /> Describe Your Symptoms
//               </h2>
//               <div className="space-y-4">
//                 <div>
//                   <Input
//                     placeholder="Enter symptoms (e.g., fever, cough, headache)"
//                     value={symptomInput}
//                     onChange={(e) => handleInputChange(e.target.value)}
//                     onKeyDown={(e) => e.key === "Enter" && addCustomSymptom()}
//                     className="h-11 rounded-xl"
//                   />
//                   <p className="text-xs text-muted-foreground mt-1">
//                     Type naturally: "I have stomach pain and feel tired"
//                   </p>
//                 </div>

//                 {suggestions.length > 0 && (
//                   <div className="space-y-2">
//                     <p className="text-sm font-medium text-muted-foreground">Related symptoms:</p>
//                     <div className="space-y-1.5">
//                       {suggestions.map((s) => (
//                         <label key={s} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors">
//                           <Checkbox checked={selectedSymptoms.includes(s)} onCheckedChange={() => toggleSymptom(s)} />
//                           <span className="text-sm text-foreground capitalize">{s}</span>
//                         </label>
//                       ))}
//                     </div>
//                   </div>
//                 )}

//                 {selectedSymptoms.length > 0 && (
//                   <div>
//                     <p className="text-sm font-medium text-muted-foreground mb-2">Selected:</p>
//                     <div className="flex flex-wrap gap-2">
//                       {selectedSymptoms.map((s) => (
//                         <span key={s} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
//                           {s}
//                           <button onClick={() => toggleSymptom(s)} className="ml-1 hover:text-destructive">×</button>
//                         </span>
//                       ))}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>

//             <div className="bg-card rounded-2xl card-shadow p-6">
//               <h3 className="text-base font-semibold text-foreground mb-4">Follow-up Details</h3>
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-1.5">
//                   <Label>Age</Label>
//                   <Input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="28" className="h-10 rounded-xl" />
//                 </div>
//                 <div className="space-y-1.5">
//                   <Label>Weight (kg)</Label>
//                   <Input value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="70" className="h-10 rounded-xl" />
//                 </div>
//                 <div className="space-y-1.5">
//                   <Label>Duration</Label>
//                   <Input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="3" className="h-10 rounded-xl" />
//                 </div>
//                 <div className="space-y-1.5">
//                   <Label>Unit</Label>
//                   <Select value={durationUnit} onValueChange={setDurationUnit}>
//                     <SelectTrigger className="h-10 rounded-xl"><SelectValue /></SelectTrigger>
//                     <SelectContent>
//                       {["minutes", "hours", "days", "weeks", "months"].map((u) => (
//                         <SelectItem key={u} value={u} className="capitalize">{u}</SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>
//               </div>
//               <div className="mt-4 space-y-1.5">
//                 <Label>Severity (optional)</Label>
//                 <div className="flex gap-2">
//                   {(["mild", "moderate", "severe"] as const).map((s) => (
//                     <button
//                       key={s}
//                       onClick={() => setSeverity(severity === s ? "" : s)}
//                       className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors capitalize ${
//                         severity === s
//                           ? "bg-primary text-primary-foreground border-primary"
//                           : "bg-card text-foreground border-border hover:bg-muted"
//                       }`}
//                     >
//                       {s}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//               <Button
//                 className="w-full mt-6 h-11 rounded-xl text-base"
//                 onClick={handleAnalyze}
//                 disabled={analyzing || (selectedSymptoms.length === 0 && !symptomInput.trim())}
//               >
//                 {analyzing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Stethoscope className="w-4 h-4 mr-2" />}
//                 {analyzing ? "Analyzing..." : "Analyze Symptoms"}
//               </Button>
//             </div>
//           </div>

//           {/* RIGHT PANEL */}
//           <div className="lg:col-span-3 space-y-5">
//             {!results && !analyzing && (
//               <div className="bg-card rounded-2xl card-shadow p-12 text-center animate-fade-in">
//                 <Stethoscope className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
//                 <h3 className="text-lg font-medium text-muted-foreground">Enter your symptoms</h3>
//                 <p className="text-sm text-muted-foreground/70 mt-1">Results will appear here after analysis</p>
//               </div>
//             )}

//             {analyzing && (
//               <div className="bg-card rounded-2xl card-shadow p-12 text-center animate-fade-in">
//                 <Loader2 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
//                 <h3 className="text-lg font-medium text-foreground">Analyzing your symptoms...</h3>
//                 <p className="text-sm text-muted-foreground mt-1">This may take a moment</p>
//               </div>
//             )}

//             {results && sev && (
//               <div className="space-y-4 animate-fade-in">
//                 <div className="bg-card rounded-2xl card-shadow p-5">
//                   <div className="flex items-start gap-3">
//                     <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
//                       <AlertTriangle className="w-5 h-5 text-primary" />
//                     </div>
//                     <div>
//                       <p className="text-sm text-muted-foreground">Possible Condition</p>
//                       <h3 className="text-lg font-semibold text-foreground">{results.disease}</h3>
//                     </div>
//                   </div>
//                 </div>

//                 <div className={`rounded-2xl card-shadow p-5 ${sev.bg}`}>
//                   <div className="flex items-center gap-3">
//                     <div className="w-3 h-3 rounded-full" style={{ backgroundColor: `hsl(var(--severity-${results.severity}))` }} />
//                     <div>
//                       <p className="text-sm text-muted-foreground">Severity Level</p>
//                       <p className={`text-base font-semibold ${sev.color}`}>{sev.label}</p>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="bg-card rounded-2xl card-shadow p-5">
//                   <div className="flex items-center gap-2 mb-4">
//                     <Home className="w-5 h-5 text-secondary" />
//                     <h3 className="font-semibold text-foreground">Home Remedies</h3>
//                   </div>
//                   <div className="space-y-3">
//                     {results.remedies.map((r, i) => (
//                       <div key={i} className="p-3 rounded-xl bg-muted/50">
//                         <p className="font-medium text-foreground text-sm">{r.name}</p>
//                         <p className="text-xs text-muted-foreground mt-1">{r.preparation}</p>
//                         <p className="text-xs text-primary mt-1">📏 {r.measurement}</p>
//                       </div>
//                     ))}
//                   </div>
//                 </div>

//                 <div className="bg-card rounded-2xl card-shadow p-5">
//                   <div className="flex items-center gap-2 mb-4">
//                     <Pill className="w-5 h-5 text-primary" />
//                     <h3 className="font-semibold text-foreground">Medicines</h3>
//                   </div>
//                   <div className="space-y-3">
//                     {results.medicines.map((m, i) => (
//                       <div key={i} className="p-3 rounded-xl bg-muted/50">
//                         <p className="font-medium text-foreground text-sm">{m.name}</p>
//                         <p className="text-xs text-muted-foreground mt-1">{m.usage}</p>
//                         <p className="text-xs text-primary mt-1">⏰ {m.timing}</p>
//                       </div>
//                     ))}
//                   </div>
//                 </div>

//                 <div className="bg-card rounded-2xl card-shadow p-5">
//                   <div className="flex items-center gap-2 mb-3">
//                     <UserCheck className="w-5 h-5 text-primary" />
//                     <h3 className="font-semibold text-foreground">Doctor Consultation</h3>
//                   </div>
//                   <p className="text-sm text-muted-foreground mb-3">Recommended specialist: <span className="font-medium text-foreground">{results.doctorType}</span></p>
//                   <Button className="rounded-xl" size="sm" onClick={() => setConsultOpen(true)}>Consult Now</Button>
//                 </div>

//                 <div className="bg-card rounded-2xl card-shadow p-5">
//                   <div className="flex items-center gap-2 mb-3">
//                     <MapPin className="w-5 h-5 text-secondary" />
//                     <h3 className="font-semibold text-foreground">Pharmacy</h3>
//                   </div>
//                   <div className="flex gap-3">
//                     <Button variant="outline" className="rounded-xl" size="sm" onClick={() => setPharmacyOpen(true)}>
//                       <MapPin className="w-4 h-4 mr-1" /> Find Pharmacy
//                     </Button>
//                     <Button variant="outline" className="rounded-xl" size="sm" onClick={() => setBuyOpen(true)}>
//                       <ShoppingCart className="w-4 h-4 mr-1" /> Buy Medicines
//                     </Button>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </main>

//       {/* Modals */}
//       {results && (
//         <>
//           <ConsultDoctorModal open={consultOpen} onOpenChange={setConsultOpen} doctorType={results.doctorType} />
//           <PharmacyModal open={pharmacyOpen} onOpenChange={setPharmacyOpen} />
//           <BuyMedicinesModal open={buyOpen} onOpenChange={setBuyOpen} medicines={results.medicines} />
//         </>
//       )}
//     </div>
//   );
// };

// export default SymptomAnalysis;
