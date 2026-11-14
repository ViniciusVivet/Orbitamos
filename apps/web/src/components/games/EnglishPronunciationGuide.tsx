import { getEnglishPronunciation } from "@/lib/englishPronunciation";
import s from "./EnglishPronunciationGuide.module.css";

/** A Brazilian reading aid, always paired with the real English model. */
export default function EnglishPronunciationGuide({ text, compact = false, reveal = true }: { text: string; compact?: boolean; reveal?: boolean }) {
  const pronunciation = getEnglishPronunciation(text);
  if (!reveal || !pronunciation) return null;
  if (compact) return <span className={s.compact} lang="pt-BR" data-pronunciation-for={pronunciation.text}><span>Como se fala</span> <strong>{pronunciation.guide}</strong></span>;
  return <div className={s.root} lang="pt-BR" data-pronunciation-for={pronunciation.text}>
    <span className={s.label}>COMO SE FALA</span>
    <strong className={s.guide}>{pronunciation.guide}</strong>
    <span className={s.note}>Apoio aproximado em português. Acompanhe o áudio.</span>
    <details className={s.details}>
      <summary>Uma dica para falar</summary>
      {pronunciation.chunks.length > 1 && <div className={s.chunks}>{pronunciation.chunks.map((chunk, index) => <span key={`${index}-${chunk.en}`}><b lang="en-US">{chunk.en}</b><span>{chunk.pt}</span></span>)}</div>}
      <p>{pronunciation.tip}</p>
    </details>
  </div>;
}
