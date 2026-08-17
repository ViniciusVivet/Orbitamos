"use client";

import { autocompletion, snippetCompletion, startCompletion, type Completion, type CompletionContext, type CompletionResult } from "@codemirror/autocomplete";
import { indentWithTab } from "@codemirror/commands";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { HighlightStyle, StreamLanguage, syntaxHighlighting } from "@codemirror/language";
import { csharp } from "@codemirror/legacy-modes/mode/clike";
import { setDiagnostics, type Diagnostic } from "@codemirror/lint";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { oneDarkTheme } from "@codemirror/theme-one-dark";
import { tags } from "@lezer/highlight";
import { basicSetup } from "codemirror";
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from "react";

export type EditorLanguage = "javascript" | "typescript" | "python" | "csharp";

const keywords = (items: string[], detail: string, section: string): Completion[] =>
  items.map((label) => ({ label, detail, type: "keyword", section }));
const methods = (items: string[], detail: string, section: string): Completion[] =>
  items.map((label) => ({ label, detail, apply: `${label}()`, type: "method", section, info: `${detail}: ${label}().` }));

const PYTHON_COMPLETIONS: Completion[] = [
  ...keywords(["def", "return", "if", "elif", "else", "for", "while", "in", "not", "and", "or", "import", "from", "class", "try", "except", "with", "pass", "break", "continue", "None", "True", "False"], "palavra-chave", "Python"),
  ...["print", "len", "range", "str", "int", "float", "list", "dict", "set", "tuple", "sum", "min", "max", "round", "sorted", "enumerate", "zip", "isinstance", "input"].map((label) => ({ label, detail: "função nativa", apply: `${label}()`, type: "function", section: "Python", info: `Função nativa Python: ${label}().` })),
  ...methods(["append", "extend", "insert", "remove", "pop", "sort", "reverse", "count", "index", "keys", "values", "items", "get", "update", "split", "join", "strip", "replace", "lower", "upper", "startswith", "endswith"], "método Python", "Métodos"),
  snippetCompletion("def ${nome}(${parametros}):\n\t${}", { label: "def", detail: "nova função", type: "function", section: "Snippets", info: "Cria uma função. Use Tab para navegar pelos campos." }),
  snippetCompletion("for ${item} in ${colecao}:\n\t${}", { label: "for", detail: "percorrer coleção", type: "keyword", section: "Snippets" }),
  snippetCompletion("if ${condicao}:\n\t${}", { label: "if", detail: "condicional", type: "keyword", section: "Snippets" }),
  snippetCompletion("class ${Nome}:\n\tdef __init__(self, ${parametros}):\n\t\t${}", { label: "class", detail: "nova classe", type: "class", section: "Snippets" }),
];

const JAVASCRIPT_COMPLETIONS: Completion[] = [
  { label: "log", displayLabel: "console.log", detail: "exibir no console", apply: "console.log()", type: "function", section: "JavaScript" },
  ...keywords(["let", "const", "return", "if", "else", "switch", "case", "for", "while", "try", "catch", "throw", "async", "await", "new", "class", "extends", "import", "export"], "palavra-chave", "JavaScript"),
  ...methods(["map", "filter", "find", "findIndex", "reduce", "forEach", "some", "every", "includes", "push", "pop", "slice", "splice", "sort", "join"], "método de array", "Arrays"),
  ...methods(["toUpperCase", "toLowerCase", "trim", "replace", "split", "startsWith", "endsWith", "includes"], "método de string", "Strings"),
  snippetCompletion("function ${nome}(${parametros}) {\n\t${}\n}", { label: "function", detail: "nova função", type: "function", section: "Snippets", info: "Cria uma função. Use Tab para navegar pelos campos." }),
  snippetCompletion("for (let ${i} = 0; ${i} < ${limite}; ${i}++) {\n\t${}\n}", { label: "for", detail: "laço indexado", type: "keyword", section: "Snippets" }),
  snippetCompletion("const ${resultado} = ${array}.map((${item}) => ${});", { label: "map", detail: "transformar array", type: "method", section: "Snippets" }),
  snippetCompletion("try {\n\t${}\n} catch (${erro}) {\n\tconsole.error(${erro});\n}", { label: "try", detail: "tratamento de erro", type: "keyword", section: "Snippets" }),
];

