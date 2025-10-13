# 🌐 Orbitamos Web - Frontend

Frontend da **Orbitamos** construído com Next.js 14, React 18 e TailwindCSS.

## 🎯 **Visão Geral**

O frontend da Orbitamos é responsável por:
- ✅ Página inicial com hero section e features
- ✅ Página sobre a empresa e propósito
- ✅ Catálogo de programas de mentoria
- ✅ Formulário de contato funcional
- ✅ Design system com paleta Orbitamos
- ✅ Componentes interativos e animações

## 🛠️ **Stack Tecnológica**

- **Next.js 15.5.4** - Framework React
- **React 18** - Biblioteca de UI
- **TypeScript 5** - Tipagem estática
- **TailwindCSS 4** - Framework CSS
- **shadcn/ui** - Componentes de UI
- **Three.js** - Gráficos 3D
- **Docker** - Containerização

## 🚀 **Como Executar**

### **Pré-requisitos**
- Node.js 18+
- npm ou yarn

### **Opção 1: Desenvolvimento Local**
```bash
# 1. Instalar dependências
npm install

# 2. Executar servidor de desenvolvimento
npm run dev

# 3. Acessar no navegador
# http://localhost:3000
```

### **Opção 2: Docker**
```bash
# Build da imagem
docker build -t orbitamos-web .

# Executar container
docker run -p 3000:3000 orbitamos-web
```

### **Opção 3: Docker Compose**
```bash
# Na raiz do projeto
docker-compose up web
```

## 📱 **Páginas Disponíveis**

### **🏠 Home (`/`)**
- Hero section com manifesto
- Features principais
- Estatísticas de impacto
- CTAs principais

### **📖 Sobre (`/sobre`)**
- História da Orbitamos
- Missão, visão e valores
- Linha do tempo do futuro
- Apresentação do time

### **🎓 Mentorias (`/mentorias`)**
- 3 programas detalhados:
  - **Mentoria Tech 9 Meses** (Gratuito)
  - **Programa Quebrada Dev** (Gratuito)
  - **Orbitamos Academy** (Acessível)
- Metodologia de ensino
- Depoimentos de transformação

### **📞 Contato (`/contato`)**
- Formulário de contato funcional
- Informações de contato direto
- Seção para parcerias empresariais
- FAQ com perguntas frequentes

### **🎓 OrbitAcademy (`/orbitacademy`)**
- Cursos especializados
- Trilhas de aprendizado
- Recursos educativos

## 🎨 **Design System**

### **Paleta de Cores**
```css
:root {
  --orbit-black: #000000;      /* Preto espacial */
  --orbit-electric: #00D4FF;   /* Azul elétrico */
  --orbit-white: #FFFFFF;      /* Branco */
  --orbit-purple: #8B5CF6;     /* Roxo suave */
}
```

### **Gradientes**
```css
.gradient-orbit {
  background: linear-gradient(135deg, #00D4FF 0%, #8B5CF6 100%);
}

.gradient-text {
  background: linear-gradient(135deg, #00D4FF 0%, #8B5CF6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

### **Animações**
```css
@keyframes orbit {
  0% { transform: rotate(0deg) translateX(20px) rotate(0deg); }
  100% { transform: rotate(360deg) translateX(20px) rotate(-360deg); }
}

.animate-orbit {
  animation: orbit 3s linear infinite;
}
```

## 🧩 **Componentes Principais**

### **UI Components (shadcn/ui)**
- `Button` - Botões com variantes
- `Card` - Cards de conteúdo
- `Input` - Campos de entrada
- `Textarea` - Área de texto

### **Custom Components**
- `Navigation` - Navegação principal
- `CursorOrbit` - Cursor animado
- `GlobeClient` - Globo 3D interativo
- `Tilt` - Efeito de inclinação
- `Parallax` - Efeito parallax
- `Magnetic` - Efeito magnético
- `XPRing` - Anel de progresso
- `SpaceShipsOverlay` - Naves espaciais
- `MissionsTeaser` - Teaser de missões
- `ConstellationStepper` - Stepper de constelação
- `MissionsSidebar` - Sidebar de missões

## 🔧 **Configuração de Desenvolvimento**

### **Variáveis de Ambiente**
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_APP_NAME=Orbitamos
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### **Scripts Disponíveis**
```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Executar build de produção
npm run start

# Linting
npm run lint
```

## 🧪 **Testes**

### **Executar Testes**
```bash
# Testes unitários
npm run test

# Testes com watch
npm run test:watch

# Testes com cobertura
npm run test:coverage
```

## 📊 **Performance**

### **Otimizações Implementadas**
- ✅ **SSR/SSG** - Server-side rendering
- ✅ **Image Optimization** - Next.js Image
- ✅ **Code Splitting** - Lazy loading automático
- ✅ **Bundle Analysis** - Análise de bundle
- ✅ **Font Optimization** - Next.js Font

### **Métricas Alvo**
- **LCP** < 2.5s (Largest Contentful Paint)
- **FID** < 100ms (First Input Delay)
- **CLS** < 0.1 (Cumulative Layout Shift)
- **Bundle Size** < 500KB

## 🚀 **Deploy**

### **Vercel (Recomendado)**
```bash
# 1. Conectar repositório no Vercel
# 2. Configurar variáveis de ambiente
# 3. Deploy automático a cada push
```

### **Docker**
```bash
# Build para produção
docker build -t orbitamos-web .

# Executar
docker run -p 3000:3000 orbitamos-web
```

### **Build Manual**
```bash
# Build
npm run build

# Executar
npm run start
```

## 🔒 **Segurança**

### **Configurações**
- ✅ **HTTPS** forçado em produção
- ✅ **CSP** (Content Security Policy)
- ✅ **XSS Protection**
- ✅ **CSRF Protection**

### **Headers de Segurança**
```javascript
// next.config.ts
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  }
];
```

## 📱 **Responsividade**

### **Breakpoints**
```css
/* TailwindCSS */
sm: 640px   /* Mobile */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large Desktop */
2xl: 1536px /* Extra Large */
```

### **Design Mobile-First**
- ✅ Layout responsivo
- ✅ Touch-friendly
- ✅ Performance otimizada
- ✅ Acessibilidade

## 🐛 **Troubleshooting**

### **Problemas Comuns**

#### **Erro de Build**
```bash
# Limpar cache
rm -rf .next
npm run build
```

#### **Dependências**
```bash
# Limpar node_modules
rm -rf node_modules package-lock.json
npm install
```

#### **Porta 3000 em Uso**
```bash
# Verificar processo
netstat -ano | findstr :3000

# Matar processo
taskkill /PID <PID> /F
```

## 📚 **Documentação Adicional**

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev/)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [shadcn/ui Docs](https://ui.shadcn.com/)

## 🤝 **Contribuindo**

Veja o [CONTRIBUTING.md](../../CONTRIBUTING.md) para mais detalhes sobre como contribuir com o projeto.

## 📄 **Licença**

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](../../LICENSE) para mais detalhes.

---

<div align="center">

### **"Da quebrada pra tecnologia — A gente sobe junto."** 🚀

**Feito com ❤️ pela comunidade Orbitamos**

</div>