import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext({});

const PROFISSIONAL_EMAIL = import.meta.env.VITE_PROFISSIONAL_EMAIL;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email, password, lembrar = false) => {
    supabase.auth.storage = lembrar
      ? window.localStorage
      : window.sessionStorage;

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const isProfissional = user?.email === PROFISSIONAL_EMAIL;

  const nomeExibicao =
    user?.user_metadata?.full_name || user?.email?.split("@")[0];

  // Cargo baseado no email
  const cargo = isProfissional ? "Fisioterapeuta" : "Desenvolvedor";

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signOut,
        isProfissional,
        nomeExibicao,
        cargo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
