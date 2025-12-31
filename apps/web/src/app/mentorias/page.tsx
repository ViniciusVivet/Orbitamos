import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function Mentorias() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orbit-black via-gray-900 to-orbit-black">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-8">
            <span className="gradient-text">Do Subemprego à T.I.</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Trilhas estruturadas para sua transformação profissional
          </p>
        </div>
      </section>

      {/* Programas */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-white mb-16">
            Nossos <span className="gradient-text">Programas</span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Mentoria Tech 9 Meses */}
            <Card className="bg-gray-900/50 border-orbit-electric/20 hover:border-orbit-electric/40 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-gradient-to-l from-orbit-electric to-transparent w-32 h-32 opacity-20"></div>
              <CardHeader>
                <CardTitle className="text-orbit-electric text-2xl">🚀 Mentoria Tech 9 Meses</CardTitle>
                <CardDescription className="text-gray-300">
                  Do zero ao primeiro trampo em T.I. em 9 meses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Duração:</span>
                    <span className="text-white font-bold">9 meses</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Nível:</span>
                    <span className="text-white font-bold">Iniciante</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Preço:</span>
                    <span className="text-orbit-electric font-bold">Gratuito</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Vagas:</span>
                    <span className="text-white font-bold">3</span>
                  </div>
                  
                  <div className="pt-4">
                    <h4 className="text-white font-bold mb-2">O que você vai aprender:</h4>
                    <ul className="text-gray-300 space-y-1 text-sm">
                      <li>• Lógica de programação</li>
                      <li>• HTML, CSS e JavaScript</li>
                      <li>• React e Node.js</li>
                      <li>• Banco de dados</li>
                      <li>• Soft skills para T.I.</li>
                    </ul>
                  </div>
                  
                  <Link href="/entrar">
                    <Button className="w-full mt-6 bg-gradient-to-r from-orbit-electric to-orbit-purple hover:from-orbit-purple hover:to-orbit-electric text-black font-bold">
                      Quero começar minha jornada
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Programa Quebrada Dev */}
            <Card className="bg-gray-900/50 border-orbit-purple/20 hover:border-orbit-purple/40 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-gradient-to-l from-orbit-purple to-transparent w-32 h-32 opacity-20"></div>
              <CardHeader>
                <CardTitle className="text-orbit-purple text-2xl">💻 Programa Quebrada Dev</CardTitle>
                <CardDescription className="text-gray-300">
                  Desenvolvimento web focado na realidade da periferia
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Duração removida: programa contínuo por entregas */}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Nível:</span>
                    <span className="text-white font-bold">Intermediário</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Preço:</span>
                    <span className="text-orbit-purple font-bold">Gratuito</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Vagas:</span>
                    <span className="text-white font-bold">30</span>
                  </div>
                  
                  <div className="pt-4">
                    <h4 className="text-white font-bold mb-2">Trilha e oportunidades:</h4>
                    <ul className="text-gray-300 space-y-1 text-sm">
                      <li>• Desenvolvimento web na vida real</li>
                      <li>• Projetos práticos com revisão técnica</li>
                      <li>• Ao se destacar, encaminhamento para freelas reais</li>
                      <li>• Participação em squads rápidos (comigo no time)</li>
                      <li>• Portfólio guiado + indicação</li>
                    </ul>
                    <p className="mt-2 text-xs text-white/70">Obs.: Alocação em projetos depende de performance e disponibilidade de demandas.</p>
                  </div>
                  
                  <Link href="/entrar">
                    <Button className="w-full mt-6 bg-gradient-to-r from-orbit-purple to-orbit-electric hover:from-orbit-electric hover:to-orbit-purple text-white font-bold">
                      Quero começar minha jornada
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Orbitamos Academy */}
            <Card className="bg-gray-900/50 border-orbit-electric/20 hover:border-orbit-electric/40 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-gradient-to-l from-orbit-electric to-transparent w-32 h-32 opacity-20"></div>
              <CardHeader>
                <CardTitle className="text-orbit-electric text-2xl">🎓 Orbitamos Academy</CardTitle>
                <CardDescription className="text-gray-300">
                  Cursos especializados em tecnologias emergentes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Duração/Nível removidos: Academy é hub contínuo de conteúdos */}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Acesso:</span>
                    <span className="text-white font-bold">Gratuito + Pago</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Modalidade:</span>
                    <span className="text-white font-bold">On‑demand + eventos</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Canais:</span>
                    <span className="text-orbit-electric font-bold">YouTube • Instagram • Hub Academy</span>
                  </div>
                  
                  <div className="pt-4">
                    <h4 className="text-white font-bold mb-2">Conteúdos e formatos:</h4>
                    <ul className="text-gray-300 space-y-1 text-sm">
                      <li>• Cursos e bootcamps</li>
                      <li>• Trilhas gratuitas (YouTube, Instagram)</li>
                      <li>• Materiais práticos e desafios</li>
                    </ul>
                    <p className="mt-2 text-xs text-white/70">Teremos uma área dedicada no site com todos os conteúdos da Academy.</p>
                  </div>
                  
                  <Link href="/entrar">
                    <Button className="w-full mt-6 bg-gradient-to-r from-orbit-electric to-orbit-purple hover:from-orbit-purple hover:to-orbit-electric text-black font-bold">
                      Quero começar minha jornada
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Metodologia */}
      <section className="py-20 bg-black/50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-white mb-16">
            Nossa <span className="gradient-text">Metodologia</span>
          </h2>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="bg-gray-900/50 border-orbit-electric/20">
                <CardHeader>
                  <CardTitle className="text-orbit-electric text-xl">🎯 Foco Prático</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">
                    Aprenda fazendo. Projetos reais desde o primeiro dia, 
                    simulando o ambiente de trabalho real.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-orbit-purple/20">
                <CardHeader>
                  <CardTitle className="text-orbit-purple text-xl">👥 Mentoria Individual</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">
                    Cada aluno tem um mentor dedicado que acompanha 
                    sua jornada pessoalmente.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-orbit-electric/20">
                <CardHeader>
                  <CardTitle className="text-orbit-electric text-xl">🤝 Apoio Coletivo</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">
                    Aprenda com seus pares. Grupos de estudo, 
                    projetos colaborativos e networking.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-orbit-purple/20">
                <CardHeader>
                  <CardTitle className="text-orbit-purple text-xl">💼 Conexão com Mercado</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">
                    Parcerias com empresas para estágios, 
                    vagas e oportunidades reais.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-white mb-16">
            Histórias de <span className="gradient-text">Transformação</span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Douglas Vinicius */}
            <Card className="bg-gray-900/50 border-orbit-electric/20">
              <CardContent className="pt-6">
                <p className="text-gray-300 italic mb-4">
                  &ldquo;Até 2025 eu era auxiliar de loja e me sentia preso na corrida dos ratos. 
                  Em menos de 1 ano mudei minha realidade; hoje estou estagiando em T.I. e, pela primeira vez, 
                  enxergo o amanhã com esperança.&rdquo;
                </p>
                <div className="text-orbit-electric font-bold">- Douglas Vinicius · Estagiário de T.I.</div>
              </CardContent>
            </Card>

            {/* Samuel Barros */}
            <Card className="bg-gray-900/50 border-orbit-purple/20">
              <CardContent className="pt-6">
                <p className="text-gray-300 italic mb-4">
                  &ldquo;Em 2023 eu era garçom, saturado da rotina. Hoje sou QA no modelo híbrido 
                  (apenas 2x presencial por mês). Minha vida mudou.&rdquo;
                </p>
                <div className="text-orbit-purple font-bold">- Samuel Barros · QA</div>
              </CardContent>
            </Card>

            {/* Estefanny Alves */}
            <Card className="bg-gray-900/50 border-orbit-electric/20">
              <CardContent className="pt-6">
                <p className="text-gray-300 italic mb-4">
                  &ldquo;Sempre quis dar uma vida mais digna para minha família. Vim da pobreza e, graças à tecnologia, 
                  hoje consigo realizar meus sonhos.&rdquo;
                </p>
                <div className="text-orbit-electric font-bold">- Estefanny Alves · Digital Analytics</div>
              </CardContent>
            </Card>
          </div>

          {/* Métricas de remuneração (fora dos cards) */}
          <div className="mt-10 grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-extrabold text-orbit-electric">R$ 1.5k</div>
              <div className="text-white/80 text-sm">Estagiário (Douglas)</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-extrabold text-orbit-purple">R$ 3.5k+</div>
              <div className="text-white/80 text-sm">Quality Assurance (Samuel)</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-extrabold text-orbit-electric">+10k/mês</div>
              <div className="text-white/80 text-sm">Digital Analytics (Estefanny)</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-r from-orbit-electric/10 to-orbit-purple/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-8">
            Pronto para sua <span className="gradient-text">transformação</span>?
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Escolha sua trilha e comece hoje mesmo sua jornada rumo ao primeiro 
            emprego em tecnologia.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/entrar">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-orbit-electric to-orbit-purple hover:from-orbit-purple hover:to-orbit-electric text-black font-bold px-12 py-6 text-xl"
              >
                🚀 Quero começar minha jornada
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
