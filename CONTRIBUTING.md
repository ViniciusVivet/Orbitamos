# 🤝 Guia de Contribuição - Orbitamos

Obrigado por considerar contribuir com a **Orbitamos**! Este guia irá ajudá-lo a entender como contribuir de forma eficaz para o projeto.

## 🎯 **Como Contribuir**

### **1. Fork e Clone**
```bash
# Fork o repositório no GitHub
# Depois clone seu fork
git clone https://github.com/SEU_USUARIO/orbitamos.git
cd orbitamos
```

### **2. Configurar Ambiente**
```bash
# Instalar dependências do frontend
cd apps/web
npm install

# Instalar dependências do backend
cd ../api
mvn install

# Subir ambiente com Docker
cd ../..
docker-compose up -d
```

### **3. Criar Branch**
```bash
git checkout -b feature/sua-feature
# ou
git checkout -b fix/seu-bug-fix
```

### **4. Desenvolver**
- Faça suas alterações
- Teste localmente (incluindo **testes automatizados**: `cd apps/api && mvn test` — veja [docs/TESTES_AUTOMATIZADOS.md](docs/TESTES_AUTOMATIZADOS.md))
- Siga os padrões de código
- Documente se necessário

### **5. Commit e Push**
```bash
git add .
git commit -m "feat: adiciona nova funcionalidade X"
git push origin feature/sua-feature
```

### **6. Pull Request**
- Abra um PR no GitHub
- Descreva suas mudanças
- Aguarde review e aprovação

---

## 📋 **Tipos de Contribuição**

### 🐛 **Bug Fixes**
- Corrigir problemas existentes
- Melhorar tratamento de erros
- Otimizar performance

### ✨ **Features**
- Adicionar novas funcionalidades
- Melhorar UX/UI
- Implementar integrações

### 📚 **Documentação**
- Melhorar README
- Adicionar comentários no código
- Criar tutoriais

### 🧪 **Testes**
- Adicionar testes unitários
- Implementar testes de integração
- Melhorar cobertura de testes

### 🎨 **Design**
- Melhorar interface
- Criar novos componentes
- Otimizar responsividade

---

## 🛠️ **Padrões de Código**

### **Frontend (TypeScript/React)**
```typescript
// ✅ Bom
interface UserProps {
  name: string;
  email: string;
  isActive: boolean;
}

const UserCard: React.FC<UserProps> = ({ name, email, isActive }) => {
  return (
    <div className="user-card">
      <h3>{name}</h3>
      <p>{email}</p>
      <span className={isActive ? 'active' : 'inactive'}>
        {isActive ? 'Ativo' : 'Inativo'}
      </span>
    </div>
  );
};

// ❌ Evitar
const UserCard = (props) => {
  return <div>{props.name}</div>;
};
```

### **Backend (Java/Spring)**
```java
// ✅ Bom
@RestController
@RequestMapping("/api")
@Validated
public class UserController {
    
    private final UserService userService;
    
    public UserController(UserService userService) {
        this.userService = userService;
    }
    
    @GetMapping("/users/{id}")
    public ResponseEntity<User> getUser(@PathVariable Long id) {
        User user = userService.findById(id);
        return ResponseEntity.ok(user);
    }
}

// ❌ Evitar
@RestController
public class UserController {
    @GetMapping("/users/{id}")
    public User getUser(@PathVariable Long id) {
        return userService.findById(id);
    }
}
```

### **Commits**
```bash
# ✅ Bom
git commit -m "feat: adiciona autenticação JWT"
git commit -m "fix: corrige validação de email"
git commit -m "docs: atualiza README com instruções de deploy"

# ❌ Evitar
git commit -m "mudanças"
git commit -m "fix"
git commit -m "update"
```

---

## 🧪 **Testes**

### **Frontend**
```bash
cd apps/web
npm run test
npm run test:coverage
```

### **Backend**
```bash
cd apps/api
mvn test
mvn jacoco:report
```

### **E2E**
```bash
npm run test:e2e
```

---

## 📝 **Checklist do PR**

### **Antes de Enviar**
- [ ] Código testado localmente
- [ ] Testes passando
- [ ] Documentação atualizada
- [ ] Commits com mensagens claras
- [ ] Branch atualizada com main

### **Descrição do PR**
```markdown
## 📋 Descrição
Breve descrição das mudanças implementadas.

## 🎯 Tipo de Mudança
- [ ] Bug fix
- [ ] Nova feature
- [ ] Breaking change
- [ ] Documentação

## 🧪 Como Testar
1. Passo 1
2. Passo 2
3. Passo 3

## 📸 Screenshots (se aplicável)
Adicione screenshots das mudanças visuais.

## ✅ Checklist
- [ ] Código testado
- [ ] Testes adicionados
- [ ] Documentação atualizada
- [ ] Sem breaking changes
```

