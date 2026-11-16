"use client";

import { useState } from "react";
import { answerCSharpObjectsPrediction, clearCSharpObjectsRun, csharpObjectsActivities, csharpObjectsKey, csharpObjectsUnit, declareCSharpObjectsRun, exportCSharpObjectsDraft, importCSharpObjectsDraft, markCSharpObjectsModel, newCSharpObjectsProgress, readCSharpObjectsProgress, resetCSharpObjectsDraft, revealCSharpObjectsHint, setCSharpObjectsDraft, setCSharpObjectsPreparation, CSHARP_OBJECTS_MAX_FILE_BYTES, type CSharpObjectsProgress } from "@/lib/csharpObjects";
import type { CSharpProjectActivity, CSharpProjectModel } from "@/lib/csharpProjectUnit";
import CSharpProjectUnit from "./CSharpProjectUnit";
import s from "./CSharpObjects.module.css";

const model: CSharpProjectModel<CSharpObjectsProgress> = {
  maxFileBytes: CSHARP_OBJECTS_MAX_FILE_BYTES, key: csharpObjectsKey, initial: newCSharpObjectsProgress, read: readCSharpObjectsProgress,
  prepare: setCSharpObjectsPreparation, edit: setCSharpObjectsDraft, reset: resetCSharpObjectsDraft, hint: revealCSharpObjectsHint, model: markCSharpObjectsModel,
  predict: answerCSharpObjectsPrediction, declare: declareCSharpObjectsRun, clear: clearCSharpObjectsRun, export: exportCSharpObjectsDraft, import: importCSharpObjectsDraft,
};
const presentation = {
  kind: "objects" as const, topic: "OBJETOS", kicker: "ORBI SERVIÇOS / DOS DADOS ÀS FICHAS",
  headline: ["Cada serviço.", "Uma ficha."] as const, caption: ["Uma ficha.", "Seus próprios dados."] as const,
  description: "Crie um serviço, separe as fichas, investigue uma cópia e organize a lista do dia.",
  referenceLabel: "Ver modelo completo de Servico.cs", nextDescription: "Você começou a usar objetos e List<Servico>. Encapsulação, entradas inválidas, interfaces e LINQ terão práticas próprias antes de avançarmos para banco e API.",
};
const parts = [
  { label: "Dados", code: "public string Cliente { get; set; }\npublic int Concluidos { get; set; }", text: "Uma propriedade guarda um dado da ficha. get permite ler; set permite alterar. public torna esse membro acessível ao código que usa a ficha. Aqui só usamos entradas válidas: esses setters ainda não impedem dados inválidos." },
  { label: "Construção", code: "public Servico(string cliente, int total, int concluidos, bool pago)\n{\n    Cliente = cliente;\n    Total = total;\n    Concluidos = concluidos;\n    Pago = pago;\n}", text: "O construtor tem o mesmo nome da classe e não declara tipo de retorno. Quando usamos new, ele recebe os argumentos e prepara a nova ficha. Cliente é a propriedade; cliente é a entrada recebida." },
  { label: "Regras", code: "public int CalcularPendentes()\n{\n    return Total - Concluidos;\n}", text: "A conta conhecida agora lê os dados desta instância. Os parênteses continuam sendo a chamada do método; return devolve o resultado. Uma ficha pode ter 8 pendências e outra ter zero, usando a mesma regra." },
  { label: "Uso", code: 'Servico servico = new Servico("Nina", 12, 4, true);\nConsole.WriteLine(servico.CalcularPendentes());', text: "Servico é o tipo; servico é a variável que aponta para uma instância. new cria essa instância. O ponto acessa algo dela: servico.Cliente lê um dado; servico.CalcularPendentes() chama sua regra." },
] as const;

