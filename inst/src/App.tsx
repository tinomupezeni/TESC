import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/ForgotPassword";
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
import NotFound from "./pages/NotFound";
import DashboardLayout from "./components/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Faculties from "./pages/Faculties";
import EnrolmentSupport from "./pages/IseopEnrolment";
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
          <Route
            path="/force-password-change"
            element={<ForcePasswordChange />}
          />

          {/* Dashboard routes wrapped with DashboardLayout and PermissionGuard */}
          <Route
            path="/dashboard"
            element={
              <PermissionGuard>
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </PermissionGuard>
            }
          />
          <Route
            path="/dashboard/students"
            element={
              <PermissionGuard>
                <DashboardLayout>
                  <Students />
                </DashboardLayout>
              </PermissionGuard>
            }
          />
          <Route
            path="/dashboard/staff"
            element={
              <PermissionGuard>
                <DashboardLayout>
                  <Staff />
                </DashboardLayout>
              </PermissionGuard>
            }
          />
         
          <Route
            path="/dashboard/programs"
            element={
              <PermissionGuard>
                <DashboardLayout>
                  <Programs />
                </DashboardLayout>
              </PermissionGuard>
            }
          />
          <Route
            path="/dashboard/graduates"
            element={
              <PermissionGuard>
                <DashboardLayout>
                  <Graduates />
                </DashboardLayout>
              </PermissionGuard>
            }
          />
          <Route
            path="/dashboard/special-enrollment"
            element={
              <PermissionGuard>
                <DashboardLayout>
                  <EnrolmentSupport />
                </DashboardLayout>
              </PermissionGuard>
            }
          />
          <Route
            path="/dashboard/facilities"
            element={
              <PermissionGuard>
                <DashboardLayout>
                  <Facilities />
                </DashboardLayout>
              </PermissionGuard>
            }
          />
          <Route
            path="/dashboard/faculties"
            element={
              <PermissionGuard>
                <DashboardLayout>
                  <Faculties />
                </DashboardLayout>
              </PermissionGuard>
            }
          />
          <Route
            path="/dashboard/reports"
            element={
              <PermissionGuard>
                <DashboardLayout>
                  <Reports />
                </DashboardLayout>
              </PermissionGuard>
            }
          />
          <Route
            path="/dashboard/innovation"
            element={
              <PermissionGuard>
                <DashboardLayout>
                  <Innovation />
                </DashboardLayout>
              </PermissionGuard>
            }
          />
          <Route
            path="/dashboard/settings"
            element={
              <PermissionGuard>
                <DashboardLayout>
                  <Settings />
                </DashboardLayout>
              </PermissionGuard>
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

          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
