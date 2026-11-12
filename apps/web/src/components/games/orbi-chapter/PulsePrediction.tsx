import { Check, ChevronDown, Lightbulb } from "lucide-react";
import { useId } from "react";
import type { PulsePrediction, PulsePredictionChoice } from "@/lib/orbiPulsePrediction";
import p from "../OrbiPulse.module.css";

export type PredictionReview = { question: PulsePrediction; answer: PulsePredictionChoice | null };

export function PulsePredictionPrompt({ question, selected, onSelect }: { question: PulsePrediction; selected: PulsePredictionChoice | null; onSelect: (answer: PulsePredictionChoice) => void }) {
  const questionId = useId();
  return <fieldset className={p.prediction} data-pulse-prediction aria-describedby={questionId}>
    <legend>Antes de testar, faça uma previsão</legend>
    <p id={questionId}>{question.prompt}</p>
    <div>{question.options.map(option => <label key={option.id} data-selected={selected === option.id}>
      <input type="radio" name="pulse-prediction" value={option.id} checked={selected === option.id} onChange={() => onSelect(option.id)} />
      <span>{option.label}</span>
    </label>)}</div>
    <small>É uma aposta, sem nota. Você também pode aplicar direto e observar.</small>
  </fieldset>;
}

export function PulsePredictionResult({ review }: { review: PredictionReview }) {
  const correct = review.answer === review.question.correctId;
  return <details className={p.predictionResult} data-pulse-prediction-result={review.answer ? correct ? "correct" : "compare" : "observe"}>
    <summary>{correct ? <Check size={16} /> : <Lightbulb size={16} />}<span>{correct ? "Você previu o efeito do código." : review.answer ? "Vamos comparar sua aposta com o código." : "Veja o que seu código mudou."}</span><ChevronDown size={15} /></summary>
    <p>{review.question.explanation}</p><p>Agora use o pulso na sentinela para conferir se a configuração resolve o desafio.</p>
  </details>;
}
