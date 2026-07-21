import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'system');
  const [glass, setGlass] = useState(localStorage.getItem('glass') === 'true');

  useEffect(() => {
    localStorage.setItem('theme', theme);
    const root = window.document.documentElement;
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.setAttribute('data-theme', systemTheme);
    } else {
      root.setAttribute('data-theme', theme);
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('glass', glass);
    const root = window.document.documentElement;
    root.setAttribute('data-glass', glass ? 'true' : 'false');
  }, [glass]);

  // Listen for system theme changes if set to system
  useEffect(() => {
    if (theme !== 'system') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      window.document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => {
      if (prev === 'system') {
        const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        return isSystemDark ? 'light' : 'dark';
      }
      return prev === 'dark' ? 'light' : 'dark';
    });
  };

  const toggleGlass = () => {
    setGlass(prev => !prev);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, glass, setGlass, toggleGlass }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
