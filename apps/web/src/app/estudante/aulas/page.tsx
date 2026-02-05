"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function EstudanteAulas() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Aulas</h1>
        <p className="mt-1 text-white/60">OrbitAcademy — seu conteúdo de estudo</p>
      </div>

      <Card className="border-orbit-electric/20 bg-gray-900/50 max-w-2xl">
        <CardHeader>
          <CardTitle className="text-orbit-electric">🎓 OrbitAcademy</CardTitle>
          <CardDescription>
            Aqui você acessa as aulas e o conteúdo da sua jornada. O mesmo OrbitAcademy que atrai novos alunos, agora com seu progresso salvo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-white/70">
            Continue de onde parou, acompanhe suas conquistas e avance nos módulos.
          </p>
          <Link href="/orbitacademy">
            <Button className="bg-gradient-to-r from-orbit-electric to-orbit-purple text-black font-bold hover:from-orbit-purple hover:to-orbit-electric">
              Abrir OrbitAcademy
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
