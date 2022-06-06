import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { User } from "@supabase/gotrue-js";

interface Props {
  children: React.ReactNode;
}

interface AuthContextProviderInterface {
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  user: EnrichedUser | null;
}

const defaultValue: AuthContextProviderInterface = {
  loading: false,
  signIn: async () => {},
  signOut: async () => {},
  signUp: async () => {},
  user: null,
};

interface EnrichedUser extends User {
  is_subscribed: boolean;
}

const AuthContext = createContext<AuthContextProviderInterface>(defaultValue);

const AuthContextProvider = (props: Props) => {
  const [user, setUser] = useState<EnrichedUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const getUserProfile = async () => {
    const sessionUser = supabase.auth.user();
    if (sessionUser) {
      const { data: profile } = await supabase
        .from("profile")
        .select("*")
        .eq("id", sessionUser.id)
        .single();
      setUser({ ...sessionUser, ...profile });
    }
  };

  useEffect(() => {
    getUserProfile();
    setLoading(false);

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!session?.user) {
          setUser(null);
        } else {
          await getUserProfile();
        }
        setLoading(false);
      }
    );

    return () => {
      listener?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user) {
      const subscription = supabase
        .from(`profile:id=eq.${user.id}`)
        .on("UPDATE", (payload) => {
          getUserProfile();
        })
        .subscribe();

      return () => {
        supabase.removeSubscription(subscription);
      };
    }
  }, [user]);

  const postRequestSettings = (body: object = {}) => {
    const requestHeaders: HeadersInit = new Headers({
      "content-type": "application/json",
      "Access-Control-Allow-Origin": "*",
    }) as HeadersInit;
    return {
      method: "POST",
      headers: requestHeaders,
      body: JSON.stringify(body),
    };
  };

  useEffect(() => {
    const body = {
      event: user ? "SIGNED_IN" : "SIGNED_OUT",
      session: supabase.auth.session(),
    };
    const headers = postRequestSettings(body);
    fetch("/api/set-supabase-cookie", headers);
  }, [user]);

  const signIn = async (email: string, password: string) => {
    await supabase.auth.signIn({ email, password });
  };
  const signOut = async () => {
    await supabase.auth.signOut();
  };
  const signUp = async (email: string, password: string) => {
    await supabase.auth.signUp({ email, password });
  };

  const data: AuthContextProviderInterface = {
    loading,
    signIn,
    signUp,
    signOut,
    user,
  };

  return (
    <AuthContext.Provider value={data}>{props.children}</AuthContext.Provider>
  );
};

function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined || context === null) {
    throw new Error(
      "useAuthContext must be used within an AuthContext Provider"
    );
  }
  return context;
}

export { AuthContextProvider, useAuthContext };
