"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { beginEnglishReview, closeEnglishReview, consultEnglishReviewModel, emptyEnglishReviewSave, englishReviewKey, evaluateEnglishReviewAnswer, mergeEnglishReviewSave, readEnglishReviewSave, setEnglishReviewDraft, startAnotherEnglishReview, submitEnglishReviewAnswer, advanceEnglishReview, type EnglishReviewSave } from "@/lib/englishReview";
import { emptySpeakingSave, mergeSpeakingSave, readSpeakingSave, speakingSaveKey, type SpeakingSave } from "@/lib/spokenEnglish";
import { emptyEnglishUseSave, mergeEnglishUseSave } from "@/lib/englishUse";
import SpokenEnglish, { type EnglishStudySnapshot } from "./SpokenEnglish";
import EnglishReview from "./EnglishReview";

type Props = { userId: string; onBackHref?: string };

export default function EnglishWorkshop({ userId, onBackHref }: Props) {
  const [save, setSave] = useState<EnglishReviewSave>(emptyEnglishReviewSave);
  const latest = useRef(save);
  const [studySnapshot, setStudySnapshot] = useState<EnglishStudySnapshot | undefined>(undefined);
  const [loadedUser, setLoadedUser] = useState<string | null>(null);
  const [storageError, setStorageError] = useState(false);

  const update = useCallback((next: EnglishReviewSave) => {
    let value = next;
    try {
      value = mergeEnglishReviewSave(next, readEnglishReviewSave(localStorage.getItem(englishReviewKey(userId))));
      localStorage.setItem(englishReviewKey(userId), JSON.stringify(value)); setStorageError(false);
    } catch { setStorageError(true); }
    latest.current = value; setSave(value);
  }, [userId]);

  useEffect(() => {
    let active = true;
    latest.current = emptyEnglishReviewSave();
    queueMicrotask(() => {
      if (!active) return;
      let value = emptyEnglishReviewSave();
      try { value = readEnglishReviewSave(localStorage.getItem(englishReviewKey(userId))); } catch { setStorageError(true); }
      if (value.active && value.session) {
        try {
          const eligible = readSpeakingSave(localStorage.getItem(speakingSaveKey(userId))).completed;
          if (!value.session.ids.every(id => eligible.includes(id))) {
            value = beginEnglishReview(value, eligible, Date.now());
            localStorage.setItem(englishReviewKey(userId), JSON.stringify(value));
          }
        } catch { setStorageError(true); }
      }
      latest.current = value; setSave(value); setStudySnapshot(undefined); setLoadedUser(userId);
    });
    const receive = (event: StorageEvent) => {
      if (event.key !== englishReviewKey(userId)) return;
      const value = mergeEnglishReviewSave(latest.current, readEnglishReviewSave(event.newValue));
      latest.current = value; setSave(value);
    };
    window.addEventListener("storage", receive);
    return () => { active = false; window.removeEventListener("storage", receive); };
  }, [userId]);

  function eligibleIds(snapshot: SpeakingSave | undefined = studySnapshot?.speaking) {
    let stored = emptySpeakingSave();
    try { stored = readSpeakingSave(localStorage.getItem(speakingSaveKey(userId))); } catch { /* The in-memory speaking snapshot remains usable. */ }
    return mergeSpeakingSave(snapshot ?? stored, stored).completed;
  }
  function openReview(snapshot: EnglishStudySnapshot) {
    const value = {
      speaking: mergeSpeakingSave(snapshot.speaking, studySnapshot?.speaking ?? emptySpeakingSave()),
      contextual: mergeEnglishUseSave(snapshot.contextual, studySnapshot?.contextual ?? emptyEnglishUseSave()),
      speakingUnsaved: snapshot.speakingUnsaved === true,
      contextualUnsaved: snapshot.contextualUnsaved === true,
    };
    setStudySnapshot(value);
    update(beginEnglishReview(latest.current, eligibleIds(value.speaking), Date.now()));
  }
  function submit() {
    const session = latest.current.session;
    if (!session || session.cursor >= session.ids.length) return { ok: false, message: "Esta revisão já chegou ao fim." };
    const result = evaluateEnglishReviewAnswer(session.ids[session.cursor], session.draft);
    if (result.ok) update(submitEnglishReviewAnswer(latest.current, Date.now()));
    return result;
  }

  if (loadedUser !== userId) return <p role="status">Preparando o inglês com o Orbi…</p>;
  if (save.active && save.session) return <EnglishReview
    key={`${save.session.ids.join("|")}:${save.session.cursor}`}
    session={save.session}
    storageError={storageError}
    onDraft={value => update(setEnglishReviewDraft(latest.current, value))}
    onModel={() => update(consultEnglishReviewModel(latest.current))}
    onSubmit={submit}
    onNext={() => update(advanceEnglishReview(latest.current))}
    onClose={() => update(closeEnglishReview(latest.current))}
    onAgain={() => update(startAnotherEnglishReview(latest.current, eligibleIds(), Date.now()))}
  />;
  return <SpokenEnglish userId={userId} onBackHref={onBackHref} initialSave={studySnapshot} onReview={openReview}/>;
}
