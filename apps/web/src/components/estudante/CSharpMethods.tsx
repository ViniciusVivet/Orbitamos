"use client";

import { answerCSharpMethodsPrediction, clearCSharpMethodsRun, csharpMethodsActivities, csharpMethodsFlow, csharpMethodsKey, csharpMethodsUnit, declareCSharpMethodsRun, exportCSharpMethodsDraft, importCSharpMethodsDraft, markCSharpMethodsModel, newCSharpMethodsProgress, readCSharpMethodsProgress, resetCSharpMethodsDraft, revealCSharpMethodsHint, setCSharpMethodsDraft, setCSharpMethodsPreparation, CSHARP_METHODS_MAX_FILE_BYTES, type CSharpMethodsProgress } from "@/lib/csharpMethods";
import type { CSharpProjectModel } from "@/lib/csharpProjectUnit";
import CSharpProjectUnit from "./CSharpProjectUnit";
import s from "./CSharpProjectUnit.module.css";

const model: CSharpProjectModel<CSharpMethodsProgress> = {
  maxFileBytes: CSHARP_METHODS_MAX_FILE_BYTES, key: csharpMethodsKey, initial: newCSharpMethodsProgress, read: readCSharpMethodsProgress,
  prepare: setCSharpMethodsPreparation, edit: setCSharpMethodsDraft, reset: resetCSharpMethodsDraft, hint: revealCSharpMethodsHint, model: markCSharpMethodsModel,
  predict: answerCSharpMethodsPrediction, declare: declareCSharpMethodsRun, clear: clearCSharpMethodsRun, export: exportCSharpMethodsDraft, import: importCSharpMethodsDraft,
};
const presentation = {
  kind: "methods" as const, topic: "MÉTODOS", kicker: "ORBI SERVIÇOS / DO CÁLCULO À REGRA",
  headline: ["Uma regra.", "Vários clientes."] as const, caption: ["Um pedido real.", "Uma regra sua."] as const,
  description: "Calcule o que falta entregar. Depois reutilize sua regra, encontre um bug e resolva um pedido novo.",
  referenceLabel: "Ver exemplo e caminho do valor", nextDescription: "Continue no mesmo projeto: represente cada serviço com seus dados e trabalhe com uma lista de fichas.",
};
function Reference() {
  return <><div className={s.flow} aria-label="Caminho dos valores no exemplo"><span>{csharpMethodsFlow.call}</span><span>8 → total · 3 → concluidos</span><span>return total - concluidos → 5</span><span>pendentes → Console.WriteLine</span></div><p>{csharpMethodsFlow.note}</p></>;
}
export default function CSharpMethods({ userId, onFullMap, onNextUnit }: { userId: string | number | null; onFullMap: () => void; onNextUnit?: () => void }) {
  return <CSharpProjectUnit userId={userId} onFullMap={onFullMap} onNextUnit={onNextUnit} definition={csharpMethodsUnit} activities={csharpMethodsActivities} model={model} presentation={presentation} renderReference={Reference}/>;
}