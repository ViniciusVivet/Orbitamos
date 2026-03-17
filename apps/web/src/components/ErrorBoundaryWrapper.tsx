"use client";

import ErrorBoundary from "./ErrorBoundary";

/**
 * Wrapper "use client" para usar ErrorBoundary dentro de Server Components (layout.tsx).
 * Error Boundaries precisam ser Client Components — esse wrapper resolve isso sem
 * precisar marcar o layout inteiro como client.
 */
export default function ErrorBoundaryWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ErrorBoundary>{children}</ErrorBoundary>;
}
