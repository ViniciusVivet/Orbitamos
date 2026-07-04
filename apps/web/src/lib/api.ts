import { isSupabaseConfigured, requireSupabase } from "@/lib/supabase";

/**
 * Funções para comunicação com a API do backend
 */

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8080/api";

/** Base da API sem /api (para montar URLs de upload/avatar em produção). */
export const API_BASE_URL = API_URL.replace(/\/api\/?$/, "");

const MAX_AVATAR_UPLOAD_BYTES = 2 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function getSafeAvatarExtension(file: File): string {
  if (file.size > MAX_AVATAR_UPLOAD_BYTES) {
    throw new Error("Imagem muito grande. Envie um arquivo de ate 2MB.");
  }

  const extension = ALLOWED_AVATAR_TYPES[file.type];
  if (!extension) {
    throw new Error("Formato invalido. Use JPG, PNG ou WEBP.");
  }

  return extension;
}

/**
 * Wrapper de fetch que sempre inclui `credentials: "include"`.
 * Isso garante que o cookie httpOnly de sessão seja enviado em toda
 * requisição, permitindo autenticação mesmo após o token sair da memória
 * (ex: refresh de página antes do login via cookie estar implementado no back).
 */
function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  return fetch(url, { ...options, credentials: "include" });
}

/**
 * URL de avatar para exibição. Garante que a foto carregue sempre pela mesma base da API
 * usada pelo frontend (evita buraco transparente por Mixed Content ou URL errada).
 * - Se a URL for localhost/127.0.0.1, reescreve para API_BASE_URL.
 * - Se a URL for de upload da API (/api/uploads/avatars/...), reescreve para API_BASE_URL + path.
 */
export function getDisplayAvatarUrl(avatarUrl: string | null | undefined): string | null | undefined {
  if (!avatarUrl?.trim()) return avatarUrl;
  const trimmed = avatarUrl.trim();
  // URL de upload da própria API: usar sempre a base configurada no frontend
  const uploadPathMatch = trimmed.match(/^(?:https?:\/\/[^/]+)?(\/api\/uploads\/avatars\/\S+)/);
  if (uploadPathMatch) {
    const path = uploadPathMatch[1];
    return (API_BASE_URL.replace(/\/$/, "") + path);
  }
  if (trimmed.includes("localhost") || trimmed.includes("127.0.0.1")) {
    return API_BASE_URL + trimmed.replace(/^https?:\/\/[^/]+/, "");
  }
  return trimmed;
}

export interface ContactData {
  name: string;
  email: string;
  message: string;
}

export interface ContactResponse {
  success: boolean;
  message: string;
  id?: number;
}

/**
 * Envia dados de contato para o backend
 * @param data Dados do formulário de contato
 * @returns Resposta do backend
 */
export async function sendContact(data: ContactData): Promise<ContactResponse> {
  try {
    const response = await fetch("/api/contact", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Erro ao enviar mensagem' }));
      throw new Error(errorData.message || 'Erro ao enviar mensagem');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Erro desconhecido ao enviar mensagem');
  }
}

/** Contato retornado pela API (lista admin) */
export interface ContactItem {
  id: number;
  name: string;
  email: string;
  message: string;
  read: boolean;
  createdAt: string;
}

/**
 * Lista todas as mensagens de contato (área colaborador/admin)
 */
export async function getContacts(token: string): Promise<ContactItem[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await requireSupabase()
      .from("v3_contacts")
      .select("id,name,email,message,read,created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((item) => ({
      id: item.id,
      name: item.name,
      email: item.email,
      message: item.message ?? "",
      read: item.read ?? false,
      createdAt: item.created_at,
    }));
  }

  const response = await authFetch(`${API_URL}/contacts`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "Erro ao carregar contatos");
  }
  return response.json();
}

/**
 * Lista contatos não lidos
 */
export async function getUnreadContacts(token: string): Promise<ContactItem[]> {
  if (isSupabaseConfigured) {
    const contacts = await getContacts(token);
    return contacts.filter((contact) => !contact.read);
  }

  const response = await authFetch(`${API_URL}/contacts/unread`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "Erro ao carregar contatos");
  }
  return response.json();
}

/**
 * Marca um contato como lido
 */
export async function markContactAsRead(
  token: string,
  contactId: number
): Promise<ContactItem> {
  if (isSupabaseConfigured) {
    const { data, error } = await requireSupabase()
      .from("v3_contacts")
      .update({ read: true })
      .eq("id", contactId)
      .select("id,name,email,message,read,created_at")
      .single();
    if (error) throw new Error(error.message);
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      message: data.message ?? "",
      read: data.read ?? false,
      createdAt: data.created_at,
    };
  }

  const response = await authFetch(`${API_URL}/contacts/${contactId}/read`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "Erro ao marcar como lido");
  }
  const data = await response.json();
  return data.contact;
}

// ==================== AUTENTICAÇÃO ====================

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface LoginData {
  email: string;
  password: string;
}

export type UserRole = "STUDENT" | "FREELANCER";
export type UserId = string | number;

export interface AuthResponse {
  token: string; // ainda retornado no body para manter token em memória; cookie httpOnly é setado em paralelo pelo backend
  email: string;
  name: string;
  id: UserId;
  message: string;
  avatarUrl?: string | null;
  role?: UserRole;
  isInternal?: boolean;
}

