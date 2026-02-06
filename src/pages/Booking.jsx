import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowLeft, FiArrowRight, FiCheck, FiStar, FiMapPin, FiClock, FiCalendar, FiUser, FiMail, FiPhone } from "react-icons/fi";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebase";
import { useAuth } from "../context/AuthContext";
import { MOVIES, THEATRES } from "../data/movies";
import SeatSelector from "../components/SeatSelector";
import toast from "react-hot-toast";

const SEAT_TYPES = {
  VIP: { price: 250, label: "VIP", color: "bg-purple-600" },
  PREMIUM: { price: 200, label: "Premium", color: "bg-blue-500" },
  STANDARD: { price: 150, label: "Standard", color: "bg-gray-400" },
  DISABLED: { price: 100, label: "Accessible", color: "bg-green-500" },
};

const Booking = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
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

  useEffect(() => {
    if (!movie || !theatre || !date || !time) {
      toast.error("Invalid booking URL");
      navigate(-1);
    }
  }, [movie, theatre, date, time, navigate]);

  useEffect(() => {
    if (user) {
      setBookingDetails({
        name: user.displayName || "",
        email: user.email || "",
        phone: "",
      });
    }
  }, [user]);

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
    if (!user) {
      toast.error("Please login to book tickets");
      navigate("/login");
      return;
    }

    if (!bookingDetails.name || !bookingDetails.email || !bookingDetails.phone) {
      toast.error("Please fill in all details");
      return;
    }

    setProcessing(true);
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
        userId: user.uid,
        userEmail: bookingDetails.email,
        userName: bookingDetails.name,
        userPhone: bookingDetails.phone,
        status: "confirmed",
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "bookings"), bookingData);
      toast.success("Booking confirmed!");
      navigate("/profile");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setProcessing(false);
    }
  };

  if (!movie || !theatre) {
    return null;
  }

  const totalPrice = calculateTotal();

  return (
    <div className="min-h-screen bg-gray-50 pt-24 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: "Seats" },
              { num: 2, label: "Details" },
              { num: 3, label: "Confirm" },
            ].map((s, i) => (
              <React.Fragment key={s.num}>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                      step >= s.num
                        ? "bg-purple-600 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {step > s.num ? <FiCheck /> : s.num}
                  </div>
                  <span
                    className={`hidden sm:block font-medium ${
                      step >= s.num ? "text-gray-900" : "text-gray-500"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {i < 2 && (
                  <div
                    className={`flex-1 h-1 mx-2 rounded ${
                      step > s.num ? "bg-purple-600" : "bg-gray-200"
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
          className="bg-white rounded-2xl p-4 shadow-sm mb-6 flex items-center gap-4"
        >
          <img
            src={movie.poster}
            alt={movie.title}
            className="w-20 h-28 object-cover rounded-lg"
          />
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">{movie.title}</h1>
            <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-500">
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
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-purple-600">${totalPrice}</p>
            <p className="text-sm text-gray-500">
              {selectedSeats.length} ticket{selectedSeats.length !== 1 ? "s" : ""}
            </p>
          </div>
        </motion.div>

        {/* Step 1: Seat Selection */}
        {step === 1 && (
          <motion.div
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
              className="w-full mt-6 py-4 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              Continue
              <FiArrowRight />
            </button>
          </motion.div>
        )}

        {/* Step 2: Contact Details */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Contact Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={bookingDetails.name}
                      onChange={(e) =>
                        setBookingDetails({ ...bookingDetails, name: e.target.value })
                      }
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="John Doe"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={bookingDetails.email}
                      onChange={(e) =>
                        setBookingDetails({ ...bookingDetails, email: e.target.value })
                      }
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      value={bookingDetails.phone}
                      onChange={(e) =>
                        setBookingDetails({ ...bookingDetails, phone: e.target.value })
                      }
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-4 border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <FiArrowLeft />
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!bookingDetails.name || !bookingDetails.email || !bookingDetails.phone}
                className="flex-1 py-4 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Continue
                <FiArrowRight />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Booking Summary</h2>

              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Movie</span>
                  <span className="font-medium text-gray-900">{movie.title}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Theatre</span>
                  <span className="font-medium text-gray-900">{theatre.name}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Date & Time</span>
                  <span className="font-medium text-gray-900">
                    {new Date(date).toLocaleDateString()} at {time}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Seats</span>
                  <span className="font-medium text-gray-900">
                    {selectedSeats.map((s) => `${s.row}${s.number}`).join(", ")}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Contact</span>
                  <span className="font-medium text-gray-900">{bookingDetails.email}</span>
                </div>
                <div className="flex justify-between py-4">
                  <span className="text-xl font-bold text-gray-900">Total</span>
                  <span className="text-xl font-bold text-purple-600">${totalPrice}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-4 border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <FiArrowLeft />
                Back
              </button>
              <button
                onClick={handleConfirmBooking}
                disabled={processing}
                className="flex-1 py-4 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {processing ? "Processing..." : "Confirm Booking"}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Booking;
