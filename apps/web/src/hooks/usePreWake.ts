"use client";

import { useEffect, useRef } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

/**
 * Hook para "acordar" o backend antes do usuário precisar
 * Faz um fetch silencioso para /api/health quando o componente monta
 */
export function usePreWake() {
  const hasWoken = useRef(false);

  useEffect(() => {
    // Só executa uma vez, mesmo se o componente re-renderizar
    if (hasWoken.current) return;
    
    hasWoken.current = true;

    // Aguarda um pouco para não bloquear o carregamento inicial
    const timeoutId = setTimeout(() => {
      // Faz um fetch silencioso para acordar o backend
      fetch(`${API_URL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Não espera resposta, só "acorda" o servidor
      }).catch(() => {
        // Ignora erros silenciosamente
        // O objetivo é apenas "acordar" o servidor
      });
    }, 1000); // Aguarda 1 segundo após o componente montar

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);
}

