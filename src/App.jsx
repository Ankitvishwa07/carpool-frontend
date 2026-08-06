import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import useAuthStore from "./store/authStore";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
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

function App() {
  const initAuth = useAuthStore((s) => s.initAuth);
  const isLoading = useAuthStore((s) => s.isLoading);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Navbar />
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
    </BrowserRouter>
  );
}

export default App;