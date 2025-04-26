import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  FiHeart, FiMusic, FiUser, FiClock, FiSearch, 
  FiPlay, FiPause, FiSkipBack, FiSkipForward,
  FiVolume2, FiVolume, FiRepeat, FiShuffle,
  FiMaximize, FiMinimize, FiUpload, FiHome,
  FiEdit, FiTrash2, FiX, FiCheck, FiPlus, FiStar
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const MusicFeed = () => {
  // State management
  const [musicList, setMusicList] = useState([]);
  const [filteredMusic, setFilteredMusic] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [editingTrack, setEditingTrack] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    artist: '',
    genre: ''
  });
  const [showPlayer, setShowPlayer] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  
  // Player state
  const [currentTrackIndex, setCurrentTrackIndex] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [repeat, setRepeat] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [favorites, setFavorites] = useState(new Set());
  
  // Refs
  const audioRef = useRef(null);
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize favorites from localStorage
  useEffect(() => {
    const storedFavorites = localStorage.getItem('musicAppFavorites');
    if (storedFavorites) {
      setFavorites(new Set(JSON.parse(storedFavorites)));
    }
  }, []);

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Format duration
  const formatDuration = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Fetch music data
  useEffect(() => {
    const fetchMusic = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/music');
        setMusicList(response.data);
        setFilteredMusic(response.data);
      } catch (error) {
        console.error('Error fetching music:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMusic();
  }, []);

  // Check if we should show favorites only
  useEffect(() => {
    setShowFavoritesOnly(location.pathname === '/favorites');
  }, [location]);

  // Filter music based on search and favorites
  useEffect(() => {
    let results = musicList;
    
    // Apply favorites filter if needed
    if (showFavoritesOnly) {
      results = results.filter(music => favorites.has(music.id));
    }
    
    // Apply search filter
    if (searchTerm) {
      results = results.filter(music =>
        music.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        music.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
        music.genre.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredMusic(results);
  }, [searchTerm, musicList, showFavoritesOnly, favorites]);

  // Toggle favorite status
  const toggleFavorite = (id) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(id)) {
      newFavorites.delete(id);
    } else {
      newFavorites.add(id);
    }
    setFavorites(newFavorites);
    localStorage.setItem('musicAppFavorites', JSON.stringify(Array.from(newFavorites)));
  };

  // Player controls
  const handlePlay = (index) => {
    setCurrentTrackIndex(index);
    setIsPlaying(true);
    setShowPlayer(true);
    setTimeout(() => audioRef.current?.play(), 100);
  };

  const handlePause = () => {
    audioRef.current?.pause();
    setIsPlaying(false);
  };

  const togglePlayPause = () => {
    if (currentTrackIndex === null && filteredMusic.length > 0) {
      handlePlay(0);
    } else {
      isPlaying ? handlePause() : handlePlay(currentTrackIndex);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleSeek = (fraction) => {
    if (audioRef.current) {
      audioRef.current.currentTime = fraction * audioRef.current.duration;
    }
  };

  const handleNext = () => {
    if (filteredMusic.length === 0) return;
    
    if (shuffle) {
      const randomIndex = Math.floor(Math.random() * filteredMusic.length);
      handlePlay(randomIndex);
    } else {
      const nextIndex = (currentTrackIndex + 1) % filteredMusic.length;
      handlePlay(nextIndex);
    }
  };

  const handlePrevious = () => {
    if (filteredMusic.length === 0) return;
    
    if (progress > 0.1) {
      handleSeek(0);
    } else {
      const prevIndex = currentTrackIndex === 0 ? filteredMusic.length - 1 : currentTrackIndex - 1;
      handlePlay(prevIndex);
    }
  };

  const toggleShuffle = () => {
    setShuffle(!shuffle);
  };

  const toggleRepeat = () => {
    setRepeat(!repeat);
  };

  // Update progress
  useEffect(() => {
    const interval = setInterval(() => {
      if (audioRef.current && !isNaN(audioRef.current.duration)) {
        setProgress(audioRef.current.currentTime / audioRef.current.duration);
        setDuration(audioRef.current.duration);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Handle track ended
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      if (repeat) {
        handleSeek(0);
        audio.play();
      } else {
        handleNext();
      }
    };

    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, [repeat, currentTrackIndex, filteredMusic]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlayPause();
      }
      if (e.code === 'ArrowRight') handleSeek(Math.min(progress + 0.05, 1));
      if (e.code === 'ArrowLeft') handleSeek(Math.max(progress - 0.05, 0));
      if (e.code === 'KeyF') toggleFullscreen();
      if (e.code === 'KeyM') toggleMute();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, progress, currentTrackIndex]);

  // Delete track
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/music/${id}`);
      setMusicList(musicList.filter(music => music.id !== id));
      
      // If the deleted track is currently playing, stop it
      if (currentTrackIndex !== null && filteredMusic[currentTrackIndex]?.id === id) {
        handlePause();
        setCurrentTrackIndex(null);
        setShowPlayer(false);
      }
      
      // Remove from favorites if it was there
      if (favorites.has(id)) {
        const newFavorites = new Set(favorites);
        newFavorites.delete(id);
        setFavorites(newFavorites);
        localStorage.setItem('musicAppFavorites', JSON.stringify(Array.from(newFavorites)));
      }
    } catch (error) {
      console.error('Error deleting track:', error);
    }
  };

  // Start editing a track
  const startEditing = (track) => {
    setEditingTrack(track.id);
    setEditFormData({
      title: track.title,
      artist: track.artist,
      genre: track.genre
    });
  };

  // Handle edit form changes
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Save edited track
  const saveEdit = async (id) => {
    try {
      await axios.put(`http://localhost:8080/api/music/${id}`, editFormData);
      setMusicList(musicList.map(music => 
        music.id === id ? { ...music, ...editFormData } : music
      ));
      setEditingTrack(null);
    } catch (error) {
      console.error('Error updating track:', error);
    }
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingTrack(null);
  };

  // Navbar component
  const Navbar = () => (
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

          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setShowSearch(!showSearch)}
              className="p-2 text-gray-300 hover:text-white transition-colors"
            >
              <FiSearch size={20} />
            </button>
            <button 
              onClick={toggleFullscreen}
              className="p-2 text-gray-300 hover:text-white transition-colors"
            >
              {isFullscreen ? <FiMinimize size={20} /> : <FiMaximize size={20} />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );

  if (loading) return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="h-16 w-16 rounded-full border-t-4 border-b-4 border-indigo-500"
      />
    </div>
  );

  return (
    <div 
      ref={containerRef}
      className={`fixed inset-0 bg-gradient-to-br from-gray-900 to-gray-800 text-white overflow-hidden ${isFullscreen ? 'pt-0' : 'pt-20'}`}
    >
      {/* Navbar */}
      <Navbar />

      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={currentTrackIndex !== null ? `http://localhost:8080/${filteredMusic[currentTrackIndex]?.filePath}` : ''}
        volume={volume}
      />

      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden z-0">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              x: [0, 100 * (i % 2 ? 1 : -1), 0],
              y: [0, 100 * (i % 3 ? 1 : -1), 0],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: 30 + i * 5,
              repeat: Infinity,
              ease: "linear"
            }}
            className={`absolute rounded-full opacity-5 blur-xl ${i % 2 ? 'bg-pink-500' : 'bg-indigo-500'}`}
            style={{
              width: `${100 + i * 30}px`,
              height: `${100 + i * 30}px`,
              top: `${i * 10}%`,
              left: `${i * 10}%`
            }}
          />
        ))}
      </div>

      {/* Search bar */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="fixed top-16 left-0 right-0 z-40 px-4"
          >
            <div className="max-w-xl mx-auto">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search songs, artists..."
                  className="pl-10 pr-4 py-3 w-full rounded-full bg-gray-800/80 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-lg text-white placeholder-gray-400 backdrop-blur-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="relative z-10 h-full w-full flex flex-col pt-4">
        {/* Header */}
        {!isFullscreen && (
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-pink-400">
                {showFavoritesOnly ? 'Your Favorites' : 'Discover Music'}
              </span>
            </h1>
            <p className="text-gray-400">
              {showFavoritesOnly ? 'Your favorite tracks collection' : 'Stream your favorite tracks'}
            </p>
          </motion.div>
        )}

        {/* Music grid */}
        {filteredMusic.length === 0 ? (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex-1 flex items-center justify-center"
          >
            <div className="text-center p-8 rounded-2xl bg-gray-800/30 backdrop-blur-sm">
              <FiMusic className="mx-auto text-5xl text-gray-400 mb-4" />
              <h3 className="text-2xl font-medium mb-2">
                {showFavoritesOnly ? 'No favorites yet' : 'No music found'}
              </h3>
              <p className="text-gray-400">
                {showFavoritesOnly 
                  ? 'Mark songs as favorites to see them here' 
                  : 'Try a different search or upload some tracks'}
              </p>
              {!showFavoritesOnly && (
                <button 
                  onClick={() => navigate('/upload')}
                  className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center mx-auto"
                >
                  <FiUpload className="mr-2" /> Upload Music
                </button>
              )}
            </div>
          </motion.div>
        ) : (
          <div className="flex-1 overflow-y-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 pb-32">
              {filteredMusic.map((music, index) => (
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
                        className={`p-2 rounded-full backdrop-blur-sm ${favorites.has(music.id) ? 'bg-amber-400/90 text-amber-900' : 'bg-white/20 text-white'}`}
                      >
                        <FiStar className={favorites.has(music.id) ? 'fill-current' : ''} />
                      </button>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => 
                          currentTrackIndex === index && isPlaying 
                            ? handlePause() 
                            : handlePlay(index)
                        }
                        className="p-4 bg-white/20 hover:bg-white/30 text-white rounded-full shadow-lg backdrop-blur-sm transition-all transform hover:scale-110"
                      >
                        {currentTrackIndex === index && isPlaying ? (
                          <FiPause size={24} />
                        ) : (
                          <FiPlay size={24} />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-5">
                    {editingTrack === music.id ? (
                      <div className="mb-3">
                        <input
                          type="text"
                          name="title"
                          value={editFormData.title}
                          onChange={handleEditChange}
                          className="w-full mb-2 p-2 bg-gray-700/50 border border-gray-600 rounded text-white"
                          placeholder="Title"
                        />
                        <input
                          type="text"
                          name="artist"
                          value={editFormData.artist}
                          onChange={handleEditChange}
                          className="w-full mb-2 p-2 bg-gray-700/50 border border-gray-600 rounded text-white"
                          placeholder="Artist"
                        />
                        <input
                          type="text"
                          name="genre"
                          value={editFormData.genre}
                          onChange={handleEditChange}
                          className="w-full p-2 bg-gray-700/50 border border-gray-600 rounded text-white"
                          placeholder="Genre"
                        />
                        <div className="flex justify-end mt-3 space-x-2">
                          <button
                            onClick={() => saveEdit(music.id)}
                            className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-full"
                          >
                            <FiCheck size={16} />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-2 bg-gray-600 hover:bg-gray-700 text-white rounded-full"
                          >
                            <FiX size={16} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
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
                            className={`flex items-center ${favorites.has(music.id) ? 'text-amber-400' : 'text-gray-300 hover:text-amber-400'} transition-colors`}
                          >
                            <FiStar className={`mr-2 ${favorites.has(music.id) ? 'fill-current' : ''}`} />
                            <span>{favorites.has(music.id) ? 'Favorited' : 'Favorite'}</span>
                          </button>
                          
                          <div className="flex items-center text-gray-300">
                            <FiClock className="mr-2 text-amber-400" />
                            <span>{formatDuration(music.duration || 180)}</span>
                          </div>
                          
                          <div className="flex space-x-2">
                            <button
                              onClick={() => startEditing(music)}
                              className="text-gray-300 hover:text-indigo-400 transition-colors"
                            >
                              <FiEdit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(music.id)}
                              className="text-gray-300 hover:text-rose-400 transition-colors"
                            >
                              <FiTrash2 size={16} />
                            </button>
                            <Link
                              to={`/music/${music.id}`}
                              className="text-sm font-medium text-indigo-300 hover:text-white transition-colors"
                            >
                              Details
                            </Link>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Floating player bar */}
      <AnimatePresence>
        {showPlayer && currentTrackIndex !== null && filteredMusic[currentTrackIndex] && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed bottom-0 left-0 right-0 bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-lg border-t border-gray-700/30 p-4 z-50"
          >
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center">
              {/* Track info */}
              <div className="flex items-center w-full md:w-1/4 mb-4 md:mb-0">
                <motion.div
                  animate={{ rotate: isPlaying ? 360 : 0 }}
                  transition={{ 
                    rotate: { 
                      duration: 10, 
                      repeat: Infinity, 
                      ease: "linear",
                      paused: !isPlaying
                    } 
                  }}
                  className="h-16 w-16 rounded-full overflow-hidden border-2 border-white/10 mr-4 shrink-0"
                >
                  <div className="h-full w-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center">
                    <FiMusic className="text-white text-xl" />
                  </div>
                </motion.div>
                <div className="overflow-hidden">
                  <motion.h4 
                    animate={{ x: isPlaying ? [0, -100, 0] : 0 }}
                    transition={{ 
                      x: { 
                        duration: 10, 
                        repeat: Infinity,
                        ease: "linear",
                        paused: !isPlaying
                      } 
                    }}
                    className="font-semibold text-white whitespace-nowrap"
                  >
                    {filteredMusic[currentTrackIndex].title} • {filteredMusic[currentTrackIndex].artist}
                  </motion.h4>
                  <p className="text-sm text-gray-400">
                    {formatDuration(progress * duration)} / {formatDuration(duration)}
                  </p>
                </div>
              </div>

              {/* Player controls */}
              <div className="w-full md:w-2/4 flex flex-col items-center px-4">
                <div className="flex items-center space-x-4 md:space-x-6 mb-3">
                  <button 
                    onClick={toggleShuffle}
                    className={`p-2 rounded-full ${shuffle ? 'text-indigo-400' : 'text-gray-400'} hover:text-white transition-colors`}
                  >
                    <FiShuffle size={18} />
                  </button>
                  <button 
                    onClick={handlePrevious}
                    className="p-2 rounded-full text-gray-300 hover:text-white transition-colors"
                  >
                    <FiSkipBack size={20} />
                  </button>
                  <button 
                    onClick={togglePlayPause}
                    className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg transition-all transform hover:scale-105"
                  >
                    {isPlaying ? <FiPause size={24} /> : <FiPlay size={24} />}
                  </button>
                  <button 
                    onClick={handleNext}
                    className="p-2 rounded-full text-gray-300 hover:text-white transition-colors"
                  >
                    <FiSkipForward size={20} />
                  </button>
                  <button 
                    onClick={toggleRepeat}
                    className={`p-2 rounded-full ${repeat ? 'text-indigo-400' : 'text-gray-400'} hover:text-white transition-colors`}
                  >
                    <FiRepeat size={18} />
                  </button>
                </div>

                {/* Progress bar */}
                <div className="w-full flex items-center">
                  <div className="w-full h-2 bg-gray-700/50 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-indigo-400 to-pink-400 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress * 100}%` }}
                      transition={{ duration: 0.1 }}
                    />
                  </div>
                </div>
              </div>

              {/* Volume control */}
              <div className="w-full md:w-1/4 flex justify-end items-center mt-4 md:mt-0">
                <div className="flex items-center">
                  <button 
                    onClick={toggleMute}
                    className="p-2 text-gray-300 hover:text-white mr-2 transition-colors"
                  >
                    {isMuted || volume === 0 ? <FiVolume size={18} /> : <FiVolume2 size={18} />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-24 h-1 bg-gray-700/50 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #f59e0b, #f97316) 0% ${(isMuted ? 0 : volume) * 100}%, #374151 ${(isMuted ? 0 : volume) * 100}% 100%`
                    }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick action button */}
      {!showFavoritesOnly && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/upload')}
          className="fixed bottom-24 right-6 z-40 p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-xl"
        >
          <FiPlus size={24} />
        </motion.button>
      )}
    </div>
  );
};

export default MusicFeed;