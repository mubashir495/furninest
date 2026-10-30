'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { ThemeMode, CustomTheme, defaultCustomTheme } from '@/Type/theme';

interface ThemeContextType {
  mode: ThemeMode;
  customTheme: CustomTheme;
  setMode: (mode: ThemeMode) => void;
  setCustomTheme: (theme: CustomTheme) => void;
  toggleTheme: () => void;
  isDark: boolean;
  /** false until the first client-side effect has run; components that
   *  render theme-dependent classes should wait for this before diffing. */
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  // ── Always start with the SSR-safe default so server HTML === initial
  //    client HTML.  The actual persisted value is applied in useEffect
  //    after hydration is complete.
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [customTheme, setCustomThemeState] = useState<CustomTheme>(defaultCustomTheme);
  const [isDark, setIsDark] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  // ── Step 1: On first mount, read localStorage and reconcile.
  //    This runs only on the client, after React has already committed
  //    the initial (server-matching) render, so there is no hydration diff.
  useEffect(() => {
    const storedMode = localStorage.getItem('themeMode') as ThemeMode | null;
    if (storedMode && ['light', 'dark', 'system', 'custom'].includes(storedMode)) {
      setModeState(storedMode);
    }

    const storedCustom = localStorage.getItem('customTheme');
    if (storedCustom) {
      try {
        setCustomThemeState(JSON.parse(storedCustom));
      } catch {
        // ignore corrupt stored value
      }
    }

    setMounted(true);
  }, []);

  // ── Step 2: Resolve isDark whenever mode changes.
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const resolve = () => {
      if (mode === 'dark') return true;
      if (mode === 'light') return false;
      if (mode === 'system') return mediaQuery.matches;
      return false; // custom
    };

    setIsDark(resolve());

    // Re-resolve when system preference changes (only relevant in 'system' mode)
    const onMediaChange = () => {
      if (mode === 'system') setIsDark(mediaQuery.matches);
    };
    mediaQuery.addEventListener('change', onMediaChange);
    return () => mediaQuery.removeEventListener('change', onMediaChange);
  }, [mode]);

  // ── Step 3: Apply dark class to <html>
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // ── Step 4: Persist mode to localStorage
  useEffect(() => {
    if (mounted) localStorage.setItem('themeMode', mode);
  }, [mode, mounted]);

  // ── Step 5: Persist customTheme to localStorage
  useEffect(() => {
    if (mounted) localStorage.setItem('customTheme', JSON.stringify(customTheme));
  }, [customTheme, mounted]);

  const setMode = (m: ThemeMode) => setModeState(m);
  const setCustomTheme = (t: CustomTheme) => setCustomThemeState(t);

  const toggleTheme = () => {
    if (mode === 'light') setModeState('dark');
    else if (mode === 'dark') setModeState('light');
    else if (mode === 'system') {
      const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setModeState(isSystemDark ? 'light' : 'dark');
    } else {
      setModeState('light');
    }
  };

  return (
    <ThemeContext.Provider
      value={{ mode, customTheme, setMode, setCustomTheme, toggleTheme, isDark, mounted }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
