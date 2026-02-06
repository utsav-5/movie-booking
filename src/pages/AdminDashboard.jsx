import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { Plus, Trash2, Edit, Users, DollarSign, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    totalUsers: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is admin
    if (userProfile?.role !== 'admin') {
      toast.error('Access denied');
      navigate('/');
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch all bookings
        const bookingsQuery = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
        const bookingsSnapshot = await getDocs(bookingsQuery);
        const bookings = bookingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        setRecentBookings(bookings.slice(0, 10));
        setStats({
          totalBookings: bookings.length,
          totalRevenue: bookings.reduce((acc, b) => acc + (b.totalPrice || 0), 0),
          totalUsers: 0 // Would need another query
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
      setLoading(false);
    };

    fetchData();
  }, [userProfile, navigate]);

  if (!currentUser || userProfile?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-xl">Access Denied</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Admin Dashboard</h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 border border-purple-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm">Total Bookings</p>
                <p className="text-3xl font-bold text-white">{stats.totalBookings}</p>
              </div>
              <div className="w-12 h-12 bg-purple-600/50 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 border border-purple-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm">Total Revenue</p>
                <p className="text-3xl font-bold text-white">${stats.totalRevenue}</p>
              </div>
              <div className="w-12 h-12 bg-green-600/50 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 border border-purple-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm">Total Users</p>
                <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
              </div>
              <div className="w-12 h-12 bg-blue-600/50 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg flex items-center gap-3 transition-colors">
            <Plus className="w-5 h-5" />
            Add New Movie
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg flex items-center gap-3 transition-colors">
            <Edit className="w-5 h-5" />
            Manage Movies
          </button>
          <button className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg flex items-center gap-3 transition-colors">
            <Users className="w-5 h-5" />
            View All Users
          </button>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl border border-purple-500/30">
          <div className="p-6 border-b border-purple-500/30">
            <h2 className="text-xl font-bold text-white">Recent Bookings</h2>
          </div>
          
          {loading ? (
            <div className="p-6 text-center text-white">Loading...</div>
          ) : recentBookings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-purple-900/30">
                  <tr>
                    <th className="text-left p-4 text-purple-200">Booking ID</th>
                    <th className="text-left p-4 text-purple-200">Customer</th>
                    <th className="text-left p-4 text-purple-200">Movie</th>
                    <th className="text-left p-4 text-purple-200">Seats</th>
                    <th className="text-left p-4 text-purple-200">Total</th>
                    <th className="text-left p-4 text-purple-200">Status</th>
                    <th className="text-left p-4 text-purple-200">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map(booking => (
                    <tr key={booking.id} className="border-b border-purple-500/20">
                      <td className="p-4 text-white text-sm">{booking.id.slice(0, 8)}...</td>
                      <td className="p-4 text-white">{booking.customerName}</td>
                      <td className="p-4 text-purple-200">{booking.movieTitle}</td>
                      <td className="p-4 text-purple-200">{booking.seats?.join(', ')}</td>
                      <td className="p-4 text-green-400 font-bold">${booking.totalPrice}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          booking.status === 'confirmed'
                            ? 'bg-green-500/30 text-green-300'
                            : 'bg-red-500/30 text-red-300'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <button className="text-red-400 hover:text-red-300">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center text-purple-200">No bookings yet</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
