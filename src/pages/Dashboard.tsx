import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Edit3, Save, LogOut, Activity, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    fullName: user?.fullName || "",
    age: user?.age?.toString() || "",
    gender: user?.gender || "",
    height: user?.height || "",
    weight: user?.weight || "",
    phone: user?.phone || "",
    email: user?.email || "",
  });

  if (!user) {
    navigate("/login");
    return null;
  }

  const handleSave = () => {
    updateProfile({
      fullName: profile.fullName,
      age: profile.age ? parseInt(profile.age) : undefined,
      gender: profile.gender,
      height: profile.height,
      weight: profile.weight,
      phone: profile.phone,
    });
    setEditing(false);
    toast({ title: "Profile updated", description: "Your changes have been saved." });
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const update = (field: string, value: string) => setProfile((p) => ({ ...p, [field]: value }));

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-semibold text-foreground">SmartCare</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="rounded-xl" onClick={() => navigate("/analyze")}>
              Symptom Analysis
            </Button>
            <Button variant="outline" size="sm" className="rounded-xl" onClick={() => navigate("/history")}>
              View History
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="rounded-xl text-muted-foreground">
              <LogOut className="w-4 h-4 mr-1" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-6 animate-fade-in">
        <div className="bg-card rounded-2xl card-shadow p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-semibold text-foreground">Patient Profile</h2>
            {!editing ? (
              <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setEditing(true)}>
                <Edit3 className="w-4 h-4 mr-1" /> Edit
              </Button>
            ) : (
              <Button size="sm" className="rounded-xl" onClick={handleSave}>
                <Save className="w-4 h-4 mr-1" /> Save
              </Button>
            )}
          </div>

          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-accent flex items-center justify-center">
                <User className="w-10 h-10 text-accent-foreground" />
              </div>
              {editing && (
                <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <Camera className="w-4 h-4 text-primary-foreground" />
                </button>
              )}
            </div>
            <h3 className="text-lg font-medium mt-3 text-foreground">{user.fullName}</h3>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <Label>Full Name</Label>
              <Input value={profile.fullName} onChange={(e) => update("fullName", e.target.value)} disabled={!editing} className="h-10 rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label>Age</Label>
              <Input type="number" value={profile.age} onChange={(e) => update("age", e.target.value)} disabled={!editing} placeholder="e.g. 28" className="h-10 rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label>Gender</Label>
              <Select value={profile.gender} onValueChange={(v) => update("gender", v)} disabled={!editing}>
                <SelectTrigger className="h-10 rounded-xl"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Height (cm)</Label>
              <Input value={profile.height} onChange={(e) => update("height", e.target.value)} disabled={!editing} placeholder="e.g. 175" className="h-10 rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label>Weight (kg)</Label>
              <Input value={profile.weight} onChange={(e) => update("weight", e.target.value)} disabled={!editing} placeholder="e.g. 70" className="h-10 rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input value={profile.phone} onChange={(e) => update("phone", e.target.value)} disabled={!editing} className="h-10 rounded-xl" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
