import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { FiHeart, FiUser, FiMessageSquare, FiSend, FiEdit2, FiTrash2 } from 'react-icons/fi';

const MusicDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [music, setMusic] = useState(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio] = useState(new Audio());
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: '',
    artist: '',
    genre: '',
  });
  const [error, setError] = useState(null);

  // Fetch pseudo user id
  const userId = localStorage.getItem('userId') || 'CurrentUser';

  // Fetch music details and cleanup audio on unmount
  useEffect(() => {
    const fetchMusic = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`http://localhost:8080/api/music/${id}`);
        setMusic(response.data);
        setEditData({
          title: response.data.title,
          artist: response.data.artist,
          genre: response.data.genre,
        });
      } catch (error) {
        console.error('Error fetching music details:', error);
        if (error.response?.status === 404) {
          setError('Music track not found.');
        } else {
          setError('Failed to load music details. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchMusic();

    // Cleanup audio
    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [id, audio]);

  // Handle audio end event
  useEffect(() => {
    const handleEnded = () => setIsPlaying(false);
    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, [audio]);

  const handleLike = async () => {
    try {
      await axios.post(`http://localhost:8080/api/music/${id}/like`);
      setMusic(prev => ({ ...prev, likesCount: prev.likesCount + 1 }));
    } catch (error) {
      console.error('Error liking music:', error);
      setError('Failed to like the track. Please try again.');
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    const trimmedComment = comment.trim();
    if (trimmedComment.length === 0 || trimmedComment.length > 500) {
      setError('Comment must be between 1 and 500 characters.');
      return;
    }
    try {
      const newComment = { content: trimmedComment, author: userId, id: Date.now() };
      await axios.post(`http://localhost:8080/api/music/${id}/comments`, newComment);
      setMusic(prev => ({
        ...prev,
        comments: [...prev.comments, newComment],
      }));
      setComment('');
      setError(null);
    } catch (error) {
      console.error('Error submitting comment:', error);
      setError('Failed to submit comment. Please try again.');
    }
  };

  const togglePlay = () => {
    if (music?.filePath) {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio.src = `http://localhost:8080/${music.filePath}`;
        audio
          .play()
          .then(() => setIsPlaying(true))
          .catch(err => {
            console.error('Error playing audio:', err);
            setError('Failed to play audio. Please try again.');
            setIsPlaying(false);
          });
      }
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this track?')) {
      try {
        await axios.delete(`http://localhost:8080/api/music/${id}`);
        navigate('/');
      } catch (error) {
        console.error('Error deleting music:', error);
        setError('Failed to delete the track. Please try again.');
      }
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setError(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value.trimStart(), // Prevent leading spaces
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const trimmedData = {
      title: editData.title.trim(),
      artist: editData.artist.trim(),
      genre: editData.genre.trim(),
    };
    if (!trimmedData.title || !trimmedData.artist || !trimmedData.genre) {
      setError('All fields are required.');
      return;
    }
    if (trimmedData.title.length > 100 || trimmedData.artist.length > 100 || trimmedData.genre.length > 50) {
      setError('Title and artist must be under 100 characters, genre under 50.');
      return;
    }
    try {
      await axios.put(`http://localhost:8080/api/music/${id}`, trimmedData);
      const response = await axios.get(`http://localhost:8080/api/music/${id}`);
      setMusic(response.data);
      setIsEditing(false);
      setError(null);
      // Optional: Add toast notification (e.g., react-toastify)
      // toast.success('Track updated successfully!');
    } catch (error) {
      console.error('Error updating music:', error);
      setError('Failed to update the track. Please try again.');
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div
        className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"
        aria-label="Loading music details"
      ></div>
    </div>
  );

  if (!music) return <div className="text-center py-10">Music not found</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Error Message */}
        {error && (
          <div className="bg-red-100 text-red-700 p-4 mx-6 mt-4 rounded-lg" role="alert">
            {error}
          </div>
        )}

        {/* Music Header */}
        <div className="p-6 bg-gradient-to-r from-primary to-secondary">
          <div className="flex items-center justify-between">
            <div>
              {isEditing ? (
                <input
                  type="text"
                  name="title"
                  value={editData.title}
                  onChange={handleEditChange}
                  className="text-2xl font-bold bg-white/90 px-2 py-1 rounded mb-1 w-full"
                  aria-label="Edit music title"
                  maxLength={100}
                  required
                />
              ) : (
                <h1 className="text-2xl font-bold text-white">{music.title}</h1>
              )}
              {isEditing ? (
                <input
                  type="text"
                  name="artist"
                  value={editData.artist}
                  onChange={handleEditChange}
                  className="bg-white/90 px-2 py-1 rounded text-sm w-full"
                  aria-label="Edit artist name"
                  maxLength={100}
                  required
                />
              ) : (
                <p className="text-white/90">{music.artist}</p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleLike}
                className="flex items-center space-x-1 px-4 py-2 bg-white/20 rounded-full text-white hover:bg-white/30 transition-colors"
                aria-label={`Like track (${music.likesCount} likes)`}
              >
                <FiHeart className={music.likesCount > 0 ? 'fill-current text-red-500' : ''} />
                <span>{music.likesCount}</span>
              </button>
              <button
                onClick={handleEditToggle}
                className="p-2 bg-white/20 rounded-full text-white hover:bg-white/30 transition-colors"
                aria-label="Edit track details"
                title="Edit"
              >
                <FiEdit2 />
              </button>
              <button
                onClick={handleDelete}
                className="p-2 bg-white/20 rounded-full text-white hover:bg-white/30 transition-colors"
                aria-label="Delete track"
                title="Delete"
              >
                <FiTrash2 />
              </button>
            </div>
          </div>
        </div>

        {/* Music Content */}
        <div className="p-6">
          <div className="flex items-center mb-4">
            {isEditing ? (
              <input
                type="text"
                name="genre"
                value={editData.genre}
                onChange={handleEditChange}
                className="bg-secondary/10 text-secondary text-sm px-3 py-1 rounded-full border border-secondary/30"
                aria-label="Edit genre"
                maxLength={50}
                required
              />
            ) : (
              <span className="bg-secondary/10 text-secondary text-sm px-3 py-1 rounded-full">
                {music.genre}
              </span>
            )}
          </div>

          {isEditing && (
            <div className="mb-4 flex justify-end">
              <button
                onClick={handleEditSubmit}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors mr-2"
                aria-label="Save changes"
              >
                Save Changes
              </button>
              <button
                onClick={handleEditToggle}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                aria-label="Cancel editing"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Audio Player */}
          <div className="mb-8">
            <div
              onClick={togglePlay}
              onKeyDown={(e) => e.key === 'Enter' && togglePlay()}
              role="button"
              aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
              tabIndex={0}
              className="flex items-center justify-center w-16 h-16 mx-auto bg-primary rounded-full cursor-pointer hover:bg-primary/90 transition-colors"
            >
              {isPlaying ? (
                <div className="w-6 h-6 bg-white" aria-hidden="true"></div>
              ) : (
                <div
                  className="w-0 h-0 border-t-8 border-b-8 border-l-16 border-t-transparent border-b-transparent border-l-white ml-1"
                  aria-hidden="true"
                ></div>
              )}
            </div>
          </div>

          {/* Comments Section */}
          <div className="border-t pt-6">
            <h3 className="flex items-center text-lg font-semibold mb-4">
              <FiMessageSquare className="mr-2" />
              Comments
            </h3>

            {music.comments.length > 0 ? (
              <div className="space-y-4 mb-6">
                {music.comments.map(c => (
                  <div key={c.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <FiUser className="text-gray-500 mr-2" />
                      <span className="font-medium text-gray-700">{c.author}</span>
                    </div>
                    <p className="text-gray-600">{c.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No comments yet</p>
            )}

            <form onSubmit={handleCommentSubmit} className="flex items-center">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 px-4 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Comment input"
                maxLength={500}
                required
              />
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-r-lg hover:bg-primary/90 transition-colors"
                aria-label="Submit comment"
              >
                <FiSend />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicDetail;