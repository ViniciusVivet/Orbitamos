import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, FileCode2, FileImage, Folder, Terminal } from "lucide-react";
import type { EnglishUseQuestion } from "@/lib/englishUse";
import s from "./EnglishUseCheck.module.css";

type Props = {
  question: EnglishUseQuestion;
  completedCount: number;
  onAnswer: (choiceId: string) => { ok: boolean; message: string };
  onBack: () => void;
  onNext: () => void;
};

function WorkScene({ scene, lessonId }: { scene: EnglishUseQuestion["scene"]; lessonId: string }) {
  const terminal = scene === "error" || scene === "test" || scene === "build";
  const result = scene === "test" ? "PASS  soma.test.js  ✓" : scene === "build" ? "Build failed\nUnexpected token" : lessonId === "phrase-fix-the-error" ? "SyntaxError: Unexpected token\nmain.js:2\nif (total > 0 {" : "Error: file not found";
  if (terminal) return <div className={s.workstation} role="img" aria-label={`Terminal de exemplo: ${result}`}>
    <div className={s.windowBar}><Terminal size={15}/><span>terminal</span><i/></div>
    <pre><span>$ {scene === "test" ? "npm test" : scene === "build" ? "npm run build" : "node main.js"}</span>{"\n"}<strong data-error={scene !== "test"}>{result}</strong></pre>
  </div>;
  return <div className={s.workstation} role="img" aria-label={scene === "folder" ? "Projeto de exemplo: images contém logo.png e banner.webp" : `Projeto de exemplo: src, assets e main.js. main.js contém const total = 2 + 3; console.log(total).${scene === "save" ? " Há uma alteração pendente." : ""}`}>
    <div className={s.windowBar}><span>ORBI EDITOR</span><i/><i/><i/></div>
    <div className={s.editor}>
      <div className={s.tree}>{scene === "folder" ? <><div data-active><Folder size={15}/><span>images</span></div><div><FileImage size={14}/><span>logo.png</span></div><div><FileImage size={14}/><span>banner.webp</span></div></> : <><div><Folder size={15}/><span>src</span></div><div><Folder size={15}/><span>assets</span></div><div data-active={scene === "file"}><FileCode2 size={14}/><span>main.js</span></div></>}</div>
      {scene === "folder" ? <div className={s.folderContents}><div><FileImage size={29}/><span>logo.png</span></div><div><FileImage size={29}/><span>banner.webp</span></div></div> : <div className={s.code}><div className={s.tab}>main.js {scene === "save" && <span aria-label="Alteração pendente">●</span>}</div><pre><span>const</span> total = 2 + 3;{"\n"}console.log(total);</pre>{scene === "run" && <div className={s.runLine}>▶ Run <span>console &gt; _</span></div>}</div>}
    </div>
  </div>;
}

export default function EnglishUseCheck({ question, completedCount, onAnswer, onBack, onNext }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const feedbackPanel = useRef<HTMLDivElement>(null);
  const allDone = completedCount === 12;

  useEffect(() => {
    const frame = requestAnimationFrame(() => heading.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, []);
  useEffect(() => {
    if (feedback) feedbackPanel.current?.scrollIntoView({ block: "nearest" });
  }, [feedback]);

  function answer(id: string) {
    if (feedback?.ok) return;
    setSelected(id);
    setFeedback(onAnswer(id));
  }

  return <div className={s.root} data-english-use-check data-use-lesson-id={question.lessonId}>
    <header className={s.header}><button data-use-back onClick={onBack}><ArrowLeft size={15}/> Voltar à fala</button><span>NO CONTEXTO · {completedCount}/12</span></header>
    <div className={s.layout}>
      <div className={s.scene}>
        <p className={s.eyebrow}>VOCÊ ENCONTROU ESTE INGLÊS</p>
        <h1 ref={heading} tabIndex={-1} lang="en-US" data-use-expression>{question.target}</h1>
        <WorkScene scene={question.scene} lessonId={question.lessonId}/>
      </div>
      <section className={s.question} aria-labelledby="english-use-prompt">
        <p className={s.context}>{question.context}</p>
        <h2 id="english-use-prompt">{question.prompt}</h2>
        <div className={s.choices}>{question.choices.map((choice, index) => <button key={choice.id} data-use-choice={choice.id} data-selected={selected === choice.id} data-correct={selected === choice.id && feedback?.ok} disabled={feedback?.ok} aria-pressed={selected === choice.id} onClick={() => answer(choice.id)}><span aria-hidden="true">{String.fromCharCode(65 + index)}</span><span>{choice.text}</span>{selected === choice.id && feedback?.ok && <Check size={18} aria-hidden="true"/>}</button>)}</div>
      </section>
    </div>
    {feedback && <div ref={feedbackPanel} className={s.feedback} data-use-meaning data-correct={feedback.ok} role="status"><Image src="/orbi-tech.png" width={60} height={72} alt=""/><div><strong>{feedback.ok ? "Essa escolha combina com a situação." : "Vamos ligar o inglês à situação."}</strong><p>{feedback.message}</p>{!feedback.ok && <p className={s.retry}>Use essa pista e tente outra opção.</p>}</div></div>}
    {feedback?.ok && allDone && <div className={s.finished} data-use-finished><strong>Você praticou as 12 situações.</strong><p>Em cada uma, encontrou uma opção que combina com o inglês. Voltar depois e tentar sem o modelo é outro passo.</p></div>}
    <div className={s.actions}><button data-use-next disabled={!feedback?.ok} onClick={onNext}>{allDone && feedback?.ok ? "Voltar à prática" : "Próximo item"}<ArrowRight size={17}/></button><span>Aqui você pratica o significado. Sua pronúncia não está sendo avaliada.</span></div>
  </div>;
}
