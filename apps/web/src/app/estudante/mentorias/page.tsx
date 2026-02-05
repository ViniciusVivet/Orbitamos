"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { whatsappMentoriaUrl } from "@/lib/social";

export default function EstudanteMentorias() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Mentorias</h1>
        <p className="mt-1 text-white/60">Sua agenda e acompanhamento</p>
      </div>

      <Card className="border-orbit-purple/20 bg-gray-900/50 max-w-2xl">
        <CardHeader>
          <CardTitle className="text-orbit-purple">👨‍🏫 Mentorias</CardTitle>
          <CardDescription>
            Conheça os programas, agende sessões e acompanhe sua evolução com o time.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-white/70">
            Mentoria Tech 9 Meses, Quebrada Dev e Orbitamos Academy — escolha o seu caminho.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/mentorias">
              <Button variant="outline" className="border-orbit-purple text-orbit-purple hover:bg-orbit-purple hover:text-white">
                Ver programas de mentoria
              </Button>
            </Link>
            <Link href={whatsappMentoriaUrl} target="_blank" rel="noreferrer">
              <Button className="bg-orbit-purple text-white hover:bg-orbit-purple/90">
                Solicitar mentoria (WhatsApp)
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
