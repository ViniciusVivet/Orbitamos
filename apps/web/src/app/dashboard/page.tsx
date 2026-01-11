"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function Dashboard() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/entrar");
    }
  }, [loading, isAuthenticated, router]);

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
                      <span>0%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <div className="bg-gradient-to-r from-orbit-electric to-orbit-purple h-3 rounded-full" style={{ width: "0%" }} />
                    </div>
                  </div>
                  <div className="text-center py-4">
                    <p className="text-gray-400 text-sm mb-2">Você ainda não iniciou nenhum curso</p>
                    <Link href="/orbitacademy">
                      <Button className="bg-gradient-to-r from-orbit-electric to-orbit-purple text-black font-bold">
                        Ver Cursos Disponíveis
                      </Button>
                    </Link>
                  </div>
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

