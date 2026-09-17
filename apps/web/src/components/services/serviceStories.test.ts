import { describe, expect, it } from "vitest";
import { servicos } from "@/data/servicos";
import { getProjetoBySlug } from "@/data/projetos";
import { serviceStories, serviceContactUrl } from "./serviceStories";

describe("páginas comerciais",()=>{
  it("cobre exatamente as seis ofertas canônicas",()=>{
    expect(Object.keys(serviceStories).sort()).toEqual(servicos.map(s=>s.slug).sort());
    expect(new Set(Object.values(serviceStories).map(s=>s.kind)).size).toBe(6);
  });
  it("mantém os preços aprovados",()=>{
    expect(servicos.map(s=>s.preco)).toEqual(["R$ 1.497","R$ 1.997","R$ 2.497","R$ 2.997","Sob orçamento","R$ 497/mês"]);
  });
  for(const service of servicos) it("entrega uma narrativa completa e prova verificável: "+service.slug,()=>{
    const story=serviceStories[service.slug];
    expect(story.features).toHaveLength(3);
    expect(story.measures).toHaveLength(3);
    expect(story.boundaries.length).toBeGreaterThanOrEqual(2);
    expect(getProjetoBySlug(story.leadProject)).toBeDefined();
    expect(service.relatedProjects).toContain(story.leadProject);
    expect(story.features.every(f=>f.nodes.length===3&&f.body.length>60)).toBe(true);
    const url=new URL(serviceContactUrl(service.nome,service.preco));
    expect(url.origin+url.pathname).toBe("https://wa.me/5511949138973");
    expect(url.searchParams.get("text")).toContain(service.nome);
    expect(url.searchParams.get("text")).toContain(service.preco);
    expect(url.searchParams.get("text")).not.toContain("quero contratar");
  });
});
