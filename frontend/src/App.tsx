import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";

import Dashboard from "./pages/Dashboard";
import Incidents from "./pages/Incidents";
import Analytics from "./pages/Analytics";
import Login from "./pages/Login";
import ThreatIntelligence from "./pages/ThreatIntelligence";
import IOCManagement from "./pages/IOCManagement";
import UserManagement from "./pages/UserManagement";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <div className="flex bg-slate-50 h-screen overflow-hidden">
                <Sidebar collapsed={sidebarCollapsed} />

                <div className="flex-1 flex flex-col min-w-0 h-screen">
                  <div className="bg-white border-b border-slate-200 px-6 py-4 flex-shrink-0">
                    <Navbar
                      onToggleSidebar={() =>
                        setSidebarCollapsed((prev) => !prev)
                      }
                    />
                  </div>

                  <div className="flex-1 min-h-0 overflow-y-auto">
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/incidents" element={<Incidents />} />
                      <Route path="/analytics" element={<Analytics />} />
                      <Route
                        path="/threat-intelligence"
                        element={<ThreatIntelligence />}
                      />
                      <Route path="/iocs" element={<IOCManagement />} />
                      <Route path="/users" element={<UserManagement />} />
                    </Routes>
                  </div>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>

      <Toaster position="top-right" />
    </BrowserRouter>
  );
}

export default App;