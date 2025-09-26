import React from 'react'
import { useAuth } from '../context/AuthContext'

export default function WelcomeBanner() {
  const { user } = useAuth()

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 18) return 'Good Afternoon'
    return 'Good Evening'
  }

  return (
    <div className="bg-gradient-to-r from-violet-700 to-indigo-600 text-white p-6 rounded-2xl shadow-md">
      <h1 className="text-2xl font-bold animate-fade-in">
        {getGreeting()}, {user?.fullName || 'Guest'} 👋
      </h1>
      <p className="text-sm opacity-80 mt-1">
        Welcome back! Here’s what’s waiting for you today.
      </p>
    </div>
  )
}
