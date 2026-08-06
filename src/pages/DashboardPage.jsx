import { Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const isDriver = user?.role === 'driver' || user?.role === 'admin';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-2">Welcome, {user?.name}</h1>
      <p className="text-gray-500 mb-6">You're signed in as a <span className="font-medium">{user?.role}</span>.</p>

      <div className="grid sm:grid-cols-2 gap-4">
        {isDriver && (
          <>
            <Link to="/post-trip" className="bg-white border rounded-xl p-5 hover:border-indigo-400">
              <p className="font-medium">Post a trip</p>
              <p className="text-sm text-gray-500">Offer seats on your commute route</p>
            </Link>
            <Link to="/my-trips" className="bg-white border rounded-xl p-5 hover:border-indigo-400">
              <p className="font-medium">My trips</p>
              <p className="text-sm text-gray-500">Manage trips and incoming requests</p>
            </Link>
          </>
        )}
        <Link to="/search" className="bg-white border rounded-xl p-5 hover:border-indigo-400">
          <p className="font-medium">Find a ride</p>
          <p className="text-sm text-gray-500">Search for trips matching your route</p>
        </Link>
        <Link to="/my-requests" className="bg-white border rounded-xl p-5 hover:border-indigo-400">
          <p className="font-medium">My requests</p>
          <p className="text-sm text-gray-500">Track your ride requests</p>
        </Link>
      </div>
    </div>
  );
}