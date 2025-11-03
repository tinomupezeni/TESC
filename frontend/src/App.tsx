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
              path="/students"
              element={
                <ProtectedRoute>
                  <Students />
                </ProtectedRoute>
              }
            />
            <Route
              path="/institutions"
              element={
                <ProtectedRoute>
                  <Institutions />
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
                  <Statistics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/facilities"
              element={
                <ProtectedRoute>
                  <Facilities />
                </ProtectedRoute>
              }
            />
            <Route
              path="/innovation"
              element={
                <ProtectedRoute>
                  <Innovation />
                </ProtectedRoute>
              }
            />
            <Route
              path="/industrialisation"
              element={
                <ProtectedRoute>
                  <Industrialisation />
                </ProtectedRoute>
              }
            />
            <Route
              path="/regional"
              element={
                <ProtectedRoute>
                  <Regional />
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
