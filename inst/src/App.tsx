import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ForcePasswordChange from "./pages/ForcePasswordChange";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Staff from "./pages/Staff";
import Programs from "./pages/Programs";
import Graduates from "./pages/Graduates";
import Facilities from "./pages/Facilities";
import Innovation from "./pages/Innovation";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import Reports from "./pages/Reports";
import Help from "./pages/Help";
import NotFound from "./pages/NotFound";
import DashboardLayout from "./components/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Faculties from "./pages/Faculties";
import EnrolmentSupport from "./pages/IseopEnrolment";
import Placements from "./pages/Placements";
import Scholarships from "./pages/Scholarships";
import Mobility from "./pages/Mobility";
import StemStudents from "./pages/StemStudents"; // New Import
import Inclusivity from "./pages/Inclusivity"; // New Import
import PossibleGraduates from "./pages/PossibleGraduates"; // New Import
import InCountryTransfers from "./pages/InCountryTransfers"; // New Import
import SpecializedStudents from "./pages/SpecializedStudents";
import CriticalStudents from "./pages/CriticalStudents";
import AuditTrail from "./pages/AuditTrail";
import { PermissionGuard } from "./components/PermissionGuard";


const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/force-password-change"
            element={<ForcePasswordChange />}
          />

          {/* Dashboard routes wrapped with ProtectedRoute, DashboardLayout and PermissionGuard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <PermissionGuard>
                  <DashboardLayout>
                    <Dashboard />
                  </DashboardLayout>
                </PermissionGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/students"
            element={
              <ProtectedRoute>
                <PermissionGuard>
                  <DashboardLayout>
                    <Students />
                  </DashboardLayout>
                </PermissionGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/staff"
            element={
              <ProtectedRoute>
                <PermissionGuard>
                  <DashboardLayout>
                    <Staff />
                  </DashboardLayout>
                </PermissionGuard>
              </ProtectedRoute>
            }
          />
         
          <Route
            path="/dashboard/programs"
            element={
              <ProtectedRoute>
                <PermissionGuard>
                  <DashboardLayout>
                    <Programs />
                  </DashboardLayout>
                </PermissionGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/graduates"
            element={
              <ProtectedRoute>
                <PermissionGuard>
                  <DashboardLayout>
                    <Graduates />
                  </DashboardLayout>
                </PermissionGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/stem-students" // New Route
            element={
              <ProtectedRoute>
                <PermissionGuard>
                  <DashboardLayout>
                    <StemStudents />
                  </DashboardLayout>
                </PermissionGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/specialized-students"
            element={
              <ProtectedRoute>
                <PermissionGuard>
                  <DashboardLayout>
                    <SpecializedStudents />
                  </DashboardLayout>
                </PermissionGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/critical-students"
            element={
              <ProtectedRoute>
                <PermissionGuard>
                  <DashboardLayout>
                    <CriticalStudents />
                  </DashboardLayout>
                </PermissionGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/inclusivity" // New Route
            element={
              <ProtectedRoute>
                <PermissionGuard>
                  <DashboardLayout>
                    <Inclusivity />
                  </DashboardLayout>
                </PermissionGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/possible-graduates" // New Route
            element={
              <ProtectedRoute>
                <PermissionGuard>
                  <DashboardLayout>
                    <PossibleGraduates />
                  </DashboardLayout>
                </PermissionGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/transfers" // New Route
            element={
              <ProtectedRoute>
                <PermissionGuard>
                  <DashboardLayout>
                    <InCountryTransfers />
                  </DashboardLayout>
                </PermissionGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/special-enrollment"
            element={
              <ProtectedRoute>
                <PermissionGuard>
                  <DashboardLayout>
                    <EnrolmentSupport />
                  </DashboardLayout>
                </PermissionGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/facilities"
            element={
              <ProtectedRoute>
                <PermissionGuard>
                  <DashboardLayout>
                    <Facilities />
                  </DashboardLayout>
                </PermissionGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/faculties"
            element={
              <ProtectedRoute>
                <PermissionGuard>
                  <DashboardLayout>
                    <Faculties />
                  </DashboardLayout>
                </PermissionGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/placements"
            element={
              <ProtectedRoute>
                <PermissionGuard>
                  <DashboardLayout>
                    <Placements />
                  </DashboardLayout>
                </PermissionGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/scholarships"
            element={
              <ProtectedRoute>
                <PermissionGuard>
                  <DashboardLayout>
                    <Scholarships />
                  </DashboardLayout>
                </PermissionGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/mobility"
            element={
              <ProtectedRoute>
                <PermissionGuard>
                  <DashboardLayout>
                    <Mobility />
                  </DashboardLayout>
                </PermissionGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/reports"
            element={
              <ProtectedRoute>
                <PermissionGuard>
                  <DashboardLayout>
                    <Reports />
                  </DashboardLayout>
                </PermissionGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/innovation"
            element={
              <ProtectedRoute>
                <PermissionGuard>
                  <DashboardLayout>
                    <Innovation />
                  </DashboardLayout>
                </PermissionGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/settings"
            element={
              <ProtectedRoute>
                <PermissionGuard>
                  <DashboardLayout>
                    <Settings />
                  </DashboardLayout>
                </PermissionGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/users"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Users />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/help"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Help />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/audit-trail"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <AuditTrail />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
