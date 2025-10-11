import React from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'

import { Link } from 'react-router-dom'

const About: React.FC = () => {
  return (
    <div className="flex flex-col items-center min-h-screen w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-indigo-100 font-sans">
      <Header />

      <div className="flex-1">
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
        <section className="max-w-4xl w-11/12 bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-6 sm:p-8 md:p-10 my-8 sm:my-10 md:my-12 text-indigo-100 text-center">
          <h2 className="text-3xl font-bold mb-4 text-yellow-400">
            What is MYM Nexus?
          </h2>
          <p className="text-lg leading-relaxed mb-8 mx-auto max-w-3xl">
            MYM Nexus is a comprehensive school management platform that
            integrates all aspects of educational administration into a single,
            user-friendly application. It serves as a centralized hub where
            teachers, students, parents, and administrators can access tools for
            attendance tracking, lesson planning, homework assistance, real-time
            communication, and detailed reporting. By consolidating these
            functionalities, MYM Nexus eliminates the fragmentation often found
            in traditional school systems, allowing users to manage their
            educational responsibilities more efficiently and effectively.
          </p>

          <h2 className="text-3xl font-bold mb-4 text-yellow-400">
            Why Choose MYM Nexus?
          </h2>
          <p className="text-lg leading-relaxed mb-8 mx-auto max-w-3xl">
            Choosing MYM Nexus means opting for a streamlined, efficient
            approach to school management. It eliminates the need for multiple
            disconnected tools, which often lead to confusion and
            inefficiencies. By reducing administrative workload, teachers can
            dedicate more time to teaching and student interaction. Enhanced
            communication features foster better collaboration between parents,
            teachers, and students, ensuring everyone stays informed and
            engaged. Overall, MYM Nexus enhances the educational experience by
            providing a cohesive platform that supports personalized learning,
            timely feedback, and data-driven insights, ultimately leading to
            better academic outcomes and a more connected school community.
          </p>

          <h2 className="text-3xl font-bold mb-4 text-yellow-400">
            How Does It Work?
          </h2>
          <p className="text-lg leading-relaxed mb-8 mx-auto max-w-3xl">
            Through a centralized dashboard, users can access features like
            attendance tracking, lesson planning, homework assistance, real-time
            chat, and detailed reports, all seamlessly integrated and accessible
            from any device.
          </p>

          <h2 className="text-3xl font-bold mb-4 text-yellow-400">
            Who Is It For?
          </h2>
          <p className="text-lg leading-relaxed mx-auto max-w-3xl">
            Designed for teachers, students, parents, and school administrators
            who want to streamline school operations, improve communication, and
            focus more on education rather than paperwork.
          </p>
        </section>

        {/* CTA Section */}
        <section className="text-center my-16 px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-indigo-200">
            Ready to Enjoy the Adventure?
          </h2>
          <Link
            to="/signup"
            className="inline-block bg-yellow-400 text-slate-900 px-8 py-3 rounded-full font-bold text-lg shadow-md hover:bg-yellow-500 hover:scale-105 transition-transform mt-4"
          >
            Get Started
          </Link>
        </section>
      </div>

      <Footer />
    </div>
  )
}

export default About
