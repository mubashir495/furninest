export type ThemeMode = 'light' | 'dark' | 'system' | 'custom';

export interface CustomTheme {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;

}

export const defaultCustomTheme: CustomTheme = {
  primary: '#D4A373',      // Luxury Gold
  secondary: '#94A3B8',    // Soft Gray
  background: '#121212',   // Deep Black
  surface: '#1E1E1E',      // Card Background
  text: '#F8FAFC',         // White
};