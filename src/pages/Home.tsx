import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'

import { useAuth } from '../context/AuthContext'

const Home: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Remove redirect to dashboard, always stay on home page
  }, [user, navigate])

  return (
    <div className="flex flex-col items-center min-h-screen w-full text-white bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-x-hidden">
      <Header />

      <div className="flex-1 overflow-y-auto">
        {/* Hero / Welcome */}
        <section className="w-full text-center py-12 sm:py-16 md:py-24 px-4 bg-gradient-radial from-purple-600 via-indigo-700 to-indigo-800 text-white shadow-xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4">
            Welcome to MYM Nexus
          </h1>
          <p className="text-base sm:text-lg md:text-xl max-w-2xl mx-auto">
            Smarter learning, easier teaching, and smooth school management –
            all in one place.
          </p>
        </section>

        {/* Main 3-column layout */}
        <div className="grid gap-4 sm:gap-6 md:gap-8 max-w-[1300px] w-full my-8 sm:my-12 md:my-16 px-4 md:grid-cols-3">
          {/* About */}
          <section className="p-6 rounded-2xl text-center transition-transform duration-300 transform hover:scale-105 bg-indigo-800/20 shadow-lg">
            <h2 className="text-2xl font-bold mb-2 text-indigo-200">About</h2>
            <p className="mb-4 leading-relaxed">
              MYM Nexus keeps school life organized and fun. Plan lessons, track
              progress, and stay connected with parents and students easily.
            </p>
            <p className="mb-4 leading-relaxed">
              Teachers can upload homework, manage attendance, and generate
              reports in seconds. Students can track progress and access
              resources anytime.
            </p>
            <p className="mb-4 leading-relaxed">
              Parents get instant updates about their child's performance and
              upcoming school events. No more confusion or missed deadlines.
            </p>
            <p className="mb-4 leading-relaxed">
              Designed with simplicity in mind, MYM Nexus brings all school
              operations together in a smooth, intuitive interface.
            </p>
            <Link to="/about">
              <button className="border-2 border-indigo-200 rounded-full py-2 px-6 font-bold text-indigo-200 hover:bg-indigo-200 hover:text-gray-900 transition transform hover:scale-105 mt-2">
                Learn More
              </button>
            </Link>
          </section>

          {/* Features */}
          <section className="p-6 rounded-2xl transition-transform duration-300 transform hover:scale-105 bg-indigo-700/10">
            <h2 className="text-2xl font-bold mb-4 text-yellow-400">
              Features
            </h2>
            <ul className="list-none p-0">
              <li className="p-2 rounded-lg mb-2 transition transform hover:scale-105 hover:bg-white/10 cursor-pointer">
                🔒 Secure User Authentication (Signup, Login, Password Reset,
                Email Verification)
              </li>
              <li className="p-2 rounded-lg mb-2 transition transform hover:scale-105 hover:bg-white/10 cursor-pointer">
                📊 Dashboard Overview (Personalized for each user role)
              </li>
              <li className="p-2 rounded-lg mb-2 transition transform hover:scale-105 hover:bg-white/10 cursor-pointer">
                ✅ Attendance Management (Create Sessions, Take Attendance, List
                Records, View Details, Delete, Reports)
              </li>
              <li className="p-2 rounded-lg mb-2 transition transform hover:scale-105 hover:bg-white/10 cursor-pointer">
                📚 Lesson Planning (AI-Generated or Manual Creation, Manage
                Plans, Check Details, Reports)
              </li>
              <li className="p-2 rounded-lg mb-2 transition transform hover:scale-105 hover:bg-white/10 cursor-pointer">
                🤖 Homework Helper (AI-Powered Assistance for Students and
                Teachers)
              </li>
              <li className="p-2 rounded-lg mb-2 transition transform hover:scale-105 hover:bg-white/10 cursor-pointer">
                💬 Real-Time Chat (Public School Discussions)
              </li>
              <li className="p-2 rounded-lg mb-2 transition transform hover:scale-105 hover:bg-white/10 cursor-pointer">
                📈 Comprehensive Reports (Attendance Analytics and Lesson Plan
                Insights)
              </li>
              <li className="p-2 rounded-lg mb-2 transition transform hover:scale-105 hover:bg-white/10 cursor-pointer">
                👤 User Profile Management (Update Info, Settings, Complete
                Profile)
              </li>
              <li className="p-2 rounded-lg mb-2 transition transform hover:scale-105 hover:bg-white/10 cursor-pointer">
                🏫 Department Management (Organize School Departments)
              </li>
              <li className="p-2 rounded-lg mb-2 transition transform hover:scale-105 hover:bg-white/10 cursor-pointer">
                👨‍💼 Admin Panel (Manage Users, Oversee Operations)
              </li>
              <li className="p-2 rounded-lg mb-2 transition transform hover:scale-105 hover:bg-white/10 cursor-pointer">
                📧 Email Notifications and OAuth Integration
              </li>
            </ul>
          </section>

          {/* Why Us / CTA */}
          <section className="p-6 rounded-2xl text-center transition-transform duration-300 transform hover:scale-105 bg-indigo-800/20">
            <h2 className="text-2xl font-bold mb-4 text-pink-300">
              Why Choose Us?
            </h2>
            <p className="mb-4 leading-relaxed">
              Stop juggling multiple tools. Keep teachers, students, and parents
              on the same page. Save time, reduce mistakes, and make school life
              smoother and more enjoyable.
            </p>
            <p className="mb-4 leading-relaxed">
              Our app is intuitive, secure, and designed to make every school
              day efficient. Whether it’s lesson planning, attendance, or
              communication – MYM has you covered.
            </p>
            <Link to="/signup">
              <button className="py-3 px-8 rounded-full font-bold bg-yellow-400 text-gray-900 hover:bg-yellow-300 hover:scale-105 transition cursor-pointer mt-2">
                Get Started
              </button>
            </Link>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default Home
