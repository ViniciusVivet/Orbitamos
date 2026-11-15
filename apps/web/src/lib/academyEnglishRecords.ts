import type { AcademyActivityItem } from "./academyActivity";
import { ENGLISH_SPEAKING_HREF } from "./portalNavigation";
import { englishSpeakingLessons, readSpeakingSave, speakingSaveKey } from "./spokenEnglish";
import { englishUseKey, englishUseQuestions, readEnglishUseSave } from "./englishUse";
import { englishReviewKey, readEnglishReviewSave } from "./englishReview";

/** Read only on the progress page. These practices do not add catalog completions or XP. */
export function getAcademyEnglishRecords(userId: string | number, read: (key: string) => string | null): AcademyActivityItem[] {
  const records: AcademyActivityItem[] = [];
  const base = { group: "experience" as const, href: ENGLISH_SPEAKING_HREF, nextHref: ENGLISH_SPEAKING_HREF, nextLabel: "Continuar o inglês", reviewed: 0 };
  const speaking = readSpeakingSave(read(speakingSaveKey(userId)));
  const speakingPracticed = speaking.completed.length > 0 || Object.values(speaking.attempts).some(count => count > 0);
  if (speakingPracticed) records.push({ ...base, id: "spoken-english", title: "Fale inglês com o Orbi", completedUnits: speaking.completed.length, totalUnits: englishSpeakingLessons.length, unit: "itens praticados", status: speaking.completed.length === englishSpeakingLessons.length ? "completed" : "in-progress", practiced: true, detail: "Ouvir e repetir", history: "Participação declarada por você; não é uma nota de pronúncia." });

  const use = readEnglishUseSave(read(englishUseKey(userId)));
  const usePracticed = use.completed.length > 0 || Object.values(use.attempts).some(count => count > 0);
  if (usePracticed) records.push({ ...base, id: "english-use", title: "Use o inglês no código", completedUnits: use.completed.length, totalUnits: englishUseQuestions.length, unit: "respostas corretas", status: use.completed.length === englishUseQuestions.length ? "completed" : "in-progress", practiced: true, detail: "Escolhas em situações de programação" });

  const review = readEnglishReviewSave(read(englishReviewKey(userId)));
  const history = Object.values(review.history);
  const session = review.active ? review.session : undefined;
  if (history.length || (session && (session.results.length || session.draft.trim() || session.consulted))) {
    const count = history.length;
    const total = englishSpeakingLessons.length;
    const lastAt = history.length ? Math.max(...history.map(item => item.lastAt)) : undefined;
    records.push({ ...base, id: "english-review", title: "Revisão escrita de inglês", completedUnits: count, totalUnits: total, unit: "expressões revisadas", status: count === total ? "completed" : "in-progress", practiced: true, lastAt, detail: "Recuperar uma expressão pela pista em português", history: `${history.reduce((sum, item) => sum + item.reviews, 0)} respostas registradas; ${history.reduce((sum, item) => sum + item.helped, 0)} com consulta ao modelo. Revisar não mede a fala.` });
  }
  return records;
}
