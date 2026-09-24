import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Sidebar from "./components/Sidebar";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import RoleSelectionPage from "./pages/RoleSelectionPage";

import FreelancerProjects from "./pages/FreelancerProjects";
import DashboardFreelancer from "./pages/DashboardFreelancer";
import TicketsFreelancer from "./pages/TicketsFreelancer";
import DashboardEmployer from "./pages/DashboardEmployer";
import { TicketProvider } from "./context/TicketContext";
import TicketChatDrawer from "./components/TicketChatDrawer";
import { FileUploadModals } from "./components/FileUploadModals";
import TicketsEmployer from "./pages/TicketsEmployer";
import EmployerProjects from "./pages/EmployerProjects";
import SupervisorFinance from "./pages/SupervisorFinance";
import SupervisorDashboard from "./pages/SupervisorDashboard";
import SupervisorTickets from "./pages/SupervisorTickets";
import SupervisorUsers from "./pages/SupervisorUsers";
import SupervisorProjects from "./pages/SupervisorProjects";
import AdminReports from "./pages/AdminReports";
import AdminUsers from "./pages/AdminUsers";
import AdminProjects from "./pages/AdminProjects";
import AdminTickets from "./pages/AdminTickets";
import AdminLogs from "./pages/AdminLogs";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";

const RoleGuard = ({ allowedRoles, children }) => {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) {
    const ROLE_HOME = {
      freelancer: "/dashboard",
      employer: "/employer-dashboard",
      supervisor: "/supervisor-dashboard",
      admin: "/admin/reports",
    };
    return <Navigate to={ROLE_HOME[user.role] || "/login"} replace />;
  }
  return children;
};

const AppLayout = () => {
  const location = useLocation();
  const { user } = useAuthStore();
  // Hide the sidebar on auth and landing pages
  const isAuthPage = ["/", "/login", "/register", "/role-selection"].includes(
    location.pathname,
  );
  if (!user && !isAuthPage) {
    return <Navigate to="/login" replace />;
  }
  return (
    <div className="flex h-screen w-full bg-gray-50 overflow-hidden" dir="ltr">
      <div className="flex-1 h-full overflow-hidden">
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/role-selection" element={<RoleSelectionPage />} />

          {/* Freelancer Panel */}
          <Route path="/dashboard" element={<RoleGuard allowedRoles={["freelancer"]}><DashboardFreelancer /></RoleGuard>} />
          <Route path="/projects" element={<RoleGuard allowedRoles={["freelancer"]}><FreelancerProjects /></RoleGuard>} />
          <Route path="/tickets" element={<RoleGuard allowedRoles={["freelancer"]}><TicketsFreelancer /></RoleGuard>} />

          {/* Employer Panel */}
          <Route path="/employer-dashboard" element={<RoleGuard allowedRoles={["employer"]}><DashboardEmployer /></RoleGuard>} />
          <Route path="/employer-tickets" element={<RoleGuard allowedRoles={["employer"]}><TicketsEmployer /></RoleGuard>} />
          <Route path="/employer-projects" element={<RoleGuard allowedRoles={["employer"]}><EmployerProjects /></RoleGuard>} />

          {/* Supervisor Panel */}
          <Route path="/supervisor-finance" element={<RoleGuard allowedRoles={["supervisor"]}><SupervisorFinance /></RoleGuard>} />
          <Route path="/supervisor-dashboard" element={<RoleGuard allowedRoles={["supervisor"]}><SupervisorDashboard /></RoleGuard>} />
          <Route path="/supervisor-tickets" element={<RoleGuard allowedRoles={["supervisor"]}><SupervisorTickets /></RoleGuard>} />
          <Route path="/supervisor-users" element={<RoleGuard allowedRoles={["supervisor"]}><SupervisorUsers /></RoleGuard>} />
          <Route path="/supervisor-projects" element={<RoleGuard allowedRoles={["supervisor"]}><SupervisorProjects /></RoleGuard>} />

          {/* Admin Panel */}
          <Route path="/admin/reports" element={<RoleGuard allowedRoles={["admin"]}><AdminReports /></RoleGuard>} />
          <Route path="/admin/users" element={<RoleGuard allowedRoles={["admin"]}><AdminUsers /></RoleGuard>} />
          <Route path="/admin/projects" element={<RoleGuard allowedRoles={["admin"]}><AdminProjects /></RoleGuard>} />
          <Route path="/admin/tickets" element={<RoleGuard allowedRoles={["admin"]}><AdminTickets /></RoleGuard>} />
          <Route path="/admin/logs" element={<RoleGuard allowedRoles={["admin"]}><AdminLogs /></RoleGuard>} />
        </Routes>
      </div>

      {!isAuthPage && <Sidebar />}
    </div>
  );
};

function App() {
  return (
    <Router>
      <TicketProvider>
        <AppLayout />
        <TicketChatDrawer />
        <FileUploadModals />
      </TicketProvider>
    </Router>
  );
}

export default App;
