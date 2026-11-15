// Public pages checked without an account. observedAt is the consultation date,
// not the publication date. A visible application link does not guarantee that
// an employer is still reviewing applications or that the listing is accurate.
export const csharpMarketCheckedAt = "15/11/2026";

export type CSharpJobSource = {
  company: string;
  title: string;
  kind: string;
  summary: string;
  url: string;
  level: "Estágio" | "Júnior" | "Pleno";
  observedAt: string;
  status: "application-link-visible";
};

// Exploratory examples, not a representative survey or a prediction for 2027.
// Closed listings and pages that could not be opened are excluded here.
export const csharpJobSources = [
  {
    company: "Spedy",
    title: "Estágio em Desenvolvimento de Software (.NET + React)",
    kind: "Estágio · aprender com o time",
    summary: "Pede matrícula ativa, lógica e código em alguma linguagem. A rotina inclui APIs, correções, testes e revisão com orientação; Docker e Git são diferenciais.",
    url: "https://br.linkedin.com/jobs/view/est%C3%A1gio-em-desenvolvimento-de-software-net-%2B-react-at-spedy-4488933575",
    level: "Estágio",
    observedAt: "2026-11-15",
    status: "application-link-visible",
  },
  {
    company: "Webmotors",
    title: "Desenvolvedor Back-end Jr | .NET",
    kind: "Júnior · produto existente",
    summary: "Lógica, C#/.NET e consultas SQL. Novas funcionalidades, manutenção e testes acontecem com apoio do time; o anúncio também menciona aprender cloud e monitoramento.",
    url: "https://br.linkedin.com/jobs/view/desenvolvedor-back-end-jr-net-at-webmotors-4486509551",
    level: "Júnior",
    observedAt: "2026-11-15",
    status: "application-link-visible",
  },
  {
    company: "Grupo Senff",
    title: "Desenvolvedor Junior",
    kind: "Júnior · IA com revisão",
    summary: "Rotina com .NET, REST/SOAP, SQL, bugs e documentação. Inclui usar IA para apoiar o trabalho e revisar o código gerado, identificando erros e riscos.",
    url: "https://br.linkedin.com/jobs/view/desenvolvedor-junior-at-grupo-senff-4489630231",
    level: "Júnior",
    observedAt: "2026-11-15",
    status: "application-link-visible",
  },
  {
    company: "Stefanini",
    title: "Desenvolvedor(a) .NET / Dynamics / Azure – Júnior",
    kind: "Júnior · especialização Microsoft",
    summary: "C#/.NET sob supervisão, com Dynamics 365, Power Apps e Azure. Essa combinação é específica da vaga; certificações Microsoft aparecem como diferenciais.",
    url: "https://stefanini.gupy.io/jobs/12861027",
    level: "Júnior",
    observedAt: "2026-11-15",
    status: "application-link-visible",
  },
  {
    company: "Stefanini",
    title: "Desenvolvedor(a) de Software Júnior | .NET, Python e JavaScript (Bahia)",
    kind: "Júnior · integrações e sustentação",
    summary: "Aceita uma das linguagens listadas e pede SQL, APIs REST, Git e Azure DevOps ou similar. Envolve requisitos, testes, documentação e correção de sistemas existentes.",
    url: "https://vagasstefanini.gupy.io/job/eyJqb2JJZCI6MTI2MDE0ODQsInNvdXJjZSI6Imd1cHlfcG9ydGFsIn0%3D",
    level: "Júnior",
    observedAt: "2026-11-15",
    status: "application-link-visible",
  },
  {
    company: "Bemobi",
    title: "Analista Desenvolvimento Pleno .NET",
    kind: "Pleno · contraste, não ponto de entrada",
    summary: "Pede experiência com APIs, testes e sistemas em produção. Acrescenta legado, CI/CD, cloud, observabilidade e IA com validação crítica: uma etapa posterior ao básico.",
    url: "https://bemobi.gupy.io/jobs/12775328?jobBoardSource=gupy_public_page",
    level: "Pleno",
    observedAt: "2026-11-15",
    status: "application-link-visible",
  },
] satisfies CSharpJobSource[];
