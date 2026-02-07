"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { login as loginApi, register as registerApi, getCurrentUser, updateProfile as updateProfileApi, AuthResponse, User } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: "STUDENT" | "FREELANCER") => Promise<void>;
  logout: () => void;
  updateProfile: (data: {
    name?: string;
    avatarUrl?: string | null;
    phone?: string | null;
    birthDate?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    zipCode?: string | null;
  }) => Promise<void>;
  setUserFromResponse: (user: User) => void;
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
    try {
      console.log("🔐 AuthContext: Iniciando login...");
      const response: AuthResponse = await loginApi({ email, password });
      console.log("✅ AuthContext: Login API respondeu:", response);
      
      localStorage.setItem("token", response.token);
      setToken(response.token);
      setUser({
        id: response.id,
        name: response.name,
        email: response.email,
        createdAt: new Date().toISOString(),
        avatarUrl: response.avatarUrl ?? null,
        role: response.role ?? "STUDENT",
      });
      // Garante perfil completo (telefone, endereço, etc.) na área logada
      getCurrentUser(response.token).then((r) => { if (r.success && r.user) setUser(r.user); });
      console.log("🚀 AuthContext: Redirecionando...");
      router.push(response.role === "FREELANCER" ? "/colaborador" : "/estudante");
    } catch (error) {
      console.error("❌ AuthContext: Erro no login:", error);
      throw error; // Re-lança o erro para ser capturado no componente
    }
  };

  const register = async (name: string, email: string, password: string, role?: "STUDENT" | "FREELANCER") => {
    try {
      console.log("📝 AuthContext: Iniciando registro...");
      const response: AuthResponse = await registerApi({ name, email, password, role });
      console.log("✅ AuthContext: Registro API respondeu:", response);
      
      localStorage.setItem("token", response.token);
      setToken(response.token);
      setUser({
        id: response.id,
        name: response.name,
        email: response.email,
        createdAt: new Date().toISOString(),
        avatarUrl: response.avatarUrl ?? null,
        role: response.role ?? "STUDENT",
      });
      getCurrentUser(response.token).then((r) => { if (r.success && r.user) setUser(r.user); });
      console.log("🚀 AuthContext: Redirecionando...");
      router.push(response.role === "FREELANCER" ? "/colaborador" : "/estudante");
    } catch (error) {
      console.error("❌ AuthContext: Erro no registro:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    router.push("/entrar");
  };

  const updateProfile = async (data: {
    name?: string;
    avatarUrl?: string | null;
    phone?: string | null;
    birthDate?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    zipCode?: string | null;
  }) => {
    if (!token) return;
    const result = await updateProfileApi(token, data);
    if (result.success && result.user) {
      setUser(result.user);
    }
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
        updateProfile,
        setUserFromResponse: setUser,
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

