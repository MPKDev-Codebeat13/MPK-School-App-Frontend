import React from 'react'
import { useTheme } from '../../context/ThemeContext'

interface DropdownProps {
  options: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  disabled = false,
  className = '',
}) => {
  const { isLight } = useTheme()

  const selectClass = `w-full px-4 py-3 rounded-xl ${
    isLight
      ? 'bg-white text-gray-900 border-gray-300'
      : 'bg-gray-800 text-white border-gray-600'
  } focus:ring-2 focus:ring-indigo-400 outline-none ${className}`

  const optionStyle = {
    backgroundColor: isLight ? '#f9fafb' : '#374151',
    color: isLight ? '#111827' : 'white',
  }

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={selectClass}
    >
      <option value="" disabled style={optionStyle}>
        {placeholder}
      </option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} style={optionStyle}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}

export default Dropdown
