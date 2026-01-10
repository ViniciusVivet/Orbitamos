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

