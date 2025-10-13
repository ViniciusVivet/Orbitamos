"use client";

import { useEffect, useState } from "react";

export default function StudyTools() {
  // Notebook
  const [note, setNote] = useState("");
  useEffect(() => { setNote(localStorage.getItem("orbit-note") || ""); }, []);
  useEffect(() => { localStorage.setItem("orbit-note", note); }, [note]);

  // Pomodoro simples
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [running]);
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  // Quiz mock
  const questions = [
    { q: "Qual seletor CSS seleciona elementos por id?", a: [".class", "#id", "tag"], c: 1 },
    { q: "Qual método cria um array a partir de string?", a: ["split", "join", "slice"], c: 0 },
  ];
  const [answers, setAnswers] = useState<number[]>(Array(questions.length).fill(-1));
  const score = answers.filter((ans, i) => ans === questions[i].c).length;

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Notebook */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="mb-2 text-sm font-semibold">Caderno de Estudos</div>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="h-40 w-full rounded-lg border border-white/10 bg-black/40 p-2 text-sm outline-none"
          placeholder="Anote ideias, dúvidas e links..."
        />
        <div className="mt-2 text-[11px] text-white/60">Salvo automaticamente no seu navegador.</div>
      </div>

      {/* Pomodoro */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
        <div className="mb-2 text-sm font-semibold">Pomodoro</div>
        <div className="text-3xl font-bold">{mm}:{ss}</div>
        <div className="mt-3 flex justify-center gap-2 text-xs">
          <button className="rounded-md bg-white/10 px-3 py-1 hover:bg-white/20" onClick={() => setRunning(true)}>Iniciar</button>
          <button className="rounded-md bg-white/10 px-3 py-1 hover:bg-white/20" onClick={() => setRunning(false)}>Pausar</button>
          <button className="rounded-md bg-white/10 px-3 py-1 hover:bg-white/20" onClick={() => { setSeconds(25*60); setRunning(false); }}>Reset</button>
        </div>
        <div className="mt-2 text-[11px] text-white/60">Registre 25min de foco + 5min de pausa.</div>
      </div>

      {/* Quiz */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="mb-2 text-sm font-semibold">Quiz (módulo)</div>
        <div className="space-y-3 text-sm">
          {questions.map((item, i) => (
            <div key={i}>
              <div className="mb-1 text-white/90">{i+1}. {item.q}</div>
              <div className="flex flex-wrap gap-2">
                {item.a.map((opt, j) => (
                  <button key={j} onClick={() => setAnswers(prev => { const p=[...prev]; p[i]=j; return p; })}
                    className={`rounded-md px-2 py-1 ${answers[i]===j?"bg-gradient-to-r from-orbit-electric to-orbit-purple text-black":"bg-white/10"}`}>{opt}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 text-xs text-white/70">Acertos: {score}/{questions.length}</div>
      </div>
    </div>
  );
}


