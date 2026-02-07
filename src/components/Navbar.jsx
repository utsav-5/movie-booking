import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../config/firebase";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { 
  FiSearch, FiX, FiUser, FiLogOut, FiHeart, FiSettings, 
  FiBell, FiMenu, FiHome, FiFilm, FiMapPin
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const { currentUser, userProfile, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const searchRef = useRef(null);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle click outside for search
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearch(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setShowUserMenu(false);
  }, [location]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearch(false);
      setSearchQuery("");
    }
  };

  const navClass = `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
    isScrolled 
      ? "bg-white/95 backdrop-blur-md shadow-lg py-3" 
      : "bg-gradient-to-b from-black/80 to-transparent py-5"
  }`;

  const linkClass = `text-sm font-medium transition-colors duration-200 ${
    isScrolled 
      ? "text-gray-800 hover:text-purple-600" 
      : "text-white hover:text-purple-400"
  }`;

  const navLinks = [
    { path: "/", label: "Home", icon: FiHome },
    { path: "/movies", label: "Movies", icon: FiFilm },
    { path: "/theaters", label: "Theaters", icon: FiMapPin },
  ];

  return (
    <nav className={navClass}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className={`font-bold text-xl hidden sm:block ${
              isScrolled ? "text-gray-900" : "text-white"
            }`}>
              CineBook
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`${linkClass} px-4 py-2 rounded-lg hover:bg-white/10`}
              >
                {link.label}
              </Link>
            ))}
            {userProfile?.role === "admin" && (
              <Link
                to="/admin"
                className={`${linkClass} px-4 py-2 rounded-lg hover:bg-white/10`}
              >
                Admin
              </Link>
            )}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Search Button (Mobile) / Search Bar (Desktop) */}
            <div className="relative" ref={searchRef}>
              {showSearch ? (
                <form onSubmit={handleSearch} className="absolute right-0 top-1/2 -translate-y-1/2 w-64">
                  <input
                    type="text"
                    placeholder="Search movies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`pl-10 pr-10 py-2 rounded-full border-2 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      isScrolled 
                        ? "bg-gray-100 border-gray-200 text-gray-800" 
                        : "bg-white/20 border-white/30 text-white placeholder-white/70"
                    }`}
                    autoFocus
                  />
                  <FiSearch className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                    isScrolled ? "text-gray-400" : "text-white/70"
                  }`} />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                        isScrolled ? "text-gray-400" : "text-white/70"
                      }`}
                    >
                      <FiX />
                    </button>
                  )}
                </form>
              ) : (
                <button
                  onClick={() => setShowSearch(true)}
                  className={`p-2 rounded-full transition-colors ${
                    isScrolled 
                      ? "text-gray-600 hover:bg-gray-100" 
                      : "text-white/80 hover:bg-white/10"
                  }`}
                >
                  <FiSearch className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Notifications (when logged in) */}
            {currentUser && (
              <button
                className={`p-2 rounded-full transition-colors relative ${
                  isScrolled ? "text-gray-600 hover:bg-gray-100" : "text-white/80 hover:bg-white/10"
                }`}
              >
                <FiBell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            )}

            {/* User Menu / Auth Buttons */}
            {currentUser ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className={`flex items-center gap-2 p-1 rounded-full transition-colors ${
                    isScrolled ? "hover:bg-gray-100" : "hover:bg-white/10"
                  }`}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    {currentUser.photoURL ? (
                      <img 
                        src={currentUser.photoURL} 
                        alt="User" 
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-white text-sm font-medium">
                        {currentUser.displayName?.charAt(0) || currentUser.email?.charAt(0) || 'U'}
                      </span>
                    )}
                  </div>
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">
                          {currentUser.displayName || 'User'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {currentUser.email}
                        </p>
                      </div>
                      
                      <Link
                        to="/profile"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <FiUser className="w-4 h-4" />
                        My Profile
                      </Link>
                      
                      <Link
                        to="/bookings"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <FiFilm className="w-4 h-4" />
                        My Bookings
                      </Link>
                      
                      <Link
                        to="/favorites"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <FiHeart className="w-4 h-4" />
                        Favorites
                      </Link>
                      
                      <Link
                        to="/settings"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <FiSettings className="w-4 h-4" />
                        Settings
                      </Link>
                      
                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full transition-colors"
                        >
                          <FiLogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isScrolled 
                      ? "text-gray-700 hover:bg-gray-100" 
                      : "text-white hover:bg-white/10"
                  }`}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`md:hidden p-2 rounded-lg transition-colors ${
                isScrolled 
                  ? "text-gray-600 hover:bg-gray-100" 
                  : "text-white hover:bg-white/10"
              }`}
            >
              {isMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-100"
          >
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <link.icon className="w-5 h-5" />
                  {link.label}
                </Link>
              ))}
              {currentUser && (
                <>
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FiUser className="w-5 h-5" />
                    Profile
                  </Link>
                  <Link
                    to="/bookings"
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FiFilm className="w-5 h-5" />
                    My Bookings
                  </Link>
                  <Link
                    to="/favorites"
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FiHeart className="w-5 h-5" />
                    Favorites
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <FiLogOut className="w-5 h-5" />
                    Logout
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
