// src/lib/csrf.ts
// CSRF protection utilities

// Generate a cryptographically secure random token
export function generateCSRFToken(): string {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    // Browser environment
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  } else {
    // Fallback for environments without crypto API
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
}

// Store CSRF token in session storage (client-side only)
export function storeCSRFToken(token: string): void {
  if (typeof window !== 'undefined' && window.sessionStorage) {
    sessionStorage.setItem('csrf_token', token);
  }
}

// Retrieve CSRF token from session storage
export function getStoredCSRFToken(): string | null {
  if (typeof window !== 'undefined' && window.sessionStorage) {
    return sessionStorage.getItem('csrf_token');
  }
  return null;
}

// Validate CSRF token
export function validateCSRFToken(submittedToken: string): boolean {
  const storedToken = getStoredCSRFToken();
  
  if (!storedToken || !submittedToken) {
    return false;
  }
  
  // Use constant-time comparison to prevent timing attacks
  if (storedToken.length !== submittedToken.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < storedToken.length; i++) {
    result |= storedToken.charCodeAt(i) ^ submittedToken.charCodeAt(i);
  }
  
  return result === 0;
}

// Initialize CSRF protection for a session
export function initializeCSRFProtection(): string {
  const token = generateCSRFToken();
  storeCSRFToken(token);
  return token;
}

// CSRF token hook for forms
export function useCSRFToken() {
  const [token, setToken] = useState<string>('');
  
  useEffect(() => {
    // Generate token on component mount
    const csrfToken = initializeCSRFProtection();
    setToken(csrfToken);
  }, []);
  
  const validateToken = (submittedToken: string): boolean => {
    return validateCSRFToken(submittedToken);
  };
  
  return { token, validateToken };
}

// React imports for the hook
import { useState, useEffect } from 'react';