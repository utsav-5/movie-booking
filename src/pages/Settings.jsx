import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiMoon, FiSun, FiBell, FiLock, FiGlobe, FiHelpCircle } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const Settings = () => {
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState("en");

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
          onChange: () => {
            setDarkMode(!darkMode);
            toast.success(darkMode ? "Light mode enabled" : "Dark mode enabled");
          },
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
          onChange: () => {
            setNotifications(!notifications);
            toast.success(notifications ? "Notifications disabled" : "Notifications enabled");
          },
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
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 px-4">
        <div className="max-w-2xl mx-auto text-center py-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign in to access settings</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500">Customize your CineBook experience</p>
        </motion.div>

        <div className="space-y-6">
          {settingsSections.map((section, sectionIndex) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: sectionIndex * 0.1 }}
              className="bg-white rounded-2xl shadow-sm overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">{section.title}</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {section.items.map((item, index) => (
                  <div
                    key={item.title}
                    className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={item.onChange}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                        <item.icon className="text-gray-600" size={20} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{item.title}</p>
                        <p className="text-sm text-gray-500">{item.description}</p>
                      </div>
                    </div>
                    {item.toggle && (
                      <button
                        className={`w-12 h-6 rounded-full transition-colors ${
                          item.checked ? "bg-purple-600" : "bg-gray-300"
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
                      <span className="text-sm text-gray-500">{item.value}</span>
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
          className="mt-8 text-center text-gray-500 text-sm"
        >
          <p>CineBook v1.0.0</p>
          <p className="mt-1">© 2024 CineBook. All rights reserved.</p>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
