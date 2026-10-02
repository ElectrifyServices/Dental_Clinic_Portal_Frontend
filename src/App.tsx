import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { AppProvider } from "./contexts/AppContext";
import { TenantProvider } from "./contexts/TenantContext";
import { ModalProvider } from "./contexts/ModalContext";
import { SidebarProvider } from "./contexts/SidebarContext";
import { MainLayout } from "./components/Layout/MainLayout";
import { LoginForm } from "./components/Auth/LoginForm";
import { getParsedPermissions } from "./utils/permission";

import { DashboardPage } from "./pages/DashboardPage";
import { AppointmentsPage } from "./pages/AppointmentsPage";
import { PatientsPage } from "./pages/PatientsPage";
import { TreatmentsPage } from "./pages/TreatmentsPage";
import { BillingPage } from "./pages/BillingPage";
import { StaffPage } from "./pages/StaffPage";
import { ProfitSharingPage } from "./pages/ProfitSharingPage";
import { MedicalRecordsPage } from "./pages/MedicalRecordsPage";
import { ConsentPage } from "./pages/ConsentPage";
import { ReportsPage } from "./pages/ReportsPage";
import { InventoryPage } from "./pages/InventoryPage";
import { LabWorkPage } from "./pages/LabWorkPage";
import { CorporatePlansPage } from "./pages/CorporatePlansPage";
import ConsultationPage from "./pages/ConsultationPage";
import { BroadcastPage } from "./pages/BroadcastPage";
import { CalendarIntegrationPage } from "./pages/CalendarIntegrationPage";
import { CalendarIntegrationCallbackPage } from "./pages/CalendarIntegrationCallbackPage";

const PERMISSION_MAP: Record<string, string[]> = {
  dashboard: ["DASHBOARD"],
  appointments: ["APPPOINTMENT", "APPOINTMENT", "APPOINTMENTS"],
  patients: ["PATIENTS"],
  "patient-queue": ["CONSULTATION"],
  treatments: ["TREATMENTS"],
  emr: ["MEDICAL_RECORDS"],
  consent: ["CONSENT_FORMS"],
  billing: ["BILLING"],
  inventory: ["INVENTORY"],
  reports: ["ANALYTICS", "REPORTS"],
  staff: ["STAFF", "STAFF_MANAGEMENT"],
  "profit-sharing": ["PROFIT_SHARING"],
  membership: ["CORPORATE_PLANS", "MEMBERSHIP"],
  "lab-work": ["LAB_WORK"],
};

function getDefaultRedirect(userPermissions: string[]): string {
  if (!userPermissions || userPermissions.length === 0) return "/patients";

  const hasAll = userPermissions.some((p) => p.toUpperCase() === "ALL");
  if (hasAll || userPermissions.some((p) => p.toUpperCase() === "PATIENTS")) {
    return "/patients";
  }

  // Find the first route in PERMISSION_MAP that matches userPermissions
  for (const [route, allowedPerms] of Object.entries(PERMISSION_MAP)) {
    const hasAccess = allowedPerms.some((p) =>
      userPermissions.some((up) => up.toUpperCase() === p.toUpperCase())
    );
    if (hasAccess) {
      return `/${route}`;
    }
  }

  return "/dashboard";
}

