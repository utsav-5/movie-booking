import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiSearch, FiFilter, FiX, FiStar, FiTrendingUp, FiCalendar } from "react-icons/fi";
import { MOVIES, THEATRES } from "../data/movies";
import MovieCard from "../components/MovieCard";

const GENRES = [
  "All",
  "Action",
  "Adventure",
  "Animation",
  "Comedy",
  "Crime",
  "Drama",
  "Fantasy",
  "Horror",
  "Mystery",
  "Romance",
  "Sci-Fi",
  "Thriller",
];

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [sortBy, setSortBy] = useState("popularity");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // Simulate loading
    setLoading(true);
    const timer = setTimeout(() => {
      setMovies(MOVIES);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const search = searchParams.get("search");
    if (search) {
      setSearchQuery(search);
      setSelectedGenre("All");
    }
  }, [searchParams]);

  const filteredMovies = useMemo(() => {
    let result = [...movies];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (movie) =>
          movie.title.toLowerCase().includes(query) ||
          movie.genre.some((g) => g.toLowerCase().includes(query)) ||
          movie.cast?.some((c) => c.toLowerCase().includes(query))
      );
    }

    // Genre filter
    if (selectedGenre !== "All") {
      result = result.filter((movie) => movie.genre.includes(selectedGenre));
    }

    // Sorting
    switch (sortBy) {
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "release":
        result.sort((a, b) => b.year - a.year);
        break;
      case "title":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        // Popularity - keep original order
        break;
    }

    return result;
  }, [movies, searchQuery, selectedGenre, sortBy]);

  const handleGenreChange = (genre) => {
    setSelectedGenre(genre);
    setSearchQuery("");
  };

  const clearFilters = () => {
    setSelectedGenre("All");
    setSortBy("popularity");
    setSearchQuery("");
    setSearchParams({});
  };

  const hasActiveFilters = searchQuery || selectedGenre !== "All" || sortBy !== "popularity";

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-purple-900 via-purple-800 to-pink-700 pt-32 pb-16 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 w-72 h-72 bg-purple-500 rounded-full filter blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-pink-500 rounded-full filter blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-white mb-4"
          >
            Discover Amazing Movies
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-purple-200 text-lg max-w-2xl mx-auto mb-8"
          >
            Book your perfect movie experience with CineBook
          </motion.p>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto relative"
          >
            <input
              type="text"
              placeholder="Search movies, genres, actors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 pl-12 pr-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
            />
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 text-xl" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
              >
                <FiX />
              </button>
            )}
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          {/* Genre Pills */}
          <div className="flex flex-wrap gap-2">
            {GENRES.slice(0, 8).map((genre) => (
              <button
                key={genre}
                onClick={() => handleGenreChange(genre)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedGenre === genre
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-500/30"
                    : "bg-white text-gray-700 hover:bg-purple-50 hover:text-purple-600 border border-gray-200"
                }`}
              >
                {genre}
              </button>
            ))}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 rounded-full text-sm font-medium bg-white text-gray-700 hover:bg-purple-50 border border-gray-200 flex items-center gap-2"
            >
              <FiFilter size={14} />
              More
            </button>
          </div>

          {/* Sort & Active Filters */}
          <div className="flex items-center gap-4">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-purple-600 hover:text-purple-800 font-medium"
              >
                Clear all
              </button>
            )}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 rounded-full bg-white border border-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="popularity">Popular</option>
              <option value="rating">Top Rated</option>
              <option value="release">Newest</option>
              <option value="title">A-Z</option>
            </select>
          </div>
        </div>

        {/* Extended Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 bg-white rounded-xl shadow-sm border border-gray-100"
            >
              <div className="flex flex-wrap gap-2">
                {GENRES.slice(8).map((genre) => (
                  <button
                    key={genre}
                    onClick={() => {
                      handleGenreChange(genre);
                      setShowFilters(false);
                    }}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      selectedGenre === genre
                        ? "bg-purple-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Count */}
        <div className="flex items-center gap-2 mb-6">
          <FiTrendingUp className="text-purple-600" />
          <span className="text-gray-600">
            <span className="font-semibold text-gray-900">{filteredMovies.length}</span> movies found
          </span>
          {searchQuery && (
            <span className="text-gray-500">for "{searchQuery}"</span>
          )}
        </div>

        {/* Loading Skeletons */}
        {loading && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                <div className="aspect-[2/3] bg-gray-200 animate-pulse" />
                <div className="p-4">
                  <div className="h-5 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Movies Grid */}
        {!loading && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <AnimatePresence>
              {filteredMovies.map((movie, index) => (
                <motion.div
                  key={movie.id}
                  variants={itemVariants}
                  layout
                  transition={{ duration: 0.3 }}
                >
                  <MovieCard movie={movie} index={index} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && filteredMovies.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <FiSearch className="text-gray-400 text-3xl" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No movies found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
            <button
              onClick={clearFilters}
              className="px-6 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors"
            >
              Clear filters
            </button>
          </motion.div>
        )}

        {/* Featured Theaters */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Theaters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {THEATRES.slice(0, 3).map((theater, index) => (
              <motion.div
                key={theater.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-6 text-white"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold mb-1">{theater.name}</h3>
                    <p className="text-purple-200">{theater.location}</p>
                  </div>
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <FiStar className="text-yellow-300" />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-purple-200">
                  <FiCalendar />
                  <span>Available shows: {MOVIES.filter(m => m.shows?.[theater.id]).length}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
