import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import MovieDetail from "./pages/MovieDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Favorites from "./pages/Favorites";
import Settings from "./pages/Settings";
import Theaters from "./pages/Theaters";
import AdminDashboard from "./pages/AdminDashboard";
import Booking from "./pages/Booking";
import { AuthProvider } from "./context/AuthContext";
import { BookingProvider } from "./context/BookingContext";

function App() {
  return (
    <AuthProvider>
      <BookingProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/movies" element={<Navigate to="/" replace />} />
              <Route path="/bookings" element={<Navigate to="/profile" replace />} />
              <Route path="/movie/:id" element={<MovieDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/theaters" element={<Theaters />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/book/:id" element={<Booking />} />
            </Routes>
          </div>
        </Router>
      </BookingProvider>
    </AuthProvider>
  );
}

export default App;
