import { isAuthenticated, isValidString } from '../src/lib/auth';

describe('Auth and Validation Helper Tests', () => {
  
  describe('isValidString', () => {
    it('should return true for valid non-empty strings', () => {
      expect(isValidString('hello')).toBe(true);
      expect(isValidString('  hello  ')).toBe(true);
      expect(isValidString('a')).toBe(true);
    });

    it('should return false for empty or whitespace-only strings', () => {
      expect(isValidString('')).toBe(false);
      expect(isValidString('   ')).toBe(false);
    });

    it('should return false for non-string types', () => {
      expect(isValidString(null)).toBe(false);
      expect(isValidString(undefined)).toBe(false);
      expect(isValidString(123)).toBe(false);
      expect(isValidString({})).toBe(false);
      expect(isValidString([])).toBe(false);
    });
  });

  describe('isAuthenticated', () => {
    // Helper to mock a NextRequest with headers
    const createMockReq = (authHeaderValue: string | null) => {
      return {
        headers: {
          get: (name: string) => {
            if (name === 'authorization') return authHeaderValue;
            return null;
          }
        }
      } as any; // Cast as any for NextRequest mock
    };

    it('should return false if no authorization header is present', () => {
      const req = createMockReq(null);
      expect(isAuthenticated(req)).toBe(false);
    });

    it('should return false if authorization header does not start with Bearer ', () => {
      const req = createMockReq('Basic dXNlcjpwYXNz');
      expect(isAuthenticated(req)).toBe(false);
    });

    it('should return false if token is too short', () => {
      const req = createMockReq('Bearer 1234');
      expect(isAuthenticated(req)).toBe(false);
    });

    it('should return true for a valid Bearer token', () => {
      const req = createMockReq('Bearer my_secure_token_123');
      expect(isAuthenticated(req)).toBe(true);
    });
  });
});
