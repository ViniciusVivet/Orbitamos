# 🐛 Lista de Erros e Melhorias no Código

> **Documento para rastrear problemas e melhorias necessárias**  
> Última atualização: 2025-01-06

---

## 🔴 CRÍTICOS (Corrigir Urgente)

### 1. ✅ Pasta `comunidade/` Vazia - RESOLVIDO
**Localização**: `apps/web/src/app/comunidade/` (REMOVIDA)

**Problema**: 
- ~~Pasta existe mas está vazia~~
- ~~Não há página `page.tsx` dentro~~
- ~~Gera erro 404 se alguém acessar `/comunidade`~~

**Solução**:
- [x] Opção 1: Remover a pasta completamente ✅
- [ ] Opção 2: Criar página de redirecionamento para `/orbitacademy`
- [ ] Opção 3: Criar página básica com conteúdo

**Status**: ✅ **RESOLVIDO** - Pasta removida em 2025-01-06

---

### 2. Console.logs em Produção
**Localização**: 
- `apps/web/src/app/contato/page.tsx` (linhas 35, 36, 55)
- `apps/web/src/app/entrar/page.tsx` (linhas 17, 24, 30)

**Problema**:
- Console.logs expõem informações no navegador
- Console.error pode expor detalhes sensíveis
- Polui o console em produção

**Solução**:
```typescript
// Substituir por:
if (process.env.NODE_ENV === 'development') {
  console.log('...');
}
// Ou usar biblioteca de logging
```

**Prioridade**: 🔴 MÉDIA

---

### 3. Chaves do EmailJS Hardcoded
**Localização**: `apps/web/src/app/contato/page.tsx` (linhas 28-30)

**Problema**:
- Chaves do EmailJS estão hardcoded no código
- Expostas no bundle do frontend
- Qualquer um pode ver e usar

**Solução**:
- [ ] Mover todas as chaves para variáveis de ambiente
- [ ] Remover valores padrão hardcoded
- [ ] Validar se variáveis existem antes de usar

**Prioridade**: 🔴 ALTA

---

### 4. Backend Não Salva Dados
**Localização**: `apps/api/src/main/java/com/orbitamos/api/controller/ContactController.java` (linha 19)

**Problema**:
- Comentário diz "Aqui seria salvo no banco de dados"
- Dados são perdidos após requisição
- Sem histórico de contatos

**Solução**:
- [ ] Criar entidade `Contact`
- [ ] Implementar `ContactRepository` e `ContactService`
- [ ] Atualizar controller para salvar no banco

**Prioridade**: 🔴 ALTA

---

## 🟡 IMPORTANTES (Corrigir em Breve)

### 5. TypeScript @ts-expect-error
**Localização**: `apps/web/src/components/EarthGlobePure.tsx` (linha 24)

**Problema**:
- Uso de `@ts-expect-error` suprime erros do TypeScript
- Pode esconder problemas reais
- Código não type-safe

**Solução**:
- [ ] Verificar versão do Three.js
- [ ] Atualizar tipos ou usar type assertion correta
- [ ] Remover `@ts-expect-error` se possível

**Prioridade**: 🟡 MÉDIA

---

### 6. Validação de Formulários Fraca
**Localização**: 
- `apps/web/src/app/contato/page.tsx`
- `apps/web/src/app/entrar/page.tsx`

**Problema**:
- Validação apenas HTML5 (`required`)
- Sem validação de formato de email robusta
- Sem sanitização de inputs
- Sem limite de tamanho de mensagem

**Solução**:
- [ ] Adicionar validação com biblioteca (zod, yup)
- [ ] Validar formato de email
- [ ] Limitar tamanho de mensagem
- [ ] Sanitizar inputs antes de enviar

**Prioridade**: 🟡 MÉDIA

---

### 7. Falta de Tratamento de Erro Robusto
**Localização**: Vários arquivos

**Problema**:
- Try/catch genérico sem tratamento específico
- Mensagens de erro genéricas para usuário
- Sem logging de erros para debug

**Solução**:
- [ ] Criar sistema de tratamento de erros centralizado
- [ ] Mensagens de erro específicas e úteis
- [ ] Logging de erros (Sentry, LogRocket, etc.)

**Prioridade**: 🟡 MÉDIA

---

### 8. Dados Mockados no OrbitAcademy
**Localização**: `apps/web/src/app/orbitacademy/page.tsx` (linhas 9-29)

**Problema**:
- Dados vêm de `localStorage` (mockado)
- Não conectado ao backend
- Progresso não persiste entre dispositivos

**Solução**:
- [ ] Conectar ao backend
- [ ] Criar endpoints para progresso
- [ ] Persistir no banco de dados

**Prioridade**: 🟡 MÉDIA

---

## 🟢 MELHORIAS (Opcional)

### 9. Falta de Loading States
**Localização**: Vários componentes

**Problema**:
- Alguns componentes não mostram loading
- Usuário não sabe se está carregando ou travado

**Solução**:
- [ ] Adicionar skeletons/loaders
- [ ] Feedback visual durante carregamento

**Prioridade**: 🟢 BAIXA

---

### 10. Falta de Acessibilidade
**Localização**: Todo o frontend

**Problema**:
- Falta `aria-labels` em alguns elementos
- Cores podem não ter contraste suficiente
- Navegação por teclado pode não funcionar

**Solução**:
- [ ] Adicionar aria-labels
- [ ] Verificar contraste de cores
- [ ] Testar navegação por teclado

**Prioridade**: 🟢 BAIXA

---

### 11. Falta de Testes
**Localização**: Todo o projeto

**Problema**:
- Sem testes unitários
- Sem testes de integração
- Sem testes E2E

**Solução**:
- [ ] Adicionar testes unitários (Jest, Vitest)
- [ ] Testes de integração
- [ ] Testes E2E (Playwright, Cypress)

**Prioridade**: 🟢 BAIXA

---

### 12. Documentação de Código
**Localização**: Vários arquivos

**Problema**:
- Falta JSDoc em funções
- Comentários explicativos escassos
- Sem documentação de componentes

**Solução**:
- [ ] Adicionar JSDoc nas funções
- [ ] Comentários explicativos
- [ ] Documentar componentes complexos

**Prioridade**: 🟢 BAIXA

---

## 📋 Resumo por Prioridade

| Prioridade | Quantidade | Status |
|------------|------------|--------|
| 🔴 Críticos | 4 | ⚠️ Precisa atenção |
| 🟡 Importantes | 4 | 📝 Planejar correção |
| 🟢 Melhorias | 4 | 💡 Futuro |

---

## 🎯 Próximos Passos Recomendados

1. **Remover/Corrigir pasta `comunidade/`** (5 min)
2. **Mover chaves EmailJS para variáveis de ambiente** (15 min)
3. **Remover console.logs ou adicionar condicional** (10 min)
4. **Implementar salvamento de contatos no banco** (2-3 horas)

---

**Nota**: Este documento deve ser atualizado conforme erros são corrigidos e novos são encontrados.

