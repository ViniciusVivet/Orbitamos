/**
 * Author-written reading aids for Brazilian beginners, informed by US dictionary
 * pronunciations. These are approximate Portuguese spellings, never IPA,
 * translations, accepted written answers, or text to send to speech synthesis.
 * Capitals mark the stronger syllable inside a multi-syllable word.
 */
export type EnglishPronunciation = {
  readonly text: string;
  readonly guide: string;
  readonly chunks: readonly { readonly en: string; readonly pt: string }[];
  readonly tip: string;
};

function word(text: string, guide: string, tip: string): EnglishPronunciation {
  return { text, guide, chunks: [{ en: text, pt: guide }], tip };
}

function phrase(
  text: string,
  chunks: EnglishPronunciation["chunks"],
  tip: string,
): EnglishPronunciation {
  return { text, guide: chunks.map(chunk => chunk.pt).join(" "), chunks, tip };
}

const thTip = "O “d” é só uma pista: no th de the, encoste de leve a ponta da língua entre os dentes e deixe a voz vibrar. Ouça o modelo.";
const finalTip = "Termine na consoante, sem acrescentar um “i” ou “ê” depois dela. O áudio ajuda a ajustar o som.";

export const englishPronunciations: readonly EnglishPronunciation[] = [
  word("file", "fáil", "Faça “ái” em um só movimento. Termine com a língua formando o l, sem acrescentar outra vogal."),
  word("folder", "FÔUL-der", "A primeira parte é mais forte. Mantenha o l antes do d; o r americano é suave, sem vibrar a língua."),
  word("code", "côud", finalTip),
  word("save", "sêiv", "Deslize de “ê” para “i” e termine no v, com o lábio inferior perto dos dentes. Não acrescente “ê”."),
  word("run", "rân", "O “â” aproxima uma vogal curta, sem nasalizar. O r americano não é o r forte de “rua”; ouça e imite."),
  word("error", "É-rer", "Dê mais força ao começo. Os sons de r americanos não vibram como o r de “caro” nem têm o som de “rr”."),
  word("button", "BÂ-tan", "A primeira parte é mais forte e a segunda é curta e fraca. O t pode soar bem discreto no áudio americano."),
  word("server", "SÂR-ver", "O começo é mais forte. A vogal e o r americano se juntam; “âr” é apenas uma aproximação desse som."),
  word("return", "ri-TÂRN", "Dê mais força à segunda parte. O r americano não vibra; termine no n, sem acrescentar “i”."),
  word("output", "ÁUT-put", "A primeira parte é mais forte. O “u” da segunda é curto e relaxado; termine no t, sem acrescentar “i”."),
  word("found", "fáund", "Deslize de “a” para “u” e preserve o final nd. Não transforme o final em “dji”."),
  word("saved", "sêivd", "O final ed tem som de d aqui. Ele se junta ao v; não vira uma sílaba “éd” ou “dji”."),
  word("open", "ÔU-pan", "A primeira parte é mais forte. A vogal da segunda é fraca e curta, sem nasalizar o começo."),
  word("fix", "fíks", "Faça um i curto e termine em ks. Não acrescente “i” depois do s."),
  word("test", "tést", finalTip),
  word("passed", "pást", "No modelo americano, o a fica entre um “á” e um “é”, com a boca aberta. O final ed soa como t, sem outra sílaba."),
  word("build", "bíld", "O i é curto. Preserve o l antes do d e não acrescente “i” ao final."),
  word("failed", "fêild", "O final ed tem som de d e não cria outra sílaba. Faça o l antes de terminar no d."),
  word("click", "clík", finalTip),
  word("not", "nát", "Esta pista segue uma pronúncia americana. Termine no t sem acrescentar “i”; outras variedades podem soar diferentes."),
  word("the", "dâ / di", `${thTip} A vogal costuma ser mais fraca antes de consoante e soar como “i” antes de vogal.`),
  phrase("Open the file", [
    { en: "Open", pt: "ÔU-pan" }, { en: "the", pt: "dâ" }, { en: "file", pt: "fáil" },
  ], thTip),
  phrase("Save the file", [
    { en: "Save", pt: "sêiv" }, { en: "the", pt: "dâ" }, { en: "file", pt: "fáil" },
  ], thTip),
  phrase("Run the code", [
    { en: "Run", pt: "rân" }, { en: "the", pt: "dâ" }, { en: "code", pt: "côud" },
  ], thTip),
  phrase("Fix the error", [
    { en: "Fix", pt: "fíks" }, { en: "the", pt: "di" }, { en: "error", pt: "É-rer" },
  ], `${thTip} Aqui o the vem antes de uma vogal; o apoio usa “di”.`),
  phrase("The test passed", [
    { en: "The", pt: "dâ" }, { en: "test", pt: "tést" }, { en: "passed", pt: "pást" },
  ], `${thTip} Em passed, abra a boca entre “á” e “é”; o final ed soa como t.`),
  phrase("The build failed", [
    { en: "The", pt: "dâ" }, { en: "build", pt: "bíld" }, { en: "failed", pt: "fêild" },
  ], `${thTip} Em failed, o final ed soa como d, sem criar outra sílaba.`),
  phrase("Open the folder", [
    { en: "Open", pt: "ÔU-pan" }, { en: "the", pt: "dâ" }, { en: "folder", pt: "FÔUL-der" },
  ], thTip),
  phrase("Click the Save button", [
    { en: "Click", pt: "clík" }, { en: "the", pt: "dâ" }, { en: "Save", pt: "sêiv" }, { en: "button", pt: "BÂ-tan" },
  ], thTip),
  phrase("File not found", [
    { en: "File", pt: "fáil" }, { en: "not", pt: "nát" }, { en: "found", pt: "fáund" },
  ], "Apoio com referência americana. Em found, faça “au” em um movimento e termine em nd, sem acrescentar “i”."),
  phrase("Not found", [
    { en: "Not", pt: "nát" }, { en: "found", pt: "fáund" },
  ], "Apoio com referência americana. O final de found mantém n e d; não acrescente uma vogal depois."),
];

function pronunciationKey(text: string): string {
  return text.normalize("NFKC").trim().replace(/[.!?]+$/u, "").trim().replace(/\s+/gu, " ").toLowerCase();
}

const pronunciationByText = new Map(englishPronunciations.map(item => [pronunciationKey(item.text), item]));

/** Unknown expressions require authored content; do not invent an English fallback. */
export function getEnglishPronunciation(text: string): EnglishPronunciation | undefined {
  return pronunciationByText.get(pronunciationKey(text));
}
