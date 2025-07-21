import { z } from 'zod'

// Security-focused input validation utilities
export class InputValidator {
  // Remove potentially harmful characters
  static sanitizeString(input: string): string {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/javascript:/gi, '') // Remove javascript: protocols
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .trim()
  }

  // Validate email with strict rules
  static validateEmail(email: string): boolean {
    const emailSchema = z.string()
      .email()
      .min(5)
      .max(254)
      .refine(email => !email.includes('..'), 'Invalid email format')
      .refine(email => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email))

    try {
      emailSchema.parse(email)
      return true
    } catch {
      return false
    }
  }

  // Validate phone numbers
  static validatePhone(phone: string): boolean {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,15}$/
    return phoneRegex.test(phone.replace(/\s+/g, ''))
  }

  // Validate UUID format
  static validateUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(uuid)
  }

  // Validate text input with length and content restrictions
  static validateText(text: string, minLength = 1, maxLength = 500): { isValid: boolean; error?: string } {
    if (!text || text.length < minLength) {
      return { isValid: false, error: `Text must be at least ${minLength} characters` }
    }
    
    if (text.length > maxLength) {
      return { isValid: false, error: `Text must not exceed ${maxLength} characters` }
    }

    // Check for SQL injection patterns
    const sqlPatterns = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|EXEC|EXECUTE)\b)/i
    if (sqlPatterns.test(text)) {
      return { isValid: false, error: 'Invalid characters detected' }
    }

    return { isValid: true }
  }

  // Validate coordinates
  static validateCoordinates(lat: number, lng: number): boolean {
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
  }

  // Rate limiting helper (basic implementation)
  private static requestCounts = new Map<string, { count: number; timestamp: number }>()

  static checkRateLimit(identifier: string, maxRequests = 100, windowMs = 60000): boolean {
    const now = Date.now()
    const key = identifier
    const current = this.requestCounts.get(key)

    if (!current || now - current.timestamp > windowMs) {
      this.requestCounts.set(key, { count: 1, timestamp: now })
      return true
    }

    if (current.count >= maxRequests) {
      return false
    }

    current.count++
    return true
  }

  // Clean up old rate limit entries
  static cleanupRateLimit(): void {
    const now = Date.now()
    for (const [key, value] of this.requestCounts.entries()) {
      if (now - value.timestamp > 60000) {
        this.requestCounts.delete(key)
      }
    }
  }
}

// Schema for common validations
export const ValidationSchemas = {
  email: z.string().email().max(254),
  phone: z.string().regex(/^\+?[\d\s\-\(\)]{10,15}$/, 'Invalid phone number'),
  name: z.string().min(2).max(100).regex(/^[a-zA-Z\s'-]+$/, 'Name contains invalid characters'),
  address: z.string().min(5).max(500),
  coordinates: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180)
  }),
  uuid: z.string().uuid(),
  fare: z.number().positive().max(99999),
  distance: z.number().positive().max(10000)
}

// Security headers for API responses
export const SecurityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co"
}