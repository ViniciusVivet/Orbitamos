export type DeliveryPlatform = { x: number; y: number; width: number };
export type DeliveryMission = {
  id: string; title: string; concept: string; story: string; instruction: string;
  options: { value: number; label: string; description: string }[];
  platforms: DeliveryPlatform[]; goal: { x: number; y: number }; launchX: number;
  question: string; answers: string[]; correctAnswer: number; explanation: string; hint: string;
};

export const deliveryMissions: DeliveryMission[] = [
  {
    id: "velocidade", title: "Uma ponte de ar", concept: "Variáveis · velocidade", story: "A ponte do correio sumiu. Orbi precisa atravessar o canal com a primeira encomenda.",
    instruction: "O pulo dura o mesmo tempo. Escolha uma velocidade e observe a distância que Orbi percorre no ar.",
    options: [{ value: 150, label: "150", description: "Passo tranquilo" }, { value: 280, label: "280", description: "Passo decidido" }, { value: 380, label: "380", description: "Passo rápido" }],
    platforms: [{ x: 0, y: 342, width: 265 }, { x: 470, y: 342, width: 490 }], goal: { x: 710, y: 342 }, launchX: 224,
    question: "Você mantém o mesmo pulo e aumenta a velocidade. O que muda?",
    answers: ["Orbi percorre mais distância na horizontal.", "A gravidade desaparece.", "Orbi passa a pular mais alto."], correctAnswer: 0,
    explanation: "A velocidade altera quanto x avança a cada instante. A altura depende do impulso e da gravidade, que continuaram iguais.",
    hint: "O canal tem 205 pixels. Uma velocidade pequena pode deixar Orbi cair antes de alcançar a outra margem. Experimente 280 ou 380.",
  },
  {
    id: "impulso", title: "Entrega no terraço", concept: "Variáveis · impulso", story: "A encomenda seguinte vai para a biblioteca, lá no terraço. Correr mais não resolve a altura.",
    instruction: "Agora a velocidade é fixa. Ajuste o impulso do pulo para alcançar a plataforma mais alta.",
    options: [{ value: 300, label: "300", description: "Pulo curto" }, { value: 540, label: "540", description: "Pulo alto" }, { value: 680, label: "680", description: "Pulo muito alto" }],
    platforms: [{ x: 0, y: 342, width: 280 }, { x: 305, y: 202, width: 655 }], goal: { x: 660, y: 202 }, launchX: 214,
    question: "Por que aumentar só a velocidade não resolve a entrega no terraço?",
    answers: ["Porque velocidade e impulso são sempre a mesma coisa.", "Porque o impulso do pulo controla a subida; a velocidade controla o avanço.", "Porque plataformas altas desativam as variáveis."], correctAnswer: 1,
    explanation: "Aqui, impulso muda a velocidade inicial para cima. A velocidade horizontal continua em 210. Uma variável pode mudar uma parte do comportamento sem mudar a outra.",
    hint: "O terraço está 140 pixels acima. Com impulso 300, Orbi sobe só 50 pixels. Um impulso de 540 já permite chegar.",
  },
  {
    id: "condicao", title: "A última bateria", concept: "Condicionais · maior ou igual", story: "Restam 2 unidades de energia e o pulo custa 2. A última entrega depende de uma condição bem escrita.",
    instruction: "Escolha a condição que permite pular quando existe energia suficiente, inclusive quando ela é exatamente 2.",
    options: [{ value: 0, label: "energia > 2", description: "Maior que 2" }, { value: 1, label: "energia >= 2", description: "Maior ou igual a 2" }, { value: 2, label: "energia === 0", description: "Igual a zero" }],
    platforms: [{ x: 0, y: 342, width: 265 }, { x: 470, y: 342, width: 490 }], goal: { x: 710, y: 342 }, launchX: 224,
    question: "Se a energia fosse 1, a condição energia >= 2 permitiria o pulo?",
    answers: ["Sim, porque 1 é um número positivo.", "Sim, porque >= aceita qualquer valor.", "Não. 1 é menor que o custo de 2."], correctAnswer: 2,
    explanation: "A condição compara o valor com o custo. Com 2, ela é verdadeira. Com 1, é falsa. O mesmo código toma decisões diferentes conforme o dado.",
    hint: "O símbolo > exclui o valor 2. O símbolo >= inclui 2. O gasto só acontece quando o pulo é permitido.",
  },
];

export const DELIVERY_WIDTH = 960;
export const DELIVERY_HEIGHT = 420;
export const ORBI_SIZE = 42;
export const DELIVERY_GRAVITY = 900;
export type DeliveryBody = { x: number; y: number; vx: number; vy: number; grounded: boolean; energy: number; time: number; status: "ready" | "running" | "arrived" | "fell" | "blocked"; jumped: boolean };
export type DeliveryInput = { direction: -1 | 0 | 1; jump: boolean };

