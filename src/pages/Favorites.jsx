import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiHeart, FiTrash2, FiPlus, FiArrowRight } from "react-icons/fi";
import { doc, onSnapshot, updateDoc, arrayRemove } from "firebase/firestore";
import { auth, db } from "../config/firebase";
import { useAuth } from "../context/AuthContext";
import { MOVIES } from "../data/movies";
import toast from "react-hot-toast";

const Favorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const unsub = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
      if (docSnap.exists()) {
        setFavorites(docSnap.data().favorites || []);
      }
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  const removeFromFavorites = async (movieId) => {
    if (!user) {
      toast.error("Please login to manage favorites");
      return;
    }

    try {
      const movie = favorites.find((f) => f.id === movieId);
      await updateDoc(doc(db, "users", user.uid), {
        favorites: arrayRemove(movie),
      });
      toast.success("Removed from favorites");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getFavoriteMovies = () => {
    return favorites.map((fav) => MOVIES.find((m) => m.id === fav.id)).filter(Boolean);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 px-4">
        <div className="max-w-4xl mx-auto text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 bg-purple-100 rounded-full flex items-center justify-center">
            <FiHeart className="text-purple-600 text-4xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign in to view favorites</h2>
          <p className="text-gray-500 mb-8">Save your favorite movies and book them easily</p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors"
          >
            Sign In
            <FiArrowRight />
          </Link>
        </div>
      </div>
    );
  }

  const favoriteMovies = getFavoriteMovies();

  return (
    <div className="min-h-screen bg-gray-50 pt-24 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Favorites</h1>
          <p className="text-gray-500">Your saved movies ({favorites.length})</p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                <div className="aspect-[2/3] bg-gray-200 animate-pulse" />
                <div className="p-4">
                  <div className="h-5 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : favoriteMovies.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <FiHeart className="text-gray-400 text-3xl" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No favorites yet</h3>
            <p className="text-gray-500 mb-6">Start adding movies to your favorites list</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors"
            >
              <FiPlus />
              Browse Movies
            </Link>
          </motion.div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <AnimatePresence>
              {favoriteMovies.map((movie, index) => (
                <motion.div
                  key={movie.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  <Link to={`/movie/${movie.id}`}>
                    <div className="aspect-[2/3] overflow-hidden">
                      <img
                        src={movie.poster}
                        alt={movie.title}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 truncate">{movie.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-gray-500">{movie.year}</span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full" />
                        <span className="text-sm text-gray-500">{movie.duration}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-2">
                        <span className="text-yellow-500">★</span>
                        <span className="text-sm font-medium">{movie.rating}</span>
                      </div>
                    </div>
                  </Link>

                  <button
                    onClick={() => removeFromFavorites(movie.id)}
                    className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-red-500 shadow-lg opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110"
                  >
                    <FiTrash2 />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
