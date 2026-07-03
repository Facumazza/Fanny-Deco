import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import type { CurrentUser } from '../api/admin';
import * as adminApi from '../api/admin';
import { ApiRequestError } from '../types/api';

interface AuthState {
  status: 'loading' | 'authenticated' | 'unauthenticated';
  user: CurrentUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthState['status']>('loading');
  const [user, setUser] = useState<CurrentUser | null>(null);

  // On mount, check if we already have a valid session.
  useEffect(() => {
    adminApi.getCurrentUser()
      .then(u => { setUser(u); setStatus('authenticated'); })
      .catch(err => {
        if (err instanceof ApiRequestError && err.status === 401) {
          setStatus('unauthenticated');
        } else {
          console.error(err);
          setStatus('unauthenticated');
        }
      });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const u = await adminApi.login(email, password);
    setUser(u);
    setStatus('authenticated');
  }, []);

  const logout = useCallback(async () => {
    await adminApi.logout();
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  return (
    <AuthContext.Provider value={{ status, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
