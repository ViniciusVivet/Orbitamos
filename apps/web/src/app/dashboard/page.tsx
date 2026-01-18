"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { DashboardSummary, getDashboardSummary } from "@/lib/api";
import { discordUrl, whatsappMentoriaUrl } from "@/lib/social";

export default function Dashboard() {
  const { user, token, isAuthenticated, loading, logout } = useAuth();
  const router = useRouter();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState("");
  const whatsappUrl = whatsappMentoriaUrl;

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/entrar");
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (loading || !isAuthenticated || !token) return;
    let isMounted = true;
    setSummaryLoading(true);
    setSummaryError("");

    getDashboardSummary(token)
      .then((result) => {
        if (!isMounted) return;
        setSummary(result);
      })
      .catch((error: Error) => {
        if (!isMounted) return;
        setSummaryError(error.message);
      })
      .finally(() => {
        if (!isMounted) return;
        setSummaryLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [loading, isAuthenticated, token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orbit-black via-gray-900 to-orbit-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orbit-electric border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white text-xl">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const createdAt = new Date(user.createdAt).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const progress = summary?.progress ?? {
    percent: 0,
    phase: "Planeta Terra — Fundação",
    nextGoal: "Finalizar o Módulo 1 de fundamentos",
    level: 1,
    xp: 0,
    streakDays: 0,
  };
  const nextAction = summary?.nextAction ?? {
    title: "Continuar o Módulo 1",
    description: "Registrar a primeira dúvida",
    cta: "/orbitacademy",
  };
  const checklistSemanal = summary?.weeklyChecklist ?? [];
  const mentorship = summary?.mentorship ?? { nextSession: "A definir", totalSessions: 0 };
  const projects = summary?.projects ?? { current: "Landing page pessoal", status: "Em planejamento" };
  const community = summary?.community ?? { unreadMessages: 0, channel: "#duvidas-iniciais" };
  const oportunidades = summary?.opportunities ?? [];
  const conquistas = summary?.achievements ?? [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orbit-black via-gray-900 to-orbit-black">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-5xl md:text-7xl font-bold mb-4">
                <span className="gradient-text">Bem-vindo, {user.name}!</span>
              </h1>
              <p className="text-xl text-gray-300">
                Sua jornada de transformação começou em {createdAt}
              </p>
            </div>
            <Button
              onClick={logout}
              variant="outline"
              className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
            >
              Sair
            </Button>
          </div>
        </div>
      </section>

      {/* Dashboard Content */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Perfil Card */}
            <Card className="bg-gray-900/50 border-orbit-electric/20">
              <CardHeader>
                <CardTitle className="text-orbit-electric text-2xl">👤 Seu Perfil</CardTitle>
                <CardDescription className="text-gray-300">Informações da sua conta</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-gray-400 text-sm">Nome</p>
                  <p className="text-white font-bold text-lg">{user.name}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">E-mail</p>
                  <p className="text-white font-bold text-lg">{user.email}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Membro desde</p>
                  <p className="text-white font-bold">{createdAt}</p>
                </div>
              </CardContent>
            </Card>

            {/* Progresso Card */}
            <Card className="bg-gray-900/50 border-orbit-purple/20">
              <CardHeader>
                <CardTitle className="text-orbit-purple text-2xl">📊 Seu Progresso</CardTitle>
                <CardDescription className="text-gray-300">Acompanhe sua evolução</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm text-gray-400 mb-2">
                      <span>Progresso Geral</span>
                      <span>{progress.percent}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <div className="bg-gradient-to-r from-orbit-electric to-orbit-purple h-3 rounded-full" style={{ width: `${progress.percent}%` }} />
                    </div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
                    <div className="flex items-center justify-between">
                      <span>Fase atual</span>
                      <span className="text-orbit-electric font-semibold">{progress.phase}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span>Próxima meta</span>
                      <span className="text-white/70">{progress.nextGoal}</span>
                    </div>
                  </div>
                  {summaryError && (
                    <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-200">
                      {summaryError}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Ações Rápidas Card */}
            <Card className="bg-gray-900/50 border-orbit-electric/20">
              <CardHeader>
                <CardTitle className="text-orbit-electric text-2xl">⚡ Ações Rápidas</CardTitle>
                <CardDescription className="text-gray-300">Navegue rapidamente</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/orbitacademy" className="block">
                  <Button variant="outline" className="w-full border-orbit-electric text-orbit-electric hover:bg-orbit-electric hover:text-black">
                    🎓 OrbitAcademy
                  </Button>
                </Link>
                <Link href="/mentorias" className="block">
                  <Button variant="outline" className="w-full border-orbit-purple text-orbit-purple hover:bg-orbit-purple hover:text-white">
                    👨‍🏫 Mentorias
                  </Button>
                </Link>
                <Link href="/sobre" className="block">
                  <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                    ℹ️ Sobre Nós
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Painel de Missão */}
      <section className="py-20 bg-black/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-10 text-center">
            Painel de <span className="gradient-text">Missão</span>
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-gray-900/50 border-orbit-electric/20">
              <CardHeader>
                <CardTitle className="text-orbit-electric text-xl">🧭 Status da Jornada</CardTitle>
                <CardDescription className="text-gray-300">Seu momento atual</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-white font-semibold">{progress.phase}</div>
                <div className="text-white/70 text-sm">Nível {progress.level} • {progress.xp} XP</div>
                <div className="text-white/70 text-sm">Sequência: {progress.streakDays} dias</div>
                <div className="text-xs text-white/60">Próxima meta: {progress.nextGoal}</div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-orbit-purple/20">
              <CardHeader>
                <CardTitle className="text-orbit-purple text-xl">🚀 Próxima Ação</CardTitle>
                <CardDescription className="text-gray-300">Uma tarefa clara para hoje</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-white/80">
                  {nextAction.title} — {nextAction.description}
                </div>
                <div className="mt-4">
                  <Link href={nextAction.cta}>
                    <Button className="w-full bg-gradient-to-r from-orbit-electric to-orbit-purple text-black font-bold">
                      Ir para as aulas
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-orbit-electric/20">
              <CardHeader>
                <CardTitle className="text-orbit-electric text-xl">✅ Checklist da Semana</CardTitle>
                <CardDescription className="text-gray-300">Pequenas vitórias</CardDescription>
              </CardHeader>
              <CardContent>
                {summaryLoading ? (
                  <p className="text-sm text-white/60">Carregando checklist...</p>
                ) : (
                  <ul className="space-y-2 text-sm">
                    {checklistSemanal.map((item) => (
                      <li key={item.label} className="flex items-center justify-between text-white/80">
                        <span>{item.label}</span>
                        <span className={item.done ? "text-orbit-electric" : "text-white/40"}>
                          {item.done ? "Concluído" : "Pendente"}
                        </span>
                      </li>
                    ))}
                    {checklistSemanal.length === 0 && (
                      <li className="text-white/50">Sem tarefas no momento.</li>
                    )}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-orbit-purple/20">
              <CardHeader>
                <CardTitle className="text-orbit-purple text-xl">👨‍🏫 Mentorias</CardTitle>
                <CardDescription className="text-gray-300">Agenda e acompanhamento</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-white/80 text-sm">
                  Próxima sessão: <span className="text-white font-semibold">{mentorship.nextSession}</span>
                </div>
                <div className="text-white/70 text-sm">Histórico: {mentorship.totalSessions} sessões</div>
                <Link href={whatsappUrl} target="_blank" rel="noreferrer">
                  <Button variant="outline" className="w-full border-orbit-purple text-orbit-purple hover:bg-orbit-purple hover:text-white">
                    Solicitar mentoria
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-orbit-electric/20">
              <CardHeader>
                <CardTitle className="text-orbit-electric text-xl">🧩 Projetos</CardTitle>
                <CardDescription className="text-gray-300">Seu portfólio em construção</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-white/80 text-sm">Projeto atual: {projects.current}</div>
                <div className="text-white/70 text-sm">Status: {projects.status}</div>
                <Button variant="outline" className="w-full border-orbit-electric text-orbit-electric hover:bg-orbit-electric hover:text-black">
                  Enviar atualização
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-orbit-purple/20">
              <CardHeader>
                <CardTitle className="text-orbit-purple text-xl">🌐 Comunidade</CardTitle>
                <CardDescription className="text-gray-300">Conexões que aceleram</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-white/80 text-sm">Últimas mensagens: {community.unreadMessages} novas</div>
                <div className="text-white/70 text-sm">Canal recomendado: {community.channel}</div>
                <Link href={discordUrl} target="_blank" rel="noreferrer">
                  <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                    Entrar no grupo
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-orbit-electric/20">
              <CardHeader>
                <CardTitle className="text-orbit-electric text-xl">💼 Oportunidades</CardTitle>
                <CardDescription className="text-gray-300">Portas abrindo</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-white/80">
                  {oportunidades.map((oportunidade) => (
                    <li key={oportunidade.title} className="flex items-center justify-between">
                      <span>{oportunidade.title}</span>
                      <span className="text-white/50">Ver</span>
                    </li>
                  ))}
                  {oportunidades.length === 0 && (
                    <li className="text-white/50">Sem oportunidades no momento.</li>
                  )}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-orbit-purple/20">
              <CardHeader>
                <CardTitle className="text-orbit-purple text-xl">🏅 Conquistas</CardTitle>
                <CardDescription className="text-gray-300">Seu progresso visível</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {conquistas.map((badge) => (
                    <span
                      key={badge}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80"
                    >
                      {badge}
                    </span>
                  ))}
                  {conquistas.length === 0 && (
                    <span className="text-xs text-white/50">Sem conquistas ainda.</span>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Mensagem de Boas-vindas */}
      <section className="py-20 bg-black/50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-8">
            Sua <span className="gradient-text">transformação</span> começa aqui
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12">
            Explore nossos cursos, participe das mentorias e comece sua jornada do subemprego à T.I. em 9 meses!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/orbitacademy">
              <Button size="lg" className="bg-gradient-to-r from-orbit-electric to-orbit-purple hover:from-orbit-purple hover:to-orbit-electric text-black font-bold px-12 py-6 text-xl">
                🚀 Começar Agora
              </Button>
            </Link>
            <Link href="/mentorias">
              <Button size="lg" variant="outline" className="border-orbit-electric text-orbit-electric hover:bg-orbit-electric hover:text-black px-12 py-6 text-xl">
                👨‍🏫 Ver Mentorias
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

