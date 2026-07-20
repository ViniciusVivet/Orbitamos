/**
 * Guia o Orbi — jogo de lógica visual estilo Lightbot.
 * O aluno monta uma sequência de comandos e vê o mascote Orbi
 * percorrer o tabuleiro espacial até o portal.
 *
 * Direções: 0 = cima, 1 = direita, 2 = baixo, 3 = esquerda.
 * A partir do nível com `slotsFuncao`, existe a Função F: um
 * subprograma reutilizável que a trilha principal pode chamar
 * (inclusive a própria F, ensinando repetição por recursão —
 * o limite de passos encerra execuções sem fim).
 */

export type OrbiDir = 0 | 1 | 2 | 3;
export type OrbiCmd = "avancar" | "esquerda" | "direita" | "funcao";
export type OrbiTrack = "principal" | "funcao";

export type NivelGuiaOrbi = {
  slug: string;
  titulo: string;
  descricao: string;
  dica: string;
  explicacao: string;
  cols: number;
  rows: number;
  inicio: { x: number; y: number; dir: OrbiDir };
  portal: { x: number; y: number };
  asteroides: Array<{ x: number; y: number }>;
  slotsPrincipal: number;
  /** Presença habilita a Função F no nível */
  slotsFuncao?: number;
  /** Total de comandos para ganhar 3 estrelas */
  par: number;
};

export type OrbiFrame = {
  x: number;
  y: number;
  dir: OrbiDir;
  track: OrbiTrack | null;
  index: number | null;
  evento: "inicio" | "passo" | "giro" | "crash" | "portal" | "limite";
};

export type OrbiResultado = "portal" | "crash" | "perdido" | "limite";

const MAX_PASSOS = 60;

export function executarPrograma(
  nivel: NivelGuiaOrbi,
  principal: OrbiCmd[],
  funcao: OrbiCmd[]
): { frames: OrbiFrame[]; resultado: OrbiResultado } {
  const frames: OrbiFrame[] = [];
  const estado = { ...nivel.inicio };
  let passos = 0;
  let resultado: OrbiResultado | null = null;

  const temAsteroide = (x: number, y: number) =>
    nivel.asteroides.some((a) => a.x === x && a.y === y);

  frames.push({ ...estado, track: null, index: null, evento: "inicio" });

  const rodar = (comandos: OrbiCmd[], track: OrbiTrack) => {
    for (let index = 0; index < comandos.length; index += 1) {
      if (resultado) return;
      if (passos >= MAX_PASSOS) {
        resultado = "limite";
        frames.push({ ...estado, track, index, evento: "limite" });
        return;
      }
      passos += 1;
      const cmd = comandos[index];

      if (cmd === "funcao") {
        rodar(funcao, "funcao");
        continue;
      }
      if (cmd === "esquerda" || cmd === "direita") {
        estado.dir = ((estado.dir + (cmd === "esquerda" ? 3 : 1)) % 4) as OrbiDir;
        frames.push({ ...estado, track, index, evento: "giro" });
        continue;
      }
      // avancar
      const nx = estado.x + (estado.dir === 1 ? 1 : estado.dir === 3 ? -1 : 0);
      const ny = estado.y + (estado.dir === 2 ? 1 : estado.dir === 0 ? -1 : 0);
      const foraDoMapa = nx < 0 || ny < 0 || nx >= nivel.cols || ny >= nivel.rows;
      if (foraDoMapa || temAsteroide(nx, ny)) {
        resultado = "crash";
        frames.push({ ...estado, track, index, evento: "crash" });
        return;
      }
      estado.x = nx;
      estado.y = ny;
      if (nx === nivel.portal.x && ny === nivel.portal.y) {
        resultado = "portal";
        frames.push({ ...estado, track, index, evento: "portal" });
        return;
      }
      frames.push({ ...estado, track, index, evento: "passo" });
    }
  };

  rodar(principal, "principal");
  return { frames, resultado: resultado ?? "perdido" };
}

export function calcularEstrelas(nivel: NivelGuiaOrbi, comandosUsados: number): 1 | 2 | 3 {
  if (comandosUsados <= nivel.par) return 3;
  if (comandosUsados <= nivel.par + 2) return 2;
  return 1;
}

