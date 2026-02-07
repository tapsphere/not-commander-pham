import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface StudioThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const StudioThemeContext = createContext<StudioThemeContextType | undefined>(undefined);

export function StudioThemeProvider({ children }: { children: ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('studio-dark-mode');
    return saved ? JSON.parse(saved) : false; // Default to light mode (Apple-style)
  });

  useEffect(() => {
    localStorage.setItem('studio-dark-mode', JSON.stringify(isDarkMode));
    // Apply dark class to document for global theme switching
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  return (
    <StudioThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <div className={isDarkMode ? 'dark' : ''}>
        {children}
      </div>
    </StudioThemeContext.Provider>
  );
}

export function useStudioTheme() {
  const context = useContext(StudioThemeContext);
  if (!context) {
    throw new Error('useStudioTheme must be used within StudioThemeProvider');
  }
  return context;
}
