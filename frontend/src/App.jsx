import { useState, useEffect } from "react";
import Login from "./Login";
import AdminDashboard from "./AdminDashboard";
import CenterDashboard from "./CenterDashboard";

function App() {
  const [userRole, setUserRole] = useState(null); // 'admin' or 'center'

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload && payload.role) {
          if (payload.role === "Admin") {
            setUserRole("admin");
          } else {
            setUserRole("center");
          }
        }
      } catch (e) {
        console.error("Failed to parse token", e);
        localStorage.removeItem('token');
      }
    }
  }, []);

  const handleLogin = (role) => {
    // User model roles are "Admin" or "User"
    if (role === "Admin") {
      setUserRole("admin");
    } else {
      setUserRole("center");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
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
