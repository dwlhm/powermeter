import * as React from "react";
import { useMutation } from "react-query";
import { doLogin, UserProfile } from "./api/users";
import { Login } from "./api/users";
import axios from "axios";
import toast from "react-hot-toast";

export interface Token<T> {
  token: string | null;
  data: T;
}

export interface AuthContext {
  isAuthenticated: boolean;
  login: (data: Login) => Promise<void>;
  logout: () => Promise<void>;
  token: string | null;
  user: UserProfile | null;
  permissions: string[];
}

interface LoginError {
  response: {
    data: {
      detail: any;
    };
  };
}

const AuthContext = React.createContext<AuthContext | null>(null);

const STORAGE_KEY = "auth.token";

function getStoredToken() {
  return localStorage.getItem(STORAGE_KEY);
}

export function setStoredToken(token: string | null) {
  if (token) {
    localStorage.setItem(STORAGE_KEY, token);
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

async function fetchProfile(token: string): Promise<UserProfile | null> {
  try {
    const { data } = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/users/me`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return data.results as UserProfile;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = React.useState<string | null>(getStoredToken);
  const [user, setUser] = React.useState<UserProfile | null>(null);
  const isAuthenticated = !!token;
  const permissions = user?.permissions || [];

  React.useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }
    fetchProfile(token).then((profile) => {
      if (profile) {
        setUser(profile);
      } else {
        setToken(null);
        setStoredToken(null);
        setUser(null);
      }
    });
  }, [token]);

  const mutation = useMutation({ mutationFn: doLogin });

  const login = React.useCallback(
    async ({ username, password }: Login) => {
      return new Promise<void>((resolve, reject) => {
        mutation.mutate(
          { username, password },
          {
            onSuccess: async (res) => {
              const accessToken = (res as any).data?.access_token;
              if (accessToken) {
                setStoredToken(accessToken);
                setToken(accessToken);
                const profile = await fetchProfile(accessToken);
                if (profile) setUser(profile);
              }
              resolve();
            },
            onError: (error) => {
              const err = error as LoginError;
              toast.error(err.response?.data?.detail || "Login gagal");
              reject(error);
            },
          },
        );
      });
    },
    [],
  );

  const logout = React.useCallback(async () => {
    setStoredToken(null);
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, token, user, permissions, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
