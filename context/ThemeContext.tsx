'use client'; 

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeMode, CustomTheme, defaultCustomTheme } from '@/Type/theme';

interface ThemeContextType {
  mode: ThemeMode;
  customTheme: CustomTheme;
  setMode: (mode: ThemeMode) => void;
  setCustomTheme: (theme: CustomTheme) => void;
  toggleTheme: () => void; // لائٹ/ڈارک کے درمیان ٹوگل
  isDark: boolean;         // موجودہ موڈ (سسٹم کو ریئل ٹائم فالو کرے گا)
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  // مقامی اسٹوریج سے پڑھیں
  const getInitialMode = (): ThemeMode => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('themeMode') as ThemeMode;
      if (stored && ['light', 'dark', 'system', 'custom'].includes(stored)) return stored;
    }
    return 'system'; // ڈیفالٹ
  };

  const getInitialCustomTheme = (): CustomTheme => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('customTheme');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return defaultCustomTheme;
        }
      }
    }
    return defaultCustomTheme;
  };

  const [mode, setMode] = useState<ThemeMode>(getInitialMode);
  const [customTheme, setCustomTheme] = useState<CustomTheme>(getInitialCustomTheme);
  const [isDark, setIsDark] = useState<boolean>(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (mode === 'system') {
        setIsDark(mediaQuery.matches);
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    handleChange();
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [mode]);

  useEffect(() => {
    let dark = false;
    if (mode === 'dark') dark = true;
    else if (mode === 'light') dark = false;
    else if (mode === 'system') {
      dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    } else if (mode === 'custom') {
      dark = false;
    }
    setIsDark(dark);
  }, [mode]);

  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  useEffect(() => {
    localStorage.setItem('customTheme', JSON.stringify(customTheme));
  }, [customTheme]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [isDark]);

  const toggleTheme = () => {
    if (mode === 'light') setMode('dark');
    else if (mode === 'dark') setMode('light');
    else if (mode === 'system') {
      const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setMode(isSystemDark ? 'light' : 'dark');
    } else if (mode === 'custom') {
      setMode('light'); 
    }
  };

  const value = {
    mode,
    customTheme,
    setMode,
    setCustomTheme,
    toggleTheme,
    isDark,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};