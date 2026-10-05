import { buddies, type Buddy } from "@/lib/vilaDosBlocos";
import s from "./VillageGame.module.css";

/** Code-native characters: their actual symbols remain crisp and readable at any size. */
export function VillageCharacter({ who, happy = false }: { who: Buddy; happy?: boolean }) {
  const b = buddies[who];
  if (who === "parenteses") return <svg className={s.character} viewBox="0 0 160 150" aria-hidden="true" data-happy={happy}>
    <ellipse cx="80" cy="137" rx="58" ry="7" fill="#182f4720"/>
    {[24, 88].map((x, i) => <g key={x} className={s.creature}>
      <path d={`M${x + 14} 116v15m25-15v15`} stroke="#24364b" strokeWidth="7" strokeLinecap="round"/>
      <path d={`M${x} 78l-8 14m62-14 8 14`} stroke="#ffd580" strokeWidth="8" strokeLinecap="round"/>
      <rect x={x} y={43 - i * 9} width="52" height={78 + i * 9} rx="24" fill={i ? "#f7c06b" : "#ffe19b"} stroke="#24364b" strokeWidth="3"/>
      <circle cx={x + 17} cy="69" r="3" fill="#24364b"/><circle cx={x + 36} cy="69" r="3" fill="#24364b"/>
      <path d={`M${x + 20} 79q6 7 12 0`} fill="none" stroke="#24364b" strokeWidth="2" strokeLinecap="round"/>
      <text x={x + 27} y="110" textAnchor="middle" fontSize="30" fontFamily="monospace" fontWeight="bold" fill="#24364b">{i ? ")" : "("}</text>
    </g>)}
  </svg>;
  return <svg className={s.character} viewBox="0 0 160 150" aria-hidden="true" data-happy={happy}>
    <ellipse cx="80" cy="136" rx="43" ry="8" fill="#182f4720"/>
    <g className={s.creature}>
      <path d="M50 113l-8 18m68-18 8 18" stroke="#24364b" strokeWidth="9" strokeLinecap="round"/>
      <path d="M35 74L18 88m107-14 17 14" stroke={b.color} strokeWidth="11" strokeLinecap="round"/>
      <rect x="33" y="28" width="94" height="92" rx={who === "colchetes" ? 16 : 39} fill={b.color} stroke="#24364b" strokeWidth="3"/>
      <path d="M57 29l8-14 9 13" fill={b.color} stroke="#24364b" strokeWidth="3" strokeLinejoin="round"/>
      {who === "chaves" && <path d="M46 43q3-28 34-28t34 28zm-5 0h78" fill="#f3ce8f" stroke="#24364b" strokeWidth="3" strokeLinecap="round"/>}
      {who === "colchetes" && <path d="M34 87h-9v26h17m73-26h12v26h-12" fill="#789dc6" stroke="#24364b" strokeWidth="3"/>}
      {who === "espacos" && <path d="M35 88q45 13 89 0v9q-44 13-89 0zm65 10v21h12v-22" fill="#6c98ae" stroke="#24364b" strokeWidth="2"/>}
      <ellipse cx="61" cy="66" rx="5" ry={happy ? 3 : 7} fill="#24364b"/>
      <ellipse cx="99" cy="66" rx="5" ry={happy ? 3 : 7} fill="#24364b"/>
      <ellipse cx="49" cy="78" rx="8" ry="4" fill="#ed8090" opacity=".55"/>
      <ellipse cx="111" cy="78" rx="8" ry="4" fill="#ed8090" opacity=".55"/>
      <path d="M72 79q8 9 16 0" fill="none" stroke="#24364b" strokeWidth="3" strokeLinecap="round"/>
      <text x="80" y="108" textAnchor="middle" fontSize="25" fontFamily="monospace" fontWeight="bold" fill="#24364b">{b.symbol}</text>
    </g>
  </svg>;
}

export function VillageScene({ lit, active, happy }: { lit: number; active: Buddy; happy: boolean }) {
  return <div className={s.scene} data-happy={happy}>
    <svg viewBox="0 0 820 320" className={s.landscape} aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <rect width="820" height="320" fill="#273e62"/>
      <circle cx="687" cy="65" r="33" fill="#ffdfa2"/><circle cx="700" cy="52" r="31" fill="#273e62"/>
      {[40, 125, 235, 327, 450, 545, 745, 790].map((x, i) => <path key={x} d={`M${x} ${30 + i % 3 * 24}v8m-4-4h8`} stroke="#ffdfa2" strokeWidth="2"/>)}
      <path d="M0 242L130 112 250 240 410 103 610 240 760 145 820 210V320H0" fill="#425c72"/>
      <path d="M0 270Q180 190 370 267T820 242V320H0" fill="#8aa9a0"/>
      <path d="M0 302Q230 232 440 288T820 280V320H0" fill="#b2c6a2"/>
      {[110, 360, 605].map((x, i) => <g key={x}>
        <rect x={x} y={164 + i % 2 * 14} width="98" height="91" rx="12" fill={i === 0 ? "#efd5b0" : i === 1 ? "#c6bada" : "#a8c9d3"} stroke="#24364b" strokeWidth="3"/>
        <path d={`M${x - 14} ${174 + i % 2 * 14}l63-55 63 55z`} fill={i === 0 ? "#cf8278" : i === 1 ? "#9b88b9" : "#769baa"} stroke="#24364b" strokeWidth="3" strokeLinejoin="round"/>
        <rect x={x + 34} y="216" width="30" height="39" rx="15" fill="#354864"/>
        <rect x={x + 12} y="190" width="20" height="21" rx="5" fill={lit > i * 3 ? "#ffe5a2" : "#435675"}/>
        <rect x={x + 67} y="190" width="20" height="21" rx="5" fill={lit > i * 3 ? "#ffe5a2" : "#435675"}/>
      </g>)}
      <path d="M70 112Q380 205 735 115" fill="none" stroke="#d8c3a4" strokeWidth="2"/>
      {Array.from({ length: 10 }, (_, i) => <circle key={i} cx={95 + i * 68} cy={122 + Math.sin(i / 9 * Math.PI) * 40} r={i < lit ? 7 : 5} fill={i < lit ? "#ffe195" : "#526581"}/>)}
    </svg>
    <div className={s.sceneLabel}>VILA DOS BLOCOS <span>{lit}/10 luzes recuperadas</span></div>
    <div className={s.sceneFriends}>{(Object.keys(buddies) as Buddy[]).map(who => <div key={who} data-active={active === who}><VillageCharacter who={who} happy={happy}/></div>)}</div>
    {happy && <div className={s.sparkles} aria-hidden="true">✦ · ✧ · ✦</div>}
  </div>;
}