const CSHARP_COMPLETIONS: Completion[] = [
  ...keywords(["public", "private", "protected", "internal", "static", "class", "interface", "namespace", "using", "return", "if", "else", "switch", "case", "for", "foreach", "while", "try", "catch", "finally", "new", "var", "async", "await", "null", "true", "false"], "palavra-chave C#", "C#"),
  ...["string", "int", "long", "double", "decimal", "bool", "object", "void", "List", "Dictionary", "DateTime", "Task"].map((label) => ({ label, detail: "tipo C#", type: "type", section: "Tipos" })),
  { label: "cw", displayLabel: "Console.WriteLine", detail: "exibir no console", apply: "Console.WriteLine();", type: "function", section: "C#" },
  snippetCompletion("Console.WriteLine(${valor});", { label: "Console.WriteLine", detail: "exibir valor", type: "function", section: "Snippets" }),
  snippetCompletion("public class ${Nome}\n{\n\t${}\n}", { label: "class", detail: "nova classe", type: "class", section: "Snippets" }),
  snippetCompletion("public static void Main(string[] args)\n{\n\t${}\n}", { label: "Main", detail: "ponto de entrada", type: "method", section: "Snippets" }),
  snippetCompletion("foreach (var ${item} in ${colecao})\n{\n\t${}\n}", { label: "foreach", detail: "percorrer coleção", type: "keyword", section: "Snippets" }),
];

const COMMON_MOBILE_KEYS = ["Tab", "(", ")", "[", "]", "{", "}", '"', "'", "=", "_"];

const accessibleHighlightStyle = HighlightStyle.define([
  { tag: [tags.keyword, tags.modifier, tags.controlKeyword], color: "#f59cf6" },
  { tag: [tags.name, tags.variableName, tags.propertyName, tags.function(tags.variableName)], color: "#8cc8ff" },
  { tag: [tags.string, tags.special(tags.string)], color: "#b6ddff" },
  { tag: [tags.number, tags.bool, tags.null], color: "#ffb77c" },
  { tag: [tags.operator, tags.punctuation], color: "#ff9b94" },
  { tag: tags.comment, color: "#b8c0cc", fontStyle: "italic" },
  { tag: [tags.typeName, tags.className], color: "#ffe08a" },
]);

function documentSymbols(context: CompletionContext, language: EditorLanguage): Completion[] {
  const text = context.state.doc.toString();
  const pattern = language === "python"
    ? /(?:def|class)\s+([A-Za-z_]\w*)|^\s*([A-Za-z_]\w*)\s*=/gm
    : language === "csharp"
      ? /(?:class|interface|(?:void|string|int|double|bool|var))\s+([A-Za-z_]\w*)/g
      : /(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)/g;
  const names = new Set<string>();
  for (const match of text.matchAll(pattern)) names.add(match[1] || match[2]);
  return Array.from(names).map((label) => ({ label, detail: "definido neste código", type: "variable", section: "Seu código", boost: 20 }));
}

function completionSource(language: EditorLanguage) {
  const options = language === "python" ? PYTHON_COMPLETIONS : language === "csharp" ? CSHARP_COMPLETIONS : JAVASCRIPT_COMPLETIONS;
  return (context: CompletionContext): CompletionResult | null => {
    const word = context.matchBefore(/[\w.]*/);
    if (!word || (word.from === word.to && !context.explicit)) return null;
    return { from: word.from, options: [...documentSymbols(context, language), ...options], validFor: /^[\w.]*$/ };
  };
}

function languageExtension(language: EditorLanguage) {
  if (language === "python") return python();
  if (language === "csharp") return StreamLanguage.define(csharp);
  return javascript({ typescript: language === "typescript" });
}