---

## 🏷️ **Labels do Projeto**

### **Por Tipo**
- `bug` - Problemas que precisam ser corrigidos
- `enhancement` - Novas funcionalidades
- `documentation` - Melhorias na documentação
- `question` - Perguntas ou discussões

### **Por Prioridade**
- `priority: high` - Crítico
- `priority: medium` - Importante
- `priority: low` - Baixa prioridade

### **Por Status**
- `status: needs review` - Aguardando review
- `status: in progress` - Em desenvolvimento
- `status: blocked` - Bloqueado

---

## 🎯 **Áreas de Foco**

### **Para Iniciantes**
- Correção de typos na documentação
- Melhoria de comentários no código
- Adição de testes simples
- Tradução de textos

### **Para Intermediários**
- Implementação de novas features
- Otimização de performance
- Melhoria de UX/UI
- Refatoração de código

### **Para Avançados**
- Arquitetura e design patterns
- Integração com APIs externas
- Otimização de banco de dados
- Implementação de CI/CD

---

## 🚀 **Roadmap de Contribuições**

### **Fase 1: Onboarding**
1. Ler documentação
2. Configurar ambiente
3. Fazer primeiro commit
4. Abrir primeiro PR

### **Fase 2: Desenvolvimento**
1. Escolher issue
2. Implementar solução
3. Testar localmente
4. Submeter PR

### **Fase 3: Liderança**
1. Review de PRs
2. Mentoria de novos contribuidores
3. Proposição de melhorias
4. Manutenção do projeto

---

## 💬 **Comunicação**

### **Canais**
- **GitHub Issues**: Bugs e features
- **GitHub Discussions**: Perguntas e ideias
- **Discord**: Comunidade Orbitamos
- **Email**: contato@orbitamos.com.br

### **Etiqueta**
- Seja respeitoso e construtivo
- Use português para comunicação
- Seja específico em issues e PRs
- Ajude outros contribuidores

---

## 🏆 **Reconhecimento**

### **Contribuidores**
- Nome no README
- Badge de contribuidor
- Certificado de contribuição
- Acesso a recursos exclusivos

### **Mentores**
- Reconhecimento especial
- Acesso a eventos
- Oportunidades de networking
- Desconto em cursos

---

## 📚 **Recursos Úteis**

### **Documentação**
- [Next.js Docs](https://nextjs.org/docs)
- [Spring Boot Docs](https://spring.io/projects/spring-boot)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [shadcn/ui Docs](https://ui.shadcn.com/)

### **Ferramentas**
- [GitHub Desktop](https://desktop.github.com/)
- [VS Code](https://code.visualstudio.com/)
- [Postman](https://www.postman.com/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop)

### **Comunidade**
- [Discord Orbitamos](https://discord.gg/orbitamos)
- [GitHub Discussions](https://github.com/ViniciusVivet/orbitamos/discussions)
- [LinkedIn](https://linkedin.com/in/vivetsp)

---

## ❓ **FAQ**

### **Como escolher uma issue?**
Procure por labels como `good first issue` ou `help wanted`. Comece com issues simples para se familiarizar.

### **Posso contribuir mesmo sendo iniciante?**
Sim! Temos issues específicas para iniciantes. A comunidade está aqui para ajudar.

### **Quanto tempo leva para um PR ser aprovado?**
Geralmente 1-3 dias úteis. PRs simples podem ser aprovados em algumas horas.

### **Posso contribuir com design?**
Claro! Design é muito importante. Abra uma issue discutindo suas ideias.

### **Como reportar um bug?**
Use o template de bug report nas issues. Inclua passos para reproduzir e screenshots se aplicável.

---

<div align="center">

### **"A gente sobe junto!"** 🚀

**Obrigado por fazer parte da transformação digital da periferia!**

[![Contributors](https://img.shields.io/github/contributors/ViniciusVivet/orbitamos)](https://github.com/ViniciusVivet/orbitamos/graphs/contributors)
[![Issues](https://img.shields.io/github/issues/ViniciusVivet/orbitamos)](https://github.com/ViniciusVivet/orbitamos/issues)
[![PRs](https://img.shields.io/github/issues-pr/ViniciusVivet/orbitamos)](https://github.com/ViniciusVivet/orbitamos/pulls)

</div>
