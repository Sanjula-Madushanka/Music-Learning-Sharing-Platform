"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { api } from "../api"

const UserProfile = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUserData = async () => {
      const email = localStorage.getItem("userEmail")
      if (!email) {
        setLoading(false)
        setError("No user email found. Please log in again.")
        return
      }

      try {
        console.log(`Fetching user data for email: ${email}`)
        const response = await api.get(`/users/email/${email}`)
        console.log("User data response:", response.data)

        if (response.data) {
          setUser(response.data)
          if (response.data.id) {
            localStorage.setItem("userId", response.data.id)
          }
        } else {
          setError("No user data returned from server")
        }
      } catch (err) {
        console.error("Failed to fetch user", err)
        setError(`Error fetching user data: ${err.message}`)
        if (err.response && err.response.data && err.response.data.error) {
          setError(`${err.response.data.error}`)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-white">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-32 h-32 bg-purple-200 rounded-full mb-4"></div>
          <div className="h-8 w-64 bg-purple-200 rounded-md mb-4"></div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 w-80 bg-purple-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-white">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg border border-purple-100">
          <h2 className="text-2xl font-bold text-purple-700">Error</h2>
          <p className="mt-2 text-gray-600">{error}</p>
          <button onClick={() => navigate("/login")} className="mt-4 px-4 py-2 bg-purple-500 text-white rounded-full">
            Back to Login
          </button>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-white">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg border border-purple-100">
          <h2 className="text-2xl font-bold text-purple-700">User Not Found</h2>
          <p className="mt-2 text-gray-600">Please log in to view your profile</p>
          <button onClick={() => navigate("/login")} className="mt-4 px-4 py-2 bg-purple-500 text-white rounded-full">
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white p-4 sm:p-8 flex items-center justify-center">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
        <div className="bg-gradient-to-r from-purple-400 to-purple-600 h-48 flex items-center justify-center relative">
          <div className="absolute -bottom-16 w-32 h-32 sm:w-40 sm:h-40 bg-white p-1 rounded-full shadow-lg">
            {user.profilePictureUrl ? (
              <img
                src={user.profilePictureUrl || "/placeholder.svg"}
                alt={`${user.firstName}'s profile`}
                className="w-full h-full object-cover rounded-full"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.target.onerror = null
                  e.target.src = "/placeholder.svg?height=150&width=150"
                }}
              />
            ) : (
              <div className="w-full h-full rounded-full bg-purple-200 flex items-center justify-center">
                <span className="text-4xl font-bold text-purple-600">{user.firstName?.charAt(0) || "U"}</span>
              </div>
            )}
          </div>
        </div>

        <div className="pt-20 px-6 pb-8">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-1">
            {user.firstName} {user.lastName || ""}
          </h2>
          <p className="text-purple-600 text-center mb-6">{user.userRole}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
            <div className="group">
              <div className="flex items-center mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-purple-500 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <span className="text-sm font-semibold text-gray-500">Email</span>
              </div>
              <p className="text-gray-700 pl-7 group-hover:text-purple-600 transition-colors">{user.email}</p>
            </div>

            <div className="group">
              <div className="flex items-center mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-purple-500 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                <span className="text-sm font-semibold text-gray-500">Contact</span>
              </div>
              <p className="text-gray-700 pl-7 group-hover:text-purple-600 transition-colors">
                {user.contactNo || "Not provided"}
              </p>
            </div>

            <div className="group">
              <div className="flex items-center mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-purple-500 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-semibold text-gray-500">Gender</span>
              </div>
              <p className="text-gray-700 pl-7 group-hover:text-purple-600 transition-colors">
                {user.gender || "Not specified"}
              </p>
            </div>

            <div className="group">
              <div className="flex items-center mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-purple-500 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm font-semibold text-gray-500">Date of Birth</span>
              </div>
              <p className="text-gray-700 pl-7 group-hover:text-purple-600 transition-colors">
                {user.dob || "Not provided"}
              </p>
            </div>
          </div>

          <div className="mt-10 flex justify-center">
            <button
              onClick={() => navigate(`/edit/${user.id}`)}
              className="px-6 py-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-50"
            >
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserProfile
