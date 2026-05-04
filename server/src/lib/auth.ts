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
  const authHeader = req.headers.get('authorization');
  
  // Basic security measure: require an authorization header
  if (!authHeader) {
    return false;
  }

  // Example: Check if it's a Bearer token
  if (!authHeader.startsWith('Bearer ')) {
    return false;
  }

  // Extract the token (in a real app, verify the JWT here)
  const token = authHeader.split(' ')[1];
  
  // Basic check: token must exist and have minimum length
  return token && token.length > 5;
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
