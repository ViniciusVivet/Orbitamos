"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type Mission = { id: string; title: string; done: boolean };

const DEFAULT: Mission[] = [
  { id: "linkedin", title: "Criar/atualizar seu LinkedIn", done: false },
  { id: "projeto", title: "Publicar 1 projeto no GitHub", done: false },
  { id: "estudo", title: "Estudar 2h hoje", done: false },
];

export default function Missions() {
  const [missions, setMissions] = useState<Mission[]>(DEFAULT);

  useEffect(() => {
    const raw = localStorage.getItem("orbit-missions");
    if (raw) setMissions(JSON.parse(raw));
  }, []);

  useEffect(() => {
    localStorage.setItem("orbit-missions", JSON.stringify(missions));
  }, [missions]);

  const toggle = (id: string) => {
    setMissions((list) => list.map((m) => (m.id === id ? { ...m, done: !m.done } : m)));
  };

  const progress = Math.round((missions.filter((m) => m.done).length / missions.length) * 100);

  return (
    <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-bold">Missões da Semana</h3>
        <span className="text-sm text-white/70">{progress}%</span>
      </div>

      <div className="relative mb-6 h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-orbit-electric to-orbit-purple" style={{ width: `${progress}%` }} />
      </div>

      <ul className="space-y-3">
        {missions.map((m) => (
          <li key={m.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-black/30 p-3">
            <label className="flex items-center gap-3 text-white/90">
              <input
                type="checkbox"
                checked={m.done}
                onChange={() => toggle(m.id)}
                className="size-4 accent-[color:theme(colors.orbit-electric)]"
              />
              {m.title}
            </label>
            {m.done && <span className="text-sm text-orbit-electric">✔</span>}
          </li>
        ))}
      </ul>

      <div className="mt-6 text-center text-sm text-white/70">
        Conclua 3/3 missões e desbloqueie uma mentoria coletiva.
      </div>
    </div>
  );
}


