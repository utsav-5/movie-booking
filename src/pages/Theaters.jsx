import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiMapPin, FiStar, FiCalendar, FiPhone, FiNavigation } from "react-icons/fi";
import { THEATRES, MOVIES } from "../data/movies";

const Theaters = () => {
  const [selectedLocation, setSelectedLocation] = useState("All");

  const locations = ["All", ...new Set(THEATRES.map((t) => t.location))];

  const filteredTheatres = useMemo(() => {
    if (selectedLocation === "All") return THEATRES;
    return THEATRES.filter((t) => t.location === selectedLocation);
  }, [selectedLocation]);

  const getTheatreShows = (theatreId) => {
    return MOVIES.filter((m) => m.shows?.[theatreId]).length;
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Our Theaters</h1>
          <p className="text-gray-500">Find a theater near you</p>
        </motion.div>

        {/* Location Filter */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {locations.map((location) => (
            <button
              key={location}
              onClick={() => setSelectedLocation(location)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                selectedLocation === location
                  ? "bg-purple-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              {location}
            </button>
          ))}
        </div>

        {/* Theaters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTheatres.map((theatre, index) => (
            <motion.div
              key={theatre.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="h-40 bg-gradient-to-br from-purple-600 to-pink-600 p-6 text-white">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-1">{theatre.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-purple-200">
                      <FiMapPin size={14} />
                      <span>{theatre.location}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-lg">
                    <FiStar className="text-yellow-300" size={14} />
                    <span className="text-sm font-medium">4.5</span>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <p className="text-2xl font-bold text-purple-600">{getTheatreShows(theatre.id)}</p>
                    <p className="text-sm text-gray-500">Movies Today</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <p className="text-2xl font-bold text-purple-600">12</p>
                    <p className="text-sm text-gray-500">Screens</p>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-gray-600">
                    <FiPhone size={16} className="text-purple-600" />
                    <span className="text-sm">{theatre.phone || "+1 234 567 8900"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <FiCalendar size={16} className="text-purple-600" />
                    <span className="text-sm">Open Daily: 9:00 AM - 2:00 AM</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors">
                    <FiNavigation size={16} />
                    Directions
                  </button>
                  <Link
                    to={`/?theatre=${theatre.id}`}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 border-2 border-purple-600 text-purple-600 rounded-xl font-medium hover:bg-purple-50 transition-colors"
                  >
                    View Movies
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Map Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 bg-white rounded-2xl p-6 shadow-sm"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">Find Us</h2>
          <div className="h-80 bg-gray-100 rounded-xl flex items-center justify-center">
            <div className="text-center text-gray-500">
              <FiMapPin size={48} className="mx-auto mb-2 text-purple-600" />
              <p>Interactive map coming soon</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Theaters;
