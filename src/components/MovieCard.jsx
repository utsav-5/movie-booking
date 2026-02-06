import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiHeart, FiStar, FiCalendar, FiClock } from "react-icons/fi";
import { doc, onSnapshot, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { auth, db } from "../config/firebase";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const MovieCard = ({ movie, index }) => {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    if (!user) return;

    const unsub = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
      if (docSnap.exists()) {
        setFavorites(docSnap.data().favorites || []);
        setIsFavorite(docSnap.data().favorites?.some((f) => f.id === movie.id));
      }
    });

    return () => unsub();
  }, [user, movie.id]);

  const toggleFavorite = async (e) => {
    e.preventDefault();
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
    >
      <Link to={`/movie/${movie.id}`}>
        <div className="aspect-[2/3] overflow-hidden relative">
          <img
            src={movie.poster}
            alt={movie.title}
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
          />
          
          {/* Rating Badge */}
          <div className="absolute top-3 left-3 flex items-center gap-1 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-lg">
            <FiStar className="text-yellow-400" size={12} />
            <span className="text-white text-xs font-medium">{movie.rating}</span>
          </div>

          {/* Genre Badge */}
          <div className="absolute top-3 right-3 bg-purple-600/90 backdrop-blur-sm px-2 py-1 rounded-lg">
            <span className="text-white text-xs font-medium">{movie.genre[0]}</span>
          </div>

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <button className="w-full py-2 bg-purple-600 text-white rounded-lg font-medium transform translate-y-2 group-hover:translate-y-0 transition-transform">
                Book Now
              </button>
            </div>
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-gray-900 truncate group-hover:text-purple-600 transition-colors">
            {movie.title}
          </h3>
          
          <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <FiCalendar size={14} />
              <span>{movie.year}</span>
            </div>
            <div className="flex items-center gap-1">
              <FiClock size={14} />
              <span>{movie.duration}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1 mt-2">
            {movie.genre.slice(0, 2).map((g) => (
              <span
                key={g}
                className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full"
              >
                {g}
              </span>
            ))}
          </div>
        </div>
      </Link>

      {/* Favorite Button */}
      <button
        onClick={toggleFavorite}
        className={`absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg transition-all transform hover:scale-110 ${
          isFavorite ? "text-red-500" : "text-gray-400 hover:text-red-500"
        }`}
      >
        <FiHeart className={isFavorite ? "fill-current" : ""} size={18} />
      </button>
    </motion.div>
  );
};

export default MovieCard;
