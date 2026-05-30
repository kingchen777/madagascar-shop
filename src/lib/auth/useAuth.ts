"use client";

import { useState, useEffect } from "react";
import type { User, Session, AuthChangeEvent } from "@supabase/supabase-js";
import { getSupabaseClient } from "./supabase-client";

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

/**
 * React hook for client-side auth state.
 * Returns current user, session, and loading state.
 */
export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
  });

  useEffect(() => {
    const supabase = getSupabaseClient();

    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      setState({ user: session?.user ?? null, session, loading: false });
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        setState({ user: session?.user ?? null, session, loading: false });
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return state;
}

/**
 * Sign out the current user.
 */
export async function signOut() {
  const supabase = getSupabaseClient();
  await supabase.auth.signOut();
}