export interface User {
  id: UserId;
  name: string;
  email: string;
  createdAt: string;
  avatarUrl?: string | null;
  role?: UserRole;
  isInternal?: boolean;
  phone?: string | null;
  birthDate?: string | null;
  address?: string | null;
  city?: string | null;
  neighborhood?: string | null;
  state?: string | null;
  zipCode?: string | null;
}

export interface DashboardProgress {
  percent: number;
  phase: string;
  nextGoal: string;
  level: number;
  xp: number;
  streakDays: number;
  lastLesson?: string;
}

export interface DashboardNextAction {
  title: string;
  description: string;
  cta: string;
}

export interface DashboardChecklistItem {
  label: string;
  done: boolean;
}

export interface DashboardMentorship {
  nextSession: string;
  totalSessions: number;
}

export interface DashboardProjects {
  current: string;
  status: string;
}

export interface DashboardCommunity {
  unreadMessages: number;
  channel: string;
}

export interface DashboardOpportunity {
  title: string;
  type: string;
}

export interface DashboardSummary {
  success: boolean;
  user: User;
  progress: DashboardProgress;
  nextAction: DashboardNextAction;
  weeklyChecklist: DashboardChecklistItem[];
  mentorship: DashboardMentorship;
  projects: DashboardProjects;
  community: DashboardCommunity;
  opportunities: DashboardOpportunity[];
  achievements: string[];
}

export interface ForumMessage {
  id: number;
  content: string;
  author: string;
  userId: UserId;
  authorAvatarUrl?: string | null;
  city?: string | null;
  neighborhood?: string | null;
  /** Estado (UF) do autor, do perfil. */
  authorState?: string | null;
  /** Idade do autor (calculada a partir da data de nascimento do perfil). */
  authorAge?: number | null;
  parentId?: number | null;
  topicTitle?: string | null;
  topicColor?: string | null;
  topicEmoji?: string | null;
  createdAt: string;
}

export interface Project {
  id: number;
  title: string;
  description: string;
  status: string;
  createdAt: string;
}

export interface Job {
  id: number;
  title: string;
  description: string;
  type: string;
  status: string;
  createdAt: string;
}

/**
 * Registra um novo usuário
 */
type SupabaseProfileRow = {
  id: string;
  email: string | null;
  name: string | null;
  avatar_url: string | null;
  role: UserRole | null;
  is_internal: boolean | null;
  phone: string | null;
  birth_date: string | null;
  address: string | null;
  city: string | null;
  neighborhood: string | null;
  state: string | null;
  zip_code: string | null;
  created_at: string | null;
};

type SupabaseProgressRow = {
  percent: number | null;
  phase: string | null;
  next_goal: string | null;
  level: number | null;
  xp: number | null;
  streak_days: number | null;
  last_lesson: string | null;
};

function profileRowToUser(profile: SupabaseProfileRow): User {
  return {
    id: profile.id,
    email: profile.email ?? "",
    name: profile.name ?? "Usuario",
    createdAt: profile.created_at ?? new Date().toISOString(),
    avatarUrl: profile.avatar_url,
    role: profile.role ?? "STUDENT",
    isInternal: profile.is_internal ?? false,
    phone: profile.phone,
    birthDate: profile.birth_date,
    address: profile.address,
    city: profile.city,
    neighborhood: profile.neighborhood,
    state: profile.state,
    zipCode: profile.zip_code,
  };
}

function progressRowToDashboardProgress(progress?: SupabaseProgressRow | null): DashboardProgress {
  return {
    percent: progress?.percent ?? 0,
    phase: progress?.phase ?? "Planeta Terra - Fundacao",
    nextGoal: progress?.next_goal ?? "Finalizar o Modulo 1 de fundamentos",
    level: progress?.level ?? 1,
    xp: progress?.xp ?? 0,
    streakDays: progress?.streak_days ?? 0,
    lastLesson: progress?.last_lesson ?? "",
  };
}

