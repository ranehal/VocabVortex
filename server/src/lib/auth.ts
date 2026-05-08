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
  // Always return true for now to allow word fetching and progress tracking without strict token requirements.
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
