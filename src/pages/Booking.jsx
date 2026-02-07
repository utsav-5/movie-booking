import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiArrowLeft, FiArrowRight, FiCheck, FiStar, FiMapPin, FiClock, FiCalendar, FiUser, FiMail, FiPhone, FiCreditCard, FiShield } from "react-icons/fi";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebase";
import { useAuth } from "../context/AuthContext";
import { MOVIES, THEATRES } from "../data/movies";
import SeatSelector from "../components/SeatSelector";
import toast from "react-hot-toast";
import Skeleton from "../components/Skeleton";

const SEAT_TYPES = {
  VIP: { price: 250, label: "VIP", color: "bg-purple-600", text: "text-purple-600", border: "border-purple-600" },
  PREMIUM: { price: 200, label: "Premium", color: "bg-blue-500", text: "text-blue-500", border: "border-blue-500" },
  STANDARD: { price: 150, label: "Standard", color: "bg-gray-400", text: "text-gray-400", border: "border-gray-400" },
  DISABLED: { price: 100, label: "Accessible", color: "bg-green-500", text: "text-green-500", border: "border-green-500" },
};

const Booking = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const movie = MOVIES.find((m) => m.id === id);
  const theatreId = searchParams.get("theatre");
  const date = searchParams.get("date");
  const time = searchParams.get("time");

  const theatre = THEATRES.find((t) => t.id === theatreId);

  const [step, setStep] = useState(1);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookingDetails, setBookingDetails] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [processing, setProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!movie || !theatre || !date || !time) {
      setError("Missing booking information. Please select a movie, theatre, date, and time.");
    }
  }, [movie, theatre, date, time]);

  useEffect(() => {
    if (currentUser) {
      setBookingDetails({
        name: currentUser.displayName || "",
        email: currentUser.email || "",
        phone: "",
      });
    }
  }, [currentUser]);

  const handleSeatSelect = (seatData) => {
    const { action } = seatData;

    setSelectedSeats((prev) => {
      if (action === "remove") {
        return prev.filter((s) => s.id !== seatData.id);
      }
      if (prev.find((s) => s.id === seatData.id)) {
        return prev;
      }
      return [...prev, seatData];
    });
  };

  const calculateTotal = () => {
    return selectedSeats.reduce((total, seat) => {
      const seatType = SEAT_TYPES[seat.type] || SEAT_TYPES.STANDARD;
      return total + seatType.price;
    }, 0);
  };

  const handleConfirmBooking = async () => {
    // Validation
    if (selectedSeats.length === 0) {
      toast.error("Please select at least one seat");
      return;
    }

    if (!currentUser) {
      toast.error("Please login to book tickets");
      navigate("/login");
      return;
    }

    if (!bookingDetails.name || !bookingDetails.email || !bookingDetails.phone) {
      toast.error("Please fill in all contact details");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(bookingDetails.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Validate phone format
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    if (!phoneRegex.test(bookingDetails.phone)) {
      toast.error("Please enter a valid phone number");
      return;
    }

    // Check if Firebase is initialized
    if (!db) {
      toast.error("Firebase is not initialized. Please restart the app.");
      setError("Firebase database not available. Please restart the app and check console for errors.");
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const bookingData = {
        movieId: movie.id,
        movieTitle: movie.title,
        moviePoster: movie.poster,
        theatreId: theatre.id,
        theatreName: theatre.name,
        date,
        time,
        seats: selectedSeats.map((s) => `${s.row}${s.number}`),
        seatTypes: selectedSeats.map((s) => s.type),
        totalPrice: calculateTotal(),
        userId: currentUser.uid,
        userEmail: bookingDetails.email,
        userName: bookingDetails.name,
        userPhone: bookingDetails.phone,
        status: "confirmed",
        createdAt: serverTimestamp(),
      };

      // Save to Firebase Firestore
      await addDoc(collection(db, "bookings"), bookingData);
      toast.success("Booking confirmed!");
      navigate("/profile");
    } catch (error) {
      console.error("Booking error:", error);
      
      // Provide more helpful error messages
      let errorMessage = error.message;
      
      if (errorMessage.includes('permission-denied') || errorMessage.includes('Missing or insufficient permissions')) {
        errorMessage = "You don't have permission to create bookings. Please check your Firestore security rules.";
      } else if (errorMessage.includes('network-request-failed') || errorMessage.includes('fetch')) {
        errorMessage = "Network error. Please check your internet connection.";
      }
      
      setError(errorMessage);
      toast.error("Failed to confirm booking: " + errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 pt-24 px-4">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-8 w-48 mb-8" variant="rectangular" />
          <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-sm">
            <Skeleton className="h-28 w-20 mb-4" variant="rectangular" />
            <Skeleton className="h-6 w-full mb-2" variant="rectangular" />
            <Skeleton className="h-4 w-3/4" variant="rectangular" />
          </div>
        </div>
      </div>
    );
  }

  // Show error if missing params
  if (error && (!movie || !theatre)) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 pt-24 px-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 mb-6 transition-colors"
          >
            <FiArrowLeft />
            <span>Go Back</span>
          </button>
          
          <div className="bg-white dark:bg-dark-800 rounded-2xl p-8 shadow-sm text-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Cannot Load Booking</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">{error}</p>
            <Link
              to={`/movie/${id}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors"
            >
              Select Showtime
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!movie || !theatre) {
    return null;
  }

  const totalPrice = calculateTotal();

  const steps = [
    { num: 1, label: "Seats" },
    { num: 2, label: "Details" },
    { num: 3, label: "Confirm" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 pt-24 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 mb-6 transition-colors"
        >
          <FiArrowLeft />
          <span>Back</span>
        </button>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((s, i) => (
              <React.Fragment key={s.num}>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                      step >= s.num
                        ? "bg-purple-600 text-white"
                        : "bg-gray-200 dark:bg-dark-700 text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {step > s.num ? <FiCheck /> : s.num}
                  </div>
                  <span
                    className={`hidden sm:block font-medium ${
                      step >= s.num ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {i < 2 && (
                  <div
                    className={`flex-1 h-1 mx-2 rounded ${
                      step > s.num ? "bg-purple-600" : "bg-gray-200 dark:bg-dark-700"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Movie Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-dark-800 rounded-2xl p-4 shadow-sm mb-6 flex items-center gap-4"
        >
          <img
            src={movie.poster}
            alt={movie.title}
            className="w-20 h-28 object-cover rounded-lg shadow-md"
          />
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{movie.title}</h1>
            <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <FiMapPin size={14} />
                {theatre.name}
              </span>
              <span className="flex items-center gap-1">
                <FiCalendar size={14} />
                {new Date(date).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </span>
              <span className="flex items-center gap-1">
                <FiClock size={14} />
                {time}
              </span>
            </div>
            <div className="flex items-center gap-1 mt-2">
              <FiStar className="text-yellow-400 fill-current" size={14} />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{movie.rating}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">/ 5</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-purple-600">${totalPrice}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {selectedSeats.length} ticket{selectedSeats.length !== 1 ? "s" : ""}
            </p>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Step 1: Seat Selection */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <SeatSelector
                onSeatSelect={handleSeatSelect}
                selectedSeats={selectedSeats}
              />

              <button
                onClick={() => selectedSeats.length > 0 && setStep(2)}
                disabled={selectedSeats.length === 0}
                className="w-full mt-6 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition-colors disabled:bg-gray-300 dark:disabled:bg-dark-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Continue to Details
                <FiArrowRight />
              </button>
            </motion.div>
          )}

          {/* Step 2: Contact Details */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-sm mb-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Contact Details</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={bookingDetails.name}
                        onChange={(e) =>
                          setBookingDetails({ ...bookingDetails, name: e.target.value })
                        }
                        className="input"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email Address *
                    </label>
                    <div className="relative">
                      <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        value={bookingDetails.email}
                        onChange={(e) =>
                          setBookingDetails({ ...bookingDetails, email: e.target.value })
                        }
                        className="input"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        value={bookingDetails.phone}
                        onChange={(e) =>
                          setBookingDetails({ ...bookingDetails, phone: e.target.value })
                        }
                        className="input"
                        placeholder="+1 234 567 8900"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Notice */}
              <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl mb-6">
                <FiShield className="text-green-600 dark:text-green-400 flex-shrink-0" />
                <p className="text-sm text-green-800 dark:text-green-300">
                  Your personal information is secure and will only be used for booking confirmation.
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-4 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors flex items-center justify-center gap-2"
                >
                  <FiArrowLeft />
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!bookingDetails.name || !bookingDetails.email || !bookingDetails.phone}
                  className="flex-1 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition-colors disabled:bg-gray-300 dark:disabled:bg-dark-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Review Booking
                  <FiArrowRight />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-sm mb-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Booking Summary</h2>

                <div className="space-y-4">
                  <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">Movie</span>
                    <span className="font-medium text-gray-900 dark:text-white">{movie.title}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">Theatre</span>
                    <span className="font-medium text-gray-900 dark:text-white">{theatre.name}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">Date & Time</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {new Date(date).toLocaleDateString()} at {time}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">Seats</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {selectedSeats.map((s) => `${s.row}${s.number}`).join(", ")}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">Contact</span>
                    <span className="font-medium text-gray-900 dark:text-white">{bookingDetails.email}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">Phone</span>
                    <span className="font-medium text-gray-900 dark:text-white">{bookingDetails.phone}</span>
                  </div>
                  
                  {/* Price Breakdown */}
                  <div className="pt-4 border-t border-gray-100 dark:border-gray-700 space-y-2">
                    {selectedSeats.map((seat) => {
                      const seatType = SEAT_TYPES[seat.type] || SEAT_TYPES.STANDARD;
                      return (
                        <div key={seat.id} className="flex justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">
                            {seat.row}{seat.number} ({seat.type})
                          </span>
                          <span className="text-gray-900 dark:text-white">${seatType.price}</span>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="flex justify-between py-4 border-t border-gray-100 dark:border-gray-700">
                    <span className="text-xl font-bold text-gray-900 dark:text-white">Total</span>
                    <span className="text-xl font-bold text-purple-600">${totalPrice}</span>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl mb-6">
                <FiCreditCard className="text-purple-600 dark:text-purple-400 flex-shrink-0" />
                <p className="text-sm text-purple-800 dark:text-purple-300">
                  Payment will be collected at the theater. No online payment required.
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-4 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors flex items-center justify-center gap-2"
                >
                  <FiArrowLeft />
                  Back
                </button>
                <button
                  onClick={handleConfirmBooking}
                  disabled={processing}
                  className="flex-1 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition-colors disabled:bg-gray-300 dark:disabled:bg-dark-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <div className="spinner" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <FiCheck />
                      Confirm Booking
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Booking;
