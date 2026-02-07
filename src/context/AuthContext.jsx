import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth, db } from '../config/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile from Firestore
  const fetchUserProfile = useCallback(async (user) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setUserProfile(userDoc.data());
      } else {
        // Create default profile
        const defaultProfile = {
          email: user.email,
          displayName: user.displayName || 'User',
          role: 'user',
          preferences: { notifications: true, newsletter: false }
        };
        await setDoc(doc(db, 'users', user.uid), defaultProfile);
        setUserProfile(defaultProfile);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Set minimal profile on error
      setUserProfile({ email: user.email, displayName: user.displayName || 'User', role: 'user' });
    }
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    let mounted = true;
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (mounted) {
        if (user) {
          setCurrentUser(user);
          await fetchUserProfile(user);
        } else {
          setCurrentUser(null);
          setUserProfile(null);
        }
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [fetchUserProfile]);

  const signup = async (email, password, userData) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: userData.displayName });
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        ...userData,
        email,
        role: 'user',
        preferences: { notifications: true, newsletter: false }
      });
      toast.success('Account created successfully!');
      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      const message = getErrorMessage(error.code);
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const login = async (email, password) => {
    try {
      console.log('Attempting login for:', email);
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('Login successful:', result.user.uid);
      toast.success('Welcome back!');
      return { success: true };
    } catch (error) {
      console.error('Login error:', error.code, error.message);
      const message = getErrorMessage(error.code);
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUserProfile(null);
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent!');
      return { success: true };
    } catch (error) {
      const message = getErrorMessage(error.code);
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const googleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Check if user profile exists, if not create it
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', result.user.uid), {
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          role: 'user',
          preferences: { notifications: true, newsletter: false },
          createdAt: new Date()
        });
      }
      
      toast.success('Welcome!');
      return { success: true };
    } catch (error) {
      console.error('Google login error:', error);
      const message = getErrorMessage(error.code);
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const getErrorMessage = (code) => {
    const messages = {
      'auth/user-not-found': 'No account found with this email',
      'auth/wrong-password': 'Incorrect password',
      'auth/email-already-in-use': 'An account with this email already exists',
      'auth/weak-password': 'Password should be at least 6 characters',
      'auth/invalid-email': 'Invalid email address',
      'auth/too-many-requests': 'Too many attempts. Please try again later',
      'auth/network-request-failed': 'Network error. Please check your connection',
      'auth/popup-closed-by-user': 'Sign-in was closed',
      'auth/user-disabled': 'This account has been disabled'
    };
    return messages[code] || 'An error occurred. Please try again.';
  };

  const value = {
    currentUser,
    userProfile,
    loading,
    signup,
    login,
    logout,
    resetPassword,
    googleLogin
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
