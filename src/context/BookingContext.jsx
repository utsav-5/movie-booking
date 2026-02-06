import { createContext, useContext, useState } from 'react';
import { db } from '../config/firebase';
import { collection, addDoc, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

const BookingContext = createContext();

export const useBooking = () => useContext(BookingContext);

export const BookingProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);

  const createBooking = async (bookingData) => {
    try {
      const docRef = await addDoc(collection(db, 'bookings'), {
        ...bookingData,
        userId: currentUser.uid,
        createdAt: new Date(),
        status: 'confirmed'
      });
      toast.success('Booking confirmed!');
      return { success: true, id: docRef.id };
    } catch (error) {
      toast.error('Failed to create booking');
      return { success: false, error };
    }
  };

  const getUserBookings = async () => {
    if (!currentUser) return [];
    try {
      const q = query(collection(db, 'bookings'), where('userId', '==', currentUser.uid));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      toast.error('Failed to fetch bookings');
      return [];
    }
  };

  const cancelBooking = async (bookingId) => {
    try {
      await updateDoc(doc(db, 'bookings', bookingId), { status: 'cancelled' });
      toast.success('Booking cancelled');
      return { success: true };
    } catch (error) {
      toast.error('Failed to cancel booking');
      return { success: false, error };
    }
  };

  const resetBooking = () => {
    setSelectedMovie(null);
    setSelectedShowtime(null);
    setSelectedSeats([]);
  };

  const value = {
    selectedMovie,
    setSelectedMovie,
    selectedShowtime,
    setSelectedShowtime,
    selectedSeats,
    setSelectedSeats,
    createBooking,
    getUserBookings,
    cancelBooking,
    resetBooking
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};
