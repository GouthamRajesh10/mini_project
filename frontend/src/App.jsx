import { useState } from "react";
import Login from "./Login";
import AdminDashboard from "./AdminDashboard";
import CenterDashboard from "./CenterDashboard";

function App() {
  const [userRole, setUserRole] = useState(null); // 'admin' or 'center'

  const handleLogin = (email, password) => {
    // Determine role based on email context for mock purposes
    if (email.toLowerCase().includes("admin")) {
      setUserRole("admin");
    } else {
      setUserRole("center");
    }
  };

  const handleLogout = () => {
    setUserRole(null);
  }

  if (!userRole) {
    return <Login onLogin={handleLogin} />;
  }

  if (userRole === "admin") {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  return <CenterDashboard onLogout={handleLogout} />;
}

export default App;
