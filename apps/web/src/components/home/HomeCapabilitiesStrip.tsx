"use client";

import { useState } from "react";
import { Bot, Code2, Pause, Play, Rocket, Zap } from "lucide-react";
import s from "./HomeCapabilitiesStrip.module.css";

const capabilities = [
  { icon: Rocket, text: "Velocidade de startup" },
  { icon: Zap, text: "Layout para conversão" },
  { icon: Bot, text: "Automações e IA" },
  { icon: Code2, text: "Pronto para escalar" },
];

export default function HomeCapabilitiesStrip() {
  const [paused, setPaused] = useState(false);

  return (
    <section className={s.strip} aria-label="Diferenciais da Orbitamos" data-home-capabilities>
      <div className={s.inner}>
        <div className={s.viewport} role="group" tabIndex={0} aria-label="Faixa de diferenciais">
          <div className={s.track} data-paused={paused}>
            {[0, 1, 2].map((copy) => (
              <ul key={copy} className={s.group} aria-hidden={copy > 0 ? true : undefined}>
                {capabilities.map(({ icon: Icon, text }) => (
                  <li key={text}>
                    <Icon size={16} aria-hidden="true" />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
        <button
          type="button"
          className={s.control}
          onClick={() => setPaused((value) => !value)}
          aria-pressed={paused}
          aria-label={paused ? "Retomar movimento da faixa" : "Pausar movimento da faixa"}
          title={paused ? "Retomar movimento" : "Pausar movimento"}
        >
          {paused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
        </button>
      </div>
    </section>
  );
}
