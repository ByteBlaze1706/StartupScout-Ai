







const AUTH_USER_KEY = 'startupscout_auth_user_cache';
const isClient = typeof window !== 'undefined';

// Memory cache for active session user
let cachedUser = null;

if (isClient) {
  try {
    const local = localStorage.getItem(AUTH_USER_KEY);
    if (local) cachedUser = JSON.parse(local);
  } catch (e) {}
}

export const auth = {
  getUser: () => {
    return cachedUser;
  },

  // Asynchronous session verification checking cookie status on the server
  checkSession: async () => {
    if (!isClient) return null;
    try {
      const res = await fetch('/api/auth/session');
      const data = await res.json();

      if (data.user) {
        cachedUser = data.user;
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
        return data.user;
      } else {
        cachedUser = null;
        localStorage.removeItem(AUTH_USER_KEY);
        return null;
      }
    } catch (e) {
      console.error('Session check failed', e);
      return cachedUser; // Return cached if network is offline
    }
  },

  signIn: async (email, password) => {
    if (!isClient) return { success: false, error: 'Not in browser' };

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        return { success: false, error: data.error || 'Login failed.' };
      }

      cachedUser = data.user;
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, error: 'Network connection issue.' };
    }
  },

  signUp: async (email, fullName, password) => {
    if (!isClient) return { success: false, error: 'Not in browser' };

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: fullName, email, password })
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        return { success: false, error: data.error || 'Registration failed.' };
      }

      cachedUser = data.user;
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, error: 'Network connection issue.' };
    }
  },

  signOut: async () => {
    if (!isClient) return false;
    try {
      cachedUser = null;
      localStorage.removeItem(AUTH_USER_KEY);

      const res = await fetch('/api/auth/logout', { method: 'POST' });
      return res.ok;
    } catch (e) {
      return false;
    }
  },

  resetPassword: async (email) => {
    if (!email.includes('@')) {
      return { success: false, error: 'Please enter a valid email' };
    }
    // Simple verification helper mock for resets
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { success: true };
  }
};