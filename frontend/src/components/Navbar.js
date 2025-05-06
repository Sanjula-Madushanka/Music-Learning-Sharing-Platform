import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FiHome, FiUpload, FiMusic, FiSearch } from "react-icons/fi";
import { MdLibraryMusic } from "react-icons/md";

const Navbar = () => {
  const location = useLocation();

  // Check if current route matches
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-xl">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo/Brand */}
        <Link
          to="/"
          className="flex items-center space-x-3 hover:opacity-90 transition-opacity"
        >
          <MdLibraryMusic className="text-3xl text-purple-400" />
          <span className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500">
            Melodify
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center space-x-2">
          <Link
            to="/"
            className={`flex items-center px-4 py-2 rounded-full transition-all ${
              isActive("/")
                ? "bg-purple-600 text-white shadow-md"
                : "text-gray-300 hover:bg-gray-700 hover:text-white"
            }`}
          >
            <FiHome className="mr-2" />
            Home
          </Link>

          <Link
            to="/upload"
            className={`flex items-center px-4 py-2 rounded-full transition-all ${
              isActive("/upload")
                ? "bg-green-600 text-white shadow-md"
                : "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-md"
            }`}
          >
            <FiUpload className="mr-2" />
            Upload
          </Link>
        </div>

        {/* User Profile (placeholder) */}
        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center cursor-pointer hover:bg-gray-600 transition-colors">
          <span className="text-lg font-semibold">U</span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
