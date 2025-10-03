import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input: React.FC<InputProps> = ({ className = '', ...props }) => {
  return (
    <input
      className={`w-full px-4 py-2 rounded-xl bg-gray-800 text-white border border-gray-600 focus:ring-2 focus:ring-purple-500 focus:outline-none sm:px-5 sm:py-3 sm:text-base md:px-6 md:py-3 md:text-lg ${className}`}
      {...props}
    />
  )
}