async function getSupabaseProfile(userId: string): Promise<User> {
  const client = requireSupabase();
  const { data, error } = await client
    .from("v3_profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) throw new Error(error.message);
  return profileRowToUser(data as SupabaseProfileRow);
}

async function ensureSupabaseProfile(params: {
  id: string;
  email: string;
  name: string;
  role?: UserRole;
}): Promise<User> {
  const client = requireSupabase();
  const { data, error } = await client
    .from("v3_profiles")
    .upsert({
      id: params.id,
      email: params.email,
      name: params.name,
      role: params.role ?? "STUDENT",
    }, { onConflict: "id" })
    .select("*")
    .single();

  if (error) throw new Error(error.message);

  await client
    .from("v3_user_progress")
    .upsert({ user_id: params.id }, { onConflict: "user_id" });

  return profileRowToUser(data as SupabaseProfileRow);
}

export async function register(data: RegisterData): Promise<AuthResponse> {
  if (isSupabaseConfigured) {
    const client = requireSupabase();
    const role = data.role ?? "STUDENT";
    const { data: authData, error } = await client.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
          role,
        },
      },
    });

    if (error) throw new Error(error.message);
    if (!authData.user) throw new Error("Nao foi possivel criar a conta.");

    const user = await ensureSupabaseProfile({
      id: authData.user.id,
      email: authData.user.email ?? data.email,
      name: data.name,
      role,
    });

    return {
      token: authData.session?.access_token ?? "",
      id: user.id,
      email: user.email,
      name: user.name,
      message: "Conta criada com sucesso",
      avatarUrl: user.avatarUrl,
      role: user.role,
      isInternal: user.isInternal,
    };
  }

  const maxRetries = 2;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      // Timeout maior para serviços gratuitos que "acordam" devagar
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 segundos

      const response = await authFetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...data, role: data.role ?? 'STUDENT' }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Erro ao criar conta');
      }

      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Erro desconhecido');
      
      // Se não for timeout ou erro de rede, não tenta novamente
      if (lastError.name !== 'AbortError' && !lastError.message.includes('fetch')) {
        throw lastError;
      }

      // Se for a última tentativa, lança o erro
      if (attempt === maxRetries) {
        if (lastError.name === 'AbortError' || lastError.message.includes('fetch')) {
          throw new Error('Servidor demorou para responder. O serviço pode estar iniciando. Tente novamente em alguns segundos.');
        }
        throw lastError;
      }

      // Aguarda antes de tentar novamente (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 2000 * (attempt + 1)));
    }
  }

  throw lastError || new Error('Erro ao criar conta');
}

/**
 * Faz login de um usuário
 */
export async function login(data: LoginData): Promise<AuthResponse> {
  if (isSupabaseConfigured) {
    const client = requireSupabase();
    const { data: authData, error } = await client.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) throw new Error(error.message);
    if (!authData.user || !authData.session) {
      throw new Error("Nao foi possivel fazer login.");
    }

    let user: User;
    try {
      user = await getSupabaseProfile(authData.user.id);
    } catch {
      user = await ensureSupabaseProfile({
        id: authData.user.id,
        email: authData.user.email ?? data.email,
        name:
          (authData.user.user_metadata?.name as string | undefined) ??
          authData.user.email?.split("@")[0] ??
          "Usuario",
        role: (authData.user.user_metadata?.role as UserRole | undefined) ?? "STUDENT",
      });
    }

    return {
      token: authData.session.access_token,
      id: user.id,
      email: user.email,
      name: user.name,
      message: "Login realizado com sucesso",
      avatarUrl: user.avatarUrl,
      role: user.role,
      isInternal: user.isInternal,
    };
  }

  const maxRetries = 2;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      // Timeout maior para serviços gratuitos que "acordam" devagar
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 segundos

      const response = await authFetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Erro ao fazer login');
      }

      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Erro desconhecido');
      
      // Se não for timeout ou erro de rede, não tenta novamente
      if (lastError.name !== 'AbortError' && !lastError.message.includes('fetch')) {
        throw lastError;
      }

      // Se for a última tentativa, lança o erro
      if (attempt === maxRetries) {
        if (lastError.name === 'AbortError' || lastError.message.includes('fetch')) {
          throw new Error('Servidor demorou para responder. O serviço pode estar iniciando. Tente novamente em alguns segundos.');
        }
        throw lastError;
      }

      // Aguarda antes de tentar novamente (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 2000 * (attempt + 1)));
    }
  }

  throw lastError || new Error('Erro ao fazer login');
}

/**
 * Busca dados do usuário autenticado
 */
export async function getCurrentUser(token: string | null): Promise<{ success: boolean; user: User; token?: string }> {
  if (isSupabaseConfigured) {
    const client = requireSupabase();
    const { data: sessionData, error: sessionError } = await client.auth.getSession();
    if (sessionError || !sessionData.session?.user) {
      throw new Error("Sessao nao encontrada");
    }
    const user = await getSupabaseProfile(sessionData.session.user.id);
    return { success: true, user, token: sessionData.session.access_token };
  }

  try {
    const response = await authFetch(`${API_URL}/dashboard/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Erro ao buscar dados do usuário');
    }

    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Erro desconhecido ao buscar dados do usuário');
  }
}

/**
 * Invalida a sessão no backend — apaga o cookie httpOnly.
 */
export async function logout(): Promise<void> {
  if (isSupabaseConfigured) {
    await requireSupabase().auth.signOut();
    return;
  }
  await authFetch(`${API_URL}/auth/logout`, { method: "POST" }).catch(() => {});
}

/**
 * Renova o JWT sem pedir senha, desde que o token atual ainda seja válido.
 * Retorna o novo token ou null se a sessão expirou.
 */
export async function refreshSession(): Promise<string | null> {
  if (isSupabaseConfigured) {
    const { data, error } = await requireSupabase().auth.refreshSession();
    if (error) return null;
    return data.session?.access_token ?? null;
  }

  try {
    const res = await authFetch(`${API_URL}/auth/refresh`, { method: "POST" });
    if (!res.ok) return null;
    const data = await res.json();
    return data.success ? (data.token as string) : null;
  } catch {
    return null;
  }
}

/**
 * Atualiza perfil do usuário (nome, foto, endereço, telefone, data de nascimento, etc.)
 */
export async function updateProfile(
  token: string,
  data: {
    name?: string;
    avatarUrl?: string | null;
    phone?: string | null;
    birthDate?: string | null;
    address?: string | null;
    city?: string | null;
    neighborhood?: string | null;
    state?: string | null;
    zipCode?: string | null;
  }
): Promise<{ success: boolean; user: User }> {
  if (isSupabaseConfigured) {
    const client = requireSupabase();
    const { data: sessionData } = await client.auth.getSession();
    const userId = sessionData.session?.user.id;
    if (!userId) throw new Error("Sessao nao encontrada");

    const payload = {
      name: data.name,
      avatar_url: data.avatarUrl,
      phone: data.phone,
      birth_date: data.birthDate,
      address: data.address,
      city: data.city,
      neighborhood: data.neighborhood,
      state: data.state,
      zip_code: data.zipCode,
    };

    const { data: profile, error } = await client
      .from("v3_profiles")
      .update(payload)
      .eq("id", userId)
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return { success: true, user: profileRowToUser(profile as SupabaseProfileRow) };
  }

  try {
    const response = await authFetch(`${API_URL}/dashboard/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Erro ao atualizar perfil');
    }

    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Erro desconhecido ao atualizar perfil');
  }
}

