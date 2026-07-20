"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { Monaco } from "@monaco-editor/react";
import type { editor as MonacoEditorNS, languages, Position } from "monaco-editor";
import { AlertTriangle, Code2 } from "lucide-react";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => null,
});

const PYTHON_KEYWORDS = [
  "def", "return", "if", "elif", "else", "for", "while", "in", "not", "and", "or",
  "import", "from", "as", "class", "try", "except", "finally", "with", "lambda",
  "pass", "break", "continue", "global", "None", "True", "False",
];

const PYTHON_BUILTINS = [
  "print", "len", "range", "input", "str", "int", "float", "bool", "list", "dict",
  "set", "tuple", "sum", "min", "max", "abs", "round", "sorted", "reversed",
  "enumerate", "zip", "map", "filter", "type", "isinstance",
];

const PYTHON_METHODS = [
  "append", "insert", "remove", "pop", "index", "count", "sort", "extend",
  "lower", "upper", "title", "strip", "split", "join", "replace", "startswith", "endswith",
  "keys", "values", "items", "get", "update", "add",
];

type SnippetSpec = { label: string; detail: string; insertText: string };

const PYTHON_SNIPPETS: SnippetSpec[] = [
  { label: "def", detail: "Definir função", insertText: "def ${1:nome}(${2:parametros}):\n    ${3:pass}" },
  { label: "if", detail: "Condicional if", insertText: "if ${1:condicao}:\n    ${2:pass}" },
  { label: "ifelse", detail: "if / else", insertText: "if ${1:condicao}:\n    ${2:pass}\nelse:\n    ${3:pass}" },
  { label: "for", detail: "Laço for ... in", insertText: "for ${1:item} in ${2:colecao}:\n    ${3:pass}" },
  { label: "forrange", detail: "for com range()", insertText: "for ${1:i} in range(${2:10}):\n    ${3:pass}" },
  { label: "while", detail: "Laço while", insertText: "while ${1:condicao}:\n    ${2:pass}" },
  { label: "tryexcept", detail: "try / except", insertText: "try:\n    ${1:pass}\nexcept ${2:Exception}:\n    ${3:pass}" },
  { label: "class", detail: "Definir classe", insertText: "class ${1:Nome}:\n    def __init__(self${2}):\n        ${3:pass}" },
  { label: "printf", detail: "print com f-string", insertText: 'print(f"${1:texto} {${2:valor}}")' },
];

const JAVASCRIPT_SNIPPETS: SnippetSpec[] = [
  { label: "log", detail: "console.log()", insertText: "console.log(${1});" },
  { label: "func", detail: "Declarar função", insertText: "function ${1:nome}(${2:parametros}) {\n  ${3}\n}" },
  { label: "arrow", detail: "Arrow function", insertText: "const ${1:nome} = (${2:parametros}) => ${3:valor};" },
  { label: "forof", detail: "Laço for ... of", insertText: "for (const ${1:item} of ${2:colecao}) {\n  ${3}\n}" },
  { label: "fori", detail: "Laço for clássico", insertText: "for (let ${1:i} = 0; ${1:i} < ${2:10}; ${1:i}++) {\n  ${3}\n}" },
  { label: "ifelse", detail: "if / else", insertText: "if (${1:condicao}) {\n  ${2}\n} else {\n  ${3}\n}" },
];

let providersRegistered = false;

function registerCompletionProviders(monaco: Monaco) {
  if (providersRegistered) return;
  providersRegistered = true;

  const buildRange = (model: MonacoEditorNS.ITextModel, position: Position) => {
    const word = model.getWordUntilPosition(position);
    return {
      startLineNumber: position.lineNumber,
      endLineNumber: position.lineNumber,
      startColumn: word.startColumn,
      endColumn: word.endColumn,
    };
  };

  monaco.languages.registerCompletionItemProvider("python", {
    provideCompletionItems(model: MonacoEditorNS.ITextModel, position: Position) {
      const range = buildRange(model, position);
      const suggestions: languages.CompletionItem[] = [
        ...PYTHON_KEYWORDS.map((keyword) => ({
          label: keyword,
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: keyword,
          range,
        })),
        ...PYTHON_BUILTINS.map((builtin) => ({
          label: builtin,
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: `${builtin}($1)`,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: "função nativa",
          range,
        })),
        ...PYTHON_METHODS.map((method) => ({
          label: method,
          kind: monaco.languages.CompletionItemKind.Method,
          insertText: `${method}($1)`,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: "método",
          range,
        })),
        ...PYTHON_SNIPPETS.map((snippet) => ({
          label: snippet.label,
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: snippet.insertText,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: snippet.detail,
          range,
        })),
      ];
      return { suggestions };
    },
  });

  for (const language of ["javascript", "typescript"]) {
    monaco.languages.registerCompletionItemProvider(language, {
      provideCompletionItems(model: MonacoEditorNS.ITextModel, position: Position) {
        const range = buildRange(model, position);
        return {
          suggestions: JAVASCRIPT_SNIPPETS.map((snippet) => ({
            label: snippet.label,
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: snippet.insertText,
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: snippet.detail,
            range,
          })),
        };
      },
    });
  }
}

