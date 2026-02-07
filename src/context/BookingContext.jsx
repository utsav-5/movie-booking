import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { db } from '../config/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  doc,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

const BookingContext = createContext();

export const useBooking = () => useContext(BookingContext);

export const BookingProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch user bookings when user changes
  useEffect(() => {
    if (currentUser) {
      fetchUserBookings();
    } else {
      setBookings([]);
    }
  }, [currentUser]);

  const fetchUserBookings = useCallback(async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      const q = query(
        collection(db, 'bookings'), 
        where('userId', '==', currentUser.uid)
      );
      const snapshot = await getDocs(q);
      const bookingsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      }));
      // Sort locally instead of using Firestore index
      bookingsData.sort((a, b) => b.createdAt - a.createdAt);
      setBookings(bookingsData);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const createBooking = async (bookingData) => {
    if (!currentUser) {
      toast.error('Please log in to book tickets');
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const docRef = await addDoc(collection(db, 'bookings'), {
        ...bookingData,
        userId: currentUser.uid,
        userEmail: currentUser.email,
        createdAt: serverTimestamp(),
        status: 'confirmed',
        paymentStatus: 'pending'
      });

      // Add to local state
      const newBooking = {
        id: docRef.id,
        ...bookingData,
        userId: currentUser.uid,
        status: 'confirmed',
        paymentStatus: 'pending',
        createdAt: new Date()
      };
      setBookings(prev => [newBooking, ...prev]);

      toast.success('Booking confirmed! Proceed to payment.');
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('Failed to create booking');
      return { success: false, error: error.message };
    }
  };

  const cancelBooking = async (bookingId) => {
    try {
      await updateDoc(doc(db, 'bookings', bookingId), { 
        status: 'cancelled',
        cancelledAt: serverTimestamp()
      });

      // Update local state
      setBookings(prev => prev.map(b => 
        b.id === bookingId 
          ? { ...b, status: 'cancelled' }
          : b
      ));

      toast.success('Booking cancelled successfully');
      return { success: true };
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Failed to cancel booking');
      return { success: false, error: error.message };
    }
  };

  const updateBookingStatus = async (bookingId, status, paymentStatus = null) => {
    try {
      const updateData = { status };
      if (paymentStatus) updateData.paymentStatus = paymentStatus;
      
      await updateDoc(doc(db, 'bookings', bookingId), updateData);

      // Update local state
      setBookings(prev => prev.map(b => 
        b.id === bookingId 
          ? { ...b, ...updateData }
          : b
      ));

      return { success: true };
    } catch (error) {
      console.error('Error updating booking:', error);
      return { success: false, error: error.message };
    }
  };

  const getBookingById = useCallback(async (bookingId) => {
    try {
      const bookingDoc = await getDocs(query(
        collection(db, 'bookings'),
        where('__name__', '==', bookingId),
        where('userId', '==', currentUser?.uid)
      ));

      if (!bookingDoc.empty) {
        const doc = bookingDoc.docs[0];
        return { id: doc.id, ...doc.data() };
      }
      return null;
    } catch (error) {
      console.error('Error fetching booking:', error);
      return null;
    }
  }, [currentUser]);

  const getUpcomingBookings = useCallback(() => {
    const now = new Date();
    return bookings.filter(b => 
      b.status === 'confirmed' && 
      new Date(b.showDate) >= now
    );
  }, [bookings]);

  const getPastBookings = useCallback(() => {
    const now = new Date();
    return bookings.filter(b => 
      b.status === 'cancelled' || 
      new Date(b.showDate) < now
    );
  }, [bookings]);

  const calculateTotalPrice = (seats, pricePerSeat = 150) => {
    return seats.length * pricePerSeat;
  };

  const resetBooking = () => {
    setSelectedMovie(null);
    setSelectedShowtime(null);
    setSelectedSeats([]);
  };

  const toggleSeat = (seat) => {
    setSelectedSeats(prev => {
      const isSelected = prev.find(s => s.id === seat.id);
      if (isSelected) {
        return prev.filter(s => s.id !== seat.id);
      } else {
        return [...prev, seat];
      }
    });
  };

  const clearSelectedSeats = () => {
    setSelectedSeats([]);
  };

  const value = {
    selectedMovie,
    setSelectedMovie,
    selectedShowtime,
    setSelectedShowtime,
    selectedSeats,
    setSelectedSeats,
    bookings,
    loading,
    createBooking,
    fetchUserBookings,
    cancelBooking,
    updateBookingStatus,
    getBookingById,
    getUpcomingBookings,
    getPastBookings,
    calculateTotalPrice,
    resetBooking,
    toggleSeat,
    clearSelectedSeats
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};
