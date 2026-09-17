import { describe, expect, it } from "vitest";
import { adjacentTab, deliverySteps, engineeringLayers } from "./deliveryContent";
describe("Home delivery narrative", () => {
  it("keeps four canonical steps with explicit deliverables", () => {
    expect(deliverySteps.map(step=>step.id)).toEqual(["diagnostico","arquitetura","construcao","lancamento"]);
    for(const step of deliverySteps){expect(step.input).toBeTruthy();expect(step.output).toBeTruthy();expect(step.photo).toBeTruthy();}
  });
  it("covers product layers without presenting a live monitoring system", () => {
    expect(engineeringLayers.map(layer=>layer.id)).toEqual(["interface","acesso","dados","conexoes"]);
    expect(new Set(engineeringLayers.map(layer=>layer.number)).size).toBe(4);
  });
  it("supports arrow keys, wrapping, Home and End", () => {
    expect(adjacentTab("ArrowRight",3,4)).toBe(0);
    expect(adjacentTab("ArrowLeft",0,4)).toBe(3);
    expect(adjacentTab("ArrowDown",1,4)).toBe(2);
    expect(adjacentTab("ArrowUp",2,4)).toBe(1);
    expect(adjacentTab("Home",2,4)).toBe(0);
    expect(adjacentTab("End",1,4)).toBe(3);
    expect(adjacentTab("Tab",1,4)).toBeNull();
  });
});
