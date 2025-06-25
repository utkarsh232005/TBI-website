// Client-side utility functions that need access to browser APIs like localStorage

// Utility function to store current user data after successful login
export function setCurrentUser(userData: {
  identifier: string;
  email: string;
  name: string;
  temporaryUserId?: string;
}): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('currentUser', JSON.stringify(userData));
  }
}

// Utility function to get current user data
export function getCurrentUser(): {
  identifier: string;
  email: string;
  name: string;
  temporaryUserId?: string;
} | null {
  if (typeof window !== 'undefined') {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch (error) {
        console.error('Error parsing current user data:', error);
        return null;
      }
    }
  }
  return null;
}

// Utility function to clear user session data
export function clearUserSession(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('currentUser');
    // Note: We no longer use localStorage for onboarding status
    // This is now managed by the database
  }
}
