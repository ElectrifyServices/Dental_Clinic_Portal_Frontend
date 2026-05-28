import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { AppProvider } from "./contexts/AppContext";
import { TenantProvider } from "./contexts/TenantContext";
import { ModalProvider } from "./contexts/ModalContext";
import { MainLayout } from "./components/Layout/MainLayout";
import { LoginForm } from "./components/Auth/LoginForm";

import { DashboardPage } from "./pages/DashboardPage";
import { AppointmentsPage } from "./pages/AppointmentsPage";
import { PatientsPage } from "./pages/PatientsPage";
import { QueuePage } from "./pages/QueuePage";
import { TreatmentsPage } from "./pages/TreatmentsPage";
import { BillingPage } from "./pages/BillingPage";
import { StaffPage } from "./pages/StaffPage";
import { ProfitSharingPage } from "./pages/ProfitSharingPage";
import { MedicalRecordsPage } from "./pages/MedicalRecordsPage";
import { ConsentPage } from "./pages/ConsentPage";
import { ReportsPage } from "./pages/ReportsPage";
import { InventoryPage } from "./pages/InventoryPage";
import { CorporatePlansPage } from "./pages/CorporatePlansPage";

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
  reports: ["ANALYTICS"],
  staff: ["STAFF"],
  "profit-sharing": ["PROFIT_SHARING"],
  "corporate-plans": ["CORPORATE_PLANS"],
};

function GuardedRoute({ path, element }: { path: string; element: React.ReactElement }) {
  const { state } = useAuth();
  const userPermissions: string[] = (state.user as any)?.module_permission || [];

  // If user has ALL permission (e.g. SUPER_ADMIN), allow access to every route
  const hasAll = userPermissions.some((p) => p.toUpperCase() === "ALL");
  if (hasAll) return element;

  if (userPermissions.length > 0) {
    const key = path.replace(/^\//, "");
    const allowed = PERMISSION_MAP[key];
    if (allowed) {
      const hasAccess = allowed.some((p) =>
        userPermissions.some((up) => up.toUpperCase() === p.toUpperCase())
      );
      if (!hasAccess) {
        return <Navigate to="/dashboard" replace />;
      }
    }
  }
  return element;
}

function ProtectedRoutes() {
  const { state } = useAuth();
  if (!state.isAuthenticated) return <Navigate to="/login" replace />;
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<GuardedRoute path="/dashboard" element={<DashboardPage />} />} />
        <Route path="/appointments" element={<GuardedRoute path="/appointments" element={<AppointmentsPage />} />} />
        <Route path="/patients" element={<GuardedRoute path="/patients" element={<PatientsPage />} />} />
        <Route path="/patient-queue" element={<GuardedRoute path="/patient-queue" element={<QueuePage />} />} />
        <Route path="/treatments" element={<GuardedRoute path="/treatments" element={<TreatmentsPage />} />} />
        <Route path="/billing" element={<GuardedRoute path="/billing" element={<BillingPage />} />} />
        <Route path="/staff" element={<GuardedRoute path="/staff" element={<StaffPage />} />} />
        <Route path="/profit-sharing" element={<GuardedRoute path="/profit-sharing" element={<ProfitSharingPage />} />} />
        <Route path="/emr" element={<GuardedRoute path="/emr" element={<MedicalRecordsPage />} />} />
        <Route path="/consent" element={<GuardedRoute path="/consent" element={<ConsentPage />} />} />
        <Route path="/reports" element={<GuardedRoute path="/reports" element={<ReportsPage />} />} />
        <Route path="/inventory" element={<GuardedRoute path="/inventory" element={<InventoryPage />} />} />
        <Route path="/corporate-plans" element={<GuardedRoute path="/corporate-plans" element={<CorporatePlansPage />} />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

function AuthRouter() {
  const { state } = useAuth();
  if (state.isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <LoginForm />;
}

export default function App() {
  return (
    <TenantProvider>
      <AuthProvider>
        <AppProvider>
          <ModalProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<AuthRouter />} />
                <Route path="/*" element={<ProtectedRoutes />} />
              </Routes>
            </BrowserRouter>
          </ModalProvider>
        </AppProvider>
      </AuthProvider>
    </TenantProvider>
  );
}
