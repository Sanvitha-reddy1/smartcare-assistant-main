import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, Heart, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Signup = () => {
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", password: "", confirmPassword: "", role: "patient" as "patient" | "doctor" | "pharmacist" });
  const [doctorForm, setDoctorForm] = useState({ hospitalName: "", specialization: "", experience: "" });
  const [pharmacistForm, setPharmacistForm] = useState({ pharmacyName: "", licenseNumber: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const { signup } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const update = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));
  const blur = (field: string) => setTouched((p) => ({ ...p, [field]: true }));

  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
  const hasUpper = /[A-Z]/.test(form.password);
  const hasLower = /[a-z]/.test(form.password);
  const hasNumber = /\d/.test(form.password);
  const hasLength = form.password.length >= 6;
  const passwordsMatch = form.password === form.confirmPassword && form.confirmPassword.length > 0;
  
  let allFilled = form.fullName.trim() && form.email && form.phone && form.password && form.confirmPassword;
  if (form.role === "doctor") {
    allFilled = allFilled && doctorForm.hospitalName.trim() && doctorForm.specialization.trim() && doctorForm.experience.trim();
  } else if (form.role === "pharmacist") {
    allFilled = allFilled && pharmacistForm.pharmacyName.trim() && pharmacistForm.licenseNumber.trim();
  }
  
  const isFormValid = allFilled && validEmail && hasUpper && hasLower && hasNumber && hasLength && passwordsMatch;

  const PasswordRule = ({ met, label }: { met: boolean; label: string }) => (
    <div className="flex items-center gap-1.5 text-xs">
      {met ? <Check className="w-3.5 h-3.5 text-severity-mild" /> : <X className="w-3.5 h-3.5 text-muted-foreground" />}
      <span className={met ? "text-severity-mild" : "text-muted-foreground"}>{label}</span>
    </div>
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const signupData = {
      fullName: form.fullName, email: form.email, phone: form.phone, password: form.password, role: form.role,
      ...(form.role === "doctor" && doctorForm),
      ...(form.role === "pharmacist" && pharmacistForm)
    };
    const success = await signup(signupData);
    setLoading(false);
    
    if (success) {
      toast({ title: "Account created!", description: "Welcome to SmartCare." });
      navigate("/dashboard");
    } else {
      toast({ title: "Signup Failed", description: "Email might already be in use.", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary mb-4">
            <Heart className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Create Account</h1>
          <p className="text-muted-foreground mt-1">Join SmartCare today</p>
        </div>

        <div className="bg-card rounded-2xl card-shadow p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" placeholder="John Doe" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} onBlur={() => blur("fullName")} className="h-11 rounded-xl" />
              {touched.fullName && !form.fullName.trim() && <p className="text-xs text-destructive">Name is required</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => update("email", e.target.value)} onBlur={() => blur("email")} className="h-11 rounded-xl" />
              {touched.email && form.email && !validEmail && <p className="text-xs text-destructive">Invalid email format</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" value={form.phone} onChange={(e) => update("phone", e.target.value)} onBlur={() => blur("phone")} className="h-11 rounded-xl" />
            </div>

            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select value={form.role} onValueChange={(v: "patient" | "doctor" | "pharmacist") => update("role", v)}>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="patient">Patient</SelectItem>
                  <SelectItem value="doctor">Doctor</SelectItem>
                  <SelectItem value="pharmacist">Pharmacist</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {form.role === "doctor" && (
              <div className="space-y-4 bg-muted/30 p-4 rounded-xl border animate-fade-in">
                <div className="space-y-1.5">
                  <Label htmlFor="hospitalName">Hospital / Clinic Name</Label>
                  <Input id="hospitalName" placeholder="e.g. Apollo Super Specialty Hospital" value={doctorForm.hospitalName} onChange={(e) => setDoctorForm({...doctorForm, hospitalName: e.target.value})} className="h-11 rounded-xl bg-background" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="specialization">Specialization</Label>
                    <Input id="specialization" placeholder="e.g. Cardiologist" value={doctorForm.specialization} onChange={(e) => setDoctorForm({...doctorForm, specialization: e.target.value})} className="h-11 rounded-xl bg-background" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="experience">Experience (Years)</Label>
                    <Input id="experience" type="number" placeholder="e.g. 10" value={doctorForm.experience} onChange={(e) => setDoctorForm({...doctorForm, experience: e.target.value})} className="h-11 rounded-xl bg-background" />
                  </div>
                </div>
              </div>
            )}

            {form.role === "pharmacist" && (
              <div className="space-y-4 bg-muted/30 p-4 rounded-xl border animate-fade-in">
                <div className="space-y-1.5">
                  <Label htmlFor="pharmacyName">Pharmacy Name</Label>
                  <Input id="pharmacyName" placeholder="e.g. MedPlus Pharmacy" value={pharmacistForm.pharmacyName} onChange={(e) => setPharmacistForm({...pharmacistForm, pharmacyName: e.target.value})} className="h-11 rounded-xl bg-background" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="licenseNumber">License Number</Label>
                  <Input id="licenseNumber" placeholder="Enter pharmacy license number" value={pharmacistForm.licenseNumber} onChange={(e) => setPharmacistForm({...pharmacistForm, licenseNumber: e.target.value})} className="h-11 rounded-xl bg-background" />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={form.password} onChange={(e) => update("password", e.target.value)} onBlur={() => blur("password")} className="h-11 rounded-xl pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {form.password && (
                <div className="grid grid-cols-2 gap-1 mt-1">
                  <PasswordRule met={hasLength} label="6+ characters" />
                  <PasswordRule met={hasUpper} label="Uppercase" />
                  <PasswordRule met={hasLower} label="Lowercase" />
                  <PasswordRule met={hasNumber} label="Number" />
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirm">Confirm Password</Label>
              <div className="relative">
                <Input id="confirm" type={showConfirm ? "text" : "password"} placeholder="••••••••" value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} onBlur={() => blur("confirmPassword")} className="h-11 rounded-xl pr-10" />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {touched.confirmPassword && form.confirmPassword && !passwordsMatch && (
                <p className="text-xs text-destructive">Passwords do not match</p>
              )}
            </div>

            <Button type="submit" disabled={!isFormValid || loading} className="w-full h-11 rounded-xl text-base mt-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {loading ? "Creating account..." : "Sign Up"}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
