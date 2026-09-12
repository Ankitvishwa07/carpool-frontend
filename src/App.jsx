import { useEffect, useState, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import useAuthStore from "./store/authStore";
import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import ToastContainer from "./components/Toast";

// Lazy-loaded page components for route-level code splitting
const LoginPage = lazy(() => import("./pages/LoginPage"));
const SignupPage = lazy(() => import("./pages/SignupPage"));
const VerifyEmailPage = lazy(() => import("./pages/VerifyEmailPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const PostTripPage = lazy(() => import("./pages/PostTripPage"));
const SearchTripsPage = lazy(() => import("./pages/SearchTripsPage"));
const MyTripsPage = lazy(() => import("./pages/MyTripsPage"));
const MyRequestsPage = lazy(() => import("./pages/MyRequestsPage"));
const TripDetailPage = lazy(() => import("./pages/TripDetailPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

function PageFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-600 space-y-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-[#16A34A]/20 animate-ping"></div>
        <div className="absolute inset-0 rounded-full border-4 border-[#16A34A] border-t-transparent animate-spin"></div>
      </div>
      <p className="text-xs font-bold tracking-wide text-[#16A34A]">Loading page...</p>
    </div>
  );
}

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
        <Suspense fallback={<PageFallback />}>
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
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </AppLayout>
      <ToastContainer />
    </BrowserRouter>
  );
}

export default App;