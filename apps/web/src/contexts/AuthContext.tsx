"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { login as loginApi, register as registerApi, getCurrentUser, updateProfile as updateProfileApi, logout as logoutApi, refreshSession, AuthResponse, User } from "@/lib/api";
import { loginDestination, loginPathFor, portalAreaFromPath, rememberPortalArea, rememberedPortalArea, sanitizeReturnTo } from "@/lib/authNavigation";
import { supabase } from "@/lib/supabase";
import { createAuthSessionGuard } from "@/lib/authSessionGuard";

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
  const sessionGuard = useRef(createAuthSessionGuard());

  useEffect(() => {
    const area = portalAreaFromPath(pathname);
    if (user && area) rememberPortalArea(user.id, area);
  }, [pathname, user]);

  // Mantém a renovação preventiva existente; o SDK também emite TOKEN_REFRESHED.
  useEffect(() => {
    if (!token) return;
    const REFRESH_INTERVAL_MS = 20 * 60 * 60 * 1000; // 20 horas
    const timer = setInterval(async () => {
      const guard = sessionGuard.current;
      const identity = guard.identity();
      const newToken = await refreshSession();
      if (!guard.current(identity)) return;
      if (newToken) {
        guard.updateToken(identity, newToken);
        setToken(newToken);
      } else {
        // Sessão expirou — faz logout limpo
        guard.observe(null, null, true);
        setToken(null);
        setUser(null);
        router.replace(loginPathFor(window.location.pathname + window.location.search + window.location.hash));
      }
    }, REFRESH_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [token, router]);

  // INITIAL_SESSION restaura a sessão; os demais eventos também chegam de
  // outras abas. Nenhuma chamada Supabase é aguardada dentro do callback SDK.
  useEffect(() => {
    const guard = sessionGuard.current;
    guard.start();
    const scheduled = new Set<ReturnType<typeof setTimeout>>();
    if (!supabase) {
      const timer = setTimeout(() => { if (guard.active) setLoading(false); }, 0);
      return () => { clearTimeout(timer); guard.stop(); };
    }
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!guard.active) return;
      const changed = guard.observe(session?.user.id ?? null, session?.access_token ?? null, event === "SIGNED_OUT");
      if (!session || event === "SIGNED_OUT") {
        setUser(null);
        setToken(null);
        setLoading(false);
        return;
      }
      setToken(session.access_token);
      if (changed) { setUser(null); setLoading(true); }
      if (!changed && guard.profileReady && event !== "USER_UPDATED") return;
      const ticket = guard.beginProfile();
      if (!ticket) return;
      // O SDK aguarda os subscribers. Adiar evita reentrância/deadlock de auth
      // (especialmente refresh aninhado em TOKEN_REFRESHED).
      const timer = setTimeout(() => {
        scheduled.delete(timer);
        if (!guard.profileCurrent(ticket)) return;
        void getCurrentUser(session.access_token).then((response) => {
          if (!guard.profileCurrent(ticket)) return;
          if (!response.success || !guard.profileCurrent(ticket, response.user.id)) {
            guard.finishProfile(ticket, false);
            return;
          }
          setUser(response.user);
          setToken(guard.token);
          guard.finishProfile(ticket, true);
          if (window.location.pathname === "/entrar") {
            const returnTo = new URLSearchParams(window.location.search).get("redirect");
            const destination = loginDestination(returnTo, response.user.role, rememberedPortalArea(response.user.id));
            const area = portalAreaFromPath(destination);
            if (area) rememberPortalArea(response.user.id, area);
            router.replace(destination);
          }
        }).catch(() => {
          if (guard.profileCurrent(ticket)) guard.finishProfile(ticket, false);
        }).finally(() => {
          if (guard.profileCurrent(ticket)) setLoading(false);
        });
      }, 0);
      scheduled.add(timer);
    });
    return () => {
      subscription.unsubscribe();
      for (const timer of scheduled) clearTimeout(timer);
      guard.stop();
    };
  }, [router]);

  const login = async (email: string, password: string) => {
    const guard = sessionGuard.current;
    const operation = guard.beginOperation(email);
    const returnTo = sanitizeReturnTo(new URLSearchParams(window.location.search).get("redirect"));
    try {
      const response: AuthResponse = await loginApi({ email, password });
      if (!guard.adoptOperation(operation, response.id, response.token, response.email)) return;
      setToken(guard.token);
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
      if (!guard.operationCurrent(operation, response.id)) return;
      const fullUser = full?.success && String(full.user.id) === String(response.id) ? full.user : null;
      if (fullUser) setUser(fullUser);
      setLoading(false);
      const destination = loginDestination(returnTo, fullUser?.role ?? response.role, rememberedPortalArea(response.id));
      const area = portalAreaFromPath(destination);
      if (area) rememberPortalArea(response.id, area);
      router.replace(destination);
    } finally {
      guard.finishOperation(operation);
    }
  };

  const register = async (name: string, email: string, password: string, role?: "STUDENT" | "FREELANCER") => {
    const guard = sessionGuard.current;
    const operation = guard.beginOperation(email);
    const returnTo = sanitizeReturnTo(new URLSearchParams(window.location.search).get("redirect"));
    try {
      const response: AuthResponse = await registerApi({ name, email, password, role });
      if (!guard.adoptOperation(operation, response.id, response.token, response.email)) return;
      setToken(guard.token);
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
      if (!guard.operationCurrent(operation, response.id)) return;
      const fullUser = full?.success && String(full.user.id) === String(response.id) ? full.user : null;
      if (fullUser) setUser(fullUser);
      setLoading(false);
      const destination = loginDestination(returnTo, fullUser?.role ?? response.role, rememberedPortalArea(response.id));
      const area = portalAreaFromPath(destination);
      if (area) rememberPortalArea(response.id, area);
      router.replace(destination);
    } finally {
      guard.finishOperation(operation);
    }
  };

  const logout = () => {
    sessionGuard.current.observe(null, null, true);
    // Limpa estado em memória
    setToken(null);
    setUser(null);
    setLoading(false);
    // O SDK invalida a sessão e propaga SIGNED_OUT para as outras abas.
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
    const guard = sessionGuard.current;
    const identity = guard.identity();
    if (!token || identity.owner == null) return;
    const result = await updateProfileApi(token, data);
    if (result.success && result.user && guard.current(identity, result.user.id)) {
      guard.markProfileReady(result.user.id);
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
        setUserFromResponse: (responseUser) => {
          if (sessionGuard.current.markProfileReady(responseUser.id)) setUser(responseUser);
        },
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

