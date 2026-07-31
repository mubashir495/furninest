'use client';
import { Sun, Moon, MonitorCog, Palette } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { ThemeMode } from '@/Type/theme';

const themeOptions: { label: string; value: ThemeMode; icon: React.ReactNode }[] = [
  { label: 'Light', value: 'light', icon: <Sun size={16} /> },
  { label: 'Dark', value: 'dark', icon: <Moon size={16} /> },
  { label: 'System', value: 'system', icon: <MonitorCog size={16} /> },
  { label: 'Custom', value: 'custom', icon: <Palette size={16} /> },
];

export function ThemeQuickSwitch() {
  const { mode, setMode, customTheme, setCustomTheme } = useTheme();

  return (
    <div className="absolute bottom-8 right-8 z-30 hidden md:block">
      <div className="glass dark:glass-dark p-3 rounded-2xl shadow-xl border border-white/10 backdrop-blur-md bg-white/10 dark:bg-black/30">
        <div className="flex flex-col gap-2">
          {themeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setMode(opt.value)}
              aria-label={`Switch to ${opt.label} theme`}
              aria-pressed={mode === opt.value}
              className={`p-2 rounded-xl transition-all text-sm flex items-center gap-2 ${
                mode === opt.value ? 'bg-accent text-accent-foreground shadow-md' : 'hover:bg-white/20 dark:hover:bg-white/10 text-white/80 hover:text-white'
              }`}
              title={opt.label}
            >
              {opt.icon}
              <span className="hidden lg:inline text-xs font-medium">{opt.label}</span>
            </button>
          ))}
          {mode === 'custom' && (
            <div className="border-t border-white/20 pt-2 mt-1">
              <label className="flex items-center gap-2 text-xs text-white/70 cursor-pointer">
                <Palette size={14} />
                <input
                  type="color"
                  value={customTheme.primary}
                  onChange={(e) => setCustomTheme({ ...customTheme, primary: e.target.value })}
                  className="w-6 h-6 p-0 border-0 rounded cursor-pointer bg-transparent"
                />
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}