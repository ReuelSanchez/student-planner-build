import React, { createContext, useState, useEffect, useMemo } from 'react';
export const ThemeContext = /*#__PURE__*/createContext({
  theme: 'light',
  toggleTheme: () => {}
});
export const ThemeProvider = ({
  children
}) => {
  const [theme, setTheme] = useState(() => {
    // Check for saved theme in localStorage, default to 'light'
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark' || savedTheme === 'light' ? savedTheme : 'light';
  });
  useEffect(() => {
    const root = window.document.documentElement;
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (theme === 'dark') {
      root.classList.add('dark');
      if (themeColorMeta) {
        themeColorMeta.setAttribute('content', '#0f172a'); // slate-900
      }
    } else {
      root.classList.remove('dark');
      if (themeColorMeta) {
        themeColorMeta.setAttribute('content', '#0284c7'); // sky-600
      }
    }
    localStorage.setItem('theme', theme);
  }, [theme]);
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };
  const value = useMemo(() => ({
    theme,
    toggleTheme
  }), [theme, toggleTheme]);
  return /*#__PURE__*/React.createElement(ThemeContext.Provider, {
    value: value
  }, children);
};