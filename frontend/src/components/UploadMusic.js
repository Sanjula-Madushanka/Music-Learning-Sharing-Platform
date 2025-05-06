import React, { useState, useRef } from 'react';
import axios from 'axios';
import { FiUpload, FiX, FiCheck, FiMusic, FiUser, FiTag, FiHome } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const UploadMusic = () => {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [genre, setGenre] = useState('');
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef(null);
  const formRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file || !title || !artist || !genre) {
      setUploadStatus({
        success: false,
        message: 'Please complete all fields and select an audio file'
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
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setUploadStatus({ success: true, message: 'Track uploaded successfully!' });
      formRef.current.reset();
      setTitle('');
      setArtist('');
      setGenre('');
      setFile(null);
      
    } catch (error) {
      setUploadStatus({ 
        success: false, 
        message: error.response?.data?.message || 'Failed to upload track'
      });
    } finally {
      setIsUploading(false);
    }
  };

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
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && isValidAudioFile(droppedFile)) {
      setFile(droppedFile);
    } else {
      setUploadStatus({
        success: false,
        message: 'Please upload MP3, WAV, or AAC files only'
      });
    }
  };

  const isValidAudioFile = (file) => {
    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/aac'];
    return validTypes.includes(file.type);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && isValidAudioFile(selectedFile)) {
      setFile(selectedFile);
    } else {
      setUploadStatus({
        success: false,
        message: 'Please upload MP3, WAV, or AAC files only'
      });
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen w-full bg-gray-900 text-white flex items-center justify-center p-4">
     
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-xl p-6"
      >
        <div className="text-center mb-6">
          <FiMusic className="mx-auto h-12 w-12 text-indigo-400" />
          <h2 className="text-2xl font-bold mt-2">Upload Your Music</h2>
          <p className="text-gray-400 text-sm mt-1">Share your tracks with the world</p>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence>
            {uploadStatus && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`p-3 rounded-lg flex items-center gap-2 text-sm ${
                  uploadStatus.success ? 'bg-green-900/50 text-green-200' : 'bg-red-900/50 text-red-200'
                }`}
              >
                {uploadStatus.success ? <FiCheck className="h-5 w-5" /> : <FiX className="h-5 w-5" />}
                {uploadStatus.message}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Track Title</label>
            <div className="relative">
              <FiMusic className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white placeholder-gray-400 text-sm"
                placeholder="Enter track title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Artist Name</label>
            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white placeholder-gray-400 text-sm"
                placeholder="Enter artist name"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Genre</label>
            <div className="relative">
              <FiTag className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white placeholder-gray-400 text-sm"
                placeholder="e.g., Pop, Rock, Hip-Hop"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Audio File</label>
            <div
              className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                isDragging ? 'border-indigo-400 bg-indigo-900/20' : 'border-gray-600 hover:border-indigo-400'
              }`}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current.click()}
            >
              {file ? (
                <div className="space-y-1">
                  <FiMusic className="mx-auto h-8 w-8 text-indigo-400" />
                  <p className="text-sm text-white truncate">{file.name}</p>
                  <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                  <button
                    type="button"
                    className="text-xs text-indigo-400 hover:text-indigo-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="space-y-1">
                  <FiUpload className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="text-sm text-gray-300">
                    Drag & drop or <span className="text-indigo-400">click to browse</span>
                  </p>
                  <p className="text-xs text-gray-400">MP3, WAV, AAC (Max 50MB)</p>
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="audio/mpeg,audio/wav,audio/aac"
                onChange={handleFileChange}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Uploading...
              </>
            ) : (
              <>
                <FiUpload className="h-5 w-5" />
                Upload Track
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default UploadMusic;