"use client";

import React from "react";

interface Props {
  children: React.ReactNode;
  /** Fallback customizado. Se omitido, usa o padrão visual da Orbitamos. */
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary global.
 * Captura qualquer erro de renderização nos filhos e exibe um fallback
 * em vez de quebrar a página inteira.
 *
 * Uso: <ErrorBoundary> <ComponenteQuePoqueQuebrar /> </ErrorBoundary>
 */
export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Em produção, aqui entraria integração com Sentry / Datadog / etc.
    if (process.env.NODE_ENV === "development") {
      console.error("[ErrorBoundary]", error, info.componentStack);
    }
  }

  private reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return <DefaultFallback error={this.state.error} onReset={this.reset} />;
    }
    return this.props.children;
  }
}

function DefaultFallback({
  error,
  onReset,
}: {
  error: Error | null;
  onReset: () => void;
}) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-5 px-4 text-center">
      <span className="text-5xl" aria-hidden>🛸</span>
      <div>
        <h2 className="text-xl font-bold text-white">Algo saiu da órbita</h2>
        <p className="mt-2 max-w-sm text-sm text-white/50">
          {process.env.NODE_ENV === "development" && error?.message
            ? error.message
            : "Erro inesperado nessa área. Tente novamente ou recarregue a página."}
        </p>
      </div>
      <button
        onClick={onReset}
        className="rounded-lg border border-orbit-electric/30 bg-orbit-electric/10 px-5 py-2 text-sm font-medium text-orbit-electric transition-colors hover:bg-orbit-electric/20"
      >
        Tentar novamente
      </button>
    </div>
  );
}
