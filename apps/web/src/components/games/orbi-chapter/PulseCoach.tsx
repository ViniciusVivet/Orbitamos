import { ArrowUp, Code2, TriangleAlert } from "lucide-react";
import type { PulseGuideState } from "./types";
import p from "../OrbiPulse.module.css";

type Props = { guide: PulseGuideState; nearTerminal: boolean; disabled: boolean; onReturnToTerminal: () => void };

export default function PulseCoach({ guide, nearTerminal, disabled, onReturnToTerminal }: Props) {
  const side = guide.direction === "left" ? "pela esquerda" : guide.direction === "right" ? "pela direita" : "na sua direção";
  const danger = guide.threat !== "safe";
  const message = guide.threat === "incoming" ? `Ruído vindo ${side}. Pule para desviar!`
    : guide.threat === "charging" ? "A sentinela está preparando um ataque. Prepare o pulo."
    : guide.breach ? "Brecha aberta! O segundo pulso precisa chegar antes que o escudo volte."
    : nearTerminal ? "Terminal aceso. Toque em Terminal para ajustar seu equipamento."
    : guide.phase === "terminal" ? guide.direction === "none" ? "Toque em Terminal para ajustar seu equipamento." : `Segure a seta da ${guide.direction === "left" ? "esquerda" : "direita"} e encontre o terminal iluminado.`
    : guide.phase === "workshop" ? "As três passagens estão livres. Caminhe até a oficina iluminada."
    : guide.phase === "repair" ? `Segure Pulso e observe se a onda alcança a sentinela ${guide.target ?? "à frente"}.`
    : "Siga até a barreira. O traço claro mostra até onde seu pulso chega.";

  return <aside className={p.coach} data-pulse-guide data-threat={guide.threat} data-phase={guide.phase} data-breach={guide.breach} aria-label="Orientação do Orbi">
    <span className={p.coachAvatar} aria-hidden="true" />
    <p aria-live="polite" aria-atomic="true"><strong>{danger ? "Atenção ao ruído" : guide.breach ? "É a sua chance" : "Orbi"}</strong><span>{danger && (guide.threat === "incoming" ? <ArrowUp size={16} aria-hidden="true" /> : <TriangleAlert size={16} aria-hidden="true" />)}{message}</span></p>
    {guide.canReturn && guide.phase !== "workshop" && !nearTerminal && <button type="button" disabled={disabled} onClick={onReturnToTerminal}><Code2 size={16} />Voltar ao terminal</button>}
  </aside>;
}
