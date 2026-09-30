import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, DEMO_ROLES, setAuthToken } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentRoleKey, setCurrentRoleKey] = useState('SECURITY');
  const [user, setUser] = useState(DEMO_ROLES.SECURITY);
  const [token, setTokenState] = useState(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState(null);

  const switchRole = async (roleKey) => {
    const creds = DEMO_ROLES[roleKey];
    if (!creds) return;

    setCurrentRoleKey(roleKey);
    setUser(creds);
    setIsAuthenticating(true);
    setAuthError(null);

    try {
      const res = await api.login(creds.phone_number, creds.password);
      const jwtToken = res.data?.access_token || res.access || res.access_token;
      setTokenState(jwtToken);
    } catch (err) {
      console.warn(`Local demo mode active for role ${roleKey}:`, err.message);
      // Fall back to a mock JWT token so UI demo features remain operational even without backend running
      const mockToken = `demo_jwt_token_${roleKey.toLowerCase()}_${Date.now()}`;
      setTokenState(mockToken);
      setAuthToken(mockToken);
    } finally {
      setIsAuthenticating(false);
    }
  };

  useEffect(() => {
    // Initial login as SECURITY officer on load
    switchRole('SECURITY');
  }, []);

  return (
    <AuthContext.Provider
      value={{
        currentRoleKey,
        user,
        token,
        isAuthenticating,
        authError,
        switchRole,
        availableRoles: DEMO_ROLES,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
