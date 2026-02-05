"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ColaboradorSquad() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Squad</h1>
        <p className="mt-1 text-white/60">Chat e contato com o time</p>
      </div>

      <Card className="border-orbit-purple/20 bg-gray-900/50 max-w-2xl">
        <CardHeader>
          <CardTitle className="text-orbit-purple">💬 Em breve</CardTitle>
          <CardDescription>
            Aqui você poderá ver o chat com seu squad, trocar mensagens e acompanhar as demandas em um só lugar.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-white/70">
            Enquanto isso, use o canal de contato ou o mural para falar com a gente.
          </p>
          <div className="flex gap-3">
            <Link href="/mensagens">
              <Button className="bg-orbit-purple text-white hover:bg-orbit-purple/90">
                Abrir Mensagens
              </Button>
            </Link>
            <Link href="/contato">
              <Button variant="outline" className="border-orbit-purple text-orbit-purple hover:bg-orbit-purple hover:text-white">
                Ir para Contato
              </Button>
            </Link>
            <Link href="/mural">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                Ir para Mural
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
