import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { FiHeart, FiUser, FiMusic, FiMessageSquare, FiSend, FiEdit2, FiTrash2 } from 'react-icons/fi';

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
    genre: ''
  });

  useEffect(() => {
    const fetchMusic = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:8080/api/music/${id}`);
        setMusic(response.data);
        setEditData({
          title: response.data.title,
          artist: response.data.artist,
          genre: response.data.genre
        });
      } catch (error) {
        console.error('Error fetching music details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMusic();
  }, [id]);

  const handleLike = async () => {
    try {
      await axios.post(`http://localhost:8080/api/music/${id}/like`);
      const response = await axios.get(`http://localhost:8080/api/music/${id}`);
      setMusic(response.data);
    } catch (error) {
      console.error('Error liking music:', error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:8080/api/music/${id}/comments`, {
        content: comment,
        author: 'CurrentUser'
      });
      const response = await axios.get(`http://localhost:8080/api/music/${id}`);
      setMusic(response.data);
      setComment('');
    } catch (error) {
      console.error('Error submitting comment:', error);
    }
  };

  const togglePlay = () => {
    if (music?.filePath) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.src = `http://localhost:8080/${music.filePath}`;
        audio.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:8080/api/music/${id}`);
      navigate('/'); // Redirect to home after deletion
    } catch (error) {
      console.error('Error deleting music:', error);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:8080/api/music/${id}`, editData);
      const response = await axios.get(`http://localhost:8080/api/music/${id}`);
      setMusic(response.data);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating music:', error);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );

  if (!music) return <div className="text-center py-10">Music not found</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
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
                />
              ) : (
                <p className="text-white/90">{music.artist}</p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={handleLike}
                className="flex items-center space-x-1 px-4 py-2 bg-white/20 rounded-full text-white hover:bg-white/30 transition-colors"
              >
                <FiHeart className={music.likesCount > 0 ? 'fill-current text-red-500' : ''} />
                <span>{music.likesCount}</span>
              </button>
              <button
                onClick={handleEditToggle}
                className="p-2 bg-white/20 rounded-full text-white hover:bg-white/30 transition-colors"
                title="Edit"
              >
                <FiEdit2 />
              </button>
              <button
                onClick={handleDelete}
                className="p-2 bg-white/20 rounded-full text-white hover:bg-white/30 transition-colors"
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
              >
                Save Changes
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
          
          {/* Audio Player */}
          <div className="mb-8">
            <div 
              onClick={togglePlay}
              className="flex items-center justify-center w-16 h-16 mx-auto bg-primary rounded-full cursor-pointer hover:bg-primary/90 transition-colors"
            >
              {isPlaying ? (
                <div className="w-6 h-6 bg-white"></div>
              ) : (
                <div className="w-0 h-0 border-t-8 border-b-8 border-l-16 border-t-transparent border-b-transparent border-l-white ml-1"></div>
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
                required
              />
              <button 
                type="submit" 
                className="px-4 py-2 bg-primary text-white rounded-r-lg hover:bg-primary/90 transition-colors"
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