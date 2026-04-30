import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import PatientDashboard from "@/components/PatientDashboard";
import DoctorDashboard from "@/components/DoctorDashboard";
import PharmacistDashboard from "@/components/PharmacistDashboard";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate("/login");
    return null;
  }

  if (user.role === "doctor") {
    return <DoctorDashboard />;
  }

  if (user.role === "pharmacist") {
    return <PharmacistDashboard />;
  }

  // Default to patient dashboard
  return <PatientDashboard />;
};

export default Dashboard;
