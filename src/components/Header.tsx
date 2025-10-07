import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FiMenu, FiX } from 'react-icons/fi'

const Header: React.FC = () => {
  const location = useLocation()
  const path = location.pathname
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => setIsOpen(!isOpen)

  return (
    <header className="w-full flex items-center justify-between px-6 py-4 bg-indigo-600 text-white sticky top-0 z-50 shadow-lg">
      {/* Logo */}
      <div className="flex items-center space-x-3">
        <img
          src="/logo.png"
          alt="MYM Nexus Logo"
          className="h-12 w-12 object-contain"
        />
        <span className="text-3xl font-bold tracking-wide">MYM Nexus</span>
      </div>

      {/* Desktop Nav */}
      <nav className="hidden md:flex flex-1 justify-center items-center gap-8">
        {path !== '/' && (
          <Link
            to="/"
            className="font-medium hover:text-yellow-400 hover:scale-105 transition-transform"
          >
            Home
          </Link>
        )}
        {path !== '/about' && (
          <Link
            to="/about"
            className="font-medium hover:text-yellow-400 hover:scale-105 transition-transform"
          >
            About
          </Link>
        )}
      </nav>

      {/* CTA Buttons */}
      <div className="hidden md:flex items-center gap-4">
        <Link
          to="/signup"
          className="bg-yellow-400 text-slate-800 px-5 py-2 rounded-xl font-semibold hover:bg-yellow-500 hover:scale-105 transition-transform"
        >
          Get Started
        </Link>
        <Link
          to="/login"
          className="bg-yellow-400 text-slate-800 px-5 py-2 rounded-xl font-semibold hover:bg-yellow-500 hover:scale-105 transition-transform"
        >
          Login
        </Link>
      </div>

      {/* Mobile Menu Icon */}
      <div className="md:hidden cursor-pointer" onClick={toggleMenu}>
        {isOpen ? <FiX size={28} /> : <FiMenu size={28} />}
      </div>

      {/* Mobile Nav */}
      <div
        className={`absolute top-16 right-0 bg-indigo-600 w-56 p-6 rounded-bl-xl flex flex-col gap-4 transform transition-transform duration-300 md:hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {path !== '/' && (
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="font-medium hover:text-yellow-400 hover:scale-105 transition-transform"
          >
            Home
          </Link>
        )}
        {path !== '/about' && (
          <Link
            to="/about"
            onClick={() => setIsOpen(false)}
            className="font-medium hover:text-yellow-400 hover:scale-105 transition-transform"
          >
            About
          </Link>
        )}
        <Link
          to="/signup"
          onClick={() => setIsOpen(false)}
          className="bg-yellow-400 text-slate-800 px-5 py-2 rounded-xl font-semibold hover:bg-yellow-500 hover:scale-105 transition-transform"
        >
          Get Started
        </Link>
        <Link
          to="/login"
          onClick={() => setIsOpen(false)}
          className="bg-yellow-400 text-slate-800 px-5 py-2 rounded-xl font-semibold hover:bg-yellow-500 hover:scale-105 transition-transform"
        >
          Login
        </Link>
      </div>
    </header>
  )
}

export default Header