function GuardedRoute({ path, element }: { path: string; element: React.ReactElement }) {
  const { state } = useAuth();
  const userPermissions = getParsedPermissions(state.user);

  // If user has ALL permission (e.g. SUPER_ADMIN), allow access to every route
  const hasAll = userPermissions.some((p) => p.toUpperCase() === "ALL");
  if (hasAll) return element;

  if (userPermissions.length > 0) {
    const key = path.replace(/^\//, "");
    const allowed = PERMISSION_MAP[key];
    if (allowed) {
      let hasAccess = allowed.some((p) =>
        userPermissions.some((up) => up.toUpperCase() === p.toUpperCase())
      );
      // Fallback for lab-work to allow access for admin, doctor, and staff roles
      if (!hasAccess && key === "lab-work") {
        const userRole = (state.user?.role?.name || state.user?.role || "").toLowerCase();
        if (["admin", "superadmin", "super_admin", "doctor", "staff"].some(r => userRole.includes(r))) {
          hasAccess = true;
        }
      }
      if (!hasAccess) {
        return <Navigate to={getDefaultRedirect(userPermissions)} replace />;
      }
    }
  }
  return element;
}

function ProtectedRoutes() {
  const { state } = useAuth();
  if (!state.isAuthenticated) return <Navigate to="/login" replace />;

  const userPermissions = getParsedPermissions(state.user);
  const defaultPath = getDefaultRedirect(userPermissions);

  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Navigate to={defaultPath} replace />} />
        <Route path="/dashboard" element={<GuardedRoute path="/dashboard" element={<DashboardPage />} />} />
        <Route path="/appointments" element={<GuardedRoute path="/appointments" element={<AppointmentsPage />} />} />
        <Route path="/patients" element={<GuardedRoute path="/patients" element={<PatientsPage />} />} />
        <Route path="/patient-queue" element={<GuardedRoute path="/patient-queue" element={<ConsultationPage />} />} />
        <Route path="/treatments" element={<GuardedRoute path="/treatments" element={<TreatmentsPage />} />} />
        <Route path="/billing" element={<GuardedRoute path="/billing" element={<BillingPage />} />} />
        <Route path="/staff" element={<GuardedRoute path="/staff" element={<StaffPage />} />} />
        <Route path="/profit-sharing" element={<GuardedRoute path="/profit-sharing" element={<ProfitSharingPage />} />} />
        <Route path="/emr" element={<GuardedRoute path="/emr" element={<MedicalRecordsPage />} />} />
        <Route path="/consent" element={<GuardedRoute path="/consent" element={<ConsentPage />} />} />
        <Route path="/reports" element={<GuardedRoute path="/reports" element={<ReportsPage />} />} />
        <Route path="/inventory" element={<GuardedRoute path="/inventory" element={<InventoryPage />} />} />
        <Route path="/lab-work" element={<GuardedRoute path="/lab-work" element={<LabWorkPage />} />} />
        <Route path="/membership" element={<GuardedRoute path="/membership" element={<CorporatePlansPage />} />} />
        <Route path="/broadcast" element={<GuardedRoute path="/broadcast" element={<BroadcastPage />} />} />
        <Route path="/calendar-integration" element={<CalendarIntegrationPage />} />
        <Route path="/calendar-integration/callback" element={<CalendarIntegrationCallbackPage />} />
        <Route path="*" element={<Navigate to={defaultPath} replace />} />
      </Route>
    </Routes>
  );
}

function AuthRouter() {
  const { state } = useAuth();
  const userPermissions = getParsedPermissions(state.user);
  if (state.isAuthenticated) return <Navigate to={getDefaultRedirect(userPermissions)} replace />;
  return <LoginForm />;
}

import { Toaster } from "./components/ui/Toast";
import { OfflineDetector } from "./components/ui/OfflineDetector";

export default function App() {
  return (
    <ThemeProvider>
      <TenantProvider>
        <AuthProvider>
          <AppProvider>
            <ModalProvider>
              <SidebarProvider>
                <BrowserRouter>
                  <Routes>
                    <Route path="/login" element={<AuthRouter />} />
                    <Route path="/reset-password" element={<AuthRouter />} />
                    <Route path="/auth/reset-password" element={<AuthRouter />} />
                    <Route path="/*" element={<ProtectedRoutes />} />
                  </Routes>
                </BrowserRouter>
              </SidebarProvider>
              <Toaster />
              <OfflineDetector />
            </ModalProvider>
          </AppProvider>
        </AuthProvider>
      </TenantProvider>
    </ThemeProvider>
  );
}
