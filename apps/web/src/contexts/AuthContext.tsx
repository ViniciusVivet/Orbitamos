"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { login as loginApi, register as registerApi, getCurrentUser, updateProfile as updateProfileApi, logout as logoutApi, refreshSession, AuthResponse, User } from "@/lib/api";
import { loginDestination, loginPathFor, portalAreaFromPath, rememberPortalArea, rememberedPortalArea, sanitizeReturnTo } from "@/lib/authNavigation";

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
    neighborhood?: string | null;
    state?: string | null;
    zipCode?: string | null;
  }) => Promise<void>;
  setUserFromResponse: (user: User) => void;
  /** Alterna para a área colaborador (por enquanto só no front; lógica pode mudar depois) */
  switchToCollaborator: () => void;
  /** Alterna para a área estudante */
  switchToStudent: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const area = portalAreaFromPath(pathname);
    if (user && area) rememberPortalArea(user.id, area);
  }, [pathname, user]);

  // Renova o JWT a cada 20h (token expira em 24h — renovar antes evita logout abrupto)
  useEffect(() => {
    if (!token) return;
    const REFRESH_INTERVAL_MS = 20 * 60 * 60 * 1000; // 20 horas
    const timer = setInterval(async () => {
      const newToken = await refreshSession();
      if (newToken) {
        setToken(newToken);
      } else {
        // Sessão expirou — faz logout limpo
        setToken(null);
        setUser(null);
        router.replace(loginPathFor(window.location.pathname + window.location.search + window.location.hash));
      }
    }, REFRESH_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [token, router]);

  // Restaura sessão via cookie httpOnly — sem localStorage.
  // O cookie é enviado automaticamente pelo browser (credentials: "include" em authFetch).
  // Se o cookie for válido, a API retorna o usuário e a sessão é restaurada.
  useEffect(() => {
    getCurrentUser(null)
      .then((response) => {
        if (response.success && response.user) {
          setUser(response.user);
          // Mantém token em memória para o header Authorization nas requisições desta sessão.
          // O cookie httpOnly é o mecanismo primário de autenticação persistente.
          if (response.token) setToken(response.token);
          if (response.token && window.location.pathname === "/entrar") {
            const returnTo = new URLSearchParams(window.location.search).get("redirect");
            const destination = loginDestination(returnTo, response.user.role, rememberedPortalArea(response.user.id));
            const area = portalAreaFromPath(destination);
            if (area) rememberPortalArea(response.user.id, area);
            router.replace(destination);
          }
        }
      })
      .catch(() => {
        // Cookie ausente ou expirado — usuário não autenticado, estado já é null
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router]);

  const login = async (email: string, password: string) => {
    const returnTo = sanitizeReturnTo(new URLSearchParams(window.location.search).get("redirect"));
    const response: AuthResponse = await loginApi({ email, password });
    // Token mantido apenas em memória — cookie httpOnly é setado pelo backend
    setToken(response.token);
    setUser({
      id: response.id,
      name: response.name,
      email: response.email,
      createdAt: new Date().toISOString(),
      avatarUrl: response.avatarUrl ?? null,
      role: response.role ?? "STUDENT",
      isInternal: response.isInternal ?? false,
    });
    // Garante perfil completo (telefone, endereço, etc.) antes de redirecionar
    const full = await getCurrentUser(response.token).catch(() => null);
    if (full?.success && full.user) setUser(full.user);
    const destination = loginDestination(returnTo, full?.user?.role ?? response.role, rememberedPortalArea(response.id));
    const area = portalAreaFromPath(destination);
    if (area) rememberPortalArea(response.id, area);
    router.replace(destination);
  };

  const register = async (name: string, email: string, password: string, role?: "STUDENT" | "FREELANCER") => {
    const returnTo = sanitizeReturnTo(new URLSearchParams(window.location.search).get("redirect"));
    const response: AuthResponse = await registerApi({ name, email, password, role });
    setToken(response.token);
    setUser({
      id: response.id,
      name: response.name,
      email: response.email,
      createdAt: new Date().toISOString(),
      avatarUrl: response.avatarUrl ?? null,
      role: response.role ?? "STUDENT",
      isInternal: response.isInternal ?? false,
    });
    const full = await getCurrentUser(response.token).catch(() => null);
    if (full?.success && full.user) setUser(full.user);
    const destination = loginDestination(returnTo, full?.user?.role ?? response.role, rememberedPortalArea(response.id));
    const area = portalAreaFromPath(destination);
    if (area) rememberPortalArea(response.id, area);
    router.replace(destination);
  };

  const logout = () => {
    // Limpa estado em memória
    setToken(null);
    setUser(null);
    // Invalida o cookie httpOnly no backend (fire-and-forget)
    logoutApi().catch(() => {});
    router.push("/entrar");
  };

  const updateProfile = async (data: {
    name?: string;
    avatarUrl?: string | null;
    phone?: string | null;
    birthDate?: string | null;
    address?: string | null;
    city?: string | null;
    neighborhood?: string | null;
    state?: string | null;
    zipCode?: string | null;
  }) => {
    if (!token) return;
    const result = await updateProfileApi(token, data);
    if (result.success && result.user) {
      setUser(result.user);
    }
  };

  const switchToCollaborator = () => {
    if (!user) return;
    rememberPortalArea(user.id, "work");
    router.push("/colaborador");
  };

  const switchToStudent = () => {
    if (!user) return;
    rememberPortalArea(user.id, "student");
    router.push("/estudante");
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
        switchToCollaborator,
        switchToStudent,
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

