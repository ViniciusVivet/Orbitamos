/**
 * URL base do WebSocket do chat (mesmo host da API, endpoint /ws).
 */
export function getChatWsUrl(): string {
  if (typeof window === "undefined") return "";
  const api = process.env.NEXT_PUBLIC_API_URL || (window.location.hostname !== "localhost" ? "https://orbitamos-backend.onrender.com/api" : "http://localhost:8080/api");
  const base = api.replace(/\/api\/?$/, "").replace(/^http/, "ws");
  return `${base}/ws`;
}
