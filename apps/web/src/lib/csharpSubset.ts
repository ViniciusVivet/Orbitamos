/**
 * Deliberately small C# teaching language. It tokenizes and type-checks before
 * emitting JavaScript; it is not Roslyn and does not claim to compile .NET.
 * Numeric support is bounded to int32 and finite double, plus bool, string and
 * one-dimensional arrays. Unsupported syntax fails closed, rather than gaining
 * JavaScript coercions or being rewritten inside a comment/string.
 */
type Scalar = "int" | "double" | "bool" | "string";
type ValueType = Scalar | `${Scalar}[]`;
type Token = { text: string; kind: "name" | "number" | "string" | "interpolated" | "symbol" | "end"; line: number; value?: string };
type Binding = { type: ValueType; js: string; readOnly: boolean };
type Scope = { bindings: Map<string, Binding>; descendants: Set<string> };
type Expression = { type: ValueType; js: string; line: number; target?: Binding & { js: string }; effect?: boolean; statementExpression?: true; numericLiteral?: number };
type State = { scopes: Scope[]; nextName: number };
export type CSharpSubsetCompilation = { ok: true; code: string; verificationCode: string } | { ok: false; error: string; line: number | null };

class SubsetError extends Error {
  constructor(message: string, readonly line: number, readonly unsupported = false) { super(message); }
}
const scalarTypes: readonly string[] = ["int", "double", "bool", "string"];
const isNumeric = (type: ValueType): type is "int" | "double" => type === "int" || type === "double";
const isArray = (type: ValueType): type is `${Scalar}[]` => type.endsWith("[]");
const compatible = (target: ValueType, value: ValueType) => target === value || target === "double" && value === "int";
const limitMessage = "Este laboratório C# inicial executa int, double, bool, string, arrays simples, Console.WriteLine, condições e laços. Este recurso precisa de um projeto .NET completo.";

function escapedCharacter(source: string, at: number, line: number): { value: string; end: number } {
  const char = source[at];
  const escapes: Record<string, string> = { "0": "\0", a: "\x07", b: "\b", f: "\f", n: "\n", r: "\r", t: "\t", v: "\v", "\\": "\\", '"': '"', "'": "'" };
  if (Object.prototype.hasOwnProperty.call(escapes, char)) return { value: escapes[char], end: at + 1 };
  if (char === "u" || char === "x") {
    const digits = char === "u" ? source.slice(at + 1, at + 5) : source.slice(at + 1).match(/^[\da-fA-F]{1,4}/)?.[0] ?? "";
    if (!digits || char === "u" && digits.length !== 4 || !/^[\da-fA-F]+$/.test(digits)) throw new SubsetError("Escape Unicode incompleto no texto.", line);
    return { value: String.fromCharCode(parseInt(digits, 16)), end: at + 1 + digits.length };
  }
  throw new SubsetError(`O escape \\${char ?? ""} não é válido neste texto.`, line);
}

function tokens(source: string, initialLine = 1): Token[] {
  const result: Token[] = [];
  let at = 0, line = initialLine;
  const push = (token: Token) => { result.push(token); if (result.length > 15000) throw new SubsetError("Divida este programa em uma prática menor.", line, true); };
  while (at < source.length) {
    const char = source[at];
    if (/\s/.test(char)) { if (char === "\n") line++; at++; continue; }
    if (source.startsWith("//", at)) { while (at < source.length && source[at] !== "\n") at++; continue; }
    if (source.startsWith("/*", at)) {
      const startLine = line; at += 2;
      while (at < source.length && !source.startsWith("*/", at)) { if (source[at] === "\n") line++; at++; }
      if (at === source.length) throw new SubsetError("Feche o comentário com */.", startLine);
      at += 2; continue;
    }
    if (char === '"' || source.startsWith('$"', at) || source.startsWith('@"', at)) {
      const startLine = line, interpolated = char === "$", verbatim = char === "@";
      if (source.startsWith('"""', at)) throw new SubsetError(limitMessage, line, true);
      at += char === '"' ? 1 : 2;
      let value = "", closed = false;
      while (at < source.length) {
        if (source[at] === '"') {
          if (verbatim && source[at + 1] === '"') { value += '"'; at += 2; continue; }
          at++; closed = true; break;
        }
        if (source[at] === "\n") {
          if (!verbatim) throw new SubsetError("Feche o texto antes de mudar de linha, ou use \\n dentro das aspas.", startLine);
          line++;
        }
        if (!verbatim && source[at] === "\\") {
          const decoded = escapedCharacter(source, at + 1, line);
          // A Unicode/hex escape may decode to a brace, but that brace was not
          // an interpolation delimiter in the source. Encode it as literal
          // doubled braces for the interpolation reader, preserving its origin.
          value += interpolated && (decoded.value === "{" || decoded.value === "}") ? decoded.value.repeat(2) : decoded.value;
          at = decoded.end; continue;
        }
        if (interpolated && source[at] === "{" && source[at + 1] !== "{") {
          value += "{"; at++;
          let depth = 1;
          while (at < source.length && depth > 0) {
            const nested = source[at];
            if (nested === '"' || nested === "'" || nested === "\n") throw new SubsetError("Nesta prática, use expressões sem aspas ou quebras de linha dentro de { } na interpolação.", line, true);
            if (nested === "{") depth++;
            if (nested === "}") depth--;
            value += nested; at++;
          }
          if (depth !== 0) throw new SubsetError("Feche a expressão interpolada com }.", startLine);
          continue;
        }
        if (interpolated && (source.startsWith("{{", at) || source.startsWith("}}", at))) { value += source.slice(at, at + 2); at += 2; continue; }
        value += source[at++];
      }
      if (!closed) throw new SubsetError("Feche o texto com aspas duplas.", startLine);
      push({ text: value, value, kind: interpolated ? "interpolated" : "string", line: startLine }); continue;
    }
    const number = source.slice(at).match(/^(?:\d+(?:\.\d+)?|\.\d+)(?:[eE][+-]?\d+)?[dD]?/);
    if (number) { push({ text: number[0], kind: "number", line }); at += number[0].length; continue; }
    const name = source.slice(at).match(/^[A-Za-z_][A-Za-z_\d]*/);
    if (name) { push({ text: name[0], kind: "name", line }); at += name[0].length; continue; }
    const operator = ["++", "--", "+=", "-=", "*=", "/=", "%=", "==", "!=", "<=", ">=", "&&", "||"].find(value => source.startsWith(value, at));
    if (operator) { push({ text: operator, kind: "symbol", line }); at += operator.length; continue; }
    if ("{}()[];,.+-*/%!=<>?:".includes(char)) { push({ text: char, kind: "symbol", line }); at++; continue; }
    throw new SubsetError(`O símbolo ${JSON.stringify(char)} ainda não é aceito neste laboratório. ${limitMessage}`, line, true);
  }
  result.push({ text: "<fim>", kind: "end", line }); return result;
}

const runtime = `
function __orbi_fail(line, text) { throw new Error("Linha " + line + ": " + text); }
function __orbi_int(value, line) { if (!Number.isInteger(value) || value < -2147483648 || value > 2147483647) __orbi_fail(line, "O valor saiu do intervalo de int deste laboratório. Use um projeto .NET para estudar overflow."); return value; }
function __orbi_div(left, right, integer, line) { if (integer && right === 0) __orbi_fail(line, "Não é possível dividir um int por zero."); return integer ? __orbi_int(Math.trunc(left / right), line) : left / right; }
function __orbi_mod(left, right, integer, line) { if (integer && right === 0) __orbi_fail(line, "Não é possível calcular resto com divisor zero."); return left % right; }
function __orbi_text(value) { return typeof value === "boolean" ? (value ? "True" : "False") : String(value); }
function __orbi_index(array, index, line) { if (!Number.isInteger(index) || index < 0 || index >= array.length) __orbi_fail(line, "O índice está fora dos limites do array."); return index; }
function __orbi_at(array, index, line) { return array[__orbi_index(array, index, line)]; }
function __orbi_array(size, value, line) { if (!Number.isInteger(size) || size < 0 || size > 10000) __orbi_fail(line, "Use um tamanho de array entre 0 e 10000 neste laboratório."); return Array.from({length:size}, () => value); }
function __orbi_finite(value, line) { if (!Number.isFinite(value)) __orbi_fail(line, "Esta oficina trabalha com double finito. Use .NET para estudar NaN e infinito."); return value; }
`;

const precedence: Record<string, number> = { "||": 1, "&&": 2, "==": 3, "!=": 3, "<": 4, ">": 4, "<=": 4, ">=": 4, "+": 5, "-": 5, "*": 6, "/": 6, "%": 6 };
const reserved = new Set(["if", "else", "for", "while", "foreach", "in", "true", "false", "new", "var", "const", "break", "continue", "return", "class", "using", "namespace", "int", "double", "string", "bool", "long", "decimal", "Console", "Math", "MathF"]);
const unsupportedWords = new Set(["const", "long", "decimal", "float", "char", "object", "dynamic", "short", "byte", "ushort", "uint", "ulong", "sbyte", "nint", "nuint", "using", "namespace", "class", "interface", "record", "struct", "async", "await", "Task", "System", "MathF", "switch", "do", "try", "throw", "return", "null"]);
// Literal payloads may be identical to keywords or punctuation. Every syntax
// match, including lookahead, must check the lexical category as well as text.
const syntaxMatches = (token: Token | undefined, text: string) => token?.text === text
  && token.kind === (text === "<fim>" ? "end" : /^[A-Za-z_][A-Za-z_\d]*$/.test(text) ? "name" : "symbol");

class Parser {
  private at = 0;
  private depth = 0;
  private loopDepth = 0;
  constructor(private readonly list: Token[], private readonly state: State, private readonly proof = false) {}
  private get current() { return this.list[this.at]; }
  private has(text: string, ahead = 0) { return syntaxMatches(this.list[this.at + ahead], text); }
  private take() { return this.list[this.at++]; }
  private accept(text: string) { if (!this.has(text)) return false; this.take(); return true; }
  private expect(text: string) { if (!this.has(text)) throw new SubsetError(`Esperava ${text === ";" ? "ponto e vírgula (;)" : JSON.stringify(text)} aqui.`, this.current.line); return this.take(); }
  private fail(text: string, token = this.current): never { throw new SubsetError(text, token.line); }
  private unsupported(token = this.current): never { throw new SubsetError(limitMessage, token.line, true); }
  private scoped<T>(action: () => T): T {
    if (++this.depth > 64) this.fail("Há blocos ou expressões demais dentro uns dos outros. Divida o programa.");
    const scope: Scope = { bindings: new Map(), descendants: new Set() }; this.state.scopes.push(scope);
    try { return action(); } finally {
      this.state.scopes.pop(); this.depth--;
      const parent = this.state.scopes.at(-1);
      if (parent) for (const name of [...scope.bindings.keys(), ...scope.descendants]) parent.descendants.add(name);
    }
  }
  private lookup(token: Token): Binding {
    for (let index = this.state.scopes.length - 1; index >= 0; index--) {
      const found = this.state.scopes[index].bindings.get(token.text); if (found) return found;
    }
    this.fail(`O nome ${token.text} não foi declarado neste escopo. Confira maiúsculas e minúsculas.`, token);
  }
  private declare(token: Token, type: ValueType, readOnly = false): Binding {
    if (token.kind !== "name" || reserved.has(token.text) || unsupportedWords.has(token.text)) this.fail("Escolha um nome de variável, sem usar uma palavra reservada.", token);
    const current = this.state.scopes.at(-1)!;
    if (current.descendants.has(token.text) || this.state.scopes.some(scope => scope.bindings.has(token.text))) this.fail(`O nome ${token.text} já foi declarado neste bloco ou em um bloco relacionado.`, token);
    const binding = { type, js: `__orbi_v${this.state.nextName++}`, readOnly }; current.bindings.set(token.text, binding); return binding;
  }
  private requireBool(expression: Expression) { if (expression.type !== "bool") this.fail(`A condição precisa ser bool (true ou false), mas recebeu ${expression.type}.`, { ...this.current, line: expression.line }); }
  private assignable(type: ValueType, expression: Expression) { if (!compatible(type, expression.type)) this.fail(`Não é possível atribuir ${expression.type} a ${type}. Use um valor do tipo declarado.`, { ...this.current, line: expression.line }); }
  private checked(type: ValueType, js: string, line: number) { return type === "int" ? `__orbi_int(${js},${line})` : type === "double" ? `__orbi_finite(${js},${line})` : js; }
  private typeName(allowVar = true): ValueType | "var" {
    const token = this.take();
    if (token.kind !== "name") this.unsupported(token);
    if (allowVar && token.text === "var") return "var";
    if (!scalarTypes.includes(token.text)) this.unsupported(token);
    const type = token.text as Scalar;
    if (this.accept("[")) { this.expect("]"); return `${type}[]`; }
    return type;
  }
  program(): string {
    const output: string[] = [];
    while (this.current.kind !== "end") output.push(this.statement());
    return output.join("\n");
  }
  private body(): string {
    if (this.has("{")) return this.statement();
    if (this.current.kind === "name" && (scalarTypes.includes(this.current.text) || this.has("var") || this.has("const"))) this.fail("Use chaves { } para declarar uma variável dentro deste bloco.");
    return this.scoped(() => `{${this.statement()}}`);
  }
  private statement(): string {
    if (this.current.kind === "name" && unsupportedWords.has(this.current.text)) this.unsupported();
    if (this.accept(";")) return ";";
    if (this.accept("{")) return this.scoped(() => {
      const output: string[] = [];
      while (!this.has("}")) { if (this.current.kind === "end") this.fail("Feche o bloco com }."); output.push(this.statement()); }
      this.expect("}"); return `{\n${output.join("\n")}\n}`;
    });
    if (this.accept("if")) {
      this.expect("("); const condition = this.expression(); this.requireBool(condition); this.expect(")");
      const yes = this.body(); const no = this.accept("else") ? `else ${this.body()}` : "";
      return `if(${condition.js})${yes}${no}`;
    }
    if (this.accept("while")) {
      this.expect("("); const condition = this.expression(); this.requireBool(condition); this.expect(")");
      this.loopDepth++; try { return `while(${condition.js})${this.body()}`; } finally { this.loopDepth--; }
    }
    if (this.accept("for")) return this.scoped(() => {
      this.expect("(");
      const init = this.has(";") ? "" : this.current.kind === "name" && (scalarTypes.includes(this.current.text) || this.has("var")) ? this.declaration() : this.actions(true);
      this.expect(";"); const condition = this.has(";") ? null : this.expression(); if (condition) this.requireBool(condition); this.expect(";");
      const update = this.has(")") ? "" : this.actions(true); this.expect(")");
      this.loopDepth++; try { return `{${init};for(;${condition?.js ?? "true"};${update})${this.body()}}`; } finally { this.loopDepth--; }
    });
    if (this.accept("foreach")) return this.scoped(() => {
      this.expect("("); const declaredType = this.typeName(); const name = this.take(); this.expect("in"); const collection = this.expression(); this.expect(")");
      if (!isArray(collection.type)) this.fail("Este foreach precisa receber um array simples.");
      const itemType = collection.type.slice(0, -2) as Scalar;
      if (declaredType !== "var" && !compatible(declaredType, itemType)) this.fail(`O item do array é ${itemType}, incompatível com ${declaredType} neste foreach.`);
      const variable = this.declare(name, declaredType === "var" ? itemType : declaredType, true);
      this.loopDepth++; try { return `for(const ${variable.js} of ${collection.js})${this.body()}`; } finally { this.loopDepth--; }
    });
    if (this.has("break") || this.has("continue")) { const token = this.take(); if (!this.loopDepth) this.fail(`${token.text} precisa estar dentro de um laço.`, token); this.expect(";"); return `${token.text};`; }
    if (this.accept("Console")) {
      this.expect("."); const method = this.take(); if (method.kind !== "name" || method.text !== "WriteLine") this.unsupported(method); this.expect("(");
      const value = this.has(")") ? null : this.expression(); this.expect(")"); this.expect(";");
      if (value && isArray(value.type)) this.fail("Para mostrar um array nesta oficina, percorra os itens com foreach.", method);
      return `console.log(${value ? this.proof ? value.js : `__orbi_text(${value.js})` : '""'});`;
    }
    if (this.current.kind === "name" && (scalarTypes.includes(this.current.text) || this.has("var"))) { const code = this.declaration(); this.expect(";"); return `${code};`; }
    if (this.current.kind !== "name" && !this.has("++") && !this.has("--")) this.unsupported();
    const code = this.actions(); this.expect(";"); return `${code};`;
  }
  private declaration(): string {
    const declaredType = this.typeName();
    const declarations: string[] = [];
    do {
      if (declarations.length && declaredType === "var") this.fail("Uma declaração com var aceita uma variável por instrução.");
      const name = this.take();
      if (!this.accept("=")) this.fail("Nesta oficina, declare a variável com um valor inicial. Declaração sem valor precisa de análise de atribuição do .NET.", name);
      const value = this.has("{") && declaredType !== "var" && isArray(declaredType) ? this.arrayInitializer(declaredType) : this.expression();
      const type = declaredType === "var" ? value.type : declaredType;
      this.assignable(type, value);
      const variable = this.declare(name, type);
      declarations.push(`${variable.js}=${this.checked(type, value.js, name.line)}`);
    } while (this.accept(","));
    return `let ${declarations.join(",")}`;
  }
  private actions(allowList = false): string {
    const result = [this.action()]; while (allowList && this.accept(",")) result.push(this.action()); return result.join(",");
  }
  private action(): string {
    const left = this.expression();
    if (this.current.kind === "symbol" && ["=", "+=", "-=", "*=", "/=", "%="].includes(this.current.text)) {
      const operator = this.take(); const right = this.expression();
      if (!left.target) this.fail("O lado esquerdo da atribuição precisa ser uma variável ou item de array.", operator);
      if (left.target.readOnly) this.fail("Esta variável é somente leitura e não pode ser alterada.", operator);
      let value = right;
      if (operator.text !== "=") value = this.binary(left, operator.text[0], right, operator.line);
      if (operator.text !== "=" && isNumeric(left.type) && isNumeric(value.type)) value = { ...value, type: left.type, js: left.type === "int" ? `Math.trunc(${value.js})` : value.js };
      this.assignable(left.type, value);
      return `${left.target.js}=${this.checked(left.type, value.js, operator.line)}`;
    }
    // A nested side effect does not make its enclosing arithmetic, conditional
    // or parenthesized expression a C# statement expression (CS0201).
    if (!left.statementExpression) this.fail("Use uma atribuição, ++, -- ou uma chamada de método nesta instrução; uma conta com incremento dentro não é uma instrução C#.", { ...this.current, line: left.line });
    return left.js;
  }
  private expression(minimum = 0): Expression {
    if (++this.depth > 64) this.fail("Simplifique esta expressão: há muitos níveis de parênteses.");
    try {
      let left = this.unary();
      while (this.current.kind === "symbol" && (precedence[this.current.text] ?? 0) > minimum) {
        const operator = this.take(); const right = this.expression(precedence[operator.text]); left = this.binary(left, operator.text, right, operator.line);
      }
      if (minimum === 0 && this.accept("?")) {
        this.requireBool(left); const yes = this.expression(); this.expect(":"); const no = this.expression();
        const type = yes.type === no.type ? yes.type : isNumeric(yes.type) && isNumeric(no.type) ? "double" : null;
        if (!type) this.fail("Os dois resultados desta escolha precisam ter tipos compatíveis.");
        left = { type, js: `(${left.js}?${yes.js}:${no.js})`, line: left.line, effect: left.effect || yes.effect || no.effect };
      }
      return left;
    } finally { this.depth--; }
  }
  private unary(): Expression {
    const token = this.current;
    if (token.kind === "symbol" && ["!", "+", "-", "++", "--"].includes(token.text)) {
      this.take();
      if (token.text === "-" && this.current.kind === "number" && this.current.text === "2147483648") { this.take(); return { type: "int", js: "-2147483648", line: token.line }; }
      const value = this.unary();
      if (token.text === "++" || token.text === "--") return this.increment(value, token, false);
      if (token.text === "!") { this.requireBool(value); return { type: "bool", js: `(!${value.js})`, line: token.line, effect: value.effect }; }
      if (!isNumeric(value.type)) this.fail("Este operador precisa receber um número.", token);
      return { type: value.type, js: this.checked(value.type, `(${token.text}${value.js})`, token.line), line: token.line, effect: value.effect };
    }
    if (this.has("(") && (this.has("int", 1) || this.has("double", 1)) && this.has(")", 2)) {
      this.take(); const type = this.take().text as "int" | "double"; this.take(); const value = this.unary();
      if (!isNumeric(value.type)) this.fail(`O cast para ${type} precisa receber um número.`, token);
      return { type, js: this.checked(type, type === "int" ? `Math.trunc(${value.js})` : value.js, token.line), line: token.line, effect: value.effect };
    }
    let value = this.primary();
    while (true) {
      if (this.accept("[")) {
        if (!isArray(value.type)) this.unsupported(token);
        const index = this.expression(); this.expect("]");
        if (index.type !== "int" || index.effect || value.effect) this.fail("O índice precisa ser int, sem atribuições ou incrementos dentro dos colchetes.");
        const type = value.type.slice(0, -2) as Scalar;
        value = { type, js: `__orbi_at(${value.js},${index.js},${token.line})`, line: token.line, target: { type, js: `${value.js}[__orbi_index(${value.js},${index.js},${token.line})]`, readOnly: false } };
      } else if (this.accept(".")) {
        const property = this.take(); if (property.kind !== "name" || property.text !== "Length" || value.type !== "string" && !isArray(value.type)) this.unsupported(property);
        value = { type: "int", js: `(${value.js}).length`, line: token.line, effect: value.effect };
      } else if (this.has("++") || this.has("--")) { value = this.increment(value, this.take(), true); }
      else break;
    }
    return value;
  }
  private increment(value: Expression, operator: Token, postfix: boolean): Expression {
    if (!value.target || value.target.readOnly || !isNumeric(value.type)) this.fail("++ e -- precisam de uma variável numérica que possa ser alterada.", operator);
    const update = `(${value.target.js}${operator.text})`;
    return { type: value.type, js: `(${this.checked(value.type, `${value.js}${operator.text === "++" ? "+" : "-"}1`, operator.line)},${postfix ? update : `${operator.text}${value.target.js}`})`, line: operator.line, effect: true, statementExpression: true };
  }
  private primary(): Expression {
    const token = this.take();
    if (token.kind === "name" && unsupportedWords.has(token.text)) this.unsupported(token);
    if (token.kind === "number") {
      const double = /[.eEdD]/.test(token.text); const value = Number(token.text.replace(/[dD]$/, ""));
      if (!Number.isFinite(value) || !double && value > 2147483647) this.fail("Este literal numérico está fora dos tipos aceitos pela oficina.", token);
      return { type: double ? "double" : "int", js: String(value), line: token.line, numericLiteral: value };
    }
    if (token.kind === "string") return { type: "string", js: JSON.stringify(token.value), line: token.line };
    if (token.kind === "interpolated") return this.interpolation(token);
    if (syntaxMatches(token, "true") || syntaxMatches(token, "false")) return { type: "bool", js: token.text, line: token.line };
    if (syntaxMatches(token, "(")) { const value = this.expression(); this.expect(")"); return { ...value, statementExpression: undefined, js: `(${value.js})` }; }
    if (syntaxMatches(token, "new")) {
      const element = this.take(); if (element.kind !== "name" || !scalarTypes.includes(element.text)) this.unsupported(element);
      const type = element.text as Scalar;
      this.expect("[");
      if (this.accept("]")) return this.arrayInitializer(`${type}[]`);
      const size = this.expression(); this.expect("]");
      if (size.type !== "int") this.fail("O tamanho do array precisa ser int.", token);
      if (this.has("{")) this.unsupported();
      const initial = type === "string" ? "null" : type === "bool" ? "false" : "0";
      if (type === "string") this.fail("Nesta oficina, crie arrays de string com valores entre chaves, evitando itens null.", token);
      return { type: `${type}[]` as ValueType, js: `__orbi_array(${size.js},${initial},${token.line})`, line: token.line, effect: size.effect };
    }
    if (syntaxMatches(token, "Math")) return this.math(token);
    if (token.kind === "name" && !reserved.has(token.text)) { const binding = this.lookup(token); return { type: binding.type, js: binding.js, line: token.line, target: binding }; }
    this.unsupported(token);
  }
  private arrayInitializer(type: `${Scalar}[]`): Expression {
    const start = this.expect("{"); const element = type.slice(0, -2) as Scalar; const values: Expression[] = [];
    if (!this.has("}")) do { const value = this.expression(); this.assignable(element, value); values.push(value); if (values.length > 10000) this.fail("Use até 10000 itens neste array."); } while (this.accept(",") && !this.has("}"));
    this.expect("}");
    return { type, js: `[${values.map(value => this.checked(element, value.js, value.line)).join(",")}]`, line: start.line, effect: values.some(value => value.effect) };
  }
  private interpolation(token: Token): Expression {
    const pieces: string[] = []; const source = token.value!; let at = 0, text = "";
    const flush = () => { if (text) { pieces.push(JSON.stringify(text)); text = ""; } };
    while (at < source.length) {
      if (source.startsWith("{{", at) || source.startsWith("}}", at)) { text += source[at]; at += 2; continue; }
      if (source[at] === "{") {
        flush(); const end = source.indexOf("}", at + 1); if (end < 0) this.fail("Feche a interpolação com }.", token);
        const parser = new Parser(tokens(source.slice(at + 1, end), token.line), this.state, this.proof); const value = parser.expression();
        if (parser.current.kind !== "end" || isArray(value.type) || value.effect) this.fail("Nesta interpolação, use uma expressão simples, sem formatação ou alterações de variável.", token);
        pieces.push(`__orbi_text(${value.js})`); at = end + 1; continue;
      }
      if (source[at] === "}") this.fail("Use }} para escrever uma chave de fechamento no texto.", token);
      text += source[at++];
    }
    flush(); return { type: "string", js: `(${pieces.length ? pieces.join("+") : '""'})`, line: token.line };
  }
  private math(token: Token): Expression {
    this.expect("."); const method = this.take(); const arities: Record<string, number> = { Abs: 1, Min: 2, Max: 2, Floor: 1, Ceiling: 1, Sqrt: 1, Pow: 2 };
    if (method.kind !== "name" || !Object.prototype.hasOwnProperty.call(arities, method.text)) this.unsupported(method);
    this.expect("("); const args = [this.expression()]; while (this.accept(",")) args.push(this.expression()); this.expect(")");
    if (args.length !== arities[method.text] || args.some(arg => !isNumeric(arg.type))) this.fail("Confira a quantidade de argumentos numéricos desta operação Math.", method);
    const type = ["Abs", "Min", "Max"].includes(method.text) && args.every(arg => arg.type === "int") ? "int" : "double";
    const names: Record<string, string> = { Abs: "abs", Min: "min", Max: "max", Floor: "floor", Ceiling: "ceil", Sqrt: "sqrt", Pow: "pow" };
    return { type, js: this.checked(type, `Math.${names[method.text]}(${args.map(arg => arg.js).join(",")})`, token.line), line: token.line, effect: args.some(arg => arg.effect), statementExpression: true };
  }
  private binary(left: Expression, operator: string, right: Expression, line: number): Expression {
    const effect = left.effect || right.effect;
    if (operator === "&&" || operator === "||") { this.requireBool(left); this.requireBool(right); return { type: "bool", js: `(${left.js}${operator}${right.js})`, line, effect }; }
    if (operator === "==" || operator === "!=") {
      if (left.type !== right.type && !(isNumeric(left.type) && isNumeric(right.type))) this.fail(`Não é possível comparar ${left.type} com ${right.type}.`, { ...this.current, line });
      return { type: "bool", js: `(${left.js}${operator === "==" ? "===" : "!=="}${right.js})`, line, effect };
    }
    if (["<", ">", "<=", ">="].includes(operator)) {
      if (!isNumeric(left.type) || !isNumeric(right.type)) this.fail("Esta comparação precisa de dois valores numéricos.", { ...this.current, line });
      return { type: "bool", js: `(${left.js}${operator}${right.js})`, line, effect };
    }
    if (operator === "+" && (left.type === "string" || right.type === "string")) {
      if (isArray(left.type) || isArray(right.type)) this.unsupported();
      return { type: "string", js: `(__orbi_text(${left.js})+__orbi_text(${right.js}))`, line, effect };
    }
    if (!isNumeric(left.type) || !isNumeric(right.type)) this.fail(`O operador ${operator} precisa de valores numéricos.`, { ...this.current, line });
    const type = left.type === "double" || right.type === "double" ? "double" : "int";
    const js = operator === "/" ? `__orbi_div(${left.js},${right.js},${type === "int"},${line})` : operator === "%" ? `__orbi_mod(${left.js},${right.js},${type === "int"},${line})` : `(${left.js}${operator}${right.js})`;
    return { type, js: this.checked(type, js, line), line, effect };
  }
}

/** Validate user code and hidden checks in the same lexical environment. */
export function compileCSharpSubset(code: string, verificationCode = ""): CSharpSubsetCompilation {
  const state: State = { scopes: [{ bindings: new Map(), descendants: new Set() }], nextName: 0 };
  let verifying = false;
  try {
    const source = new Parser(tokens(code), state).program();
    verifying = true;
    const proof = verificationCode ? new Parser(tokens(verificationCode), state, true).program() : "";
    return { ok: true, code: runtime + "\n" + source, verificationCode: proof };
  } catch (error) {
    if (error instanceof SubsetError) return { ok: false, error: `${verifying ? "Não foi possível conferir a entrega: " : `Linha ${error.line}: `}${error.message}`, line: verifying ? null : error.line };
    return { ok: false, error: "Não foi possível analisar este programa no laboratório C# inicial. Simplifique a expressão ou use um projeto .NET.", line: null };
  }
}
