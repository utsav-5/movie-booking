import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiStar, FiClock, FiCalendar, FiMapPin, FiHeart, FiShare2, FiPlay, FiMinus, FiPlus, FiChevronLeft } from "react-icons/fi";
import { doc, onSnapshot, updateDoc, arrayUnion, arrayRemove, addDoc, collection, serverTimestamp, query, orderBy } from "firebase/firestore";
import { auth, db } from "../config/firebase";
import { useAuth } from "../context/AuthContext";
import { MOVIES, THEATRES, getDates, getShowTimes } from "../data/movies";
import toast from "react-hot-toast";
import SeatSelector from "../components/SeatSelector";

const MovieDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const movie = MOVIES.find((m) => m.id === id);
  const [selectedTheatre, setSelectedTheatre] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [showTrailer, setShowTrailer] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const dates = getDates();

  useEffect(() => {
    if (!movie) return;

    // Check if favorite
    if (user) {
      const unsub = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
        if (docSnap.exists()) {
          setFavorites(docSnap.data().favorites || []);
          setIsFavorite(docSnap.data().favorites?.some((f) => f.id === movie.id));
        }
      });
      return () => unsub();
    }
  }, [user, movie]);

  useEffect(() => {
    if (!movie) return;

    // Load reviews
    const unsub = onSnapshot(
      query(collection(db, "reviews", movie.id, "userReviews"), orderBy("createdAt", "desc")),
      (snapshot) => {
        const reviewsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setReviews(reviewsData);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [movie]);

  if (!movie) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Movie not found</h2>
          <Link to="/" className="text-purple-600 hover:text-purple-800">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const toggleFavorite = async () => {
    if (!user) {
      toast.error("Please login to add favorites");
      return;
    }

    try {
      if (isFavorite) {
        const fav = favorites.find((f) => f.id === movie.id);
        await updateDoc(doc(db, "users", user.uid), {
          favorites: arrayRemove(fav),
        });
        toast.success("Removed from favorites");
      } else {
        await updateDoc(doc(db, "users", user.uid), {
          favorites: arrayUnion({ id: movie.id, addedAt: new Date() }),
        });
        toast.success("Added to favorites");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const submitReview = async () => {
    if (!user) {
      toast.error("Please login to write a review");
      return;
    }

    if (!newReview.trim()) {
      toast.error("Please write a review");
      return;
    }

    try {
      await addDoc(collection(db, "reviews", movie.id, "userReviews"), {
        userId: user.uid,
        userName: auth.currentUser?.displayName || "Anonymous",
        rating: newRating,
        review: newReview.trim(),
        createdAt: serverTimestamp(),
      });
      toast.success("Review submitted!");
      setNewReview("");
      setNewRating(5);
      setShowReviewForm(false);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const shareMovie = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  const theatreShows = selectedTheatre ? movie.shows?.[selectedTheatre.id] || {} : {};

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-[70vh] min-h-[500px] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={movie.backdrop}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />
        </div>

        {/* Back Button */}
        <Link
          to="/"
          className="absolute top-24 left-4 md:left-8 z-10 flex items-center gap-2 text-white/80 hover:text-white transition-colors"
        >
          <FiChevronLeft />
          <span>Back</span>
        </Link>

        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8 items-end">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="hidden md:block w-64 flex-shrink-0"
            >
              <img
                src={movie.poster}
                alt={movie.title}
                className="w-full rounded-xl shadow-2xl"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex-1"
            >
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">{movie.title}</h1>

              <div className="flex flex-wrap items-center gap-4 text-white/80 mb-6">
                <span className="flex items-center gap-1">
                  <FiStar className="text-yellow-400" />
                  <span className="font-medium text-white">{movie.rating}</span>
                </span>
                <span className="flex items-center gap-1">
                  <FiClock size={16} />
                  {movie.duration}
                </span>
                <span className="flex items-center gap-1">
                  <FiCalendar size={16} />
                  {movie.year}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {movie.genre.map((g) => (
                  <span key={g} className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-sm text-white">
                    {g}
                  </span>
                ))}
              </div>

              <p className="text-white/80 mb-6 line-clamp-3">{movie.description}</p>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowTrailer(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors"
                >
                  <FiPlay />
                  Watch Trailer
                </button>
                <button
                  onClick={toggleFavorite}
                  className={`p-3 rounded-full transition-colors ${
                    isFavorite
                      ? "bg-red-500 text-white"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  <FiHeart className={isFavorite ? "fill-current" : ""} />
                </button>
                <button
                  onClick={shareMovie}
                  className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                >
                  <FiShare2 />
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Details & Reviews */}
          <div className="lg:col-span-2 space-y-8">
            {/* Cast */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Cast</h3>
              <div className="flex flex-wrap gap-4">
                {movie.cast?.map((actor, i) => (
                  <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-full px-4 py-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-medium">
                      {actor.charAt(0)}
                    </div>
                    <span className="text-gray-700">{actor}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Reviews ({reviews.length})</h3>
                <button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-full text-sm hover:bg-purple-700 transition-colors"
                >
                  Write Review
                </button>
              </div>

              {/* Review Form */}
              <AnimatePresence>
                {showReviewForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6 p-4 bg-gray-50 rounded-xl overflow-hidden"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-gray-700">Your Rating:</span>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setNewRating(star)}
                          className="text-2xl transition-colors"
                        >
                          <FiStar className={star <= newRating ? "text-yellow-400 fill-current" : "text-gray-300"} />
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={newReview}
                      onChange={(e) => setNewReview(e.target.value)}
                      placeholder="Share your thoughts..."
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      rows={3}
                    />
                    <div className="flex justify-end gap-3 mt-3">
                      <button
                        onClick={() => setShowReviewForm(false)}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-full"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={submitReview}
                        className="px-4 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700"
                      >
                        Submit
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Reviews List */}
              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review!</p>
                ) : (
                  reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {review.userName?.charAt(0) || "A"}
                          </div>
                          <span className="font-medium text-gray-900">{review.userName}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <FiStar
                              key={i}
                              className={i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"}
                              size={14}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-600">{review.review}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Booking */}
          <div className="space-y-6">
            {/* Theatre Selection */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Select Theatre</h3>
              <div className="space-y-3">
                {THEATRES.map((theatre) => (
                  <button
                    key={theatre.id}
                    onClick={() => {
                      setSelectedTheatre(theatre);
                      setSelectedDate(null);
                      setSelectedTime(null);
                    }}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      selectedTheatre?.id === theatre.id
                        ? "border-purple-500 bg-purple-50"
                        : "border-gray-200 hover:border-purple-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <FiMapPin className="text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{theatre.name}</p>
                        <p className="text-sm text-gray-500">{theatre.location}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Date Selection */}
            {selectedTheatre && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Select Date</h3>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {dates.map((date, i) => {
                    const dateStr = date.toISOString().split("T")[0];
                    const isSelected = selectedDate === dateStr;
                    return (
                      <button
                        key={i}
                        onClick={() => {
                          setSelectedDate(dateStr);
                          setSelectedTime(null);
                        }}
                        className={`flex-shrink-0 w-16 py-3 rounded-xl border-2 text-center transition-all ${
                          isSelected
                            ? "border-purple-500 bg-purple-50"
                            : "border-gray-200 hover:border-purple-300"
                        }`}
                      >
                        <p className="text-xs text-gray-500">{date.toLocaleDateString("en-US", { weekday: "short" })}</p>
                        <p className="font-bold text-gray-900">{date.getDate()}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Time Selection */}
            {selectedDate && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Select Time</h3>
                <div className="grid grid-cols-3 gap-2">
                  {getShowTimes(movie.id, selectedTheatre.id, selectedDate).map((time, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedTime(time)}
                      className={`py-3 rounded-xl border-2 font-medium transition-all ${
                        selectedTime === time
                          ? "border-purple-500 bg-purple-50 text-purple-600"
                          : "border-gray-200 hover:border-purple-300"
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Book Button */}
            {selectedTime && (
              <Link
                to={`/book/${movie.id}?theatre=${selectedTheatre.id}&date=${selectedDate}&time=${selectedTime}`}
                className="block w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-center font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg shadow-purple-500/30"
              >
                Book Tickets
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Trailer Modal */}
      <AnimatePresence>
        {showTrailer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setShowTrailer(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="w-full max-w-4xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="aspect-video bg-black rounded-xl overflow-hidden">
                <iframe
                  src={movie.trailer}
                  title="Trailer"
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MovieDetail;
