import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "light",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
 const [theme, setTheme] = useState<Theme>(() => {
    // Check if we should force dark theme based on path
    const path = window.location.pathname;
    const isSiswaOrAdmin = path.startsWith('/siswa') || path.startsWith('/admin');

    // Force dark theme for non-siswa/admin routes
    if (!isSiswaOrAdmin) {
      return "dark";
    }

    // For siswa/admin routes, use saved preference or default
    return (localStorage.getItem(storageKey) as Theme) || defaultTheme;
  })

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove("light", "dark")

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light"

      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme])

  // Force dark theme on non-siswa/admin routes even if theme changes
  useEffect(() => {
    const checkAndForceTheme = () => {
      const path = window.location.pathname;
      const isSiswaOrAdmin = path.startsWith('/siswa') || path.startsWith('/admin');

      if (!isSiswaOrAdmin && theme !== 'dark') {
        setTheme('dark');
      }
    };

    checkAndForceTheme();

    // Listen for Inertia navigation
    document.addEventListener('inertia:navigate', checkAndForceTheme);
    return () => document.removeEventListener('inertia:navigate', checkAndForceTheme);
  }, [theme])

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      // Prevent theme changes on non-siswa/admin routes
      const path = window.location.pathname;
      const isSiswaOrAdmin = path.startsWith('/siswa') || path.startsWith('/admin');

      if (!isSiswaOrAdmin) {
        // Force dark theme, don't allow changes
        return;
      }

      localStorage.setItem(storageKey, newTheme)
      setTheme(newTheme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