function IdentityExample({ list }: { list: boolean }) {
  const [alias, setAlias] = useState(false);
  const [changed, setChanged] = useState(false);
  if (list) return <div className={s.identity} data-object-list-example>
    <span className={s.eyebrow}>EXEMPLO EXPLICADO / LISTA DO DIA</span>
    <div className={s.lanes}><div><strong>Entrada</strong><div className={s.chips}><span>#A Nina · 8 · pago</span><span>#B Leo · 0 · pago</span><span>#C Bia · 3 · não pago</span><span>#A Nina · novamente</span></div></div><span className={s.arrow} aria-hidden="true">↓</span><div><strong>Lista de liberados</strong><div className={s.chips}><span data-active>#A Nina</span><span data-active>#A Nina</span></div></div></div>
    <p>Outra lista, as mesmas fichas. Nina aparece duas vezes porque a entrada tem duas ocorrências. Filtrar aqui preserva a ordem e as repetições; não copia as fichas nem altera a entrada.</p><p className={s.note}>A lista original e a lista filtrada apontam para o mesmo objeto #A. Esse é um exemplo autoral; não executa seu rascunho.</p>
  </div>;
  return <div className={s.identity} data-object-identity-example>
    <span className={s.eyebrow}>EXEMPLO EXPLICADO / QUEM APONTA PARA QUEM?</span>
    <div className={s.switch} role="group" aria-label="Escolher relação entre fichas"><button aria-pressed={!alias} onClick={() => { setAlias(false); setChanged(false); }}>Nova instância</button><button aria-pressed={alias} onClick={() => { setAlias(true); setChanged(false); }}>Mesma instância</button></div>
    <div className={s.cards}><article><span>original → #A</span><strong>Nina</strong><p>8 serviços · <b>{alias && changed ? 5 : 3}</b> concluídos</p><small>{alias && changed ? 3 : 5} pendentes</small></article><article data-shared={alias}><span>copia → {alias ? "#A" : "#B"}</span><strong>Nina</strong><p>8 serviços · <b>{changed ? 5 : 3}</b> concluídos</p><small>{changed ? 3 : 5} pendentes</small></article></div>
    <div className={s.relation}>{alias ? <code>Servico copia = original;</code> : <span>Outro objeto (#B) com os mesmos valores iniciais.</span>}</div>
    <button className={s.change} disabled={changed} onClick={() => setChanged(true)}>Alterar copia.Concluidos para 5</button>
    <p role="status">{changed ? alias ? "As duas variáveis apontam para #A. A alteração aparece nas duas leituras; não houve cópia do objeto." : "#B mudou e #A manteve seu estado. São instâncias diferentes com dados próprios." : alias ? "Dois nomes, um só objeto. A atribuição copia a referência." : "Duas instâncias. Os dados começam iguais, mas podem mudar separadamente."}</p>
    <p className={s.note}>Visualização de um exemplo autoral. Estes botões não executam C# nem conferem o seu código.</p>
  </div>;
}
function Context({ activity, consult }: { activity: CSharpProjectActivity; consult: () => void }) {
  const [part, setPart] = useState(0);
  return <>
    <div className={s.fileFocus}><strong>Você escreve: {activity.fileName}</strong><span>{activity.id === "guided" ? "Program.cs já chama sua classe no pacote." : "Servico.cs já está fornecido no pacote. Seu foco agora é Program.cs."}</span></div>
    {activity.id === "guided" && <details className={s.lesson} onToggle={event => { if (event.currentTarget.open) consult(); }}><summary>Entender a ficha em quatro partes</summary><div className={s.switch} role="group" aria-label="Partes da classe Servico">{parts.map((item, i) => <button key={item.label} aria-pressed={part === i} onClick={() => setPart(i)}>{item.label}</button>)}</div><p>{parts[part].text}</p><pre><code>{parts[part].code}</code></pre></details>}
    <details className={s.lesson} onToggle={event => { if (event.currentTarget.open) consult(); }}><summary>{activity.id === "independent" ? "Entender lista nova e fichas existentes" : "Entender com duas fichas"}</summary><IdentityExample list={activity.id === "independent"}/></details>
    <details className={s.lesson}><summary>{activity.id === "guided" ? "Ver o Program.cs que usa sua classe" : "Consultar o Servico.cs já fornecido"}</summary><p>{activity.id === "guided" ? "Este arquivo já está no pacote. Sua tarefa é escrever a classe Servico no outro arquivo." : "Esse tipo faz parte da base desta tarefa. Ele não implementa a função pedida no Program.cs."}</p><pre><code>{activity.id === "guided" ? 'Servico servico = new Servico("Nina", 12, 4, true);\nConsole.WriteLine(servico.Cliente);\nConsole.WriteLine(servico.CalcularPendentes());\nConsole.WriteLine(servico.PodeIniciar());' : csharpObjectsActivities[0].reference}</code></pre></details>
  </>;
}
export default function CSharpObjects({ userId, onFullMap }: { userId: string | number | null; onFullMap: () => void }) {
  return <CSharpProjectUnit userId={userId} onFullMap={onFullMap} definition={csharpObjectsUnit} activities={csharpObjectsActivities} model={model} presentation={presentation} Context={Context}/>;
}
