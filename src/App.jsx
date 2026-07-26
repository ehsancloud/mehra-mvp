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

const AppLayout = () => {
  const location = useLocation();

  // Hide the sidebar on auth and landing pages
  const isAuthPage = ["/", "/login", "/register", "/role-selection"].includes(
    location.pathname,
  );

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
          <Route path="/dashboard" element={<DashboardFreelancer />} />
          <Route path="/projects" element={<FreelancerProjects />} />
          <Route path="/tickets" element={<TicketsFreelancer />} />

          {/* Employer Panel */}
          <Route path="/employer-dashboard" element={<DashboardEmployer />} />
          <Route path="/employer-tickets" element={<TicketsEmployer />} />
          <Route path="/employer-projects" element={<EmployerProjects />} />

          {/* Supervisor Panel */}
          <Route path="/supervisor-finance" element={<SupervisorFinance />} />
          <Route
            path="/supervisor-dashboard"
            element={<SupervisorDashboard />}
          />
          <Route path="/supervisor-tickets" element={<SupervisorTickets />} />
          <Route path="/supervisor-users" element={<SupervisorUsers />} />
          <Route path="/supervisor-projects" element={<SupervisorProjects />} />

          {/* Admin Panel */}
          <Route path="/admin/reports" element={<AdminReports />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/projects" element={<AdminProjects />} />
          <Route path="/admin/tickets" element={<AdminTickets />} />
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
