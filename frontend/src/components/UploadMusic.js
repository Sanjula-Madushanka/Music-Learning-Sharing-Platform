import React, { useState, useRef } from 'react';
import axios from 'axios';
import { FiUpload, FiX, FiCheck, FiMusic, FiUser, FiTag, FiHome } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const UploadMusic = () => {
  // Form state
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [genre, setGenre] = useState('');
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Refs
  const fileInputRef = useRef(null);
  const formRef = useRef(null);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!file) {
      setUploadStatus({
        success: false,
        message: 'Please select an audio file to upload'
      });
      return;
    }

    if (!title || !artist || !genre) {
      setUploadStatus({
        success: false,
        message: 'Please fill in all required fields'
      });
      return;
    }

    setIsUploading(true);
    setUploadStatus(null);
    
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('artist', artist);
      formData.append('genre', genre);
      formData.append('file', file);

      const response = await axios.post('http://localhost:8080/api/music', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setUploadStatus({ 
        success: true, 
        message: 'Music uploaded successfully! 🎵' 
      });
      
      // Reset form on success
      formRef.current.reset();
      setTitle('');
      setArtist('');
      setGenre('');
      setFile(null);
      
    } catch (error) {
      console.error('Error uploading music:', error);
      const errorMessage = error.response?.data?.message || 
                         error.message || 
                         'Error uploading music';
      setUploadStatus({ 
        success: false, 
        message: errorMessage 
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Drag and drop handlers
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (isValidAudioFile(droppedFile)) {
        setFile(droppedFile);
      } else {
        setUploadStatus({
          success: false,
          message: 'Please upload a valid audio file (MP3, WAV, AAC)'
        });
      }
    }
  };

  // File validation
  const isValidAudioFile = (file) => {
    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/aac', 'audio/x-wav', 'audio/x-aac'];
    return validTypes.includes(file.type);
  };

  // File input handler
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (isValidAudioFile(selectedFile)) {
        setFile(selectedFile);
      } else {
        setUploadStatus({
          success: false,
          message: 'Please upload a valid audio file (MP3, WAV, AAC)'
        });
      }
    }
  };

  // Format file size for display
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      {/* Navigation */}
      <Link 
        to="/" 
        className="fixed top-6 left-6 z-50 flex items-center text-indigo-300 hover:text-white transition-colors"
      >
        <FiHome className="mr-2" /> Back to Home
      </Link>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 py-16 px-4 sm:px-6 lg:px-8"
      >
        {/* Background decorative elements */}
        <div className="fixed inset-0 overflow-hidden z-0">
          {[...Array(8)].map((_, i) => (
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

        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
              Share Your Music
            </h1>
            <p className="text-xl text-gray-300 max-w-lg mx-auto">
              Upload your tracks and connect with listeners worldwide
            </p>
          </motion.div>

          {/* Form container */}
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800/50 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden border border-gray-700/30"
          >
            {/* Form header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-10 text-center relative overflow-hidden">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -right-20 -top-20 h-40 w-40 rounded-full border-4 border-white/10"
              />
              <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full border-4 border-white/10"
              />
              <FiMusic className="mx-auto h-20 w-20 text-white mb-6 relative z-10" />
              <h2 className="mt-2 text-3xl font-bold text-white relative z-10">
                Upload New Track
              </h2>
            </div>

            {/* Form content */}
            <div className="p-8 sm:p-10">
              <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
                {/* Status messages */}
                <AnimatePresence>
                  {uploadStatus && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={`mb-8 p-5 rounded-lg flex items-center text-lg ${
                        uploadStatus.success 
                          ? 'bg-green-900/30 text-green-300 border border-green-800/50' 
                          : 'bg-red-900/30 text-red-300 border border-red-800/50'
                      }`}
                    >
                      {uploadStatus.success ? (
                        <FiCheck className="flex-shrink-0 h-7 w-7 text-green-400 mr-4" />
                      ) : (
                        <FiX className="flex-shrink-0 h-7 w-7 text-red-400 mr-4" />
                      )}
                      <span className="font-medium">{uploadStatus.message}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Title field */}
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-3"
                >
                  <label className="block text-lg font-medium text-gray-300">
                    Track Title *
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FiMusic className="h-6 w-6 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="block w-full pl-14 pr-4 py-4 text-lg bg-gray-700/50 border border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white placeholder-gray-400"
                      placeholder="My Awesome Track"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>
                </motion.div>

                {/* Artist field */}
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-3"
                >
                  <label className="block text-lg font-medium text-gray-300">
                    Artist Name *
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FiUser className="h-6 w-6 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="block w-full pl-14 pr-4 py-4 text-lg bg-gray-700/50 border border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white placeholder-gray-400"
                      placeholder="Artist or Band Name"
                      value={artist}
                      onChange={(e) => setArtist(e.target.value)}
                      required
                    />
                  </div>
                </motion.div>

                {/* Genre field */}
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-3"
                >
                  <label className="block text-lg font-medium text-gray-300">
                    Genre *
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FiTag className="h-6 w-6 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="block w-full pl-14 pr-4 py-4 text-lg bg-gray-700/50 border border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white placeholder-gray-400"
                      placeholder="Rock, Pop, Electronic..."
                      value={genre}
                      onChange={(e) => setGenre(e.target.value)}
                      required
                    />
                  </div>
                </motion.div>

                {/* File upload */}
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className="space-y-4"
                >
                  <label className="block text-lg font-medium text-gray-300">
                    Audio File *
                  </label>
                  <div
                    className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer ${
                      isDragging
                        ? 'border-purple-500 bg-purple-900/20'
                        : 'border-gray-600 hover:border-purple-400 bg-gray-700/30'
                    }`}
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current.click()}
                  >
                    {file ? (
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="space-y-4"
                      >
                        <FiMusic className="mx-auto h-16 w-16 text-purple-400" />
                        <p className="text-lg font-medium text-white truncate">
                          {file.name}
                        </p>
                        <p className="text-sm text-gray-400">
                          {formatFileSize(file.size)}
                        </p>
                        <button
                          type="button"
                          className="mt-4 text-lg text-purple-400 hover:text-purple-300 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFile(null);
                          }}
                        >
                          Remove File
                        </button>
                      </motion.div>
                    ) : (
                      <div className="space-y-4">
                        <FiUpload className="mx-auto h-16 w-16 text-gray-400" />
                        <div className="flex justify-center text-lg text-gray-300">
                          <p className="pl-1">
                            Drag and drop your audio file here, or{' '}
                            <span className="font-medium text-purple-400 hover:text-purple-300">
                              click to browse
                            </span>
                          </p>
                        </div>
                        <p className="text-sm text-gray-400">
                          Supported formats: MP3, WAV, AAC (Max 50MB)
                        </p>
                      </div>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="audio/*"
                      onChange={handleFileChange}
                      required
                    />
                  </div>
                </motion.div>

                {/* Submit button */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="pt-6"
                >
                  <button
                    type="submit"
                    className="w-full flex justify-center items-center px-8 py-6 text-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-2xl hover:from-purple-500 hover:to-indigo-500 shadow-xl transition-all disabled:opacity-50 group relative overflow-hidden"
                    disabled={isUploading}
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-purple-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    <span className="relative z-10 flex items-center">
                      {isUploading ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-3 h-6 w-6 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <FiUpload className="mr-3 h-6 w-6" />
                          Upload Track
                        </>
                      )}
                    </span>
                  </button>
                </motion.div>
              </form>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default UploadMusic;