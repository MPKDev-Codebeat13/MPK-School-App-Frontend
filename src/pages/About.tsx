import React from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { Link } from 'react-router-dom'

const About: React.FC = () => {
  return (
    <div className="flex flex-col items-center min-h-screen w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-indigo-100 font-sans overflow-x-hidden">
      <Header />

      {/* Hero Section */}
      <section className="w-full text-center py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-gradient-to-tr from-indigo-500 to-indigo-700 rounded-2xl shadow-2xl mt-4 sm:mt-6 md:mt-8 mx-2 sm:mx-4 md:mx-12">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 text-white drop-shadow-lg">
          About MYM Nexus
        </h1>
        <p className="text-base sm:text-lg md:text-xl leading-relaxed max-w-3xl mx-auto text-indigo-100">
          MYM Nexus is designed to make school life simple, organized, and
          engaging for students, teachers, and parents alike.
        </p>
      </section>

      {/* Details Section */}
      <section className="max-w-4xl w-11/12 bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-6 sm:p-8 md:p-10 my-8 sm:my-10 md:my-12 text-indigo-100">
        <h2 className="text-3xl font-bold mb-4 text-yellow-400">
          What We Offer
        </h2>
        <p className="text-lg leading-relaxed mb-8 text-justify">
          Our platform allows teachers to plan lessons efficiently, track
          attendance, and communicate with students and parents in real-time.
          Students can follow tasks and stay on top of assignments, while
          parents can monitor progress and receive updates.
        </p>

        <h2 className="text-3xl font-bold mb-4 text-yellow-400">
          How It Works
        </h2>
        <p className="text-lg leading-relaxed mb-8 text-justify">
          Everything is streamlined into a single app. Teachers create lesson
          plans, students access tasks and notes, and parents get notifications.
          Communication is smooth and centralized.
        </p>

        <h2 className="text-3xl font-bold mb-4 text-yellow-400">
          Why Choose MYM?
        </h2>
        <p className="text-lg leading-relaxed text-justify">
          By reducing chaos and improving organization, MYM Nexus saves
          time, increases engagement, and makes school management fun. Our goal
          is to connect all school stakeholders effortlessly while keeping the
          experience stylish and intuitive.
        </p>
      </section>

      {/* CTA Section */}
      <section className="text-center my-16 px-6">
        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-indigo-200">
          Ready to Enjoy the Adventure?
        </h2>
        <Link
          to="/signup"
          className="inline-block bg-yellow-400 text-slate-900 px-8 py-3 rounded-full font-bold text-lg shadow-md hover:bg-yellow-500 hover:scale-105 transition-transform"
        >
          Get Started
        </Link>
      </section>

      <Footer />
    </div>
  )
}

export default About
