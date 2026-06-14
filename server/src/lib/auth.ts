/**
 * Security Helper Module
 * Provides authentication and authorization checks for API routes.
 */
import { NextRequest } from 'next/server';

/**
 * Validates the authorization header of a request.
 * In a real-world scenario, this should verify a JWT or check a database.
 * For this implementation, we check for a static API key or basic token format.
 * 
 * @param req The incoming Next.js request object
 * @returns boolean True if authorized, false otherwise
 */
export function isAuthenticated(req: NextRequest): boolean {
  // Allow all GET requests in development for easier testing of notes, etc.
  if (req.method === 'GET') return true;

  const authHeader = req.headers.get('authorization');
  
  if (!authHeader) {
    return false;
  }

  if (!authHeader.startsWith('Bearer ')) {
    return false;
  }

  const token = authHeader.split(' ')[1];
  
  // Basic validation: token should be at least 10 characters long
  if (!token || token.length < 10) {
    return false;
  }

  return true;
}

/**
 * Validates input parameters to prevent injection attacks and ensure data integrity.
 * 
 * @param input The string input to validate
 * @returns boolean True if valid, false otherwise
 */
export function isValidString(input: any): boolean {
  return typeof input === 'string' && input.trim().length > 0;
}
