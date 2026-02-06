import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiUser, FiMail, FiCalendar, FiMapPin, FiClock, FiX, FiDownload, FiHeart, FiSettings, FiLogOut, FiStar, FiFilm } from "react-icons/fi";
import { onAuthStateChanged, signOut, updateProfile } from "firebase/auth";
import { doc, getDoc, updateDoc, deleteDoc, collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../config/firebase";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { MOVIES, THEATRES } from "../data/movies";

const Profile = () => {
  const { user, userData, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("bookings");
  const [showCancelModal, setShowCancelModal] = useState(null);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchBookings = async () => {
      try {
        const q = query(collection(db, "bookings"), where("userId", "==", user.uid));
        const snapshot = await getDocs(q);
        const bookingsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBookings(bookingsData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user]);

  const cancelBooking = async (bookingId) => {
    try {
      await deleteDoc(doc(db, "bookings", bookingId));
      setBookings(bookings.filter((b) => b.id !== bookingId));
      toast.success("Booking cancelled successfully");
      setShowCancelModal(null);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const updateUserName = async () => {
    if (!newName.trim()) return;
    try {
      await updateProfile(auth.currentUser, { displayName: newName });
      await updateDoc(doc(db, "users", user.uid), { name: newName });
      toast.success("Name updated successfully");
      setEditingName(false);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getMovie = (movieId) => MOVIES.find((m) => m.id === movieId);
  const getTheatre = (theatreId) => THEATRES.find((t) => t.id === theatreId);

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

  if (!user) {
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
              {userData?.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
            </div>
            <div className="flex-1 text-center md:text-left">
              {editingName ? (
                <div className="flex flex-col md:flex-row gap-2">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter new name"
                  />
                  <button
                    onClick={updateUserName}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingName(false)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {userData?.name || "User"}
                  </h1>
                  <button
                    onClick={() => {
                      setNewName(userData?.name || "");
                      setEditingName(true);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FiSettings size={18} />
                  </button>
                </div>
              )}
              <div className="flex items-center gap-2 mt-2 text-gray-500 justify-center md:justify-start">
                <FiMail size={16} />
                <span>{user.email}</span>
              </div>
            </div>
            <button
              onClick={() => signOut(auth).then(() => toast.success("Logged out!"))}
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
                      const movie = getMovie(booking.movieId);
                      const theatre = getTheatre(booking.theatreId);
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
                                <FiCalendar />
                                {formatDate(booking.date)}
                              </span>
                              <span className="flex items-center gap-1">
                                <FiClock />
                                {booking.time}
                              </span>
                              <span className="flex items-center gap-1">
                                <FiMapPin />
                                Seats: {booking.seats?.join(", ")}
                              </span>
                            </div>
                            <div className="mt-3 flex items-center gap-2">
                              <span className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-sm font-medium">
                                {booking.status || "Confirmed"}
                              </span>
                              <span className="text-lg font-bold text-gray-900">
                                ${booking.totalPrice}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-row md:flex-col gap-2 justify-end">
                            <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                              <FiDownload size={16} />
                              Ticket
                            </button>
                            <button
                              onClick={() => setShowCancelModal(booking)}
                              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <FiX size={16} />
                              Cancel
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}

                {pastBookings.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">Past</h2>
                    {pastBookings.map((booking) => {
                      const movie = getMovie(booking.movieId);
                      return (
                        <motion.div
                          key={booking.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-gray-50 rounded-xl p-4 shadow-sm mb-4 flex gap-4 opacity-75"
                        >
                          <img
                            src={movie?.poster}
                            alt={movie?.title}
                            className="w-20 h-28 object-cover rounded-lg"
                          />
                          <div>
                            <h3 className="font-semibold text-gray-900">{movie?.title}</h3>
                            <p className="text-sm text-gray-500">{formatDate(booking.date)} at {booking.time}</p>
                            <p className="text-sm text-gray-500">Seats: {booking.seats?.join(", ")}</p>
                            <span className="inline-block mt-2 px-2 py-1 bg-gray-200 text-gray-600 rounded-full text-xs">
                              Completed
                            </span>
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl p-6 shadow-sm text-center"
          >
            <Link
              to="/favorites"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors"
            >
              <FiHeart />
              View All Favorites
            </Link>
          </motion.div>
        )}

        {/* Stats Tab */}
        {activeTab === "stats" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <div className="bg-white rounded-xl p-6 shadow-sm text-center">
              <div className="text-4xl font-bold text-purple-600">{bookings.length}</div>
              <div className="text-gray-500 mt-1">Total Bookings</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm text-center">
              <div className="text-4xl font-bold text-purple-600">
                ${bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0)}
              </div>
              <div className="text-gray-500 mt-1">Total Spent</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm text-center">
              <div className="text-4xl font-bold text-purple-600">
                {new Set(bookings.map((b) => b.movieId)).size}
              </div>
              <div className="text-gray-500 mt-1">Unique Movies</div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Cancel Modal */}
      <AnimatePresence>
        {showCancelModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setShowCancelModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-gray-900 mb-2">Cancel Booking?</h3>
              <p className="text-gray-500 mb-6">
                Are you sure you want to cancel this booking? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowCancelModal(null)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Keep Booking
                </button>
                <button
                  onClick={() => cancelBooking(showCancelModal.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Cancel Booking
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
