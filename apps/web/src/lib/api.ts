/**
 * Funções para comunicação com a API do backend
 */

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined" && window.location.hostname !== "localhost"
    ? "https://orbitamos-api.onrender.com/api"
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
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  name: string;
  id: number;
  message: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

export interface DashboardProgress {
  percent: number;
  phase: string;
  nextGoal: string;
  level: number;
  xp: number;
  streakDays: number;
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
        body: JSON.stringify(data),
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