export const niveisGuiaOrbi: NivelGuiaOrbi[] = [
  {
    slug: "decolagem",
    titulo: "Decolagem",
    descricao: "Leve o Orbi até o portal. Ele só anda para onde está olhando!",
    dica: "O Orbi está olhando para a direita e o portal está 3 casas à frente. Quantos 'avançar' você precisa?",
    explicacao: "Um programa é uma sequência: o computador executa um comando por vez, na ordem exata que você montou. Três 'avançar' seguidos levam o Orbi três casas adiante.",
    cols: 5,
    rows: 5,
    inicio: { x: 0, y: 2, dir: 1 },
    portal: { x: 3, y: 2 },
    asteroides: [{ x: 1, y: 0 }, { x: 4, y: 4 }],
    slotsPrincipal: 4,
    par: 3,
  },
  {
    slug: "primeira-curva",
    titulo: "Primeira Curva",
    descricao: "O portal está em outra linha. O Orbi vai precisar girar no caminho.",
    dica: "Avance até ficar embaixo do portal, gire para a esquerda (ele passa a olhar para cima) e avance de novo.",
    explicacao: "Girar não move o Orbi — só muda para onde ele olha. Todo robô (e todo programa) precisa dessa diferença entre 'mudar de direção' e 'andar'.",
    cols: 5,
    rows: 5,
    inicio: { x: 0, y: 3, dir: 1 },
    portal: { x: 3, y: 1 },
    asteroides: [{ x: 1, y: 1 }, { x: 4, y: 3 }],
    slotsPrincipal: 7,
    par: 6,
  },
  {
    slug: "desvio-de-asteroide",
    titulo: "Desvio de Asteroide",
    descricao: "Tem um asteroide no caminho direto. Contorne por cima!",
    dica: "Suba uma casa antes do asteroide, passe por cima dele e desça de volta para a linha do portal.",
    explicacao: "Quando o caminho óbvio está bloqueado, o algoritmo precisa de um desvio planejado. Você acabou de fazer o que apps de GPS fazem o dia todo: recalcular a rota.",
    cols: 5,
    rows: 5,
    inicio: { x: 0, y: 2, dir: 1 },
    portal: { x: 4, y: 2 },
    asteroides: [{ x: 2, y: 2 }, { x: 2, y: 3 }],
    slotsPrincipal: 12,
    par: 10,
  },
  {
    slug: "corredor-zigue-zague",
    titulo: "Corredor Zigue-Zague",
    descricao: "Um campo de asteroides! Só dá para passar subindo em zigue-zague.",
    dica: "O padrão se repete: avança, gira para a esquerda, avança, gira para a direita... Perceba a repetição — ela vai ser útil em breve.",
    explicacao: "Você repetiu o mesmo padrão de comandos várias vezes. Cansativo, né? Programadores odeiam repetição — e no próximo nível você vai conhecer a ferramenta que resolve isso.",
    cols: 5,
    rows: 5,
    inicio: { x: 0, y: 4, dir: 1 },
    portal: { x: 4, y: 0 },
    asteroides: [{ x: 2, y: 4 }, { x: 3, y: 3 }, { x: 4, y: 2 }, { x: 1, y: 2 }, { x: 0, y: 1 }],
    slotsPrincipal: 16,
    par: 15,
  },
  {
    slug: "beco-do-cometa",
    titulo: "Beco do Cometa",
    descricao: "O Orbi está encurralado olhando para cima. O portal ficou para trás!",
    dica: "Dois giros para o mesmo lado fazem o Orbi dar meia-volta.",
    explicacao: "Meia-volta = girar 90° duas vezes. Decompor um movimento grande em passos pequenos é o coração do pensamento computacional.",
    cols: 5,
    rows: 5,
    inicio: { x: 2, y: 2, dir: 0 },
    portal: { x: 2, y: 4 },
    asteroides: [{ x: 2, y: 1 }, { x: 1, y: 2 }, { x: 3, y: 2 }],
    slotsPrincipal: 5,
    par: 4,
  },
  {
    slug: "funcao-f",
    titulo: "A Função F",
    descricao: "Agora só cabem 2 comandos no programa principal! Use a Função F para guardar um trecho e reaproveitar.",
    dica: "Guarde 'avançar, avançar' dentro da Função F. No programa principal, chame F duas vezes.",
    explicacao: "Isso é uma função: um bloco de código com nome que você escreve uma vez e usa quantas vezes quiser. É o conceito mais importante da programação — e você acabou de usar um.",
    cols: 5,
    rows: 5,
    inicio: { x: 0, y: 2, dir: 1 },
    portal: { x: 4, y: 2 },
    asteroides: [{ x: 1, y: 0 }, { x: 3, y: 4 }],
    slotsPrincipal: 2,
    slotsFuncao: 2,
    par: 4,
  },
  {
    slug: "escada-de-f",
    titulo: "Escada de F",
    descricao: "Aquele zigue-zague cansativo? Com a Função F ele vira um programa curtinho.",
    dica: "O degrau é: avançar, girar à esquerda, avançar, girar à direita. Guarde isso em F e chame F três vezes.",
    explicacao: "Compare com o Corredor Zigue-Zague: lá foram 15 comandos, aqui só 7. Encontrar o padrão que se repete e extrair para uma função é o que separa código iniciante de código profissional.",
    cols: 5,
    rows: 5,
    inicio: { x: 0, y: 4, dir: 1 },
    portal: { x: 3, y: 1 },
    asteroides: [{ x: 2, y: 4 }, { x: 3, y: 3 }, { x: 4, y: 2 }],
    slotsPrincipal: 3,
    slotsFuncao: 4,
    par: 7,
  },
  {
    slug: "orbita-infinita",
    titulo: "Órbita Infinita",
    descricao: "Um único comando no programa principal?! Existe um truque: F pode chamar a si mesma...",
    dica: "Dentro de F, coloque 'avançar' e depois... chame F de novo! O Orbi repete para sempre — até chegar ao portal.",
    explicacao: "F chamando F é recursão: o programa se repete sozinho até uma condição de parada (aqui, o portal). É assim que nascem os loops — e você zerou o jogo entendendo um dos conceitos mais avançados da programação!",
    cols: 5,
    rows: 5,
    inicio: { x: 0, y: 2, dir: 1 },
    portal: { x: 4, y: 2 },
    asteroides: [{ x: 2, y: 0 }, { x: 2, y: 4 }],
    slotsPrincipal: 1,
    slotsFuncao: 2,
    par: 3,
  },
];

