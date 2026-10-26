import { describe, expect, it } from "vitest";
import { deliveryCanJump, deliveryMissions, initialDelivery, readDeliverySave, simulateDelivery, stepDelivery } from "./orbiDelivery";

describe("Entrega do Orbi: comportamento do cenário", () => {
  it("mantém o impulso e revela uma diferença real de alcance ao mudar velocidade", () => {
    expect(simulateDelivery(0, 150).status).toBe("fell");
    expect(simulateDelivery(0, 280).status).toBe("arrived");
    expect(simulateDelivery(0, 380).status).toBe("arrived");
  });
  it("colide com o terraço e só alcança a altura quando o impulso permite", () => {
    expect(simulateDelivery(1, 300).status).toBe("fell");
    expect(simulateDelivery(1, 540).status).toBe("arrived");
    expect(simulateDelivery(1, 680).status).toBe("arrived");
  });
  it("usa a condição escolhida, incluindo o limite exato e o gasto de energia", () => {
    expect(simulateDelivery(2, 0).status).toBe("blocked");
    expect(simulateDelivery(2, 2).status).toBe("blocked");
    expect(simulateDelivery(2, 1)).toMatchObject({ status: "arrived", energy: 0 });
    expect(deliveryCanJump(2, 1, 1)).toBe(false);
    expect(deliveryCanJump(2, 1, 2)).toBe(true);
    expect(deliveryCanJump(2, 1, 3)).toBe(true);
  });
  it("não move um cenário parado e não aceita um segundo pulo no ar", () => {
    const ready = initialDelivery();
    expect(stepDelivery(ready, { direction: 1, jump: true }, 0, 280, 1 / 120)).toEqual(ready);
    const jumping = stepDelivery({ ...ready, status: "running" }, { direction: 1, jump: true }, 0, 280, 1 / 120);
    const next = stepDelivery(jumping, { direction: 1, jump: true }, 0, 280, 1 / 120);
    expect(next.vy).toBeGreaterThan(jumping.vy);
    expect(next.grounded).toBe(false);
  });
  it("uma chegada só conta após pular e pousar, sem atravessar a face da plataforma", () => {
    const body = { ...initialDelivery(), x: 263, status: "running" as const };
    const result = stepDelivery(body, { direction: 1, jump: false }, 1, 300, 1 / 30);
    expect(result.x + 42).toBeLessThanOrEqual(305);
    expect(result.status).not.toBe("arrived");
  });
  it("restaura apenas missões consecutivas, sem liberar etapas por dados inválidos", () => {
    expect(readDeliverySave("{bad")).toEqual({ version: 1, current: 0, completed: [] });
    expect(readDeliverySave(JSON.stringify({ version: 1, current: 2, completed: [deliveryMissions[2].id] }))).toEqual({ version: 1, current: 0, completed: [] });
    expect(readDeliverySave(JSON.stringify({ version: 1, current: 99, completed: deliveryMissions.map(mission => mission.id) })).current).toBe(2);
  });
});
