"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import emailjs from '@emailjs/browser';
import { sendContact } from "@/lib/api";
import Link from "next/link";
import { whatsappMentoriaUrl } from "@/lib/social";

export default function Contato() {
  const instagramUrl = "https://www.instagram.com/orbitamosbr/";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setIsSuccess(false);
    
    try {
      // 1. Salvar no banco de dados via backend
      try {
        const response = await sendContact({
          name: formData.name,
          email: formData.email,
          message: formData.message,
        });
        
        console.log('✅ Contato salvo no banco:', response);
      } catch (apiError) {
        console.warn('⚠️ Erro ao salvar no banco (continuando com EmailJS):', apiError);
        // Continua mesmo se o backend falhar
      }
      
      // 2. Enviar email via EmailJS (notificação)
      try {
        const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
        const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
        const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
        
        if (serviceId && templateId && publicKey && publicKey !== 'YOUR_PUBLIC_KEY') {
          const templateParams = {
            from_name: formData.name,
            from_email: formData.email,
            message: formData.message,
            to_email: 'contato@orbitamos.com',
          };
          
          await emailjs.send(serviceId, templateId, templateParams, publicKey);
          console.log('📧 Email enviado com sucesso via EmailJS!');
        }
      } catch (emailError) {
        console.warn('⚠️ Erro ao enviar email (mas dados foram salvos no banco):', emailError);
        // Não bloqueia o sucesso se o email falhar
      }
      
      setIsSuccess(true);
      setFormData({ name: "", email: "", message: "" });
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setIsSuccess(false);
      }, 5000);
      
    } catch (err) {
      console.error('❌ Erro geral:', err);
      setError('Erro ao enviar mensagem. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orbit-black via-gray-900 to-orbit-black">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 sm:py-16 md:py-20">
        <div className="container mx-auto max-w-full px-4 text-center">
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold mb-6 md:mb-8">
            <span className="gradient-text">Entre em Órbita</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Pronto para começar sua transformação? Entre em contato conosco!
          </p>
        </div>
      </section>

      {/* Formulário e Informações */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Formulário */}
            <Card className="bg-gray-900/50 border-orbit-electric/20">
              <CardHeader>
                <CardTitle className="text-orbit-electric text-2xl">📝 Envie sua Mensagem</CardTitle>
                <CardDescription className="text-gray-300">
                  Preencha o formulário e entraremos em contato em breve
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-white font-medium mb-2">
                      Nome Completo
                    </label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Seu nome completo"
                      required
                      className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-white font-medium mb-2">
                      E-mail
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="seu@email.com"
                      required
                      className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-white font-medium mb-2">
                      Mensagem
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Conte-nos sobre seus objetivos e como podemos ajudar..."
                      rows={5}
                      required
                      className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                    />
                  </div>

                  <Button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-orbit-electric to-orbit-purple hover:from-orbit-purple hover:to-orbit-electric text-black font-bold py-3 disabled:opacity-50"
                  >
                    {isLoading ? "⏳ Enviando..." : "🚀 Enviar Mensagem"}
                  </Button>
                  
                  {/* Success Message */}
                  {isSuccess && (
                    <div className="mt-4 p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 text-center">
                      ✅ Mensagem enviada com sucesso! Entraremos em contato em breve.
                    </div>
                  )}
                  
                  {/* Error Message */}
                  {error && (
                    <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-center">
                      ❌ {error}
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>

            {/* Informações de Contato */}
            <div className="space-y-8">
              <Card className="bg-gray-900/50 border-orbit-purple/20">
                <CardHeader>
                  <CardTitle className="text-orbit-purple text-2xl">📞 Contato Direto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-orbit-electric to-orbit-purple rounded-full flex items-center justify-center">
                      📧
                    </div>
                    <div>
                      <p className="text-white font-bold">E-mail</p>
                      <p className="text-gray-300">aquelequevivencia@gmail.com</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-orbit-purple to-orbit-electric rounded-full flex items-center justify-center">
                      📱
                    </div>
                    <div>
                      <p className="text-white font-bold">WhatsApp</p>
                      <p className="text-gray-300">(11) 94913-8973</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-orbit-electric to-orbit-purple rounded-full flex items-center justify-center">
                      💬
                    </div>
                    <div>
                      <p className="text-white font-bold">Discord</p>
                      <p className="text-gray-300">Comunidade Orbitamos</p>
                    </div>
                  </div>

                  <Link
                    href={instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-orbit-electric to-orbit-purple px-4 py-2 text-sm font-semibold text-black"
                  >
                    📸 Seguir no Instagram
                  </Link>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-orbit-electric/20">
                <CardHeader>
                  <CardTitle className="text-orbit-electric text-2xl">🏢 Parcerias</CardTitle>
                  <CardDescription className="text-gray-300">
                    Empresas que querem acelerar talentos conosco
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-white mb-4">
                    Quer contratar nossos alunos ou fazer uma parceria? 
                    Temos talentos prontos para o mercado!
                  </p>
                  <Link href={whatsappMentoriaUrl} target="_blank" rel="noreferrer">
                    <Button 
                      variant="outline"
                      className="border-orbit-electric text-orbit-electric hover:bg-orbit-electric hover:text-black"
                    >
                      🤝 Falar sobre Parceria
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-orbit-purple/20">
                <CardHeader>
                  <CardTitle className="text-orbit-purple text-2xl">👨‍💻 Mentoria</CardTitle>
                  <CardDescription className="text-gray-300">
                    Quer ser um mentor da Orbitamos?
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-white mb-4">
                    Profissionais experientes que querem compartilhar conhecimento 
                    e transformar vidas.
                  </p>
                  <Link href={whatsappMentoriaUrl} target="_blank" rel="noreferrer">
                    <Button 
                      variant="outline"
                      className="border-orbit-purple text-orbit-purple hover:bg-orbit-purple hover:text-white"
                    >
                      🎓 Ser Mentor
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-black/50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-white mb-16">
            Perguntas <span className="gradient-text">Frequentes</span>
          </h2>
          
          <div className="max-w-4xl mx-auto space-y-6">
            <Card className="bg-gray-900/50 border-orbit-electric/20">
              <CardHeader>
                <CardTitle className="text-orbit-electric">Quanto custa participar dos programas?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Nossos programas principais são gratuitos! Acreditamos que educação 
                  de qualidade deve ser acessível para todos. Alguns cursos especializados 
                  podem ter valores simbólicos para cobrir custos operacionais.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-orbit-purple/20">
              <CardHeader>
                <CardTitle className="text-orbit-purple">Preciso ter conhecimento prévio?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Não! Nossos programas são pensados para pessoas que estão começando do zero. 
                  Você só precisa ter vontade de aprender e dedicação para estudar.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-orbit-electric/20">
              <CardHeader>
                <CardTitle className="text-orbit-electric">Como funciona o processo seletivo?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Não temos processo seletivo tradicional. Acreditamos que todos têm potencial. 
                  Fazemos apenas uma conversa para entender seus objetivos e como podemos ajudar 
                  da melhor forma.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-orbit-purple/20">
              <CardHeader>
                <CardTitle className="text-orbit-purple">Vocês ajudam com empregos?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Sim! Temos parcerias com empresas e uma rede de contatos que nos ajuda 
                  a conectar nossos alunos com oportunidades reais de trabalho. 
                  Além disso, ensinamos como se posicionar no mercado.
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
            Pronto para <span className="gradient-text">orbitar</span>?
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Sua transformação começa com um simples contato. 
            Vamos juntos nessa jornada!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/entrar">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-orbit-electric to-orbit-purple hover:from-orbit-purple hover:to-orbit-electric text-black font-bold px-12 py-6 text-xl"
              >
                🚀 Começar Agora
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
