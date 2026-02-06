"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ColaboradorCandidaturas() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Candidaturas</h1>
        <p className="mt-1 text-white/60">Pipeline de candidaturas às vagas</p>
      </div>

      <Card className="border-orbit-purple/20 bg-gray-900/50 max-w-2xl">
        <CardHeader>
          <CardTitle className="text-orbit-purple">Em breve</CardTitle>
          <CardDescription>Pipeline de candidaturas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-white/70 text-sm">
            Aqui você verá as candidaturas recebidas por vaga, com nome, e-mail e data. Poderá mover candidatos entre etapas (Novos, Em contato, Fechado).
          </p>
          <Link href="/colaborador/vagas">
            <Button variant="outline" className="border-orbit-purple text-orbit-purple hover:bg-orbit-purple hover:text-white">
              Ver vagas abertas
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
