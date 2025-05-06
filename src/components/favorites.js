import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { 
  FiMusic, 
  FiStar, 
  FiHome, 
  FiUpload, 
  FiPlus,
  FiUser,
  FiClock
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import axios from 'axios';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Load favorites from localStorage and fetch their full data
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        // Get favorite IDs from localStorage
        const storedFavorites = localStorage.getItem('musicAppFavorites');
        if (!storedFavorites || JSON.parse(storedFavorites).length === 0) {
          setFavorites([]);
          setLoading(false);
          return;
        }

        const favoriteIds = JSON.parse(storedFavorites);
        
        // Fetch all music to get full favorite tracks
        const response = await axios.get('http://localhost:8080/api/music');
        const allMusic = response.data;
        
        // Filter to only include favorites
        const favoriteTracks = allMusic.filter(track => 
          favoriteIds.includes(track.id)
        );
        
        setFavorites(favoriteTracks);
      } catch (err) {
        console.error('Error fetching favorites:', err);
        setError('Failed to load favorites');
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  const toggleFavorite = (id) => {
    const newFavorites = favorites.filter(track => track.id !== id);
    setFavorites(newFavorites);
    
    // Update localStorage
    const updatedIds = newFavorites.map(track => track.id);
    localStorage.setItem('musicAppFavorites', JSON.stringify(updatedIds));
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="h-16 w-16 rounded-full border-t-4 border-b-4 border-indigo-500"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="text-center p-8 rounded-2xl bg-gray-800/30 backdrop-blur-sm">
          <h3 className="text-2xl font-medium mb-2">Error Loading Favorites</h3>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 to-gray-800 text-white overflow-hidden pt-20">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 bg-gray-900/80 backdrop-blur-md z-50 border-b border-gray-700/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center text-white hover:text-indigo-400 transition-colors">
                <FiMusic className="h-6 w-6 mr-2" />
                <span className="text-xl font-bold">MelodicStream</span>
              </Link>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <NavLink 
                to="/" 
                className={({ isActive }) => 
                  `flex items-center px-1 text-sm font-medium ${isActive ? 'text-indigo-400' : 'text-gray-300 hover:text-white'} transition-colors`
                }
              >
                <FiHome className="mr-2" /> Home
              </NavLink>
              <NavLink 
                to="/upload" 
                className={({ isActive }) => 
                  `flex items-center px-1 text-sm font-medium ${isActive ? 'text-indigo-400' : 'text-gray-300 hover:text-white'} transition-colors`
                }
              >
                <FiUpload className="mr-2" /> Upload
              </NavLink>
              <NavLink 
                to="/favorites" 
                className={({ isActive }) => 
                  `flex items-center px-1 text-sm font-medium ${isActive ? 'text-indigo-400' : 'text-gray-300 hover:text-white'} transition-colors`
                }
              >
                <FiStar className="mr-2" /> Favorites
              </NavLink>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div className="relative z-10 h-full w-full flex flex-col pt-4">
        {/* Header */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-2">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-pink-400">
              Your Favorites
            </span>
          </h1>
          <p className="text-gray-400">
            Your favorite tracks collection
          </p>
        </motion.div>

        {/* Favorites grid */}
        {favorites.length === 0 ? (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex-1 flex items-center justify-center"
          >
            <div className="text-center p-8 rounded-2xl bg-gray-800/30 backdrop-blur-sm">
              <FiStar className="mx-auto text-5xl text-amber-400 mb-4" />
              <h3 className="text-2xl font-medium mb-2">
                No favorites yet
              </h3>
              <p className="text-gray-400 mb-4">
                Mark songs as favorites to see them here
              </p>
              <button 
                onClick={() => navigate('/')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
              >
                Browse Music
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="flex-1 overflow-y-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 pb-32">
              {favorites.map((music, index) => (
                <motion.div
                  key={music.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ scale: 1.03 }}
                  className="bg-gray-800/30 rounded-2xl overflow-hidden shadow-xl transition-all duration-300 backdrop-blur-sm"
                >
                  <div className="relative group h-64">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/80 to-pink-500/80 flex items-center justify-center">
                      <FiMusic className="text-white text-5xl opacity-80" />
                    </div>
                    <div className="absolute top-2 right-2 z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(music.id);
                        }}
                        className="p-2 rounded-full backdrop-blur-sm bg-amber-400/90 text-amber-900"
                      >
                        <FiStar className="fill-current" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div className="overflow-hidden">
                        <h3 className="text-xl font-bold truncate">{music.title}</h3>
                        <p className="text-gray-300 flex items-center truncate">
                          <FiUser className="mr-2 min-w-fit" /> {music.artist}
                        </p>
                      </div>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-amber-500 to-rose-500 text-white shrink-0">
                        {music.genre}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700/50">
                      <button 
                        onClick={() => toggleFavorite(music.id)}
                        className="flex items-center text-amber-400 transition-colors"
                      >
                        <FiStar className="mr-2 fill-current" />
                        <span>Favorited</span>
                      </button>
                      
                      <div className="flex items-center text-gray-300">
                        <FiClock className="mr-2 text-amber-400" />
                        <span>
                          {Math.floor((music.duration || 180) / 60)}:
                          {((music.duration || 180) % 60).toString().padStart(2, '0')}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick action button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => navigate('/upload')}
        className="fixed bottom-24 right-6 z-40 p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-xl"
      >
        <FiPlus size={24} />
      </motion.button>
    </div>
  );
};

export default Favorites;