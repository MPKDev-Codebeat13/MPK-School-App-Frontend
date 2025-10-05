import React from 'react'

interface ScrollbarProps {
  children: React.ReactNode
  className?: string
}

const Scrollbar: React.FC<ScrollbarProps> = ({ children, className = '' }) => {
  return (
    <div
      className={`overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-500 scrollbar-track-indigo-100 hover:scrollbar-thumb-indigo-600 ${className}`}
    >
      {children}
    </div>
  )
}

export default Scrollbar
