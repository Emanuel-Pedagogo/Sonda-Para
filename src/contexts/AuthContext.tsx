import type { Session } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { getUsuarioProfile } from '@/src/services/auth/auth.service';
import { supabase } from '@/src/lib/supabase/client';
import type { Usuario } from '@/src/types/database';

interface AuthContextValue {
  session: Session | null;
  usuario: Usuario | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  usuario: null,
  isLoading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.user.id) {
      return;
    }

    let active = true;

    getUsuarioProfile(session.user.id).then((profile) => {
      if (active) {
        setUsuario(profile);
      }
    });

    return () => {
      active = false;
      setUsuario(null);
    };
  }, [session?.user.id]);

  const value = useMemo(
    () => ({
      session,
      usuario,
      isLoading,
    }),
    [session, usuario, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  return useContext(AuthContext);
}
