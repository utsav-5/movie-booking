import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiUser, FiMail, FiCalendar, FiFilm, FiLogOut, FiSettings, FiHeart, FiStar, FiX } from "react-icons/fi";
import { signOut } from "firebase/auth";
import { auth, db } from "../config/firebase";
import { useAuth } from "../context/AuthContext";
import { doc, getDoc, query, where, getDocs, collection, deleteDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import { MOVIES, THEATRES } from "../data/movies";

const Profile = () => {
  const { currentUser, userProfile, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("bookings");
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const navigate = useNavigate();

  // Fetch bookings
  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const fetchBookings = async () => {
      try {
        const q = query(collection(db, "bookings"), where("userId", "==", currentUser.uid));
        const snapshot = await getDocs(q);
        const bookingsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        }));
        setBookings(bookingsData.sort((a, b) => b.createdAt - a.createdAt));
      } catch (error) {
        console.error("Error fetching bookings:", error);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  };

  const isPastBooking = (dateStr) => {
    return new Date(dateStr) < new Date();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 px-4">
        <div className="max-w-md mx-auto text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 bg-purple-100 rounded-full flex items-center justify-center">
            <FiUser className="text-purple-600 text-4xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign in to view profile</h2>
          <p className="text-gray-500 mb-8">Access your bookings and favorites</p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const upcomingBookings = bookings.filter((b) => !isPastBooking(b.date));
  const pastBookings = bookings.filter((b) => isPastBooking(b.date));

  return (
    <div className="min-h-screen bg-gray-50 pt-24 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm mb-6"
        >
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white text-4xl font-bold">
              {userProfile?.name?.charAt(0)?.toUpperCase() || currentUser.email?.charAt(0)?.toUpperCase()}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold text-gray-900">
                {userProfile?.name || "User"}
              </h1>
              <div className="flex items-center gap-2 mt-2 text-gray-500 justify-center md:justify-start">
                <FiMail size={16} />
                <span>{currentUser.email}</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <FiLogOut />
              Logout
            </button>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab("bookings")}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all whitespace-nowrap ${
              activeTab === "bookings"
                ? "bg-purple-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            <FiCalendar />
            My Bookings
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-sm">{bookings.length}</span>
          </button>
          <button
            onClick={() => setActiveTab("favorites")}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all whitespace-nowrap ${
              activeTab === "favorites"
                ? "bg-purple-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            <FiHeart />
            Favorites
          </button>
          <button
            onClick={() => setActiveTab("stats")}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all whitespace-nowrap ${
              activeTab === "stats"
                ? "bg-purple-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            <FiStar />
            Stats
          </button>
        </div>

        {/* Bookings Tab */}
        {activeTab === "bookings" && (
          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full" />
              </div>
            ) : bookings.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-2xl p-12 text-center shadow-sm"
              >
                <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <FiFilm className="text-gray-400 text-3xl" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings yet</h3>
                <p className="text-gray-500 mb-6">Start booking your favorite movies!</p>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors"
                >
                  Browse Movies
                </Link>
              </motion.div>
            ) : (
              <>
                {upcomingBookings.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">Upcoming</h2>
                    {upcomingBookings.map((booking) => {
                      const movie = MOVIES.find((m) => m.id === booking.movieId);
                      const theatre = THEATRES.find((t) => t.id === booking.theatreId);
                      return (
                        <motion.div
                          key={booking.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white rounded-xl p-4 shadow-sm mb-4 flex flex-col md:flex-row gap-4"
                        >
                          <img
                            src={movie?.poster}
                            alt={movie?.title}
                            className="w-24 h-36 object-cover rounded-lg flex-shrink-0"
                          />
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">{movie?.title}</h3>
                            <p className="text-gray-500">{theatre?.name}</p>
                            <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <FiCalendar size={14} />
                                {formatDate(booking.date)}
                              </span>
                              <span className="flex items-center gap-1">
                                <FiUser size={14} />
                                {booking.showtime}
                              </span>
                              <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                                {booking.seats?.length || 0} seat(s)
                              </span>
                            </div>
                            <div className="mt-3">
                              <span className="text-purple-600 font-semibold">Total: ${booking.totalPrice}</span>
                            </div>
                          </div>
                          <div className="flex flex-row md:flex-col gap-2 justify-end">
                            <button
                              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                              onClick={() => toast.success("Booking confirmed! Check your email for details.")}
                            >
                              View Ticket
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
                {pastBookings.length > 0 && (
                  <div className="mt-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">Past Bookings</h2>
                    {pastBookings.map((booking) => {
                      const movie = MOVIES.find((m) => m.id === booking.movieId);
                      const theatre = THEATRES.find((t) => t.id === booking.theatreId);
                      return (
                        <motion.div
                          key={booking.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-gray-50 rounded-xl p-4 mb-4 flex flex-col md:flex-row gap-4 opacity-75"
                        >
                          <img
                            src={movie?.poster}
                            alt={movie?.title}
                            className="w-24 h-36 object-cover rounded-lg flex-shrink-0 grayscale"
                          />
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-700">{movie?.title}</h3>
                            <p className="text-gray-500">{theatre?.name}</p>
                            <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <FiCalendar size={14} />
                                {formatDate(booking.date)}
                              </span>
                              <span className="flex items-center gap-1">
                                <FiUser size={14} />
                                {booking.showtime}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Favorites Tab */}
        {activeTab === "favorites" && (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <FiHeart className="text-gray-300 text-5xl mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No favorites yet</h3>
            <p className="text-gray-500">Save movies to your favorites</p>
          </div>
        )}

        {/* Stats Tab */}
        {activeTab === "stats" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <FiCalendar className="text-purple-600 text-2xl mb-2" />
              <p className="text-3xl font-bold text-gray-900">{bookings.length}</p>
              <p className="text-gray-500">Total Bookings</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <FiFilm className="text-pink-600 text-2xl mb-2" />
              <p className="text-3xl font-bold text-gray-900">{upcomingBookings.length}</p>
              <p className="text-gray-500">Upcoming</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <FiStar className="text-yellow-600 text-2xl mb-2" />
              <p className="text-3xl font-bold text-gray-900">
                {bookings.length > 0 ? Math.round(bookings.reduce((sum, b) => sum + (b.seats?.length || 0), 0) / bookings.length * 10) / 10 : 0}
              </p>
              <p className="text-gray-500">Avg. Seats per Booking</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
