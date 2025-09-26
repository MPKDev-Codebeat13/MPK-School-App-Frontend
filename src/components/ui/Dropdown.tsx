import React from 'react'

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
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`w-full px-4 py-3 rounded-xl bg-blue-600 text-white border border-blue-600 focus:ring-2 focus:ring-indigo-400 outline-none ${className}`}
    >
      <option
        value=""
        disabled
        style={{ backgroundColor: '#374151', color: 'white' }}
      >
        {placeholder}
      </option>
      {options.map((opt) => (
        <option
          key={opt.value}
          value={opt.value}
          style={{ backgroundColor: '#374151', color: 'white' }}
        >
          {opt.label}
        </option>
      ))}
    </select>
  )
}

export default Dropdown
