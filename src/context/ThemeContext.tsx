import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
  useEffect,
} from 'react'
import { useAuth } from './AuthContext'

type Theme = {
  name: string
  class: string
}

type ThemeContextType = {
  theme: Theme
  setTheme: (theme: Theme) => void
  isLight: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const THEME_STORAGE_KEY = 'app-theme'

const defaultTheme: Theme = {
  name: 'Default Gradient',
  class:
    'bg-gradient-to-br from-indigo-900 via-purple-950 to-pink-900 text-white',
}

// Helper function to determine if a theme is light
const isLightTheme = (theme: Theme): boolean => {
  // Check theme name for explicit light themes
  if (theme.name.toLowerCase().includes('light')) {
    return true
  }

  // Check theme name for explicit dark themes
  if (theme.name.toLowerCase().includes('dark')) {
    return false
  }

  // Check CSS classes for light indicators
  if (
    theme.class.includes('text-gray-900') ||
    theme.class.includes('bg-gray-100')
  ) {
    return true
  }

  // Check CSS classes for dark indicators
  if (
    theme.class.includes('text-white') ||
    theme.class.includes('bg-gray-900')
  ) {
    return false
  }

  // Default to dark for gradient themes
  return false
}

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth()
  const getStorageKey = (userId?: string) =>
    userId ? `${THEME_STORAGE_KEY}-${userId}` : `${THEME_STORAGE_KEY}-default`

  const [theme, setTheme] = useState<Theme>(() => {
    const key = getStorageKey(user?._id || user?.id)
    const storedTheme = localStorage.getItem(key)
    if (storedTheme) {
      try {
        return JSON.parse(storedTheme) as Theme
      } catch {
        return defaultTheme
      }
    }
    return defaultTheme
  })

  const isLight = isLightTheme(theme)

  // Save theme to user-specific key
  useEffect(() => {
    const key = getStorageKey(user?._id || user?.id)
    localStorage.setItem(key, JSON.stringify(theme))
    console.log(
      '[ThemeProvider] theme updated:',
      theme,
      'for user:',
      user?.email
    )
  }, [theme, user])

  // Reload theme when user changes
  useEffect(() => {
    const key = getStorageKey(user?._id || user?.id)
    const storedTheme = localStorage.getItem(key)
    if (storedTheme) {
      try {
        setTheme(JSON.parse(storedTheme) as Theme)
      } catch {
        setTheme(defaultTheme)
      }
    } else {
      setTheme(defaultTheme)
    }
  }, [user])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isLight }}>
      <div
        className={`min-h-screen ${theme.class} transition-colors duration-300`}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider')
  }
  return context
}
