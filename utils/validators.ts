// src/utils/validators.ts

export const validators = {
  required: (value: any) => {
    if (typeof value === 'string') {
      return value.trim().length > 0 || 'This field is required';
    }
    return value !== null && value !== undefined || 'This field is required';
  },

  minLength: (min: number) => (value: string) => {
    return value.length >= min || `Minimum ${min} characters required`;
  },

  maxLength: (max: number) => (value: string) => {
    return value.length <= max || `Maximum ${max} characters allowed`;
  },

  positiveNumber: (value: number) => {
    return value > 0 || 'Value must be greater than 0';
  },

  nonNegativeNumber: (value: number) => {
    return value >= 0 || 'Value cannot be negative';
  },

  imageFile: (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!validTypes.includes(file.type)) {
      return 'Only JPEG, PNG, WEBP, and SVG images are allowed';
    }
    if (file.size > maxSize) {
      return 'Image size must be less than 5MB';
    }
    return null;
  },
};

/**
 * Reusable currency formatter for the entire app.
 * Formats numeric amounts as British Pounds, e.g. £99, £99.99, £1,299.99.
 * Every component/page that displays a price should use this helper
 * instead of hand-rolled "Rs"/"$"/toLocaleString() formatting.
 */
export function formatCurrency(amount: number | null | undefined) {
  const value = typeof amount === 'number' && !Number.isNaN(amount) ? amount : 0;
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDate(dateString: string) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateString));
}