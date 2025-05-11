"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { api } from "../api"
import toast from "react-hot-toast"
import CommentSection from "../components/CommentSection"
import LikeButton from "../components/LikeButton"

const PostFeed = () => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState(null)
  const [expandedPost, setExpandedPost] = useState(null)

  useEffect(() => {
    const userId = localStorage.getItem("userId")
    setCurrentUserId(userId)

    if (userId) {
      fetchPostsForUser(userId)
    } else {
      fetchPosts()
    }
  }, [])

  const fetchPosts = async () => {
    try {
      const response = await api.get("/posts")
      setPosts(response.data)
    } catch (error) {
      console.error("Error fetching posts:", error)
      toast.error("Failed to load posts")
    } finally {
      setLoading(false)
    }
  }

  const fetchPostsForUser = async (userId) => {
    try {
      const response = await api.get(`/posts/for-user/${userId}`)
      setPosts(response.data)
    } catch (error) {
      console.error("Error fetching posts for user:", error)
      toast.error("Failed to load posts")
    } finally {
      setLoading(false)
    }
  }

  const toggleComments = (postId) => {
    if (expandedPost === postId) {
      setExpandedPost(null)
    } else {
      setExpandedPost(postId)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-16 h-16 relative">
          <div className="absolute inset-0 rounded-full border-t-2 border-purple-500 animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-r-2 border-purple-400 animate-spin animate-reverse"></div>
          <div className="absolute inset-4 rounded-full border-b-2 border-purple-300 animate-spin"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Music Feed</h1>
          <Link
            to="/create-post"
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full text-white font-medium hover:from-purple-600 hover:to-purple-700 transition-all duration-300 hover:scale-105"
          >
            Create Post
          </Link>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-12">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto text-purple-500/50 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <h3 className="text-xl font-medium text-purple-200">No posts yet</h3>
            <p className="text-purple-200/70 mt-2">Be the first to share your music journey!</p>
          </div>
        ) : (
          <div className="space-y-8">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-black/60 backdrop-blur-xl rounded-3xl border border-purple-500/20 shadow-[0_0_30px_rgba(236,72,153,0.1)] overflow-hidden"
              >
                {/* Post Header */}
                <div className="flex items-center p-4 border-b border-purple-500/10">
                  <Link to={`/profile/${post.userId}`} className="flex items-center">
                    {post.user?.profilePictureUrl ? (
                      <img
                        src={post.user.profilePictureUrl || "/placeholder.svg"}
                        alt={`${post.user.firstName}'s profile`}
                        className="w-10 h-10 rounded-full object-cover border-2 border-purple-500"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center border-2 border-purple-500">
                        <span className="text-lg font-bold text-purple-600">
                          {post.user?.firstName?.charAt(0) || "U"}
                        </span>
                      </div>
                    )}
                    <div className="ml-3">
                      <p className="font-medium text-white">
                        {post.user?.firstName} {post.user?.lastName}
                      </p>
                      <p className="text-xs text-purple-300">
                        {new Date(post.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </Link>

                  {/* Show edit options if current user is the post owner */}
                  {currentUserId && post.userId.toString() === currentUserId.toString() && (
                    <div className="ml-auto">
                      <Link
                        to={`/edit-post/${post.id}`}
                        className="text-purple-400 hover:text-purple-300 transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </Link>
                    </div>
                  )}
                </div>

                {/* Post Media */}
                {post.mediaItems && post.mediaItems.length > 0 && (
                  <div className={`grid grid-cols-${Math.min(post.mediaItems.length, 3)}`}>
                    {post.mediaItems.map((media, index) => (
                      <div key={index} className="aspect-square">
                        <img
                          src={media.mediaUrl || "/placeholder.svg"}
                          alt={`Post media ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Post Caption */}
                <div className="p-4">
                  <p className="text-white">{post.caption}</p>

                  {/* Like and Comment Actions */}
                  <div className="mt-4 flex items-center space-x-4">
                    <LikeButton
                      postId={post.id}
                      userId={currentUserId}
                      initialLikeCount={post.likeCount}
                      initialHasLiked={post.hasLiked}
                      isOwner={currentUserId && post.userId.toString() === currentUserId.toString()}
                    />

                    <button
                      onClick={() => toggleComments(post.id)}
                      className="flex items-center text-sm text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                      {post.commentCount} {post.commentCount === 1 ? "comment" : "comments"}
                    </button>
                  </div>

                  {/* Comments Section (expanded when clicked) */}
                  {expandedPost === post.id && <CommentSection postId={post.id} />}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default PostFeed
