import estudo from "../../../public/images/orbitamos/estudo-v1.png";
import equipe from "../../../public/images/orbitamos/equipe-v1.png";
import mentoria from "../../../public/images/orbitamos/mentoria-v1.png";
import dados from "../../../public/images/orbitamos/dados-v1.png";
import hardware from "../../../public/images/orbitamos/hardware-v1.png";
import criacao from "../../../public/images/orbitamos/criacao-v1.png";

export const orbitamosPhotos = { estudo, equipe, mentoria, dados, hardware, criacao };
export type OrbitPhotoKind = keyof typeof orbitamosPhotos;

// Stable subject mapping: filtering/reordering must not change a course's cover.
const coursePhotos: Record<string, OrbitPhotoKind> = {
  "html-css-js": "criacao",
  "logica-programacao-python": "estudo",
  "csharp-fundamentos": "estudo",
  "sql-na-pratica": "dados",
  "github-colaborativo": "equipe",
  "excel-procv": "dados",
  "power-bi": "dados",
  "vba-excel": "dados",
  "montagem-manutencao": "hardware",
};
export function coursePhotoKind(slug: string): OrbitPhotoKind {
  return coursePhotos[slug] ?? "estudo";
}