export default function ReliableCodeEditor({
  value,
  language,
  onChange,
  errorLine,
  errorMessage,
}: {
  value: string;
  language: "javascript" | "typescript" | "python";
  onChange: (value: string) => void;
  /** Linha (1-indexada) a sublinhar em vermelho; null/undefined limpa o marcador */
  errorLine?: number | null;
  errorMessage?: string;
}) {
  const [ready, setReady] = useState(false);
  const [fallback, setFallback] = useState(false);
  const editorRef = useRef<MonacoEditorNS.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);

  useEffect(() => {
    let active = true;
    const mobile = window.matchMedia("(max-width: 767px), (pointer: coarse)").matches;

    if (mobile) {
      queueMicrotask(() => {
        if (active) setFallback(true);
      });
      return () => {
        active = false;
      };
    }

    const timer = window.setTimeout(() => {
      if (active && !ready) setFallback(true);
    }, 8000);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [ready]);

  useEffect(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco || !ready) return;
    const model = editor.getModel();
    if (!model) return;

    if (errorLine && errorLine >= 1 && errorLine <= model.getLineCount()) {
      monaco.editor.setModelMarkers(model, "orbitamos-pratica", [
        {
          startLineNumber: errorLine,
          endLineNumber: errorLine,
          startColumn: 1,
          endColumn: model.getLineMaxColumn(errorLine),
          message: errorMessage || "O erro aconteceu nesta linha.",
          severity: monaco.MarkerSeverity.Error,
        },
      ]);
      editor.revealLineInCenterIfOutsideViewport(errorLine);
    } else {
      monaco.editor.setModelMarkers(model, "orbitamos-pratica", []);
    }
  }, [errorLine, errorMessage, ready]);

  if (fallback) {
    return (
      <div className="flex h-full min-h-0 flex-col bg-[#0d1117]">
        <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2 text-[10px] text-white/35">
          <AlertTriangle className="size-3 text-amber-300" />
          Editor compatível ativado
        </div>
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          aria-label="Editor de código"
          className="min-h-0 flex-1 resize-none bg-[#0d1117] p-4 font-mono text-[13px] leading-6 text-slate-100 outline-none"
        />
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-0">
      {!ready && (
        <div className="absolute inset-0 z-10 grid place-items-center bg-[#0d1117]">
          <div className="text-center">
            <Code2 className="mx-auto size-6 text-orbit-electric/60" />
            <p className="mt-3 text-xs font-semibold text-white/45">Preparando editor...</p>
            <button type="button" onClick={() => setFallback(true)} className="mt-3 text-[10px] font-bold text-orbit-electric hover:underline">
              Usar editor compatível
            </button>
          </div>
        </div>
      )}
      <MonacoEditor
        height="100%"
        language={language}
        theme="vs-dark"
        value={value}
        onMount={(editor, monaco) => {
          editorRef.current = editor;
          monacoRef.current = monaco;
          registerCompletionProviders(monaco);
          setReady(true);
        }}
        onChange={(nextValue) => onChange(nextValue ?? "")}
        options={{
          fontSize: 13,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          padding: { top: 12, bottom: 12 },
          lineNumbers: "on",
          automaticLayout: true,
          tabSize: language === "python" ? 4 : 2,
          wordWrap: "on",
          lineDecorationsWidth: 0,
          lineNumbersMinChars: 3,
          quickSuggestions: { other: true, comments: false, strings: true },
          quickSuggestionsDelay: 80,
          suggestOnTriggerCharacters: true,
          snippetSuggestions: "top",
          tabCompletion: "on",
          wordBasedSuggestions: "currentDocument",
          parameterHints: { enabled: true },
          autoClosingBrackets: "always",
          autoClosingQuotes: "always",
          bracketPairColorization: { enabled: true },
          suggest: { preview: true, showWords: true },
        }}
      />
    </div>
  );
}
