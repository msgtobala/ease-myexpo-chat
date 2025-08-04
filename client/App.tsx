import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";
import Discussions from "./pages/Discussions";
import VisitorProfile from "./pages/VisitorProfile";
import ExhibitorProfile from "./pages/ExhibitorProfile";
import ExhibitionsProfile from "./pages/ExhibitionsProfile";
import ExhibitionsList from "./pages/ExhibitionsList";
import SmartMatch from "./pages/SmartMatch";
import Chats from "./pages/Chats";
import Onboarding from "./pages/Onboarding";
import CreationConfirmation from "./pages/CreationConfirmation";
import Login from "./pages/Login";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes that redirect logged-in users */}
            <Route
              path="/"
              element={<Onboarding />}
            />
            <Route
              path="/login"
              element={
                <ProtectedRoute requireAuth={false} redirectTo="/home">
                  <Login />
                </ProtectedRoute>
              }
            />
            {/* Protected routes that require authentication */}
            <Route
              path="/creation-confirmation"
              element={<CreationConfirmation />}
            />
            <Route
              path="/home"
              element={
                <ProtectedRoute requireAuth={true}>
                  <Discussions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/visitor/profile"
              element={
                <ProtectedRoute requireAuth={true}>
                  <VisitorProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/exhibitor/profile"
              element={
                <ProtectedRoute requireAuth={true}>
                  <ExhibitorProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/exhibitions/profile"
              element={
                <ProtectedRoute requireAuth={true}>
                  <ExhibitionsProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/exhibitions/list"
              element={
                <ProtectedRoute requireAuth={true}>
                  <ExhibitionsList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/smart-match"
              element={
                <ProtectedRoute requireAuth={true}>
                  <SmartMatch />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chats"
              element={
                <ProtectedRoute requireAuth={true}>
                  <Chats />
                </ProtectedRoute>
              }
            />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