/**
 * Envia foto de perfil (imagem) pela própria plataforma.
 * POST multipart para o backend; retorna a nova URL e o usuário atualizado.
 */
export async function uploadAvatarViaApi(
  token: string,
  file: File
): Promise<{ success: boolean; avatarUrl: string; user: User }> {
  if (isSupabaseConfigured) {
    const client = requireSupabase();
    const { data: sessionData } = await client.auth.getSession();
    const userId = sessionData.session?.user.id;
    if (!userId) throw new Error("Sessao nao encontrada");

    const extension = getSafeAvatarExtension(file);
    const path = `${userId}/avatar.${extension}`;
    const { error: uploadError } = await client.storage
      .from("avatars")
      .upload(path, file, { upsert: true, contentType: file.type });
    if (uploadError) throw new Error(uploadError.message);

    const { data: publicUrl } = client.storage.from("avatars").getPublicUrl(path);
    const result = await updateProfile(token, { avatarUrl: publicUrl.publicUrl });
    return { success: true, avatarUrl: publicUrl.publicUrl, user: result.user };
  }

  const formData = new FormData();
  formData.append('file', file);
  const response = await authFetch(`${API_URL}/dashboard/me/avatar`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Erro ao enviar foto');
  }
  return result;
}

/**
 * Busca o resumo do dashboard do usuário autenticado
 */
export async function getDashboardSummary(token: string): Promise<DashboardSummary> {
  if (isSupabaseConfigured) {
    const client = requireSupabase();
    const { data: sessionData } = await client.auth.getSession();
    const userId = sessionData.session?.user.id;
    if (!userId) throw new Error("Sessao nao encontrada");

    const user = await getSupabaseProfile(userId);
    const { data: progressRow } = await client
      .from("v3_user_progress")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (!progressRow) {
      await client.from("v3_user_progress").upsert({ user_id: userId }, { onConflict: "user_id" });
    }

    return {
      success: true,
      user,
      progress: progressRowToDashboardProgress(progressRow as SupabaseProgressRow | null),
      nextAction: {
        title: "Continuar o Modulo 1",
        description: "Registrar a primeira duvida",
        cta: "/estudante/aulas",
      },
      weeklyChecklist: [
        { label: "Assistir 2 aulas base", done: false },
        { label: "Fazer 1 exercicio pratico", done: false },
        { label: "Postar 1 duvida na comunidade", done: false },
        { label: "Marcar 1 mentoria", done: false },
      ],
      mentorship: { nextSession: "A definir", totalSessions: 0 },
      projects: { current: "Landing page pessoal", status: "Em planejamento" },
      community: { unreadMessages: 0, channel: "#duvidas-iniciais" },
      opportunities: [],
      achievements: [],
    };
  }

  try {
    const response = await authFetch(`${API_URL}/dashboard/summary`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Erro ao buscar resumo do dashboard');
    }

    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Erro desconhecido ao buscar resumo do dashboard');
  }
}

export interface AddProgressLessonBody {
  xpGained?: number;
  lessonTitle?: string;
}

/**
 * Registra conclusão de aula: adiciona XP e opcionalmente atualiza lastLesson.
 * Reflete em todos os pontos que usam getDashboardSummary (progresso real por usuário).
 */
export async function addProgressLesson(
  token: string,
  body: AddProgressLessonBody = {}
): Promise<{ success: boolean; progress: DashboardProgress }> {
  if (isSupabaseConfigured) {
    const client = requireSupabase();
    const { data: sessionData } = await client.auth.getSession();
    const userId = sessionData.session?.user.id;
    if (!userId) throw new Error("Sessao nao encontrada");

    const { data: current } = await client
      .from("v3_user_progress")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    const previous = progressRowToDashboardProgress(current as SupabaseProgressRow | null);
    let xp = previous.xp + (body.xpGained ?? 10);
    let level = previous.level;
    while (xp >= 100) {
      xp -= 100;
      level += 1;
    }

    const payload = {
      user_id: userId,
      xp,
      level,
      last_lesson: body.lessonTitle ?? previous.lastLesson ?? null,
    };

    const { data: updated, error } = await client
      .from("v3_user_progress")
      .upsert(payload, { onConflict: "user_id" })
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return { success: true, progress: progressRowToDashboardProgress(updated as SupabaseProgressRow) };
  }

  const response = await authFetch(`${API_URL}/dashboard/me/progress/lesson`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Erro ao registrar progresso da aula');
  }
  return result;
}

