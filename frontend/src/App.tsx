import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import Students from "./pages/Students";
import Institutions from "./pages/Institutions";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ProtectedRoute from "./pages/auth/ProtectedRoute";
import Profile from "./pages/Profile";
import Statistics from "./pages/Statistics";
import Facilities from "./pages/Facilities";
import Innovation from "./pages/Innovation";
import Industrialisation from "./pages/Industrialisation";
import Regional from "./pages/Regional";
import Setting from "./pages/Settings";
import Reports from "./pages/Reports";
import Help from "./pages/Help";
import InnovationDashboard from "./pages/dashboards/InnovationDashboard";
import Hubs from "./modules/innovation/Hubs";
import Startups from "./modules/innovation/Startups";
import AdmissionsDashboard from "./modules/admissions/AdmissionDashboard";
import DropoutAnalysis from "./modules/admissions/DropOut";
import SpecialEnrollment from "./modules/admissions/SpecialEnrollment";
import PaymentsAndFees from "./modules/admissions/PaymentsAndFees";
import Admissions from "./pages/Admissions";
import { PermissionGuard } from "./components/layout/PermissionGuard";

const queryClient = new QueryClient();

const App = () => (
  // 1. BrowserRouter is now the top-level provider for routing
  <BrowserRouter>
    {/* 2. AuthProvider is now inside, so it can use routing hooks */}
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          {/* 3. The Routes will work as before */}
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/innovation"
              element={
                <ProtectedRoute>
                  <PermissionGuard>
                    <InnovationDashboard />
                  </PermissionGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/admissions"
              element={
                <ProtectedRoute>
                  <PermissionGuard>
                    <AdmissionsDashboard />
                  </PermissionGuard>
                </ProtectedRoute>
              }
            />
            {/* innovation */}
            <Route
              path="/hubs"
              element={
                <ProtectedRoute>
                  <PermissionGuard>
                    <Hubs />
                  </PermissionGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/startups"
              element={
                <ProtectedRoute>
                  <PermissionGuard>
                    <Startups />
                  </PermissionGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admissions"
              element={
                <ProtectedRoute>
                  <PermissionGuard>
                    <Admissions />
                  </PermissionGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/students"
              element={
                <ProtectedRoute>
                  <PermissionGuard>
                    <Students />
                  </PermissionGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/institutions"
              element={
                <ProtectedRoute>
                  <PermissionGuard>
                    <Institutions />
                  </PermissionGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admissions/dropouts"
              element={
                <ProtectedRoute>
                  <PermissionGuard>
                    <DropoutAnalysis />
                  </PermissionGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admissions/special"
              element={
                <ProtectedRoute>
                  <PermissionGuard>
                    <SpecialEnrollment />
                  </PermissionGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admissions/fees"
              element={
                <ProtectedRoute>
                  <PermissionGuard>
                    <PaymentsAndFees />
                  </PermissionGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/statistics"
              element={
                <ProtectedRoute>
                  <PermissionGuard>
                    <Statistics />
                  </PermissionGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/facilities"
              element={
                <ProtectedRoute>
                  <PermissionGuard>
                    <Facilities />
                  </PermissionGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/innovation"
              element={
                <ProtectedRoute>
                  <PermissionGuard>
                    <Innovation />
                  </PermissionGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/industrialisation"
              element={
                <ProtectedRoute>
                  <PermissionGuard>
                    <Industrialisation />
                  </PermissionGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/regional"
              element={
                <ProtectedRoute>
                  <PermissionGuard>
                    <Regional />
                  </PermissionGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  
                  <Setting />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/help"
              element={
                <ProtectedRoute>
                  <Help />
                </ProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </QueryClientProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
