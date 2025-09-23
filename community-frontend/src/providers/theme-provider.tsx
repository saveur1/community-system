import React, { createContext, useState, useEffect, useContext, type ReactNode } from 'react';

// Theme types
export type ThemeMode = 'system' | 'light' | 'dark';

// Theme context interface
interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: (mode: ThemeMode) => void;
  actualTheme: 'light' | 'dark'; // The actual applied theme (resolved from system if needed)
}

// Theme provider props interface
interface ThemeProviderProps {
  children: ReactNode;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const getInitialTheme = (): ThemeMode => {
    // Check if theme is stored in localStorage
    if ('theme' in localStorage) {
      const savedTheme = localStorage.getItem('theme') as ThemeMode;
      if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
        return savedTheme;
      }
    }
    // Default to system preference if no theme is stored
    return 'system';
  };

  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');

  // Function to get the resolved theme
  const getResolvedTheme = (themeMode: ThemeMode): 'light' | 'dark' => {
    if (themeMode === 'system') {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return themeMode;
  };

  // Function to apply the actual theme to the document (following Tailwind docs approach)
  const applyTheme = (themeMode: ThemeMode) => {
    const root = document.documentElement;
    const resolvedTheme = getResolvedTheme(themeMode);
    
    setActualTheme(resolvedTheme);
    
    // Apply data-theme attribute for your custom variant
    root.setAttribute('data-theme', resolvedTheme);
    
    // Also toggle the dark class as per Tailwind docs approach
    root.classList.toggle(
      'dark',
      localStorage.theme === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
    );
  };

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Listen for system theme changes when in system mode
  useEffect(() => {
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        applyTheme('system');
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  const toggleTheme = (mode: ThemeMode) => {
    // Follow Tailwind CSS docs approach for localStorage handling
    if (mode === 'light') {
      localStorage.theme = 'light';
    } else if (mode === 'dark') {
      localStorage.theme = 'dark';
    } else {
      // System mode - remove theme from localStorage to respect OS preference
      localStorage.removeItem('theme');
    }
    
    setTheme(mode);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, actualTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme context
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export { ThemeProvider, ThemeContext };