export type ReliableCodeEditorHandle = {
  focus: () => void;
  getValue: () => string;
  insertText: (text: string) => void;
  showCompletions: () => void;
};

const ReliableCodeEditor = forwardRef<ReliableCodeEditorHandle, {
  value: string;
  language: EditorLanguage;
  onChange: (value: string) => void;
  errorLine?: number | null;
  errorMessage?: string;
}>(function ReliableCodeEditor({ value, language, onChange, errorLine, errorMessage }, forwardedRef) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<EditorView | null>(null);
  const initialValueRef = useRef(value);

  const extensions = useMemo(() => [
    basicSetup,
    oneDarkTheme,
    syntaxHighlighting(accessibleHighlightStyle),
    languageExtension(language),
    autocompletion({ override: [completionSource(language)], activateOnTyping: true, maxRenderedOptions: 40 }),
    keymap.of([indentWithTab]),
    EditorState.tabSize.of(language === "python" ? 4 : 2),
    EditorView.lineWrapping,
    EditorView.contentAttributes.of({
      "aria-label": "Editor de código",
      "aria-description": "Digite sua solução. Use Control mais Enter para executar.",
      autocapitalize: "off", autocomplete: "off", autocorrect: "off", spellcheck: "false",
    }),
    EditorView.theme({
      "&": { height: "100%", backgroundColor: "#0d1117", fontSize: "16px" },
      ".cm-scroller": { overflow: "auto", fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" },
      ".cm-content": { minHeight: "100%", padding: "12px 0", caretColor: "#22d3ee" },
      ".cm-line": { padding: "0 12px 0 6px" },
      ".cm-gutters": { backgroundColor: "#0d1117", borderRight: "1px solid rgba(255,255,255,.06)" },
      ".cm-activeLine, .cm-activeLineGutter": { backgroundColor: "rgba(34,211,238,.055)" },
      ".cm-focused": { outline: "none" },
      ".cm-tooltip-autocomplete": { border: "1px solid rgba(34,211,238,.32)", borderRadius: "10px", overflow: "hidden", backgroundColor: "#0b1119", boxShadow: "0 18px 50px rgba(0,0,0,.55)" },
      ".cm-tooltip-autocomplete > ul": { maxHeight: "min(320px, 45vh)", fontFamily: "ui-monospace, monospace" },
      ".cm-tooltip-autocomplete > ul > li": { minHeight: "30px", padding: "5px 10px", color: "#dbeafe" },
      ".cm-tooltip-autocomplete > ul > li[aria-selected]": { background: "linear-gradient(90deg, rgba(6,182,212,.3), rgba(139,92,246,.28))", color: "#fff" },
      ".cm-completionMatchedText": { color: "#67e8f9", textDecoration: "none", fontWeight: "800" },
      ".cm-completionDetail": { color: "#94a3b8", fontStyle: "normal", marginLeft: "10px" },
      ".cm-completionIcon": { opacity: "1", width: "18px" },
      ".cm-completionIcon-keyword": { color: "#f0abfc" },
      ".cm-completionIcon-function, .cm-completionIcon-method": { color: "#67e8f9" },
      ".cm-completionIcon-variable, .cm-completionIcon-property": { color: "#86efac" },
      ".cm-completionIcon-class, .cm-completionIcon-type": { color: "#fde68a" },
      ".cm-completionInfo": { border: "1px solid rgba(139,92,246,.3)", borderRadius: "8px", backgroundColor: "#0b1119", color: "#dbeafe", padding: "10px" },
      "@media (min-width: 768px)": { "&": { fontSize: "13px" } },
    }),
    EditorView.updateListener.of((update) => { if (update.docChanged) onChange(update.state.doc.toString()); }),
  ], [language, onChange]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const editor = new EditorView({ state: EditorState.create({ doc: initialValueRef.current, extensions }), parent: host });
    editorRef.current = editor;
    return () => { editor.destroy(); editorRef.current = null; };
  }, [extensions]);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const current = editor.state.doc.toString();
    if (current !== value) editor.dispatch({ changes: { from: 0, to: current.length, insert: value } });
  }, [value]);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const diagnostics: Diagnostic[] = [];
    if (errorLine && errorLine >= 1 && errorLine <= editor.state.doc.lines) {
      const line = editor.state.doc.line(errorLine);
      diagnostics.push({ from: line.from, to: Math.max(line.from + 1, line.to), severity: "error", message: errorMessage || "O erro aconteceu nesta linha." });
    }
    editor.dispatch(setDiagnostics(editor.state, diagnostics));
    if (diagnostics[0]) editor.dispatch({ selection: { anchor: diagnostics[0].from }, scrollIntoView: true });
  }, [errorLine, errorMessage]);

  const insertText = (text: string) => {
    const editor = editorRef.current;
    if (!editor) return;
    const insertion = text === "Tab" ? (language === "python" ? "    " : "  ") : text;
    const { from, to } = editor.state.selection.main;
    editor.dispatch({ changes: { from, to, insert: insertion }, selection: { anchor: from + insertion.length }, scrollIntoView: true });
    editor.focus();
  };
  const showCompletions = () => { const editor = editorRef.current; if (editor) { editor.focus(); startCompletion(editor); } };

  useImperativeHandle(forwardedRef, () => ({
    focus: () => editorRef.current?.focus(),
    getValue: () => editorRef.current?.state.doc.toString() ?? value,
    insertText,
    showCompletions,
  }));

  const languageLabel = language === "python" ? "Python" : language === "typescript" ? "TypeScript" : language === "csharp" ? "C#" : "JavaScript";
  return (
    <div className="relative flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-[#0d1117]">
      <div ref={hostRef} data-testid="code-editor" className="min-h-0 min-w-0 flex-1 overflow-hidden" />
      <div className="flex h-7 min-w-0 shrink-0 items-center gap-2 overflow-hidden border-t border-white/10 bg-[#111820] px-3 font-mono text-[9px] text-white/60">
        <span className="font-bold uppercase text-orbit-electric/70">{languageLabel}</span>
        <span className="shrink-0">{value.split("\n").length} linhas</span>
        <span className="min-w-0 truncate">{value.length.toLocaleString("pt-BR")} caracteres</span>
        <span className="ml-auto hidden text-white/60 sm:inline">Ctrl/⌘+Enter executa · Ctrl/⌘+Espaço sugere</span>
      </div>
      <div aria-label="Atalhos de símbolos" className="flex min-w-0 max-w-full shrink-0 gap-1 overflow-x-auto overscroll-x-contain border-t border-white/10 bg-[#161b22] px-2 py-1.5 md:hidden [scrollbar-width:none] pb-[max(.375rem,env(safe-area-inset-bottom))]">
        <button type="button" onPointerDown={(event) => { event.preventDefault(); showCompletions(); }} className="min-h-11 shrink-0 rounded-md border border-orbit-electric/30 bg-orbit-electric/10 px-3 font-mono text-xs font-bold text-orbit-electric" aria-label="Abrir sugestões">Sug.</button>
        {[...COMMON_MOBILE_KEYS, ...(language === "python" ? [":", "#"] : language === "csharp" ? [";", ".", "<", ">"] : ["=>", ";"])].map((key, index) => (
          <button key={`${key}-${index}`} type="button" onPointerDown={(event) => { event.preventDefault(); insertText(key); }} onClick={(event) => { if (event.detail === 0) insertText(key); }} className="min-h-11 min-w-11 shrink-0 rounded-md border border-white/10 bg-white/[0.04] px-2 font-mono text-sm font-semibold text-slate-200 active:bg-orbit-electric/20 active:text-orbit-electric" aria-label={key === "Tab" ? "Inserir indentação" : `Inserir ${key}`}>{key}</button>
        ))}
      </div>
    </div>
  );
});

ReliableCodeEditor.displayName = "ReliableCodeEditor";
export default ReliableCodeEditor;
