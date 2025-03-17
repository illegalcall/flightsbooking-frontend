import { supabase } from "./client";
import { User, Session } from "@supabase/supabase-js";

export type AuthError = {
  message: string;
  status?: number;
};

export async function signUp(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      throw { message: error.message, status: error.status };
    }

    return { user: data.user, session: data.session };
  } catch (err) {
    const error = err as AuthError;
    throw error;
  }
}

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw { message: error.message, status: error.status };
    }

    return { user: data.user, session: data.session };
  } catch (err) {
    const error = err as AuthError;
    throw error;
  }
}

export async function signOut() {
  try {
    // Sign out from Supabase and clear all sessions
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw { message: error.message, status: error.status };
    }

    // Clear any stored session data
    if (typeof window !== "undefined") {
      localStorage.removeItem("sb-auth-token");

      // Clear any other auth-related data
      const authKeys = Object.keys(localStorage).filter(
        (key) => key.startsWith("sb-") || key.includes("supabase")
      );

      authKeys.forEach((key) => localStorage.removeItem(key));
    }

    return true;
  } catch (err) {
    const error = err as AuthError;
    throw error;
  }
}

export async function resetPassword(email: string) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password/update`,
    });

    if (error) {
      throw { message: error.message, status: error.status };
    }

    return true;
  } catch (err) {
    const error = err as AuthError;
    throw error;
  }
}

export async function updatePassword(newPassword: string) {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw { message: error.message, status: error.status };
    }

    return true;
  } catch (err) {
    const error = err as AuthError;
    throw error;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error("Error getting current user:", error);
      return null;
    }
    return data?.user || null;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

export async function getCurrentSession(): Promise<Session | null> {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error("Error getting current session:", error);
      return null;
    }
    return data?.session || null;
  } catch (error) {
    console.error("Error getting current session:", error);
    return null;
  }
}
