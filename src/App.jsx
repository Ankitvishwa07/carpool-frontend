import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import useAuthStore from "./store/authStore";
import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import ToastContainer from "./components/Toast";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import DashboardPage from "./pages/DashboardPage";
import PostTripPage from "./pages/PostTripPage";
import SearchTripsPage from "./pages/SearchTripsPage";
import MyTripsPage from "./pages/MyTripsPage";
import MyRequestsPage from "./pages/MyRequestsPage";
import TripDetailPage from "./pages/TripDetailPage";
import ProfilePage from "./pages/ProfilePage";
import AdminPage from "./pages/AdminPage";

function AppLayout({ children }) {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isPublicRoute = ['/login', '/signup', '/verify-email', '/forgot-password', '/reset-password'].includes(location.pathname);

  if (!user || isPublicRoute) {
    return <main className="min-h-screen bg-[#F4F9F5] text-slate-800 flex flex-col font-sans">{children}</main>;
  }

  return (
    <div className="min-h-screen bg-[#F4F9F5] text-slate-800 flex font-sans">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMobileMenuToggle={() => setMobileOpen(true)} />
        <main className="flex-1 pb-12 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

function App() {
  const initAuth = useAuthStore((s) => s.initAuth);
  const isLoading = useAuthStore((s) => s.isLoading);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F4F9F5] flex flex-col items-center justify-center text-slate-600 space-y-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-[#16A34A]/20 animate-ping"></div>
          <div className="absolute inset-0 rounded-full border-4 border-[#16A34A] border-t-transparent animate-spin"></div>
        </div>
        <p className="text-xs font-bold tracking-wide text-[#16A34A]">Loading Current...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/post-trip" element={<ProtectedRoute><PostTripPage /></ProtectedRoute>} />
          <Route path="/search" element={<ProtectedRoute><SearchTripsPage /></ProtectedRoute>} />
          <Route path="/my-trips" element={<ProtectedRoute><MyTripsPage /></ProtectedRoute>} />
          <Route path="/my-requests" element={<ProtectedRoute><MyRequestsPage /></ProtectedRoute>} />
          <Route path="/trips/:id" element={<ProtectedRoute><TripDetailPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminPage />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AppLayout>
      <ToastContainer />
    </BrowserRouter>
  );
}

export default App;