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

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateString: string) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateString));
}