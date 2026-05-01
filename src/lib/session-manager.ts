// Session management utilities for Firebase Auth
// This helps maintain longer user sessions and handle token refresh

import { getFirebaseAuth } from '@/lib/firebase';
import { User as FirebaseUser, onIdTokenChanged, getIdToken } from 'firebase/getFirebaseAuth()';

export class SessionManager {
  private static instance: SessionManager;
  private refreshInterval: NodeJS.Timeout | null = null;
  private readonly TOKEN_REFRESH_INTERVAL = 30 * 60 * 1000; // 30 minutes
  private readonly ACTIVITY_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes
  private lastActivity: number = Date.now();
  private activityCheckInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.setupActivityTracking();
    this.setupTokenRefresh();
  }

  public static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  /**
   * Setup automatic token refresh to prevent session expiry
   */
  private setupTokenRefresh() {
    // Listen for getFirebaseAuth() state changes and setup token refresh
    onIdTokenChanged(getFirebaseAuth(), (user: FirebaseUser | null) => {
      if (user) {
        this.startTokenRefresh(user);
      } else {
        this.stopTokenRefresh();
      }
    });
  }

  /**
   * Start periodic token refresh for the current user
   */
  private startTokenRefresh(user: FirebaseUser) {
    this.stopTokenRefresh(); // Clear any existing interval

    this.refreshInterval = setInterval(async () => {
      try {
        // Force refresh the ID token
        await getIdToken(user, true);
        console.log('🔄 Firebase Auth token refreshed successfully');
        
        // Update last activity time
        this.updateActivity();
      } catch (error) {
        console.error('❌ Failed to refresh Firebase Auth token:', error);
        // If token refresh fails, user might be logged out
        // The onAuthStateChanged listener will handle this
      }
    }, this.TOKEN_REFRESH_INTERVAL);

    console.log('✅ Token refresh interval started (every 30 minutes)');
  }

  /**
   * Stop token refresh interval
   */
  private stopTokenRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
      console.log('🛑 Token refresh interval stopped');
    }
  }

  /**
   * Setup user activity tracking to maintain session
   */
  private setupActivityTracking() {
    if (typeof window === 'undefined') return;

    // Track user activity events
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const updateActivity = () => {
      this.updateActivity();
    };

    // Add event listeners for user activity
    activityEvents.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    // Start activity check interval
    this.startActivityCheck();
  }

  /**
   * Update the last activity timestamp
   */
  private updateActivity() {
    this.lastActivity = Date.now();
    
    // Store activity in localStorage for persistence across tabs
    if (typeof window !== 'undefined') {
      localStorage.setItem('lastActivity', this.lastActivity.toString());
    }
  }

  /**
   * Start periodic activity checking
   */
  private startActivityCheck() {
    this.activityCheckInterval = setInterval(() => {
      // Check if user has been inactive for too long (2 hours)
      const inactiveTime = Date.now() - this.lastActivity;
      const MAX_INACTIVE_TIME = 2 * 60 * 60 * 1000; // 2 hours

      if (inactiveTime > MAX_INACTIVE_TIME) {
        console.log('⏰ User inactive for 2+ hours, maintaining session...');
        // Optionally show a warning or refresh token
        this.forceTokenRefresh();
      }
    }, this.ACTIVITY_CHECK_INTERVAL);
  }

  /**
   * Force refresh the current user's token
   */
  public async forceTokenRefresh(): Promise<void> {
    const user = getFirebaseAuth().currentUser;
    if (user) {
      try {
        await getIdToken(user, true);
        console.log('🔄 Forced token refresh successful');
      } catch (error) {
        console.error('❌ Forced token refresh failed:', error);
      }
    }
  }

  /**
   * Get the time since last user activity
   */
  public getTimeSinceLastActivity(): number {
    return Date.now() - this.lastActivity;
  }

  /**
   * Check if user session is still valid
   */
  public isSessionValid(): boolean {
    const user = getFirebaseAuth().currentUser;
    const timeSinceActivity = this.getTimeSinceLastActivity();
    const MAX_SESSION_TIME = 24 * 60 * 60 * 1000; // 24 hours

    return !!(user && timeSinceActivity < MAX_SESSION_TIME);
  }

  /**
   * Cleanup session manager
   */
  public cleanup() {
    this.stopTokenRefresh();
    
    if (this.activityCheckInterval) {
      clearInterval(this.activityCheckInterval);
      this.activityCheckInterval = null;
    }
  }
}

// Initialize session manager on import
let sessionManager: SessionManager | null = null;

if (typeof window !== 'undefined') {
  sessionManager = SessionManager.getInstance();
}

export { sessionManager };
