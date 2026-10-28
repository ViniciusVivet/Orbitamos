import loja from "../../../public/images/jogos/loja-orbi-v1.webp";
import entrega from "../../../public/images/jogos/entrega-orbi-v1.webp";
import ingles from "../../../public/images/jogos/ingles-em-cena-v1.webp";
import vila from "../../../public/images/jogos/vila-blocos-v1.webp";
import rota from "../../../public/images/jogos/guia-orbi-v1.webp";
import monte from "../../../public/images/jogos/monte-codigo-v1.webp";

// Captures of the actual experiences, cropped and encoded for the catalog.
// No generated mock gameplay: every cover shows what the student can open.
export const activityCovers = {
  sql: { image: loja, position: "50% 50%" },
  delivery: { image: entrega, position: "50% 70%" },
  english: { image: ingles, position: "50% 50%" },
  village: { image: vila, position: "50% 62%" },
  orbi: { image: rota, position: "50% 50%" },
  assembly: { image: monte, position: "50% 38%" },
} as const;
