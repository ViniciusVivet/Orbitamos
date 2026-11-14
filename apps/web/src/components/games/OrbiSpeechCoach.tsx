import Image from "next/image";
import s from "./OrbiSpeechCoach.module.css";

/** Motion follows actual synthesis start/end events, not a timer or microphone. */
export default function OrbiSpeechCoach({ speaking, waiting, children }: { speaking: boolean; waiting: boolean; children: React.ReactNode }) {
  return <div className={s.coach} data-orbi-coach data-speaking={speaking} data-waiting={waiting}>
    <div className={s.avatar} aria-hidden="true">
      <Image src="/orbi-tech.png" alt="" width={218} height={291} sizes="(max-width: 540px) 100px, 218px"/>
      <span className={s.mouth}/>
      <span className={s.shadow}/>
    </div>
    <div className={s.bubble}><span className={s.name}>ORBI <span>{speaking ? "falando" : waiting ? "sua vez" : "com você"}</span></span><p role="status" aria-live="polite">{children}</p><span className={s.wave} aria-hidden="true"><i/><i/><i/><i/><i/></span></div>
  </div>;
}
