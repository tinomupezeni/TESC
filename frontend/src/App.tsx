import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "@/components/theme-provider";
import { PermissionGuard } from "./components/layout/PermissionGuard";

// Pages
import Index from "./pages/Index";
import Students from "./pages/Students";
import Institutions from "./pages/Institutions";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ProtectedRoute from "./pages/auth/ProtectedRoute";
import Profile from "./pages/Profile";
import Statistics from "./pages/Statistics";
import Staff from "./pages/Staff";
import Graduates from "./pages/Graduates";
import Facilities from "./pages/Facilities";
import Innovation from "./pages/Innovation";
import Industrialisation from "./pages/Industrialisation";
import Regional from "./pages/Regional";
import Setting from "./pages/Settings";

import Help from "./pages/Help";
import Admissions from "./pages/Admissions";
import ISEOP from "./pages/ISEOP";

// Modules
import Hubs from "./modules/innovation/Hubs";
import Startups from "./modules/innovation/Startups";
import DropoutAnalysis from "./modules/admissions/DropOut";
import SpecialEnrollment from "./modules/admissions/SpecialEnrollment";


const queryClient = new QueryClient();

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Login />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Protected Main Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Index />
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
                path="/students/:id"
                element={
                  <ProtectedRoute>
                    <PermissionGuard>
                      <div className="p-8">
                        Student Detail Page Component Goes Here
                      </div>
                    </PermissionGuard>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/staff"
                element={
                  <ProtectedRoute>
                    <PermissionGuard>
                      <Staff />
                    </PermissionGuard>
                  </ProtectedRoute>
                }
              />

              {/* Innovation & Industrialisation */}
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

              {/* Admissions & Finance */}
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
                path="/iseop"
                element={
                  <ProtectedRoute>
                    <PermissionGuard>
                      <ISEOP />
                    </PermissionGuard>
                  </ProtectedRoute>
                }
              />

              {/* Institutional Records */}
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
                path="/graduates"
                element={
                  <ProtectedRoute>
                    <PermissionGuard>
                      <Graduates />
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
                path="/statistics"
                element={
                  <ProtectedRoute>
                    <PermissionGuard>
                      <Statistics />
                    </PermissionGuard>
                  </ProtectedRoute>
                }
              />

              {/* User & Support */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
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
                path="/help"
                element={
                  <ProtectedRoute>
                    <Help />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;