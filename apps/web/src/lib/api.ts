/**
 * Funções para comunicação com a API do backend
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

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

/**
 * Registra um novo usuário
 */
export async function register(data: RegisterData): Promise<AuthResponse> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos timeout

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
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Tempo de espera esgotado. Verifique sua conexão e tente novamente.');
      }
      throw error;
    }
    throw new Error('Erro desconhecido ao criar conta');
  }
}

/**
 * Faz login de um usuário
 */
export async function login(data: LoginData): Promise<AuthResponse> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos timeout

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
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Tempo de espera esgotado. Verifique sua conexão e tente novamente.');
      }
      throw error;
    }
    throw new Error('Erro desconhecido ao fazer login');
  }
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