/**
 * Lista projetos do usuário (área do colaborador)
 */
export async function getMyProjects(token: string): Promise<Project[]> {
  if (isSupabaseConfigured) return [];

  try {
    const response = await authFetch(`${API_URL}/projects`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Erro ao carregar projetos');
    }
    return result.projects ?? [];
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error('Erro ao carregar projetos');
  }
}

export interface GetJobsOptions {
  /** Filtrar por tipo: freela, clt, estágio, etc. */
  type?: string;
}

/**
 * Lista vagas (área do colaborador). Opcionalmente filtra por tipo.
 */
export async function getJobs(
  token: string,
  options?: GetJobsOptions
): Promise<Job[]> {
  if (isSupabaseConfigured) return [];

  try {
    const params = new URLSearchParams();
    if (options?.type?.trim()) params.set("type", options.type.trim());
    const url = params.toString() ? `${API_URL}/jobs?${params}` : `${API_URL}/jobs`;
    const response = await authFetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "Erro ao carregar vagas");
    }
    return result.jobs ?? [];
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("Erro ao carregar vagas");
  }
}

/** Perfil público do usuário (para modal no fórum, visto por último no chat). */
export interface PublicProfile {
  id: UserId;
  name: string;
  avatarUrl: string;
  city: string;
  state: string;
  role: string;
  lastSeenAt: string | null;
}

export async function getPublicProfile(token: string, userId: UserId): Promise<PublicProfile | null> {
  if (isSupabaseConfigured) {
    const { data, error } = await requireSupabase()
      .from("v3_profiles")
      .select("id,name,avatar_url,city,state,role")
      .eq("id", String(userId))
      .maybeSingle();
    if (error || !data) return null;
    return {
      id: data.id,
      name: data.name ?? "",
      avatarUrl: data.avatar_url ?? "",
      city: data.city ?? "",
      state: data.state ?? "",
      role: data.role ?? "STUDENT",
      lastSeenAt: null,
    };
  }

  try {
    const response = await authFetch(`${API_URL}/users/${userId}/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const result = await response.json();
    if (!response.ok || !result.profile) return null;
    return result.profile;
  } catch {
    return null;
  }
}

/**
 * Lista mensagens do forum (tópicos raiz) ou respostas de um tópico
 */
export async function getForumMessages(parentId?: number): Promise<ForumMessage[]> {
  if (isSupabaseConfigured) {
    let query = requireSupabase()
      .from("v3_forum_messages")
      .select("*, profiles:v3_profiles(id,name,avatar_url,state,birth_date)")
      .order("created_at", { ascending: false });
    query = parentId != null ? query.eq("parent_id", parentId) : query.is("parent_id", null);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data ?? []).map((item) => ({
      id: item.id,
      content: item.content,
      author: item.profiles?.name ?? "Usuario",
      userId: item.user_id,
      authorAvatarUrl: item.profiles?.avatar_url ?? null,
      city: item.city ?? null,
      neighborhood: item.neighborhood ?? null,
      authorState: item.profiles?.state ?? null,
      authorAge: null,
      parentId: item.parent_id ?? null,
      topicTitle: item.topic_title ?? null,
      topicColor: item.topic_color ?? null,
      topicEmoji: item.topic_emoji ?? null,
      createdAt: item.created_at,
    }));
  }

  try {
    const params = new URLSearchParams();
    if (parentId != null) params.set("parentId", String(parentId));
    const url = params.toString() ? `${API_URL}/forum/messages?${params.toString()}` : `${API_URL}/forum/messages`;
    const response = await authFetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error((err as { message?: string }).message || 'Erro ao carregar mensagens');
    }
    return response.json();
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error('Erro desconhecido ao carregar mensagens');
  }
}

export async function searchForumMessages(query: string, parentId?: number): Promise<ForumMessage[]> {
  if (isSupabaseConfigured) {
    const messages = await getForumMessages(parentId);
    const normalized = query.trim().toLowerCase();
    if (!normalized) return messages;
    return messages.filter((message) =>
      [message.content, message.topicTitle, message.author, message.city, message.neighborhood]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalized))
    );
  }

  try {
    const params = new URLSearchParams({ q: query });
    if (parentId != null) params.set("parentId", String(parentId));
    const response = await authFetch(`${API_URL}/forum/messages?${params.toString()}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error((err as { message?: string }).message || 'Erro ao buscar mensagens');
    }
    return response.json();
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error('Erro desconhecido ao buscar mensagens');
  }
}

/**
 * Envia nova mensagem no forum (requer autenticação). Pode ser tópico (com título/cor/emoji) ou resposta (parentId).
 */
