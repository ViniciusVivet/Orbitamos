export type SqlLine = { code: string; meaning: string; why: string };
export const sqlLessons: { id: string; title: string; goal: string; speech: string; lines: SqlLine[] }[] = [
  { id: "fundacao", title: "A planta da loja", goal: "Criar produtos com id, nome e estoque.", speech: "A loja precisa lembrar o que tem nas prateleiras. A tabela é a estrutura; cada coluna guarda um tipo de informação. Vamos desenhar essa planta em SQL?", lines: [
    { code: "CREATE TABLE produtos (", meaning: "Crie uma tabela chamada produtos e abra sua definição.", why: "CREATE TABLE cria a estrutura, não os produtos. O parêntese abre a lista de colunas." },
    { code: "    id INTEGER PRIMARY KEY,", meaning: "Dê a cada produto uma identificação inteira e única.", why: "INTEGER indica números inteiros. PRIMARY KEY identifica cada registro; a vírgula separa esta coluna da próxima." },
    { code: "    nome TEXT NOT NULL,", meaning: "Reserve um campo de texto que não pode ser NULL.", why: "TEXT guarda o nome. NOT NULL proíbe valor ausente, mas não proíbe texto vazio; são coisas diferentes." },
    { code: "    estoque INTEGER NOT NULL", meaning: "Guarde a quantidade de unidades como inteiro.", why: "Aqui vem a última coluna: não coloque vírgula depois dela. Ainda não há nenhum produto cadastrado." },
    { code: ") STRICT;", meaning: "Feche a definição e aplique tipos estritos no SQLite.", why: "STRICT faz esta tabela exigir tipos compatíveis. É uma opção do SQLite, não uma palavra que todo banco usa. O ; termina o comando." },
  ] },
  { id: "cadastro", title: "As primeiras entregas", goal: "Cadastrar Caderno (12 unidades) e Caneta (3 unidades).", speech: "A estrutura ficou pronta, mas a loja ainda está vazia. Cada linha da tabela será um produto. Escreva o cadastro e veja as duas entregas chegarem juntas.", lines: [
    { code: "INSERT INTO produtos (id, nome, estoque)", meaning: "Indique a tabela e a ordem das colunas que receberão dados.", why: "INSERT INTO adiciona registros. A posição dos valores deve seguir a ordem id, nome, estoque." },
    { code: "VALUES", meaning: "Agora começam os valores dos novos registros.", why: "VALUES separa a lista de colunas dos dados. Escrever a palavra ainda não insere nada; é preciso completar e executar." },
    { code: "    (1, 'Caderno', 12),", meaning: "Cadastre o produto 1: Caderno, com 12 unidades.", why: "Aspas simples delimitam o texto. O número 12 é uma quantidade. A vírgula após o parêntese anuncia outro registro." },
    { code: "    (2, 'Caneta', 3);", meaning: "Cadastre o produto 2: Caneta, com 3 unidades.", why: "O segundo registro segue a mesma ordem das colunas. O ponto e vírgula encerra o INSERT." },
  ] },
  { id: "consulta", title: "A vitrine dos dados", goal: "Consultar nome e estoque dos dois produtos, na ordem do id.", speech: "Não precisamos reescrever a loja para olhar o estoque. Uma consulta abre uma janela para os dados e pode mostrar só as colunas que interessam.", lines: [
    { code: "SELECT nome, estoque", meaning: "Escolha as duas colunas que devem aparecer no resultado.", why: "SELECT consulta dados. A tabela continua tendo id; só estamos escolhendo o que exibir nesta janela." },
    { code: "FROM produtos", meaning: "Busque essas informações na tabela produtos.", why: "FROM indica a origem. É diferente de criar outra tabela ou mover os registros." },
    { code: "ORDER BY id;", meaning: "Organize o resultado pelo id, em ordem crescente.", why: "Sem ORDER BY, não devemos depender de uma ordem específica dos registros retornados." },
  ] },
  { id: "filtro", title: "O alerta do Orbi", goal: "Mostrar apenas produtos com menos de 5 unidades.", speech: "Uma prateleira está quase vazia! Me ajude a descobrir qual. O filtro não apaga produtos: ele decide o que aparece na consulta.", lines: [
    { code: "SELECT nome, estoque", meaning: "Mostre nome e quantidade dos produtos que passarem no filtro.", why: "Mantemos a mesma vitrine da etapa anterior, mas agora ela terá uma condição." },
    { code: "FROM produtos", meaning: "Consulte a tabela que já construímos.", why: "Os registros completos continuam no banco; não vamos substituir a tabela por este resultado." },
    { code: "WHERE estoque < 5", meaning: "Inclua somente quem tem estoque menor que 5.", why: "WHERE filtra. < significa menor que: 3 passa, 12 não. O número 5 também não passaria." },
    { code: "ORDER BY id;", meaning: "Mantenha uma ordem explícita no resultado filtrado.", why: "A ordenação acontece sobre o resultado da consulta. A Caneta deverá aparecer sozinha." },
  ] },
  { id: "reposicao", title: "A prateleira voltou a encher", goal: "Atualizar somente o produto 2 para 8 unidades.", speech: "Chegou a reposição da Caneta! Agora vamos alterar um registro que já existe. Cuidado: sem a condição, uma atualização pode alcançar todos os produtos.", lines: [
    { code: "UPDATE produtos", meaning: "Escolha a tabela que terá registros atualizados.", why: "UPDATE modifica registros existentes. Não é INSERT, que adiciona outros registros." },
    { code: "SET estoque = 8", meaning: "Defina o novo valor do estoque.", why: "SET atribui 8 ao campo. Isso define o total final, não soma 8 ao valor anterior." },
    { code: "WHERE id = 2;", meaning: "Aplique a mudança somente ao produto identificado por 2.", why: "A chave primária identifica a Caneta. O Caderno precisa continuar com 12 unidades. Nunca omita WHERE sem entender o alcance de uma atualização." },
  ] },
];
export type SqlTable = { columns: string[]; values: (string | number | null)[][] };
export type SqlSnapshot = { table: SqlTable | null; schema: { name: string; type: string; notnull: number; pk: number }[]; strict: boolean; query: SqlTable | null; error?: string; truncated?: boolean };
export function verifySqlLesson(stage: number, snapshot: SqlSnapshot) {
  if (snapshot.error || snapshot.truncated || !snapshot.table) return false;
  const schema = snapshot.schema;
  const correctSchema = schema.length === 3 && schema[0].name === "id" && schema[0].type === "INTEGER" && schema[0].pk === 1 && schema[1].name === "nome" && schema[1].type === "TEXT" && schema[1].notnull === 1 && schema[2].name === "estoque" && schema[2].type === "INTEGER" && schema[2].notnull === 1 && snapshot.strict;
  if (!correctSchema) return false;
  const expectedRows = stage === 0 ? [] : [[1, "Caderno", 12], [2, "Caneta", stage === 4 ? 8 : 3]];
  if (JSON.stringify(snapshot.table.values) !== JSON.stringify(expectedRows)) return false;
  if (stage === 2 || stage === 3) return JSON.stringify(snapshot.query) === JSON.stringify({ columns: ["nome", "estoque"], values: stage === 2 ? [["Caderno", 12], ["Caneta", 3]] : [["Caneta", 3]] });
  return true;
}
// Compare tokens rather than lowercasing strings: 'Caneta' must not equal 'caneta'.
export function sqlTokens(code: string) { return code.match(/'(?:''|[^'])*'|"(?:""|[^"])*"|[A-Za-z_][\w]*|\d+|[^\s]/g)?.map(token => /^[A-Za-z_]/.test(token) ? token.toUpperCase() : token) ?? []; }
export function sqlLineMatches(actual: string, expected: string) { return JSON.stringify(sqlTokens(actual)) === JSON.stringify(sqlTokens(expected)); }
export type SqlDraft = { version: 1; stage: number; drafts: string[][]; passed: number[] };
export function emptySqlDraft(): SqlDraft { return { version: 1, stage: 0, drafts: sqlLessons.map(lesson => lesson.lines.map(() => "")), passed: [] }; }
export function readSqlDraft(raw: string | null): SqlDraft {
  const empty = emptySqlDraft();
  try {
    const d = JSON.parse(raw ?? "null");
    if (d?.version !== 1 || !Array.isArray(d.drafts) || d.drafts.length !== sqlLessons.length || !d.drafts.every((lines: unknown, i: number) => Array.isArray(lines) && lines.length === sqlLessons[i].lines.length && lines.every(line => typeof line === "string" && line.length <= 1000))) return empty;
    const passed: number[] = [];
    for (let i = 0; i < sqlLessons.length && Array.isArray(d.passed) && d.passed.includes(i) && d.drafts[i].every((line: string) => line.trim()); i++) passed.push(i);
    return { version: 1, drafts: d.drafts, passed, stage: Number.isInteger(d.stage) ? Math.max(0, Math.min(d.stage, passed.length, sqlLessons.length - 1)) : 0 };
  } catch { return empty; }
}
export function editSqlLine(draft: SqlDraft, line: number, value: string): SqlDraft { return { ...draft, drafts: draft.drafts.map((rows, stage) => stage === draft.stage ? rows.map((text, index) => index === line ? value.slice(0, 1000).replace(/[\r\n]/g, " ") : text) : rows), passed: draft.passed.filter(stage => stage < draft.stage) }; }
export const sqlStorageKey = (userId: string) => `orbitamos-sql-v1-${userId}`;
