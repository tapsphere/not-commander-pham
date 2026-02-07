import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface StudioThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const StudioThemeContext = createContext<StudioThemeContextType | undefined>(undefined);

export function StudioThemeProvider({ children }: { children: ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('studio-dark-mode');
    return saved ? JSON.parse(saved) : true; // Default to dark
  });

  useEffect(() => {
    localStorage.setItem('studio-dark-mode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  return (
    <StudioThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
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
