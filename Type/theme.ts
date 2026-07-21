export type ThemeMode = 'light' | 'dark' | 'system' | 'custom';

export interface CustomTheme {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;

}

export const defaultCustomTheme: CustomTheme = {
  primary: '#3b82f6',    
  secondary: '#6b7280',  
  background: '#ffffff',
  surface: '#f9fafb',
  text: '#111827',
};