export async function postForumMessage(
  token: string,
  content: string,
  city?: string,
  neighborhood?: string,
  options?: { parentId?: number; topicTitle?: string; topicColor?: string; topicEmoji?: string }
): Promise<ForumMessage> {
  if (isSupabaseConfigured) {
    const client = requireSupabase();
    const { data: sessionData } = await client.auth.getSession();
    const userId = sessionData.session?.user.id;
    if (!userId) throw new Error("Sessao nao encontrada");

    const { data, error } = await client
      .from("v3_forum_messages")
      .insert({
        user_id: userId,
        content,
        city: city ?? "",
        neighborhood: neighborhood ?? "",
        parent_id: options?.parentId ?? null,
        topic_title: options?.topicTitle ?? null,
        topic_color: options?.topicColor ?? null,
        topic_emoji: options?.topicEmoji ?? null,
      })
      .select("*, profiles:v3_profiles(id,name,avatar_url,state)")
      .single();
    if (error) throw new Error(error.message);
    return {
      id: data.id,
      content: data.content,
      author: data.profiles?.name ?? "Usuario",
      userId: data.user_id,
      authorAvatarUrl: data.profiles?.avatar_url ?? null,
      city: data.city ?? null,
      neighborhood: data.neighborhood ?? null,
      authorState: data.profiles?.state ?? null,
      authorAge: null,
      parentId: data.parent_id ?? null,
      topicTitle: data.topic_title ?? null,
      topicColor: data.topic_color ?? null,
      topicEmoji: data.topic_emoji ?? null,
      createdAt: data.created_at,
    };
  }

  try {
    const body: Record<string, unknown> = { content, city: city ?? "", neighborhood: neighborhood ?? "" };
    if (options?.parentId != null) body.parentId = options.parentId;
    if (options?.topicTitle != null) body.topicTitle = options.topicTitle;
    if (options?.topicColor != null) body.topicColor = options.topicColor;
    if (options?.topicEmoji != null) body.topicEmoji = options.topicEmoji;
    const response = await authFetch(`${API_URL}/forum/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error((err as { message?: string }).message || 'Erro ao enviar mensagem');
    }
    return response.json();
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error('Erro desconhecido ao enviar mensagem');
  }
}

export async function updateForumMessage(
  token: string,
  id: number,
  content: string,
  city?: string,
  neighborhood?: string,
  options?: { topicTitle?: string; topicColor?: string; topicEmoji?: string }
): Promise<ForumMessage> {
  if (isSupabaseConfigured) {
    const { data, error } = await requireSupabase()
      .from("v3_forum_messages")
      .update({
        content,
        city: city ?? "",
        neighborhood: neighborhood ?? "",
        topic_title: options?.topicTitle ?? null,
        topic_color: options?.topicColor ?? null,
        topic_emoji: options?.topicEmoji ?? null,
      })
      .eq("id", id)
      .select("*, profiles:v3_profiles(id,name,avatar_url,state)")
      .single();
    if (error) throw new Error(error.message);
    return {
      id: data.id,
      content: data.content,
      author: data.profiles?.name ?? "Usuario",
      userId: data.user_id,
      authorAvatarUrl: data.profiles?.avatar_url ?? null,
      city: data.city ?? null,
      neighborhood: data.neighborhood ?? null,
      authorState: data.profiles?.state ?? null,
      authorAge: null,
      parentId: data.parent_id ?? null,
      topicTitle: data.topic_title ?? null,
      topicColor: data.topic_color ?? null,
      topicEmoji: data.topic_emoji ?? null,
      createdAt: data.created_at,
    };
  }

  try {
    const body: Record<string, unknown> = { content, city: city ?? "", neighborhood: neighborhood ?? "" };
    if (options?.topicTitle != null) body.topicTitle = options.topicTitle;
    if (options?.topicColor != null) body.topicColor = options.topicColor;
    if (options?.topicEmoji != null) body.topicEmoji = options.topicEmoji;
    const response = await authFetch(`${API_URL}/forum/messages/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error((err as { message?: string }).message || 'Erro ao atualizar mensagem');
    }
    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Erro desconhecido ao atualizar mensagem');
  }
}

