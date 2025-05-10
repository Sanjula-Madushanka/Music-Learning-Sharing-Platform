import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { FiHeart, FiUser, FiMessageSquare, FiSend, FiEdit2, FiTrash2 } from 'react-icons/fi';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

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
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingContent, setEditingContent] = useState('');

  // Fetch pseudo user id
  const userId = localStorage.getItem('userId') || 'CurrentUser';

  // Fetch music details and cleanup audio on unmount
  useEffect(() => {
    const fetchMusic = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`http://localhost:8080/api/music/${id}`);
        const commentsResponse = await axios.get(`http://localhost:8080/api/music/${id}/comments`);
        response.data.comments = commentsResponse.data;
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
      const response = await axios.post(
        `http://localhost:8080/api/music/${id}/comments`,
        { content: trimmedComment, author: userId }
      );
      setMusic((prev) => ({
        ...prev,
        comments: [...prev.comments, response.data],
      }));
      setComment('');
      setError(null);
    } catch (error) {
      console.error('Error submitting comment:', error);
      setError('Failed to submit comment. Please try again.');
    }
  };

  const startEditing = (comment) => {
    setEditingCommentId(comment.id);
    setEditingContent(comment.content);
  };

  const handleUpdateComment = async (e, commentId) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:8080/api/music/${id}/comments/${commentId}`, {
        content: editingContent,
        author: userId,
      });
      const updated = await axios.get(`http://localhost:8080/api/music/${id}/comments`);
      setMusic((prev) => ({ ...prev, comments: updated.data }));
      setEditingCommentId(null);
    } catch (err) {
      console.error('Update failed', err);
      setError('Failed to update comment. Please try again.');
    }
  };
  const deleteComment = async (commentId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this comment?");
    if (!confirmDelete) return;
  
    try {
      await axios.delete(`http://localhost:8080/api/music/${id}/comments/${commentId}`);
      const updated = await axios.get(`http://localhost:8080/api/music/${id}/comments`);
      setMusic((prev) => ({ ...prev, comments: updated.data }));
    } catch (err) {
      console.error('Delete failed', err);
      setError('Failed to delete comment. Please try again.');
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
      [name]: value.trimStart(),
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
    <div className="border-t border-gray-700 pt-6">
  <div className="flex items-center justify-between px-6 py-3 rounded-t-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
    <h2 className="text-white font-semibold text-base">Discussion</h2>
    <FiHeart className="text-pink-200" />
  </div>

  <form onSubmit={handleCommentSubmit} className="flex items-center gap-3 mb-4 px-6 mt-4">
    <img
      src={`https://api.dicebear.com/7.x/initials/svg?seed=${userId}`}
      className="w-10 h-10 rounded-full"
      alt="avatar"
    />
    <input
      type="text"
      value={comment}
      onChange={(e) => setComment(e.target.value)}
      placeholder="Write your comment..."
      className="flex-1 px-4 py-2 rounded-full border border-gray-300 bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      maxLength={500}
    />
    <button
      type="submit"
      className="p-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700"
      aria-label="Submit comment"
    >
      <FiSend size={16} />
    </button>
  </form>

  <div className="space-y-4 px-6 pb-6">
    {music.comments.length > 0 ? (
      music.comments.map((c) => (
        <div key={c.id} className="bg-white p-4 rounded-lg shadow flex space-x-4">
          <img
            src={`https://api.dicebear.com/7.x/initials/svg?seed=${c.author}`}
            alt="avatar"
            className="w-10 h-10 rounded-full"
          />
          <div className="flex-1 text-sm text-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-base">{c.author}</span>
                <span className="bg-green-100 text-green-600 text-xs font-medium px-2 py-0.5 rounded-full">Top Comment</span>
              </div>
              <span className="text-xs text-gray-500">
                {dayjs(c.createdAt).fromNow()}
              </span>
            </div>
            {editingCommentId === c.id ? (
              <form onSubmit={(e) => handleUpdateComment(e, c.id)} className="mt-2">
                <textarea
                  value={editingContent}
                  onChange={(e) => setEditingContent(e.target.value)}
                  className="w-full p-2 border rounded text-sm text-gray-800"
                  rows={2}
                />
                <div className="mt-2 flex gap-2">
                  <button type="submit" className="text-sm text-white bg-indigo-600 px-3 py-1 rounded">Save</button>
                  <button type="button" className="text-sm text-gray-600" onClick={() => setEditingCommentId(null)}>Cancel</button>
                </div>
              </form>
            ) : (
              <p className="mt-2 text-gray-700 text-sm leading-relaxed">{c.content}</p>
            )}
            <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1 text-emerald-600">
                <FiHeart className="text-sm" /> <span>24</span>
              </div>
              <button onClick={() => startEditing(c)} className="flex items-center gap-1 hover:text-blue-600">
                <FiEdit2 className="text-sm" /> Edit
              </button>
              <button onClick={() => deleteComment(c.id)} className="flex items-center gap-1 hover:text-red-600">
                <FiTrash2 className="text-sm" /> Delete
              </button>
            </div>
          </div>
        </div>
      ))
    ) : (
      <p className="text-gray-500 text-center py-4">No comments yet</p>
    )}
  </div>
</div>

  );
};

export default MusicDetail;