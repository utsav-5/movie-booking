import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaFacebookF } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

import {
  GoogleAuthProvider,
  FacebookAuthProvider,
  createUserWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";

import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase";
import toast from "react-hot-toast";

const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password) {
      toast.error("Please fill in all fields");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const res = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      await setDoc(doc(db, "users", res.user.uid), {
        uid: res.user.uid,
        name: form.name,
        email: res.user.email,
        provider: "email",
        role: "user",
        createdAt: new Date(),
      });

      toast.success("Registration successful!");
      navigate("/");
    } catch (err) {
      toast.error(err.message);
      console.log(err.message);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const user = res.user;

      await setDoc(
        doc(db, "users", user.uid),
        {
          uid: user.uid,
          name: user.displayName,
          email: user.email,
          photo: user.photoURL,
          provider: "google",
          role: "user",
          createdAt: new Date(),
        },
        { merge: true }
      );

      toast.success("Login successful!");
      navigate("/");
    } catch (err) {
      toast.error(err.message);
      console.log(err.message);
    } finally {
      setLoading(false);
    }
  };

  const signInWithFacebook = async () => {
    setLoading(true);
    try {
      const res = await signInWithPopup(auth, facebookProvider);
      const user = res.user;

      await setDoc(
        doc(db, "users", user.uid),
        {
          uid: user.uid,
          name: user.displayName,
          email: user.email,
          photo: user.photoURL,
          provider: "facebook",
          role: "user",
          createdAt: new Date(),
        },
        { merge: true }
      );

      toast.success("Login successful!");
      navigate("/");
    } catch (err) {
      toast.error(err.message);
      console.log(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create account</h2>
        <p style={styles.subtitle}>Join CineBook and book movie tickets</p>

        <input
          type="text"
          placeholder="Full name"
          style={styles.input}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          type="email"
          placeholder="Email address"
          style={styles.input}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          type="password"
          placeholder="Password"
          style={styles.input}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button 
          style={styles.primaryBtn} 
          onClick={handleRegister}
          disabled={loading}
        >
          {loading ? "Creating account..." : "Create account"}
        </button>

        <div style={styles.divider}>
          <span>OR</span>
        </div>

        <button 
          style={styles.googleBtn} 
          onClick={signInWithGoogle}
          disabled={loading}
        >
          <FcGoogle size={18} />
          Continue with Google
        </button>

        <button 
          style={styles.facebookBtn} 
          onClick={signInWithFacebook}
          disabled={loading}
        >
          <FaFacebookF size={16} />
          Continue with Facebook
        </button>

        <p style={styles.footerText}>
          Already have an account?{" "}
          <Link to="/login" style={styles.link}>
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

const styles = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
    padding: "20px",
  },

  card: {
    width: "380px",
    padding: "32px",
    borderRadius: "16px",
    background: "rgba(255, 255, 255, 0.95)",
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
    textAlign: "center",
  },

  title: {
    marginBottom: "8px",
    fontSize: "26px",
    fontWeight: "700",
    color: "#1a1a2e",
  },

  subtitle: {
    marginBottom: "24px",
    color: "#64748b",
    fontSize: "14px",
  },

  input: {
    width: "100%",
    height: "48px",
    padding: "0 14px",
    marginBottom: "14px",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    fontSize: "15px",
    outline: "none",
    boxSizing: "border-box",
    backgroundColor: "#f8fafc",
  },

  primaryBtn: {
    width: "100%",
    height: "48px",
    marginTop: "8px",
    background: "linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "15px",
    transition: "transform 0.2s",
  },

  divider: {
    margin: "20px 0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#94a3b8",
    fontSize: "12px",
  },

  googleBtn: {
    width: "100%",
    height: "46px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    borderRadius: "10px",
    border: "1px solid #e5e7eb",
    background: "#fff",
    cursor: "pointer",
    fontWeight: "500",
    fontSize: "14px",
    transition: "transform 0.2s",
  },

  facebookBtn: {
    width: "100%",
    height: "46px",
    marginTop: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    borderRadius: "10px",
    border: "none",
    background: "#1877F2",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "500",
    fontSize: "14px",
    transition: "transform 0.2s",
  },

  footerText: {
    marginTop: "20px",
    fontSize: "14px",
    color: "#475569",
  },

  link: {
    color: "#7c3aed",
    fontWeight: "600",
    textDecoration: "none",
  },
};