export function initialDelivery(): DeliveryBody {
  return { x: 74, y: 342 - ORBI_SIZE, vx: 0, vy: 0, grounded: true, energy: 2, time: 0, status: "ready", jumped: false };
}

export function deliveryParameters(mission: number, value: number) {
  return { speed: mission === 0 ? value : mission === 1 ? 210 : 330, impulse: mission === 1 ? value : 430 };
}

export function deliveryCanJump(mission: number, value: number, energy: number) {
  if (mission !== 2) return true;
  return value === 0 ? energy > 2 : value === 1 ? energy >= 2 : energy === 0;
}

/** Deterministic fixed-step physics: rendering and assisted play use the same collisions. */
export function stepDelivery(body: DeliveryBody, input: DeliveryInput, missionIndex: number, value: number, seconds: number): DeliveryBody {
  if (body.status !== "running") return body;
  const dt = Math.min(Math.max(seconds, 0), 1 / 30);
  const mission = deliveryMissions[missionIndex];
  const params = deliveryParameters(missionIndex, value);
  const next = { ...body, vx: input.direction * params.speed, time: body.time + dt };
  if (input.jump && body.grounded) {
    if (!deliveryCanJump(missionIndex, value, body.energy)) return { ...next, vx: 0, status: "blocked" };
    next.vy = -params.impulse; next.grounded = false; next.jumped = true;
    if (missionIndex === 2) next.energy -= 2;
  }
  next.x = Math.max(0, Math.min(DELIVERY_WIDTH - ORBI_SIZE, next.x + next.vx * dt));
  const oldFeet = body.y + ORBI_SIZE;
  next.vy += DELIVERY_GRAVITY * dt;
  next.y += next.vy * dt;
  next.grounded = false;
  if (next.vy >= 0) {
    for (const platform of mission.platforms) {
      if (next.x + ORBI_SIZE - 7 > platform.x && next.x + 7 < platform.x + platform.width && oldFeet <= platform.y + 0.5 && next.y + ORBI_SIZE >= platform.y) {
        next.y = platform.y - ORBI_SIZE; next.vy = 0; next.grounded = true; break;
      }
    }
  }
  // Side collisions keep a low jump from travelling through the face of the terrace.
  for (const platform of mission.platforms) {
    if (next.y + ORBI_SIZE > platform.y + 2 && next.y < DELIVERY_HEIGHT) {
      if (body.x + ORBI_SIZE <= platform.x && next.x + ORBI_SIZE > platform.x) next.x = platform.x - ORBI_SIZE;
      if (body.x >= platform.x + platform.width && next.x < platform.x + platform.width) next.x = platform.x + platform.width;
    }
  }
  if (next.y > DELIVERY_HEIGHT + 60 || next.time > 18) return { ...next, vx: 0, status: "fell" };
  if (missionIndex === 1 && next.jumped && next.grounded && next.x < mission.platforms[1].x && next.time > 0.5) return { ...next, vx: 0, status: "fell" };
  if (next.grounded && next.jumped && next.x + ORBI_SIZE > mission.goal.x && Math.abs(next.y + ORBI_SIZE - mission.goal.y) < 2) return { ...next, vx: 0, status: "arrived" };
  return next;
}

export function assistedDeliveryInput(body: DeliveryBody, missionIndex: number): DeliveryInput {
  return { direction: 1, jump: !body.jumped && body.x >= deliveryMissions[missionIndex].launchX && body.grounded };
}

export function simulateDelivery(mission: number, value: number): DeliveryBody {
  let body: DeliveryBody = { ...initialDelivery(), status: "running" };
  for (let frame = 0; frame < 1200 && body.status === "running"; frame++) body = stepDelivery(body, assistedDeliveryInput(body, mission), mission, value, 1 / 120);
  return body;
}

export function deliveryCode(mission: number, value: number): string {
  if (mission === 0) return `const velocidade = ${value};\nx = x + velocidade * tempo;`;
  if (mission === 1) return `const impulso = ${value};\nvelocidadeY = -impulso;`;
  return `let energia = 2;\nif (${deliveryMissions[2].options.find(option => option.value === value)?.label ?? "energia > 2"}) {\n  pular();\n  energia = energia - 2;\n}`;
}

export type DeliverySave = { version: 1; current: number; completed: string[] };
export function readDeliverySave(raw: string | null): DeliverySave {
  const empty: DeliverySave = { version: 1, current: 0, completed: [] };
  if (!raw) return empty;
  try {
    const parsed = JSON.parse(raw);
    if (parsed.version !== 1 || !Array.isArray(parsed.completed) || !Number.isInteger(parsed.current)) return empty;
    const completed: string[] = [];
    for (const mission of deliveryMissions) { if (!parsed.completed.includes(mission.id)) break; completed.push(mission.id); }
    return { version: 1, completed, current: Math.max(0, Math.min(parsed.current, Math.min(completed.length, deliveryMissions.length - 1))) };
  } catch { return empty; }
}
export const deliveryStorageKey = (userId: string) => `orbitamos-delivery-v1-${userId}`;