export async function deleteForumMessage(token: string, id: number): Promise<void> {
  if (isSupabaseConfigured) {
    const { error } = await requireSupabase().from("v3_forum_messages").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return;
  }

  try {
    const response = await authFetch(`${API_URL}/forum/messages/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error((err as { message?: string }).message || 'Erro ao excluir mensagem');
    }
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error('Erro desconhecido ao excluir mensagem');
  }
}

// ==================== CHAT (MENSAGENS) ====================

export interface ChatUser {
  id: UserId;
  name: string;
  email: string;
  avatarUrl: string;
  role: string;
  lastSeenAt?: string | null;
}

export interface ChatLastMessage {
  content: string;
  senderId: UserId;
  createdAt: string;
}

export interface ChatConversation {
  id: number;
  type: "DIRECT" | "GROUP";
  name: string | null;
  displayName: string;
  avatarUrl?: string | null;
  createdByUserId?: UserId | null;
  createdAt: string;
  participants: ChatUser[];
  lastMessage: ChatLastMessage | null;
}

export interface ChatMessageItem {
  id: number;
  content: string;
  senderId: UserId;
  senderName: string;
  senderAvatarUrl: string;
  createdAt: string;
  readAt?: string | null;
}

async function getCurrentSupabaseUserId(): Promise<string> {
  const { data } = await requireSupabase().auth.getSession();
  const userId = data.session?.user.id;
  if (!userId) throw new Error("Sessao nao encontrada");
  return userId;
}

function profileToChatUser(profile: any): ChatUser {
  return {
    id: profile.id,
    name: profile.name ?? "Usuario",
    email: profile.email ?? "",
    avatarUrl: profile.avatar_url ?? "",
    role: profile.role ?? "STUDENT",
    lastSeenAt: null,
  };
}

async function buildSupabaseConversation(conversation: any): Promise<ChatConversation> {
  const client = requireSupabase();
  const currentUserId = await getCurrentSupabaseUserId();
  const { data: participantRows } = await client
    .from("v3_conversation_participants")
    .select("user_id, profiles:v3_profiles(id,name,email,avatar_url,role)")
    .eq("conversation_id", conversation.id);
  const participants = (participantRows ?? [])
    .map((row: any) => row.profiles)
    .filter(Boolean)
    .map(profileToChatUser);
  const other = participants.find((participant) => participant.id !== currentUserId);
  const { data: lastMessage } = await client
    .from("v3_chat_messages")
    .select("content,sender_id,created_at")
    .eq("conversation_id", conversation.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return {
    id: conversation.id,
    type: conversation.type,
    name: conversation.name,
    displayName: conversation.type === "GROUP"
      ? conversation.name ?? "Grupo"
      : other?.name ?? "Conversa",
    avatarUrl: conversation.avatar_url ?? other?.avatarUrl ?? null,
    createdByUserId: conversation.created_by_user_id,
    createdAt: conversation.created_at,
    participants,
    lastMessage: lastMessage
      ? {
          content: lastMessage.content,
          senderId: lastMessage.sender_id,
          createdAt: lastMessage.created_at,
        }
      : null,
  };
}

export async function getChatConversations(token: string): Promise<ChatConversation[]> {
  if (isSupabaseConfigured) {
    const client = requireSupabase();
    const userId = await getCurrentSupabaseUserId();
    const { data: mine, error } = await client
      .from("v3_conversation_participants")
      .select("conversation_id")
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    const ids = (mine ?? []).map((row) => row.conversation_id);
    if (ids.length === 0) return [];
    const { data: conversations, error: convError } = await client
      .from("v3_conversations")
      .select("*")
      .in("id", ids)
      .order("created_at", { ascending: false });
    if (convError) throw new Error(convError.message);
    return Promise.all((conversations ?? []).map(buildSupabaseConversation));
  }

  const response = await authFetch(`${API_URL}/chat/conversations`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || "Erro ao carregar conversas");
  return result.conversations ?? [];
}

export async function getChatConversation(token: string, id: number): Promise<ChatConversation | null> {
  if (isSupabaseConfigured) {
    const { data, error } = await requireSupabase()
      .from("v3_conversations")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error || !data) return null;
    return buildSupabaseConversation(data);
  }

  const response = await authFetch(`${API_URL}/chat/conversations/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const result = await response.json();
  if (!response.ok) return null;
  return result.conversation ?? null;
}

export async function getChatMessages(token: string, conversationId: number): Promise<ChatMessageItem[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await requireSupabase()
      .from("v3_chat_messages")
      .select("id,content,sender_id,created_at, profiles:v3_profiles(name,avatar_url)")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []).map((message: any) => ({
      id: message.id,
      content: message.content,
      senderId: message.sender_id,
      senderName: message.profiles?.name ?? "Usuario",
      senderAvatarUrl: message.profiles?.avatar_url ?? "",
      createdAt: message.created_at,
      readAt: null,
    }));
  }

  const response = await authFetch(`${API_URL}/chat/conversations/${conversationId}/messages`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || "Erro ao carregar mensagens");
  return result.messages ?? [];
}

