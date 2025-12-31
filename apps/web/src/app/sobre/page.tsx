import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Sobre() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orbit-black via-gray-900 to-orbit-black">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-8">
            <span className="gradient-text">Nosso Propósito</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Se a gente vai longe, é porque sobe junto.
          </p>
        </div>
      </section>

      {/* História */}
      <section className="py-20 bg-black/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-white mb-8 text-center">
              Nossa <span className="gradient-text">História</span>
            </h2>
            
            <div className="space-y-6 text-lg text-gray-300">
              <p>
                A Orbitamos nasceu da necessidade real de transformar vidas através da tecnologia. 
                Criada por pessoas que viveram a transição do subemprego para a área de T.I., 
                entendemos como é difícil essa jornada quando você não tem as ferramentas certas.
              </p>
              
              <p>
                Nossa metodologia foi desenvolvida na prática, testada e refinada com centenas 
                de pessoas da periferia. Sabemos que não é só sobre aprender a programar - 
                é sobre mudança de mindset, quebra de barreiras e construção de uma nova realidade.
              </p>
              
              <p>
                Hoje, somos mais que uma escola de tecnologia. Somos um movimento que acredita 
                no potencial da quebrada e na força da comunidade unida.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Missão, Visão, Valores */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-white mb-16">
            Nossos <span className="gradient-text">Pilares</span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-gray-900/50 border-orbit-electric/20 hover:border-orbit-electric/40 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-orbit-electric text-2xl">🎯 Missão</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white">
                  Transformar vidas através da tecnologia, levando pessoas da classe C e D 
                  do subemprego ao primeiro trampo em T.I. em até 9 meses, com foco na 
                  realidade da periferia.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-orbit-purple/20 hover:border-orbit-purple/40 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-orbit-purple text-2xl">👁️ Visão</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white">
                  Ser o maior movimento de transformação digital da periferia, criando uma 
                  geração de profissionais de tecnologia que representam a diversidade 
                  e a força da quebrada.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-orbit-electric/20 hover:border-orbit-electric/40 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-orbit-electric text-2xl">💎 Valores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-white space-y-2">
                  <p><strong>Autenticidade:</strong> Ser real, sem máscaras</p>
                  <p><strong>Esperança:</strong> Acreditar no potencial de cada um</p>
                  <p><strong>Comunidade:</strong> A gente sobe junto</p>
                  <p><strong>Impacto:</strong> Transformar vidas reais</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Linha do Tempo */}
      <section className="py-20 bg-black/50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-white mb-16">
            Linha do <span className="gradient-text">Futuro</span>
          </h2>
          
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              <div className="flex items-center gap-6">
                <div className="w-4 h-4 bg-orbit-electric rounded-full"></div>
                <div>
                  <h3 className="text-2xl font-bold text-orbit-electric">2025</h3>
                  <p className="text-gray-300">Expansão para 5 cidades, 1000+ pessoas transformadas</p>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="w-4 h-4 bg-orbit-purple rounded-full"></div>
                <div>
                  <h3 className="text-2xl font-bold text-orbit-purple">2026</h3>
                  <p className="text-gray-300">Orbitamos Academy com cursos especializados</p>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="w-4 h-4 bg-orbit-electric rounded-full"></div>
                <div>
                  <h3 className="text-2xl font-bold text-orbit-electric">2027</h3>
                  <p className="text-gray-300">Parcerias com grandes empresas de tecnologia</p>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="w-4 h-4 bg-orbit-purple rounded-full"></div>
                <div>
                  <h3 className="text-2xl font-bold text-orbit-purple">2030</h3>
                  <p className="text-gray-300">Referência nacional em educação tech da periferia</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Time */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-white mb-16">
            Nosso <span className="gradient-text">Time</span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-gray-900/50 border-orbit-electric/20 text-center">
              <CardHeader>
                <div className="w-24 h-24 bg-gradient-to-r from-orbit-electric to-orbit-purple rounded-full mx-auto mb-4"></div>
                <CardTitle className="text-orbit-electric">Fundadores</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Pessoas que viveram a transformação e decidiram compartilhar 
                  o conhecimento com a comunidade.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-orbit-purple/20 text-center">
              <CardHeader>
                <div className="w-24 h-24 bg-gradient-to-r from-orbit-purple to-orbit-electric rounded-full mx-auto mb-4"></div>
                <CardTitle className="text-orbit-purple">Mentores</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Profissionais experientes que dedicam tempo para guiar 
                  a jornada de novos desenvolvedores.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-orbit-electric/20 text-center">
              <CardHeader>
                <div className="w-24 h-24 bg-gradient-to-r from-orbit-electric to-orbit-purple rounded-full mx-auto mb-4"></div>
                <CardTitle className="text-orbit-electric">Orbiters</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Orbiters que se ajudam mutuamente, criando uma rede 
                  de apoio e crescimento conjunto.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-r from-orbit-electric/10 to-orbit-purple/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-8">
            Faça parte da nossa <span className="gradient-text">história</span>
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Junte-se ao movimento que está transformando vidas e construindo 
            o futuro da tecnologia na periferia.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-orbit-electric to-orbit-purple hover:from-orbit-purple hover:to-orbit-electric text-black font-bold px-12 py-6 text-xl"
            >
              🚀 Entrar para a Órbita
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
