# Laboratório Orbitamos — direção e manutenção

## Escopo da revisão (14/09/2026)

O catálogo de prática e a interface do editor passam a seguir a identidade da Academy: bancada de experimentos, tipografia da marca e uma folha de orientação ao lado do código. Não reproduzir os efeitos imersivos do site comercial dentro de uma ferramenta de estudo.

- Abertura com retomada do rascunho real ou primeiro desafio ainda não concluído.
- A prévia mostra instruções reais; contadores usam o catálogo e o armazenamento do navegador.
- Cartões por assunto, com cores estáveis por linguagem, habilidade e estado legível. Sem capas aleatórias, progresso inventado ou resultados fictícios.
- Busca, linguagem, dificuldade e status continuam combináveis, com ação clara para limpar filtros.
- Editor com arquivo virtual identificado, estado real de salvamento, execução em destaque e console separado.
- Guia com missão ativa em uma superfície clara, progresso e referências em uma única região rolável.
- Em celular, Código/Guia continuam em abas; console expande e controles principais têm área de toque de pelo menos 44 px.
- Não substituir responsividade com captura de scroll, vídeo ou animação decorativa.

## Limites preservados

Execução JavaScript/Python/C#, currículos, critérios de validação, dicas, reflexão, identificadores de armazenamento, autenticação e permissões não foram reescritos. Os rascunhos continuam locais, não sincronizados entre dispositivos. C# continua com as capacidades do executor existente, não um ambiente .NET completo.

A regra de altura do console foi ajustada para que o tamanho intermediário (640–767 px) não anule a expansão. Estilos de botões não devem sobrescrever as classes que ocultam controles exclusivos de celular.

## Arquivos

- `src/app/estudante/pratica/page.tsx`: catálogo e filtros; componente de apresentação recebe identificação de usuário.
- `src/app/estudante/pratica/[slug]/page.tsx`: workspace existente, agora com a nova camada visual.
- `src/components/estudante/Laboratory.module.css`: estilos encapsulados, sem novas dependências.
- `src/app/dev/LaboratoryPreviewFrame.tsx`: moldura de teste com barra lateral real, sem sessão de aluno.
- `/dev/lab-preview` e `/dev/ide-preview/[slug]`: prévias disponíveis apenas em desenvolvimento.

## Verificação reproduzível

Servidor local na porta 3015:

```powershell
$env:IDE_AUDIT_URL = 'http://localhost:3015'
node scripts/audit-laboratory.mjs
$env:IDE_AUDIT_REQUIRE_PYTHON = '1'
npm run test:ide
npm test
npm run build
```

O primeiro script cobre catálogo em 320, 390, 768, 1024 e 1440 px; filtros combinados, vazio, reflexão e retomada de rascunho; editor e guia em 320, 390, 700 e 1440 px; expansão do console em 700 px; axe e overflow. Capturas e relatório: `test-results/laboratory/`.

A auditoria de IDE cobre seis perfis de tela, execução, autocomplete, teclado de símbolos, atalhos, persistência, JavaScript offline, copiar/limpar/expandir console, interrupção e reutilização do runtime Python. Capturas: `test-results/student-ide/`.

As prévias usam armazenamento de teste e não validam permissões ou dados de uma conta real. Teste em aparelho físico com teclado virtual continua complementar à emulação. O primeiro carregamento do Python pode ser demorado; a alteração visual não promete reduzir esse custo.
