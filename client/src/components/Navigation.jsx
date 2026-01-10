import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Github, User, LogOut, Home, FileText } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navigation = ({ showAuth = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    navigate("/");
  };

  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate(isAuthenticated ? "/home" : "/")}
        >
          <div className="bg-slate-900 text-white p-1.5 rounded-lg">
            <span className="font-bold text-lg leading-none">R</span>
          </div>
          <span className="font-bold text-xl tracking-tight">ReadMeAI</span>
        </motion.div>

        {showAuth && isAuthenticated ? (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <div className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-600">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/home")}
                className={`px-3 py-2 rounded-lg hover:text-slate-900 transition-colors flex items-center gap-2 ${
                  location.pathname === "/home" ? "bg-slate-100 text-slate-900" : ""
                }`}
              >
                <Home size={16} />
                Repositories
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/profile")}
                className={`px-3 py-2 rounded-lg hover:text-slate-900 transition-colors flex items-center gap-2 ${
                  location.pathname === "/profile" ? "bg-slate-100 text-slate-900" : ""
                }`}
              >
                <FileText size={16} />
                Active Repos
              </motion.button>
            </div>

            <div className="relative" ref={dropdownRef}>
              {user?.avatarUrl ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="w-10 h-10 rounded-full overflow-hidden border-2 border-slate-200 hover:border-slate-300 transition-all shadow-lg shadow-slate-200"
                >
                  <img
                    src={user.avatarUrl}
                    alt={user.githubUsername || "User"}
                    className="w-full h-full object-cover"
                  />
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="bg-slate-900 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                >
                  <User size={18} />
                </motion.button>
              )}

              <AnimatePresence>
                {showDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden"
                  >
                    <div className="p-4 border-b border-slate-100">
                      <div className="flex items-center gap-3 mb-2">
                        {user?.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt={user.githubUsername || "User"}
                            className="w-12 h-12 rounded-full border-2 border-slate-200"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center">
                            <User size={24} />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate">
                            {user?.githubUsername || "User"}
                          </p>
                          <p className="text-xs text-slate-500">
                            GitHub Account
                          </p>
                        </div>
                      </div>
                      {user?.githubId && (
                        <p className="text-xs text-slate-400 mt-2">
                          ID: {user.githubId}
                        </p>
                      )}
                    </div>
                    <motion.button
                      whileHover={{ backgroundColor: "rgb(248 250 252)" }}
                      onClick={handleLogout}
                      className="w-full px-4 py-3 text-left text-sm text-slate-700 transition-colors flex items-center gap-2"
                    >
                      <LogOut size={16} />
                      Logout
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ) : (
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            {["How it works", "Features", "Security"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                className="hover:text-slate-900 transition-colors relative group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-slate-900 transition-all group-hover:w-full" />
              </a>
            ))}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/login")}
              className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
            >
              <Github size={18} />
              Connect GitHub
            </motion.button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
