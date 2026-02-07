import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface GlobalThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const GlobalThemeContext = createContext<GlobalThemeContextType | undefined>(undefined);

export function GlobalThemeProvider({ children }: { children: ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('global-dark-mode');
    return saved ? JSON.parse(saved) : false; // Default to light mode
  });

  useEffect(() => {
    localStorage.setItem('global-dark-mode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode((prev: boolean) => !prev);

  return (
    <GlobalThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </GlobalThemeContext.Provider>
  );
}

export function useGlobalTheme() {
  const context = useContext(GlobalThemeContext);
  if (!context) {
    throw new Error('useGlobalTheme must be used within GlobalThemeProvider');
  }
  return context;
}
