import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../config/firebase';
import { setSentryUser } from '../config/sentry';
import { identifyUser, resetUser } from '../config/analytics';

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);

      // Attach or clear user context on every Sentry error report.
      setSentryUser(
        firebaseUser
          ? { id: firebaseUser.uid, email: firebaseUser.email }
          : null,
      );

      // Sync user identity with PostHog analytics.
      if (firebaseUser) {
        identifyUser(firebaseUser.uid, {
          email: firebaseUser.email,
          display_name: firebaseUser.displayName ?? undefined,
        });
      } else {
        resetUser();
      }
    });
    return unsubscribe;
  }, []);

  const value = useMemo(() => ({ user, loading }), [user, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
