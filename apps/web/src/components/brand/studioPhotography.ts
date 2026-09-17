import lancamento from "../../../public/images/orbitamos/lancamento-v1.png";
import { orbitamosPhotos } from "./orbitamosPhotography";

export const studioPhotos = { ...orbitamosPhotos, lancamento };
export type StudioPhotoKind = keyof typeof studioPhotos;
const servicePhotos: Record<string, StudioPhotoKind> = {
  "presenca-profissional": "criacao",
  "vender-pela-internet": "lancamento",
  "organizar-a-empresa": "dados",
  "automatizar-e-integrar": "estudo",
  "projeto-especial": "equipe",
  "manutencao-e-evolucao": "lancamento",
};
export function servicePhotoKind(slug: string): StudioPhotoKind {
  return servicePhotos[slug] ?? "criacao";
}
