import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b px-6 py-3 flex items-center justify-between">
      <Link to="/dashboard" className="font-semibold text-lg text-indigo-600">
        Carpool
      </Link>
      <div className="flex items-center gap-4 text-sm">
        {user ? (
          <>
            <Link to="/search" className="text-gray-600 hover:text-indigo-600">Find a ride</Link>
            {(user.role === 'driver' || user.role === 'admin') && (
              <Link to="/post-trip" className="text-gray-600 hover:text-indigo-600">Post a trip</Link>
            )}
            <Link to="/my-trips" className="text-gray-600 hover:text-indigo-600">My trips</Link>
            <Link to="/my-requests" className="text-gray-600 hover:text-indigo-600">My requests</Link>
            {user.role === 'admin' && (
              <Link to="/admin" className="text-gray-600 hover:text-indigo-600">Admin</Link>
            )}
            <NotificationBell />
            <Link to="/profile" className="text-gray-600 hover:text-indigo-600">
              {user.name} <span className="text-gray-400">({user.role})</span>
            </Link>
            <button onClick={handleLogout} className="text-red-600 hover:underline">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-gray-600 hover:text-indigo-600">Login</Link>
            <Link to="/signup" className="text-gray-600 hover:text-indigo-600">Sign up</Link>
          </>
        )}
      </div>
    </nav>
  );
}