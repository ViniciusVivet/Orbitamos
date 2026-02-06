/**
 * Funções para comunicação com a API do backend
 */

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined" && window.location.hostname !== "localhost"
    ? "https://orbitamos-backend.onrender.com/api"
    : "http://localhost:8080/api");

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
    const response = await fetch(`${API_URL}/contact`, {
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

export interface AuthResponse {
  token: string;
  email: string;
  name: string;
  id: number;
  message: string;
  avatarUrl?: string | null;
  role?: UserRole;
}

export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  avatarUrl?: string | null;
  role?: UserRole;
  phone?: string | null;
  birthDate?: string | null;
  address?: string | null;
  city?: string | null;
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
  userId: number;
  city?: string | null;
  neighborhood?: string | null;
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
export async function register(data: RegisterData): Promise<AuthResponse> {
  const maxRetries = 2;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      // Timeout maior para serviços gratuitos que "acordam" devagar
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 segundos

      const response = await fetch(`${API_URL}/auth/register`, {
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
  const maxRetries = 2;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      // Timeout maior para serviços gratuitos que "acordam" devagar
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 segundos

      const response = await fetch(`${API_URL}/auth/login`, {
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
export async function getCurrentUser(token: string): Promise<{ success: boolean; user: User }> {
  try {
    const response = await fetch(`${API_URL}/dashboard/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
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
    state?: string | null;
    zipCode?: string | null;
  }
): Promise<{ success: boolean; user: User }> {
  try {
    const response = await fetch(`${API_URL}/dashboard/me`, {
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
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch(`${API_URL}/dashboard/me/avatar`, {
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
  try {
    const response = await fetch(`${API_URL}/dashboard/summary`, {
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
  const response = await fetch(`${API_URL}/dashboard/me/progress/lesson`, {
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
  try {
    const response = await fetch(`${API_URL}/projects`, {
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

/**
 * Lista vagas (área do colaborador)
 */
export async function getJobs(token: string): Promise<Job[]> {
  try {
    const response = await fetch(`${API_URL}/jobs`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Erro ao carregar vagas');
    }
    return result.jobs ?? [];
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error('Erro ao carregar vagas');
  }
}

/**
 * Lista mensagens do forum
 */
export async function getForumMessages(): Promise<ForumMessage[]> {
  try {
    const response = await fetch(`${API_URL}/forum/messages`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error('Erro ao carregar mensagens');
    }

    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Erro desconhecido ao carregar mensagens');
  }
}

export async function searchForumMessages(query: string): Promise<ForumMessage[]> {
  try {
    const params = new URLSearchParams({ q: query });
    const response = await fetch(`${API_URL}/forum/messages?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error('Erro ao carregar mensagens');
    }

    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Erro desconhecido ao carregar mensagens');
  }
}

/**
 * Envia nova mensagem no forum (requer autenticação)
 */
export async function postForumMessage(
  token: string,
  content: string,
  city?: string,
  neighborhood?: string
): Promise<ForumMessage> {
  try {
    const response = await fetch(`${API_URL}/forum/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ content, city, neighborhood }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Erro ao enviar mensagem');
    }

    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Erro desconhecido ao enviar mensagem');
  }
}

export async function updateForumMessage(
  token: string,
  id: number,
  content: string,
  city?: string,
  neighborhood?: string
): Promise<ForumMessage> {
  try {
    const response = await fetch(`${API_URL}/forum/messages/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ content, city, neighborhood }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Erro ao atualizar mensagem');
    }

    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Erro desconhecido ao atualizar mensagem');
  }
}

export async function deleteForumMessage(token: string, id: number): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/forum/messages/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Erro ao excluir mensagem');
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Erro desconhecido ao excluir mensagem');
  }
}

// ==================== CHAT (MENSAGENS) ====================

export interface ChatUser {
  id: number;
  name: string;
  email: string;
  avatarUrl: string;
  role: string;
}

export interface ChatLastMessage {
  content: string;
  senderId: number;
  createdAt: string;
}

export interface ChatConversation {
  id: number;
  type: "DIRECT" | "GROUP";
  name: string | null;
  displayName: string;
  createdAt: string;
  participants: ChatUser[];
  lastMessage: ChatLastMessage | null;
}

export interface ChatMessageItem {
  id: number;
  content: string;
  senderId: number;
  senderName: string;
  senderAvatarUrl: string;
  createdAt: string;
}

export async function getChatConversations(token: string): Promise<ChatConversation[]> {
  const response = await fetch(`${API_URL}/chat/conversations`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || "Erro ao carregar conversas");
  return result.conversations ?? [];
}

export async function getChatConversation(token: string, id: number): Promise<ChatConversation | null> {
  const response = await fetch(`${API_URL}/chat/conversations/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const result = await response.json();
  if (!response.ok) return null;
  return result.conversation ?? null;
}

export async function getChatMessages(token: string, conversationId: number): Promise<ChatMessageItem[]> {
  const response = await fetch(`${API_URL}/chat/conversations/${conversationId}/messages`, {
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
  const response = await fetch(`${API_URL}/chat/conversations/${conversationId}/messages`, {
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
  otherUserId: number
): Promise<{ conversation: ChatConversation; alreadyExists?: boolean }> {
  const response = await fetch(`${API_URL}/chat/conversations`, {
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
  userIds: number[]
): Promise<{ conversation: ChatConversation }> {
  const response = await fetch(`${API_URL}/chat/conversations`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ type: "GROUP", name, userIds }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || "Erro ao criar grupo");
  return result;
}

export async function getChatUsers(token: string): Promise<ChatUser[]> {
  const response = await fetch(`${API_URL}/chat/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || "Erro ao carregar usuários");
  return result.users ?? [];
}

