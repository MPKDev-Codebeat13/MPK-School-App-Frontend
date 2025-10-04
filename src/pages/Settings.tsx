import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext' // import global theme
import Sidebar from '../components/Sidebar'

const themes = [
  {
    name: 'Default Gradient',
    class:
      'bg-gradient-to-br from-indigo-900 via-purple-950 to-pink-900 text-white',
  },
  {
    name: 'Ocean Breeze',
    class: 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white',
  },
  {
    name: 'Sunset Glow',
    class:
      'bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 text-white',
  },
  { name: 'Dark Mode', class: 'bg-gray-900 text-white' },
  { name: 'Light Mode', class: 'bg-gray-100 text-gray-900' },
  {
    name: 'Cosmic Nebula',
    class: 'bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white',
  },
  {
    name: 'Forest Aurora',
    class:
      'bg-gradient-to-br from-green-800 via-teal-600 to-blue-800 text-white',
  },
  {
    name: 'Fire Ember',
    class:
      'bg-gradient-to-br from-red-900 via-orange-800 to-yellow-600 text-white',
  },
  {
    name: 'Arctic Ice',
    class:
      'bg-gradient-to-br from-blue-200 via-cyan-300 to-white text-gray-900',
  },
  {
    name: 'Golden Hour',
    class:
      'bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600 text-white',
  },
  {
    name: 'Midnight Abyss',
    class: 'bg-gradient-to-br from-black via-purple-900 to-red-900 text-white',
  },
  {
    name: 'Neon Glow',
    class:
      'bg-gradient-to-br from-pink-500 via-blue-500 to-green-500 text-white',
  },
  {
    name: 'Pastel Dream',
    class:
      'bg-gradient-to-br from-pink-100 via-blue-100 to-green-100 text-gray-800',
  },
  {
    name: 'Retro Synthwave',
    class:
      'bg-gradient-to-br from-purple-600 via-pink-600 to-cyan-600 text-white',
  },
  {
    name: 'Nature Zen',
    class:
      'bg-gradient-to-br from-green-300 via-blue-200 to-teal-300 text-gray-800',
  },
  {
    name: 'Cyberpunk Neon',
    class:
      'bg-black bg-gradient-to-br from-green-400 via-pink-500 to-purple-600 text-white',
  },
  {
    name: 'Desert Mirage',
    class:
      'bg-gradient-to-br from-yellow-300 via-orange-400 to-red-500 text-white',
  },
  {
    name: 'Forest Whisper',
    class: 'bg-gradient-to-br from-green-900 via-brown-800 to-black text-white',
  },
  {
    name: 'Ice Crystal',
    class:
      'bg-gradient-to-br from-blue-100 via-cyan-200 to-white text-gray-900',
  },
  {
    name: 'Royal Velvet',
    class: 'bg-gradient-to-br from-purple-900 via-gold-600 to-black text-white',
  },
  {
    name: 'Electric Vibes',
    class: 'bg-gradient-to-br from-purple-500 via-pink-500 to-yellow-400 text-white',
  },
  {
    name: 'Tropical Sunset',
    class: 'bg-gradient-to-br from-yellow-400 via-red-400 to-pink-500 text-white',
  },
  {
    name: 'Mystic Forest',
    class: 'bg-gradient-to-br from-green-700 via-green-900 to-black text-white',
  },
  {
    name: 'Solar Flare',
    class: 'bg-gradient-to-br from-red-600 via-orange-600 to-yellow-500 text-white',
  },
  {
    name: 'Deep Ocean',
    class: 'bg-gradient-to-br from-blue-800 via-blue-900 to-black text-white',
  },
  {
    name: 'Lavender Dream',
    class: 'bg-gradient-to-br from-purple-300 via-pink-300 to-white text-gray-900',
  },
]

const Settings: React.FC = () => {
  const { theme, setTheme } = useTheme() // use global theme
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
  })
  const [privacy, setPrivacy] = useState({ visible: true, showPhone: false })

  return (
    <div
      className={`flex min-h-screen ${
        isSidebarOpen ? 'flex-col sm:flex-row' : 'flex-row'
      } overflow-x-hidden ${theme.class}`}
    >
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-violet-300">
          Settings ⚙️
        </h1>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6 sm:space-y-8"
        >
          {/* Theme Selection */}
          <section className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 sm:p-6 shadow-lg">
            <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-violet-300">
              🎨 Theme
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {themes.map((t) => (
                <button
                  key={t.name}
                  onClick={() => setTheme(t)}
                  className={`p-3 sm:p-4 rounded-xl shadow text-center font-semibold transition-all duration-200 text-sm sm:text-base ${
                    theme.name === t.name
                      ? 'ring-4 ring-violet-500 scale-105'
                      : 'hover:scale-105'
                  } ${t.class}`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </section>

          {/* Keep the rest same (notifications, privacy, account) */}
        </motion.div>
      </main>
    </div>
  )
}

export default Settings
