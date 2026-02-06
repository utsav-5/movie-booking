import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiMoon, FiSun, FiBell, FiLock, FiGlobe, FiHelpCircle, FiUser } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase";

const Settings = () => {
  const { user, userData } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState("en");

  // Load dark mode preference
  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDarkMode = async () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode.toString());
    
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
      toast.success("Dark mode enabled", { icon: "🌙" });
    } else {
      document.documentElement.classList.remove("dark");
      toast.success("Light mode enabled", { icon: "☀️" });
    }

    // Save preference to Firebase if user is logged in
    if (user) {
      try {
        await updateDoc(doc(db, "users", user.uid), {
          darkMode: newDarkMode,
        });
      } catch (error) {
        console.error("Error saving dark mode preference:", error);
      }
    }
  };

  const toggleNotifications = () => {
    setNotifications(!notifications);
    toast.success(notifications ? "Notifications disabled" : "Notifications enabled");
  };

  const settingsSections = [
    {
      title: "Appearance",
      items: [
        {
          icon: darkMode ? FiSun : FiMoon,
          title: "Dark Mode",
          description: "Toggle dark mode theme",
          toggle: true,
          checked: darkMode,
          onChange: toggleDarkMode,
        },
      ],
    },
    {
      title: "Notifications",
      items: [
        {
          icon: FiBell,
          title: "Push Notifications",
          description: "Receive booking confirmations and updates",
          toggle: true,
          checked: notifications,
          onChange: toggleNotifications,
        },
      ],
    },
    {
      title: "Preferences",
      items: [
        {
          icon: FiGlobe,
          title: "Language",
          description: "Select your preferred language",
          value: language === "en" ? "English" : "हिन्दी",
          onClick: () => {
            setLanguage(language === "en" ? "hi" : "en");
            toast.success(`Language changed to ${language === "en" ? "English" : "हिन्दी"}`);
          },
        },
        {
          icon: FiLock,
          title: "Privacy",
          description: "Manage your privacy settings",
        },
        {
          icon: FiHelpCircle,
          title: "Help & Support",
          description: "Get help with using CineBook",
        },
      ],
    },
    {
      title: "Account",
      items: [
        {
          icon: FiUser,
          title: "Edit Profile",
          description: "Update your profile information",
          onClick: () => {
            toast.success("Redirecting to profile...");
          },
        },
      ],
    },
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 px-4">
        <div className="max-w-2xl mx-auto text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
            <FiUser className="text-purple-600 dark:text-purple-400 text-4xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Sign in to access settings</h2>
          <p className="text-gray-500 dark:text-gray-400">Customize your CineBook experience</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-500 dark:text-gray-400">Customize your CineBook experience</p>
        </motion.div>

        <div className="space-y-6">
          {settingsSections.map((section, sectionIndex) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: sectionIndex * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                <h2 className="font-semibold text-gray-900 dark:text-white">{section.title}</h2>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {section.items.map((item) => (
                  <div
                    key={item.title}
                    className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                    onClick={item.onClick}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                        <item.icon className="text-gray-600 dark:text-gray-400" size={20} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{item.title}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
                      </div>
                    </div>
                    {item.toggle && (
                      <button
                        className={`w-12 h-6 rounded-full transition-colors ${
                          item.checked ? "bg-purple-600" : "bg-gray-300 dark:bg-gray-600"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          item.onChange();
                        }}
                      >
                        <div
                          className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                            item.checked ? "translate-x-6" : "translate-x-0.5"
                          }`}
                        />
                      </button>
                    )}
                    {item.value && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">{item.value}</span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* App Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center text-gray-500 dark:text-gray-400 text-sm"
        >
          <p>CineBook v1.0.0</p>
          <p className="mt-1">© 2024 CineBook. All rights reserved.</p>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
