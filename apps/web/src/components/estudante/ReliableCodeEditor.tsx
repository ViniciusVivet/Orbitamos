"use client";

import { autocompletion, type CompletionContext, type CompletionResult } from "@codemirror/autocomplete";
import { indentWithTab } from "@codemirror/commands";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { setDiagnostics, type Diagnostic } from "@codemirror/lint";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { oneDarkTheme } from "@codemirror/theme-one-dark";
import { tags } from "@lezer/highlight";
import { basicSetup } from "codemirror";
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from "react";

type Language = "javascript" | "typescript" | "python";
type SnippetSpec = { label: string; detail: string; apply: string; type: "keyword" | "function" };

const PYTHON_COMPLETIONS: SnippetSpec[] = [
  ...["def", "return", "if", "elif", "else", "for", "while", "in", "not", "and", "or", "import", "from", "class", "try", "except", "with", "pass", "break", "continue", "None", "True", "False"].map((label) => ({ label, detail: "palavra-chave", apply: label, type: "keyword" as const })),
  ...["print", "len", "range", "str", "int", "float", "list", "dict", "sum", "min", "max", "round", "sorted", "enumerate", "zip"].map((label) => ({ label, detail: "função nativa", apply: `${label}()`, type: "function" as const })),
];

const JAVASCRIPT_COMPLETIONS: SnippetSpec[] = [
  { label: "log", detail: "console.log()", apply: "console.log()", type: "function" },
  { label: "function", detail: "declarar função", apply: "function nome() {\n  \n}", type: "keyword" },
  { label: "for", detail: "laço for", apply: "for (let i = 0; i < 10; i++) {\n  \n}", type: "keyword" },
  { label: "if", detail: "condicional", apply: "if (condicao) {\n  \n}", type: "keyword" },
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

function completionSource(language: Language) {
  const options = language === "python" ? PYTHON_COMPLETIONS : JAVASCRIPT_COMPLETIONS;
  return (context: CompletionContext): CompletionResult | null => {
    const word = context.matchBefore(/[\w.]*/);
    if (!word || (word.from === word.to && !context.explicit)) return null;
    return { from: word.from, options, validFor: /^[\w.]*$/ };
  };
}

function languageExtension(language: Language) {
  if (language === "python") return python();
  return javascript({ typescript: language === "typescript" });
}

export type ReliableCodeEditorHandle = {
  focus: () => void;
  getValue: () => string;
  insertText: (text: string) => void;
};

const ReliableCodeEditor = forwardRef<ReliableCodeEditorHandle, {
  value: string;
  language: Language;
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
    autocompletion({ override: [completionSource(language)], activateOnTyping: true }),
    keymap.of([indentWithTab]),
    EditorState.tabSize.of(language === "python" ? 4 : 2),
    EditorView.lineWrapping,
    EditorView.contentAttributes.of({
      "aria-label": "Editor de código",
      "aria-description": "Digite sua solução. Use Control mais Enter para executar.",
      autocapitalize: "off",
      autocomplete: "off",
      autocorrect: "off",
      spellcheck: "false",
    }),
    EditorView.theme({
      "&": { height: "100%", backgroundColor: "#0d1117", fontSize: "16px" },
      ".cm-scroller": { overflow: "auto", fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" },
      ".cm-content": { minHeight: "100%", padding: "12px 0", caretColor: "#a855f7" },
      ".cm-line": { padding: "0 12px 0 6px" },
      ".cm-gutters": { backgroundColor: "#0d1117", borderRight: "1px solid rgba(255,255,255,.06)" },
      ".cm-activeLine, .cm-activeLineGutter": { backgroundColor: "rgba(255,255,255,.035)" },
      ".cm-focused": { outline: "none" },
      "@media (min-width: 768px)": { "&": { fontSize: "13px" } },
    }),
    EditorView.updateListener.of((update) => {
      if (update.docChanged) onChange(update.state.doc.toString());
    }),
  ], [language, onChange]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const editor = new EditorView({
      state: EditorState.create({ doc: initialValueRef.current, extensions }),
      parent: host,
    });
    editorRef.current = editor;
    return () => {
      editor.destroy();
      editorRef.current = null;
    };
  }, [extensions]);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const current = editor.state.doc.toString();
    if (current === value) return;
    editor.dispatch({ changes: { from: 0, to: current.length, insert: value } });
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

  useImperativeHandle(forwardedRef, () => ({
    focus: () => editorRef.current?.focus(),
    getValue: () => editorRef.current?.state.doc.toString() ?? value,
    insertText,
  }));

  return (
    <div className="relative flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-[#0d1117]">
      <div ref={hostRef} data-testid="code-editor" className="min-h-0 min-w-0 flex-1 overflow-hidden" />
      <div className="flex h-7 min-w-0 shrink-0 items-center gap-2 overflow-hidden border-t border-white/10 bg-[#111820] px-3 font-mono text-[9px] text-white/60">
        <span className="font-bold uppercase text-orbit-electric/70">{language === "python" ? "Python" : language === "typescript" ? "TypeScript" : "JavaScript"}</span>
        <span className="shrink-0">{value.split("\n").length} linhas</span>
        <span className="min-w-0 truncate">{value.length.toLocaleString("pt-BR")} caracteres</span>
        <span className="ml-auto hidden text-white/60 sm:inline">Ctrl/⌘ + Enter para executar</span>
      </div>
      <div aria-label="Atalhos de símbolos" className="flex min-w-0 max-w-full shrink-0 gap-1 overflow-x-auto overscroll-x-contain border-t border-white/10 bg-[#161b22] px-2 py-1.5 md:hidden [scrollbar-width:none] pb-[max(.375rem,env(safe-area-inset-bottom))]">
        {[...COMMON_MOBILE_KEYS, ...(language === "python" ? [":", "#"] : ["=>", ";"])].map((key, index) => (
          <button
            key={`${key}-${index}`}
            type="button"
            onPointerDown={(event) => {
              event.preventDefault();
              insertText(key);
            }}
            onClick={(event) => {
              // Ativação por teclado não dispara pointerdown.
              if (event.detail === 0) insertText(key);
            }}
            className="min-h-11 min-w-11 shrink-0 rounded-md border border-white/10 bg-white/[0.04] px-2 font-mono text-sm font-semibold text-slate-200 active:bg-orbit-electric/20 active:text-orbit-electric"
            aria-label={key === "Tab" ? "Inserir indentação" : `Inserir ${key}`}
          >
            {key}
          </button>
        ))}
      </div>
    </div>
  );
});

ReliableCodeEditor.displayName = "ReliableCodeEditor";
export default ReliableCodeEditor;
