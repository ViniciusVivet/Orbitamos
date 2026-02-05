"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { discordUrl } from "@/lib/social";

export default function EstudanteComunidade() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Comunidade</h1>
        <p className="mt-1 text-white/60">Mural, fórum e conexão com a galera</p>
      </div>

      <Card className="border-orbit-purple/20 bg-gray-900/50 max-w-2xl">
        <CardHeader>
          <CardTitle className="text-orbit-purple">🌐 Comunidade</CardTitle>
          <CardDescription>
            Troque ideia com outros alunos, tire dúvidas e acompanhe o mural.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-white/70">
            O mural é o espaço para dúvidas, dicas e troca de experiências.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/mural">
              <Button variant="outline" className="border-orbit-purple text-orbit-purple hover:bg-orbit-purple hover:text-white">
                Ir ao mural
              </Button>
            </Link>
            <Link href={discordUrl} target="_blank" rel="noreferrer">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                Entrar no grupo (Discord)
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
