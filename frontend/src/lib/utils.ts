import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(priceInr: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(priceInr);
}

export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

export function generateOrderId(): string {
  return 'SPF-' + Math.random().toString(36).substr(2, 8).toUpperCase();
}

export function luhnCheck(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, '');
  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits.charAt(i));
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

export function detectCardNetwork(cardNumber: string): 'visa' | 'mastercard' | 'amex' | 'unknown' {
  const digits = cardNumber.replace(/\D/g, '');
  if (/^4/.test(digits)) return 'visa';
  if (/^5[1-5]|^2[2-7]/.test(digits)) return 'mastercard';
  if (/^3[47]/.test(digits)) return 'amex';
  return 'unknown';
}

export function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}

export function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 2) {
    return digits.slice(0, 2) + '/' + digits.slice(2);
  }
  return digits;
}

export function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max - 3) + '...' : str;
}
