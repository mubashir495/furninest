'use client';

import { useTheme } from '@/context/ThemeContext';
import { ThemeMode } from '@/Type/theme';
import { useState } from 'react';

export const ThemeSwitcher = () => {
  const { mode, setMode, customTheme, setCustomTheme, isDark, toggleTheme } = useTheme();
  const [color, setColor] = useState(customTheme.primary);

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setColor(newColor);
    setCustomTheme({ ...customTheme, primary: newColor });
  };

  return (
    <div className="p-4 border rounded shadow bg-white dark:bg-gray-800 dark:text-white">
      <h3 className="text-lg font-bold">Theme Settings</h3>

      <div className="flex gap-2 mt-2">
        {(['light', 'dark', 'system', 'custom'] as ThemeMode[]).map((t) => (
          <button
            key={t}
            className={`px-3 py-1 rounded ${mode === t ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
            onClick={() => setMode(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {mode === 'custom' && (
        <div className="mt-3">
          <label className="block text-sm">Choose Primary Color:</label>
          <input
            type="color"
            value={color}
            onChange={handleCustomColorChange}
            className="mt-1 w-12 h-12 p-0 border-0"
          />
          <div className="mt-2 text-xs">
            Current primary: <span style={{ color }}>{color}</span>
          </div>
        </div>
      )}

      <button
        onClick={toggleTheme}
        className="mt-3 px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded"
      >
        Toggle (Current: {isDark ? 'Dark' : 'Light'})
      </button>
    </div>
  );
};