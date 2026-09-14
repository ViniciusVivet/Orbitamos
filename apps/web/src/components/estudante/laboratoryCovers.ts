import fundamentos from "../../../public/images/laboratorio/fundamentos-v1.png";
import calculos from "../../../public/images/laboratorio/calculos-v1.png";
import decisoes from "../../../public/images/laboratorio/decisoes-v1.png";
import repeticao from "../../../public/images/laboratorio/repeticao-v1.png";
import dados from "../../../public/images/laboratorio/dados-v1.png";
import funcoes from "../../../public/images/laboratorio/funcoes-v1.png";

export const laboratoryCovers = {
  fundamentos: { image: fundamentos, position: "50% 44%" },
  calculos: { image: calculos, position: "50% 48%" },
  decisoes: { image: decisoes, position: "50% 50%" },
  repeticao: { image: repeticao, position: "50% 50%" },
  dados: { image: dados, position: "50% 45%" },
  funcoes: { image: funcoes, position: "50% 48%" },
} as const;

type CoverKey = keyof typeof laboratoryCovers;
const categoryCovers: Record<string, CoverKey> = {
  Fundamentos: "fundamentos",
  Operadores: "calculos",
  Condicionais: "decisoes",
  Validação: "decisoes",
  Erros: "decisoes",
  Laços: "repeticao",
  Comprehensions: "repeticao",
  Objetos: "dados",
  Strings: "dados",
  "Métodos de array": "dados",
  Listas: "dados",
  Dicionários: "dados",
  Classes: "dados",
  Coleções: "dados",
  Tuplas: "dados",
  Conjuntos: "dados",
  Funções: "funcoes",
  Algoritmos: "funcoes",
  Assíncrono: "funcoes",
};

// Stable by subject: filtering or reordering must never change a challenge's cover.
// These generated editorial photos are illustrative, not photos of enrolled students.
export function getLaboratoryCover(category?: string) {
  const key = categoryCovers[category ?? ""] ?? "fundamentos";
  return { key, ...laboratoryCovers[key] };
}