export async function sendChatMessage(
  token: string,
  conversationId: number,
  content: string
): Promise<ChatMessageItem> {
  if (isSupabaseConfigured) {
    const client = requireSupabase();
    const userId = await getCurrentSupabaseUserId();
    const { data, error } = await client
      .from("v3_chat_messages")
      .insert({
        conversation_id: conversationId,
        sender_id: userId,
        content: content.trim(),
      })
      .select("id,content,sender_id,created_at, profiles:v3_profiles(name,avatar_url)")
      .single();
    if (error) throw new Error(error.message);
    const message = data as any;
    const senderProfile = Array.isArray(message.profiles) ? message.profiles[0] : message.profiles;
    return {
      id: message.id,
      content: message.content,
      senderId: message.sender_id,
      senderName: senderProfile?.name ?? "Usuario",
      senderAvatarUrl: senderProfile?.avatar_url ?? "",
      createdAt: message.created_at,
      readAt: null,
    };
  }

  const response = await authFetch(`${API_URL}/chat/conversations/${conversationId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ content: content.trim() }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || "Erro ao enviar mensagem");
  return result.message;
}

export async function createDirectConversation(
  token: string,
  otherUserId: UserId
): Promise<{ conversation: ChatConversation; alreadyExists?: boolean }> {
  if (isSupabaseConfigured) {
    const client = requireSupabase();
    const userId = await getCurrentSupabaseUserId();
    const targetId = String(otherUserId);
    const existing = await getChatConversations(token);
    const found = existing.find((conversation) =>
      conversation.type === "DIRECT" &&
      conversation.participants.some((participant) => participant.id === targetId)
    );
    if (found) return { conversation: found, alreadyExists: true };

    const { data: conversation, error } = await client
      .from("v3_conversations")
      .insert({ type: "DIRECT", created_by_user_id: userId })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    const { error: participantsError } = await client
      .from("v3_conversation_participants")
      .insert([
        { conversation_id: conversation.id, user_id: userId },
        { conversation_id: conversation.id, user_id: targetId },
      ]);
    if (participantsError) throw new Error(participantsError.message);
    return { conversation: await buildSupabaseConversation(conversation) };
  }

  const response = await authFetch(`${API_URL}/chat/conversations`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ type: "DIRECT", otherUserId }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || "Erro ao criar conversa");
  return result;
}

export async function createGroupConversation(
  token: string,
  name: string,
  userIds: UserId[],
  avatarUrl?: string | null
): Promise<{ conversation: ChatConversation }> {
  if (isSupabaseConfigured) {
    const client = requireSupabase();
    const userId = await getCurrentSupabaseUserId();
    const { data: conversation, error } = await client
      .from("v3_conversations")
      .insert({
        type: "GROUP",
        name,
        avatar_url: avatarUrl ?? null,
        created_by_user_id: userId,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    const uniqueUserIds = Array.from(new Set([userId, ...userIds.map(String)]));
    const { error: participantsError } = await client
      .from("v3_conversation_participants")
      .insert(uniqueUserIds.map((participantId) => ({
        conversation_id: conversation.id,
        user_id: participantId,
      })));
    if (participantsError) throw new Error(participantsError.message);
    return { conversation: await buildSupabaseConversation(conversation) };
  }

  const body: { type: string; name: string; userIds: UserId[]; avatarUrl?: string } = { type: "GROUP", name, userIds };
  if (avatarUrl?.trim()) body.avatarUrl = avatarUrl.trim();
  const response = await authFetch(`${API_URL}/chat/conversations`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || "Erro ao criar grupo");
  return result;
}

export async function updateGroupConversation(
  token: string,
  conversationId: number,
  data: { name?: string; avatarUrl?: string | null }
): Promise<{ success: boolean; conversation: ChatConversation }> {
  if (isSupabaseConfigured) {
    const { data: conversation, error } = await requireSupabase()
      .from("v3_conversations")
      .update({
        name: data.name,
        avatar_url: data.avatarUrl,
      })
      .eq("id", conversationId)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return { success: true, conversation: await buildSupabaseConversation(conversation) };
  }

  const response = await authFetch(`${API_URL}/chat/conversations/${conversationId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || "Erro ao atualizar grupo");
  return result;
}

export async function addGroupParticipant(
  token: string,
  conversationId: number,
  userId: UserId
): Promise<{ success: boolean }> {
  if (isSupabaseConfigured) {
    const { error } = await requireSupabase()
      .from("v3_conversation_participants")
      .insert({ conversation_id: conversationId, user_id: String(userId) });
    if (error) throw new Error(error.message);
    return { success: true };
  }

  const response = await authFetch(`${API_URL}/chat/conversations/${conversationId}/participants`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ userId }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || "Erro ao adicionar participante");
  return result;
}

export async function removeGroupParticipant(
  token: string,
  conversationId: number,
  userId: UserId
): Promise<{ success: boolean }> {
  if (isSupabaseConfigured) {
    const { error } = await requireSupabase()
      .from("v3_conversation_participants")
      .delete()
      .eq("conversation_id", conversationId)
      .eq("user_id", String(userId));
    if (error) throw new Error(error.message);
    return { success: true };
  }

  const response = await authFetch(`${API_URL}/chat/conversations/${conversationId}/participants/${userId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || "Erro ao remover participante");
  return result;
}

/**
 * Upload de foto do grupo (arquivo). Apenas o criador pode enviar.
 * Retorna a conversa atualizada com avatarUrl.
 */
export async function uploadGroupAvatar(
  token: string,
  conversationId: number,
  file: File
): Promise<{ success: boolean; avatarUrl: string; conversation: ChatConversation }> {
  if (isSupabaseConfigured) {
    const client = requireSupabase();
    const extension = getSafeAvatarExtension(file);
    const path = `groups/${conversationId}/avatar.${extension}`;
    const { error: uploadError } = await client.storage
      .from("avatars")
      .upload(path, file, { upsert: true, contentType: file.type });
    if (uploadError) throw new Error(uploadError.message);
    const { data: publicUrl } = client.storage.from("avatars").getPublicUrl(path);
    const { success, conversation } = await updateGroupConversation(token, conversationId, {
      avatarUrl: publicUrl.publicUrl,
    });
    return { success, avatarUrl: publicUrl.publicUrl, conversation };
  }

  const formData = new FormData();
  formData.append("file", file);
  const response = await authFetch(`${API_URL}/chat/conversations/${conversationId}/avatar`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || "Erro ao enviar foto do grupo");
  return result;
}

export async function getChatUsers(token: string): Promise<ChatUser[]> {
  if (isSupabaseConfigured) {
    const currentUserId = await getCurrentSupabaseUserId();
    const { data, error } = await requireSupabase()
      .from("v3_profiles")
      .select("id,name,email,avatar_url,role")
      .neq("id", currentUserId)
      .order("name", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []).map(profileToChatUser);
  }

  const response = await authFetch(`${API_URL}/chat/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || "Erro ao carregar usuários");
  return result.users ?? [];
}


