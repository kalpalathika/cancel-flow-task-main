// src/lib/validation.ts
// Input validation utilities with XSS protection and rate limiting

// Sanitize string inputs to prevent XSS attacks
export function sanitizeString(input: string, maxLength: number = 1000): string {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string');
  }
  
  // Remove HTML tags and encode special characters
  const sanitized = input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
    
  // Enforce length limits
  if (sanitized.length > maxLength) {
    throw new Error(`Input exceeds maximum length of ${maxLength} characters`);
  }
  
  return sanitized;
}

// Validate email format
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

// Validate UUID format
export function validateUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// Validate survey response data
export function validateSurveyResponse(response: unknown): Record<string, unknown> {
  if (!response || typeof response !== 'object') {
    throw new Error('Survey response must be an object');
  }
  
  const validated: Record<string, unknown> = {};
  const allowedKeys = [
    'foundJob',
    'foundWithMigrateMate', 
    'jobTitle',
    'companyName',
    'salary',
    'startDate'
  ];
  
  for (const [key, value] of Object.entries(response as Record<string, unknown>)) {
    if (!allowedKeys.includes(key)) {
      continue; // Skip unknown keys
    }
    
    if (typeof value === 'string') {
      validated[key] = sanitizeString(value, 200);
    } else if (typeof value === 'boolean') {
      validated[key] = value;
    } else if (typeof value === 'number') {
      validated[key] = Math.max(0, Math.min(1000000, value)); // Salary bounds
    }
  }
  
  return validated;
}

// Validate feedback text
export function validateFeedback(feedback: string): string {
  if (!feedback || typeof feedback !== 'string') {
    throw new Error('Feedback must be a non-empty string');
  }
  
  const sanitized = sanitizeString(feedback, 2000);
  
  if (sanitized.length < 10) {
    throw new Error('Feedback must be at least 10 characters long');
  }
  
  return sanitized;
}

// Validate cancellation reason
export function validateCancellationReason(reason: string, details?: string): { reason: string; details?: string } {
  const allowedReasons = [
    'Too expensive',
    'Platform not helpful',
    'Found a job',
    'Taking a break',
    'Other'
  ];
  
  if (!allowedReasons.includes(reason)) {
    throw new Error('Invalid cancellation reason');
  }
  
  const result: { reason: string; details?: string } = { reason };
  
  if (details) {
    const sanitizedDetails = sanitizeString(details, 500);
    if (sanitizedDetails.length < 25) {
      throw new Error('Reason details must be at least 25 characters long');
    }
    result.details = sanitizedDetails;
  }
  
  return result;
}

// Validate visa type input
export function validateVisaType(visaType: string): string {
  if (!visaType || typeof visaType !== 'string') {
    throw new Error('Visa type must be a non-empty string');
  }
  
  const sanitized = sanitizeString(visaType, 100);
  
  if (sanitized.length < 2) {
    throw new Error('Visa type must be at least 2 characters long');
  }
  
  return sanitized;
}

// Rate limiting helper (simple in-memory implementation)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(identifier: string, maxAttempts: number = 5, windowMs: number = 60000): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);
  
  if (!record || now > record.resetTime) {
    // Reset or create new record
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (record.count >= maxAttempts) {
    return false; // Rate limit exceeded
  }
  
  record.count++;
  return true;
}

// Clean up expired rate limit records periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 60000); // Clean up every minute

// Input sanitization for database operations
export function sanitizeForDatabase(data: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined) {
      sanitized[key] = null;
    } else if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === 'boolean' || typeof value === 'number') {
      sanitized[key] = value;
    } else if (value instanceof Date) {
      sanitized[key] = value;
    } else {
      // Skip complex objects for security
      continue;
    }
  }
  
  return sanitized;
}

// Validate downsell variant
export function validateDownsellVariant(variant: string): 'A' | 'B' {
  if (variant !== 'A' && variant !== 'B') {
    throw new Error('Downsell variant must be either A or B');
  }
  return variant;
}

// Security logging helper
export function logSecurityEvent(event: string, userId?: string, details?: Record<string, unknown>): void {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    event,
    userId: userId || 'anonymous',
    details: details || {},
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server'
  };
  
  // In production, this should send to a proper logging service
  console.warn('[SECURITY]', logEntry);
}