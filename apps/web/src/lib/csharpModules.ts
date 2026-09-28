import { csharpPilot, csharpProgressKey, readVariablesProgress, variableActivities, variablesKey } from "./csharpVariables";
import { conditionsActivities, conditionsKey, conditionsPilot, readConditionsProgress } from "./csharpConditions";
import { loopsActivities, loopsKey, loopsPilot, readLoopsProgress } from "./csharpLoops";

export type CSharpModuleKind = "variables" | "conditions" | "loops";
export function readModuleKind(value: string | null): CSharpModuleKind {
  return value === "conditions" || value === "loops" ? value : "variables";
}
export const csharpModules = {
  variables: {
    label: "Variáveis", tab: "01 · Variáveis", stage: 0, section: "FUNDAMENTOS", activities: variableActivities, pilot: csharpPilot, key: variablesKey,
    restore: readVariablesProgress,
    upcoming: "Condições → laços (disponíveis) → métodos (em preparação). Depois: objetos, dados, APIs, testes e entrega.",
    completion: "Você praticou texto, números, reatribuição, cálculo e leitura de erros. Agora pode continuar com condições e fazer seu programa tomar decisões.", next: "conditions" as CSharpModuleKind,
  },
  conditions: {
    label: "Condições", tab: "02.1 · Condições", stage: 1, section: "REGRAS DE NEGÓCIO / PARTE 1", activities: conditionsActivities, pilot: conditionsPilot, key: conditionsKey,
    restore: readConditionsProgress,
    upcoming: "Laços (disponível) → métodos (em preparação). Depois: objetos, dados, APIs, testes e entrega.",
    completion: "Você combinou comparações, if/else, condições lógicas e variáveis. Agora use essas decisões dentro de repetições para tratar vários serviços.", next: "loops" as CSharpModuleKind,
  },
  loops: {
    label: "Laços", tab: "02.2 · Laços", stage: 1, section: "REGRAS DE NEGÓCIO / PARTE 2", activities: loopsActivities, pilot: loopsPilot, key: loopsKey,
    restore: readLoopsProgress,
    upcoming: "Métodos (em preparação): dar nomes às tarefas e reutilizar as regras. Depois: objetos, dados, APIs, testes e entrega.",
    completion: "Você combinou variáveis, decisões e repetições; contou, acumulou e testou filas vazias. Antes de seguir, tente explicar por que cada laço termina. A próxima parte será métodos, ainda em preparação.", next: null,
  },
};
export { csharpProgressKey };
