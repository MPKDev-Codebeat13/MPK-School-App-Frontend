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

  const selectClass = `w-full px-4 py-3 rounded-xl border ${
    isLight
      ? 'bg-white text-gray-900 border-gray-300'
      : 'bg-gray-900 text-white border-gray-700'
  } focus:ring-2 focus:ring-indigo-400 outline-none ${className}`

  const optionClass = isLight
    ? 'bg-gray-50 text-gray-900'
    : 'bg-gray-800 text-white'

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={selectClass}
    >
      <option value="" disabled className={optionClass}>
        {placeholder}
      </option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} className={optionClass}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}

export default Dropdown