export function getNivelGuiaOrbi(slug: string): NivelGuiaOrbi | undefined {
  return niveisGuiaOrbi.find((nivel) => nivel.slug === slug);
}

export function getProximoNivel(slug: string): NivelGuiaOrbi | undefined {
  const index = niveisGuiaOrbi.findIndex((nivel) => nivel.slug === slug);
  if (index < 0) return undefined;
  return niveisGuiaOrbi[index + 1];
}

const ORBI_STORAGE_PREFIX = "orbitamos-jogo-orbi";

export type NivelProgresso = {
  concluido: boolean;
  estrelas: 0 | 1 | 2 | 3;
  tentativas: number;
};

export function lerProgressoNivel(userId: string | undefined, slug: string): NivelProgresso {
  if (typeof window === "undefined") return { concluido: false, estrelas: 0, tentativas: 0 };
  try {
    const raw = localStorage.getItem(`${ORBI_STORAGE_PREFIX}-${userId ?? "anon"}-${slug}`);
    if (!raw) return { concluido: false, estrelas: 0, tentativas: 0 };
    const parsed = JSON.parse(raw) as Partial<NivelProgresso>;
    const estrelas = [0, 1, 2, 3].includes(parsed.estrelas ?? -1) ? (parsed.estrelas as 0 | 1 | 2 | 3) : 0;
    return {
      concluido: Boolean(parsed.concluido),
      estrelas,
      tentativas: typeof parsed.tentativas === "number" ? parsed.tentativas : 0,
    };
  } catch {
    return { concluido: false, estrelas: 0, tentativas: 0 };
  }
}

export function salvarProgressoNivel(userId: string | undefined, slug: string, progresso: NivelProgresso) {
  try {
    localStorage.setItem(`${ORBI_STORAGE_PREFIX}-${userId ?? "anon"}-${slug}`, JSON.stringify(progresso));
  } catch {
    // storage indisponível — o jogo segue sem persistir
  }
}
