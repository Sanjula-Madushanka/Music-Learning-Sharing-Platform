import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { FiHeart, FiMessageSquare, FiSend, FiCornerUpLeft, FiEdit2, FiTrash2, FiPlay, FiPause } from 'react-icons/fi';
import TimeAgo from 'timeago-react';

const MusicDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [music, setMusic] = useState(null);
  const [comments, setComments] = useState([]);
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
  const [editingComment, setEditingComment] = useState(null);
  const [editCommentContent, setEditCommentContent] = useState('');
  
  const userId = localStorage.getItem('userId') || 'CurrentUser';

  useEffect(() => {
    const fetchMusicAndComments = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch music details
        const musicResponse = await axios.get(`http://localhost:8080/api/music/${id}`);
        setMusic(musicResponse.data);
        setEditData({
          title: musicResponse.data.title,
          artist: musicResponse.data.artist,
          genre: musicResponse.data.genre,
        });

        // Fetch comments
        const commentsResponse = await axios.get('http://localhost:8080/comments');
        const filteredComments = commentsResponse.data.filter(c => c.music.id === parseInt(id));
        setComments(filteredComments);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchMusicAndComments();

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [id, audio]);

  const togglePlay = () => {
    if (music?.filePath) {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio.src = `http://localhost:8080/${music.filePath}`;
        audio.play()
          .then(() => setIsPlaying(true))
          .catch(err => {
            console.error('Error playing audio:', err);
            setError('Failed to play audio. Please try again.');
          });
      }
    }
  };

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
      const newComment = { 
        content: trimmedComment,
        username: userId,
        music: { id: parseInt(id) }
      };
      
      const response = await axios.post('http://localhost:8080/comments', newComment, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      setComments(prev => [...prev, response.data]);
      setComment('');
      setError(null);
    } catch (error) {
      console.error('Error submitting comment:', error);
      setError(error.response?.data?.message || 'Failed to submit comment. Please try again.');
    }
  };

  const saveEditedComment = async (commentId) => {
    const trimmedContent = editCommentContent.trim();
    if (trimmedContent.length === 0 || trimmedContent.length > 500) {
      setError('Comment must be between 1 and 500 characters.');
      return;
    }
    
    try {
      await axios.put(`http://localhost:8080/comments/${commentId}`, {
        content: trimmedContent
      });
      setComments(prev => prev.map(c => 
        c.id === commentId ? { ...c, content: trimmedContent } : c
      ));
      setEditingComment(null);
      setEditCommentContent('');
      setError(null);
    } catch (error) {
      console.error('Error updating comment:', error);
      setError('Failed to update comment. Please try again.');
    }
  };

  const deleteComment = async (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await axios.delete(`http://localhost:8080/comments/${commentId}`);
        setComments(prev => prev.filter(c => c.id !== commentId));
        setError(null);
      } catch (error) {
        console.error('Error deleting comment:', error);
        setError('Failed to delete comment. Please try again.');
      }
    }
  };

  const getInitials = (name) => {
    return name.split(' ').map(part => part[0]).join('').toUpperCase();
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>
  );

  if (!music) return <div className="text-center py-10">Music not found</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {error && (
          <div className="bg-red-100 text-red-700 p-4 mx-6 mt-4 rounded-lg">
            {error}
          </div>
        )}

        {/* Music Header */}
        <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">{music.title}</h1>
              <p className="text-white/90 mt-1">{music.artist}</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleLike}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full text-white hover:bg-white/30"
              >
                <FiHeart className={music.likesCount > 0 ? 'fill-current text-red-500' : ''} />
                <span>{music.likesCount}</span>
              </button>
              <button
                onClick={togglePlay}
                className="p-3 bg-white/20 rounded-full text-white hover:bg-white/30"
              >
                {isPlaying ? <FiPause size={24} /> : <FiPlay size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Music Details */}
        <div className="p-6">
          <div className="mb-6">
            <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full text-sm">
              {music.genre}
            </span>
          </div>

          {/* Comments Section */}
          <div className="border-t pt-6 px-6 pb-8">
            <h3 className="flex items-center text-2xl font-bold mb-6 text-gray-800">
              <FiMessageSquare className="mr-2 text-indigo-600" />
              Comments {comments.length > 0 && `(${comments.length})`}
            </h3>

            {comments.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No comments yet</p>
            ) : (
              <div className="space-y-8">
                {comments.map((c, index) => (
                  <div key={c.id} className="border-b pb-6 last:border-b-0">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600">
                        {getInitials(c.username)}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-bold text-gray-900">{c.username}</h4>
                          {index === 0 && (
                            <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
                              Top Comment
                            </span>
                          )}
                          <span className="text-sm text-gray-500">
                            <TimeAgo datetime={c.createdAt} />
                          </span>
                        </div>

                        {editingComment === c.id ? (
                          <div className="flex flex-col gap-2">
                            <textarea
                              value={editCommentContent}
                              onChange={(e) => setEditCommentContent(e.target.value)}
                              className="w-full p-2 border rounded-lg text-gray-900"
                              rows="3"
                            />
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => saveEditedComment(c.id)}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => {
                                  setEditingComment(null);
                                  setEditCommentContent('');
                                }}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="text-gray-800 mb-4">{c.content}</p>
                            <div className="flex items-center gap-4">
                              <button className="flex items-center text-gray-600 hover:text-indigo-600">
                                <FiCornerUpLeft className="mr-1" />
                                <span className="text-sm">Reply</span>
                              </button>
                              
                              {c.username === userId && (
                                <div className="flex gap-3">
                                  <button
                                    onClick={() => {
                                      setEditingComment(c.id);
                                      setEditCommentContent(c.content);
                                    }}
                                    className="text-gray-600 hover:text-blue-600 text-sm flex items-center"
                                  >
                                    <FiEdit2 className="mr-1" /> Edit
                                  </button>
                                  <button
                                    onClick={() => deleteComment(c.id)}
                                    className="text-gray-600 hover:text-red-600 text-sm flex items-center"
                                  >
                                    <FiTrash2 className="mr-1" /> Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Comment Input */}
            <form onSubmit={handleCommentSubmit} className="mt-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500">
                  {getInitials(userId)}
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full px-4 py-2 border-b-2 border-gray-200 focus:outline-none focus:border-indigo-600 text-gray-900 placeholder-gray-400"
                    maxLength={500}
                    required
                  />
                  <div className="mt-4 flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors flex items-center"
                    >
                      <FiSend className="mr-2" /> Post Comment
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicDetail;