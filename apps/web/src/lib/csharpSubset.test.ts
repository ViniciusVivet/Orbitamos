import { describe, expect, it } from "vitest";
import { compileCSharpSubset } from "./csharpSubset";
import { variableActivities } from "./csharpVariables";
import { conditionsActivities, conditionsPilot } from "./csharpConditions";
import { loopsActivities, loopsPilot } from "./csharpLoops";
import { csharpPilot } from "./csharpTrack";
import { withCSharpInputs } from "./csharpFeedback";

function execute(code: string, proof = "") {
  const compiled = compileCSharpSubset(code, proof);
  if (!compiled.ok) throw new Error(compiled.error);
  const output: string[] = [], verification: string[] = [];
  let current = output;
  const run = new Function("console", "beginVerification", `${compiled.code}\nbeginVerification();\n${compiled.verificationCode}`);
  run({ log: (...values: unknown[]) => current.push(values.map(String).join(" ")) }, () => { current = verification; });
  return { output: output.join("\n"), verification: verification.join("\n") };
}

describe("typed C# teaching subset", () => {
  it.each([
    ['int value = "5";', /string a int/],
    ['int value = 3; value = "5"; Console.WriteLine(value);', /string a int/],
    ['var value = 3; value = "5";', /string a int/],
    ['bool active = true; active = 1;', /int a bool/],
    ['string name = "Lia"; name = 7;', /int a string/],
    ['int value = 1.0;', /double a int/],
    ['int value = 1; value = 2.5;', /double a int/],
    ['int value = 1; Console.WriteLine(value == "1");', /comparar int com string/],
    ['bool active = true; Console.WriteLine(active == 1);', /comparar bool com int/],
  ])("rejects incompatible declarations, reassignments and equality: %s", (code, message) => {
    const result = compileCSharpSubset(code);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(message);
  });

  it.each([
    'if (1) { Console.WriteLine("x"); }',
    'if ("true") { Console.WriteLine("x"); }',
    'while (2) { break; }',
    'for (int i = 0; i; i++) { }',
    'bool ready = true && 1;',
    'bool ready = !5;',
    'int value = 1; value ? 2 : 3;',
  ])("requires actual booleans in conditions and logical operators: %s", code => {
    const result = compileCSharpSubset(code);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("bool");
  });

  it("keeps division, integer arithmetic, equality and concatenation type-aware", () => {
    expect(execute('int minutes = 135; int hours = minutes / 60; int rest = minutes % 60; double ratio = 5 / 2; double precise = 5 / 2.0; Console.WriteLine(hours); Console.WriteLine(rest); Console.WriteLine(ratio); Console.WriteLine(precise); Console.WriteLine(-5 / 2); Console.WriteLine(1 + 2 * 3);')).toEqual({ output: "2\n15\n2\n2.5\n-2\n7", verification: "" });
    expect(execute('int count = 3; count += 2; count *= 2; count--; bool paid = count == 9; Console.WriteLine("Paid: " + paid); Console.WriteLine(paid);', 'Console.WriteLine(count == 9); Console.WriteLine(paid == true);'))
      .toEqual({ output: "Paid: True\nTrue", verification: "true\ntrue" });
  });

  it("does not parse keywords, operators or comments inside string literals", () => {
    const code = '/* using class async Console.WriteLine(99); */\nstring text = "class using int value = 1; // still text";\nConsole.WriteLine(text);\nConsole.WriteLine("+");\nConsole.WriteLine("true");\nConsole.WriteLine("!=");\nConsole.WriteLine("quote: \\\"ok\\\"");';
    expect(execute(code).output).toBe('class using int value = 1; // still text\n+\ntrue\n!=\nquote: "ok"');
    expect(execute('string path = @"C:\\folder\\file"; Console.WriteLine(path);').output).toBe('C:\\folder\\file');
    expect(execute('int count = 2; Console.WriteLine($"Total {{itens}}: {count + 1}");').output).toBe('Total {itens}: 3');
  });

  it("preserves escaped braces as literal text instead of interpolation syntax", () => {
    expect(execute('int count = 2; Console.WriteLine($"\\u007Bcount\\u007D");').output).toBe('{count}');
    expect(execute('Console.WriteLine($"\\u007B"); Console.WriteLine($"\\u007D");').output).toBe('{\n}');
    expect(execute('int count = 2; Console.WriteLine($"\\x7B{count}\\x7D");').output).toBe('{2}');
    expect(execute('int count = 2; Console.WriteLine($"{{count}} {count} \\u007B\\u007B");').output).toBe('{count} 2 {{');
  });

  it.each([
    'Console.WriteLine("not closed);',
    '/* missing end',
    'if (true) { Console.WriteLine("x");',
    'int value = 1 Console.WriteLine(value);',
    'Console."WriteLine"("x");',
    'int[] values = { 1 }; Console.WriteLine(values."Length");',
    'int value = 1 "==" 1;',
    'Console.WriteLine(("int" ")" 2.5);',
    'Console.WriteLine((int ")" 2.5);',
    'Console.WriteLine(("double")2);',
    'Console.WriteLine("(" 2 ")");',
    '"if" (true) { Console.WriteLine(1); }',
    'if "(" true) { Console.WriteLine(1); }',
    'Console.WriteLine(2 "+" 3);',
    'Console.WriteLine(2 ")";',
    'Console.WriteLine(2) ";"',
    'int value "=" 1;',
    '"int" value = 1;',
    'int[] values = { 1 }; foreach (int value "in" values) { }',
    'Console.WriteLine(Math."Abs"(2));',
  ])("rejects malformed syntax instead of turning arbitrary tokens into JavaScript: %s", code => {
    expect(compileCSharpSubset(code).ok).toBe(false);
  });

  it.each([
    'int i = 0; i++ + 2; Console.WriteLine(i);',
    'int i = 0; i++ == 0;',
    'int i = 0; bool ready = true; ready ? i++ : i--;',
    'int i = 0; Math.Abs(i++) + 2;',
    'int i = 0; for (; i < 1; +i++) { }',
    'int i = 0; for ((i++); i < 2; i++) { }',
    'int i = 0; for (; i < 2; (i++)) { }',
    'int i = 0; i++, i++;',
    'int i = 0; new int[i++];',
  ])("requires a valid root statement expression rather than a nested side effect: %s", code => {
    expect(compileCSharpSubset(code).ok).toBe(false);
  });

  it("keeps actual casts, method calls, increments and for expression lists valid", () => {
    expect(execute('int i = 0; ++i; i++; Math.Abs(i++); for (i = 0; i < 2; i++, Math.Abs(i)) { } Console.WriteLine(i); Console.WriteLine((/* string \"int\" is not syntax */ int /* ) */)2.5);').output).toBe('2\n2');
    expect(execute('Console.WriteLine("int"); Console.WriteLine(")"); Console.WriteLine("("); Console.WriteLine("if"); Console.WriteLine("in"); Console.WriteLine("="); /* \"for\" \";\" */').output).toBe('int\n)\n(\nif\nin\n=');
  });

  it("checks declarations and actual lexical scopes", () => {
    expect(execute('int total = 0; for (int i = 1; i <= 3; i++) { total += i; } if (total == 6) { string message = "done"; Console.WriteLine(message); } Console.WriteLine(total);').output).toBe('done\n6');
    for (const code of [
      'Console.WriteLine(missing);',
      'if (true) { int inside = 1; } Console.WriteLine(inside);',
      'for (int i = 0; i < 1; i++) { } Console.WriteLine(i);',
      'int name = 1; if (true) { int name = 2; }',
      'if (true) { int name = 1; } int name = 2;',
      'int name = 1; int name = 2;',
      'int name = name + 1;',
    ]) expect(compileCSharpSubset(code).ok, code).toBe(false);
    expect(execute('if (true) { int x = 1; Console.WriteLine(x); } if (true) { int x = 2; Console.WriteLine(x); }').output).toBe('1\n2');
  });

  it("checks array initialization, elements, indices and readonly foreach variables", () => {
    expect(execute('int[] values = new int[] { 1, 2, 3 }; int total = 0; foreach (var value in values) { total += value; } values[0] = 4; Console.WriteLine(total); Console.WriteLine(values[0]); Console.WriteLine(values.Length);').output).toBe('6\n4\n3');
    expect(execute('int[] values = new int[2]; values[1] = 9; Console.WriteLine(values[0]); Console.WriteLine(values[1]);').output).toBe('0\n9');
    expect(execute('string[] names = { "Lia", "Bia" }; foreach (string name in names) { Console.WriteLine(name); }').output).toBe('Lia\nBia');
    for (const code of [
      'int[] values = { 1, "2" };',
      'int[] values = { 1 }; values[0] = "2";',
      'int[] values = { 1 }; Console.WriteLine(values[0.5]);',
      'int[] values = { 1 }; foreach (var value in values) { value = 2; }',
      'int[] values = { 1 }; values.Length = 7;',
      'int[] values = { 1 }; values = new string[] { "a" };',
    ]) expect(compileCSharpSubset(code).ok, code).toBe(false);
    expect(() => execute('int[] values = { 1 }; Console.WriteLine(values[1]);')).toThrow(/fora dos limites/);
  });

  it("handles statement bodies, loops, break/continue and casts within the supported contract", () => {
    expect(execute('int n = 3; while (n > 0) n--; if (n == 0) Console.WriteLine("empty"); else Console.WriteLine("work"); for (int i = 0; i < 4; i++) { if (i == 1) continue; if (i == 3) break; Console.WriteLine(i); } Console.WriteLine((int)2.9);').output).toBe('empty\n0\n2\n2');
    expect(compileCSharpSubset('break;').ok).toBe(false);
    expect(compileCSharpSubset('if (true) int value = 3;').ok).toBe(false);
  });

  it.each(['using System; class Program {}', 'decimal price = 2.5m;', 'long count = 1;', 'int count;', 'const int count = 1;', 'Console.ReadLine();', 'Math.Round(1.5);', 'fetch("https://example.com");', 'Console.WriteLine(globalThis);'])
    ("fails closed for unimplemented .NET or JavaScript constructs: %s", code => {
      expect(compileCSharpSubset(code).ok).toBe(false);
    });

  it("keeps supported Math operations numeric and checks runtime limits", () => {
    expect(execute('Console.WriteLine(Math.Max(2, 5)); Console.WriteLine(Math.Abs(-3)); Console.WriteLine(Math.Pow(2, 3));').output).toBe('5\n3\n8');
    expect(compileCSharpSubset('Console.WriteLine(Math.Max("2", 5));').ok).toBe(false);
    expect(() => execute('int zero = 0; Console.WriteLine(1 / zero);')).toThrow(/int por zero/);
    expect(() => execute('int value = 2147483647; value++;')).toThrow(/intervalo de int/);
    expect(execute('int minimum = -2147483648; Console.WriteLine(minimum);').output).toBe('-2147483648');
  });

  it("maps source errors without exposing generated JavaScript lines", () => {
    const result = compileCSharpSubset('int count = 1;\n\ncount = "wrong";');
    expect(result.ok).toBe(false);
    if (!result.ok) { expect(result.line).toBe(3); expect(result.error).toContain('Linha 3:'); }
    const proof = compileCSharpSubset('int count = 1;', 'Console.WriteLine(missing == 1);');
    expect(proof.ok).toBe(false);
    if (!proof.ok) { expect(proof.line).toBeNull(); expect(proof.error).toContain('conferir a entrega'); }
  });

  it("never binds learner variable names to worker globals or internal helpers", () => {
    expect(execute('int console = 4; int self = 2; int __orbi_int = 1; Console.WriteLine(console + self + __orbi_int);').output).toBe('7');
  });

  it("rejects excessively nested expressions before exhausting the JavaScript stack", () => {
    expect(compileCSharpSubset(`int n = ${'('.repeat(100)}1${')'.repeat(100)};`).ok).toBe(false);
  });
});

describe("current C# curriculum remains executable", () => {
  for (const [name, pilot] of [['variables', csharpPilot], ['conditions', conditionsPilot], ['loops', loopsPilot]] as const) {
    it(`executes the ${name} guided reference and original hidden checks`, () => {
      const result = execute(pilot.steps[0].codigoExemplo!, pilot.testCode);
      expect(result.output).toBe(pilot.exemplo);
      expect(result.verification).toMatch(/^true(?:\ntrue)*$/);
    });
  }
  for (const activity of [...variableActivities, ...conditionsActivities, ...loopsActivities]) {
    if (activity.kind !== "code") continue;
    it(`executes ${activity.title} and its original proof`, () => {
      const result = execute(activity.solution, activity.verification);
      expect(result.output).toBe(activity.expected);
      expect(result.verification).toBe(activity.verification.split('\n').map(() => 'true').join('\n'));
      for (const scenario of activity.cases ?? []) expect(execute(withCSharpInputs(activity.solution, scenario.values)).output, scenario.label).toBe(scenario.expected);
    });
  }
  it.each([
    ['string nome = "Ana"; int idade = 20; Console.WriteLine(nome); Console.WriteLine(idade);', 'Ana\n20'],
    ['int totalMinutos = 135; int horas = totalMinutos / 60; int minutos = totalMinutos % 60; Console.WriteLine(horas); Console.WriteLine(minutos);', '2\n15'],
    ['int idade = 17; if (idade >= 18) { Console.WriteLine("adulto"); } else { Console.WriteLine("menor"); }', 'menor'],
    ['int total = 0; for (int numero = 1; numero <= 5; numero++) { total += numero; } Console.WriteLine(total);', '15'],
  ])("executes the four existing laboratory exercise contracts", (code, output) => { expect(execute(code).output).toBe(output); });
});
