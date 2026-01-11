"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { login as loginApi, register as registerApi, getCurrentUser, AuthResponse, User } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Carrega dados do localStorage ao inicializar
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      // Busca dados do usuário
      getCurrentUser(storedToken)
        .then((response) => {
          if (response.success && response.user) {
            setUser(response.user);
          } else {
            // Token inválido, limpa
            localStorage.removeItem("token");
            setToken(null);
          }
        })
        .catch(() => {
          // Token inválido ou erro, limpa
          localStorage.removeItem("token");
          setToken(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response: AuthResponse = await loginApi({ email, password });
    localStorage.setItem("token", response.token);
    setToken(response.token);
    
    // Usa dados diretamente da resposta (não precisa fazer chamada extra)
    setUser({
      id: response.id,
      name: response.name,
      email: response.email,
      createdAt: new Date().toISOString(),
    });
    
    router.push("/dashboard");
  };

  const register = async (name: string, email: string, password: string) => {
    const response: AuthResponse = await registerApi({ name, email, password });
    localStorage.setItem("token", response.token);
    setToken(response.token);
    
    // Usa dados diretamente da resposta (não precisa fazer chamada extra)
    setUser({
      id: response.id,
      name: response.name,
      email: response.email,
      createdAt: new Date().toISOString(),
    });
    
    router.push("/dashboard");
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    router.push("/entrar");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!token && !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

