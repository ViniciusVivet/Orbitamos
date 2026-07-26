"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft, BookOpen, ChevronDown, ChevronRight, FileText, GraduationCap,
  GripVertical, Loader2, Plus, Save, Trash2, Upload, X,
} from "lucide-react";
import {
  listAdminCourses, saveAdminCourse, deleteAdminCourse,
  saveAdminModule, deleteAdminModule, saveAdminLesson, deleteAdminLesson,
  saveAdminMaterial, deleteAdminMaterial, uploadAcademyAsset,
  type AdminCourse, type AdminModule, type AdminLesson, type AdminMaterial, type AdminQuizQuestion,
} from "@/lib/workspace";

const input = "w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-orbit-electric/50 focus:outline-none";
const label = "mb-1 block text-[11px] font-semibold uppercase tracking-wider text-white/40";
const btnPrimary = "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-orbit-electric px-4 text-sm font-bold text-black transition hover:brightness-110 disabled:opacity-50";
const btnGhost = "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-white/10 px-3 text-sm font-semibold text-white/70 transition hover:bg-white/5 hover:text-white";

const emptyCourse = (position: number): AdminCourse => ({ slug: "", title: "", description: "", coverUrl: "", level: "", isPublished: false, position, modules: [] });
const emptyModule = (position: number): AdminModule => ({ slug: "", title: "", description: "", position, lessons: [] });
const emptyLesson = (position: number): AdminLesson => ({ slug: "", title: "", description: "", youtubeVideoId: "", content: "", isPublished: false, position, quiz: [], materials: [] });

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function CursosAdminPage() {
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openCourseId, setOpenCourseId] = useState<string | null>(null);
  const [creatingCourse, setCreatingCourse] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setCourses(await listAdminCourses());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const openCourse = courses.find((c) => c.id === openCourseId) ?? null;

  if (loading) {
    return <div className="grid min-h-[60vh] place-items-center"><Loader2 className="size-8 animate-spin text-orbit-electric" /></div>;
  }

  if (openCourse) {
    return <CourseEditor course={openCourse} onBack={() => setOpenCourseId(null)} onChange={reload} />;
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-black text-white"><GraduationCap className="size-6 text-orbit-electric" />OrbitAcademy</h1>
          <p className="mt-1 text-sm text-white/40">Gerencie cursos, módulos, aulas, materiais e quizzes.</p>
        </div>
        <button className={btnPrimary} onClick={() => setCreatingCourse(true)}><Plus className="size-4" />Novo curso</button>
      </header>

      {error && <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300">{error}</p>}

      {creatingCourse && (
        <CourseForm
          initial={emptyCourse(courses.length)}
          onCancel={() => setCreatingCourse(false)}
          onSaved={async () => { setCreatingCourse(false); await reload(); }}
        />
      )}

      {courses.length === 0 && !creatingCourse ? (
        <div className="grid place-items-center rounded-2xl border border-dashed border-white/10 py-16 text-center">
          <BookOpen className="size-10 text-white/15" />
          <p className="mt-3 text-sm text-white/40">Nenhum curso ainda. Crie o primeiro.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {courses.map((c) => (
            <div key={c.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate font-bold text-white">{c.title}</p>
                  <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${c.isPublished ? "bg-emerald-500/15 text-emerald-300" : "bg-white/10 text-white/40"}`}>{c.isPublished ? "Publicado" : "Rascunho"}</span>
                </div>
                <p className="mt-0.5 text-xs text-white/35">/{c.slug} · {c.modules.length} módulo(s) · {c.modules.reduce((a, m) => a + m.lessons.length, 0)} aula(s)</p>
              </div>
              <button className={btnGhost} onClick={() => setOpenCourseId(c.id!)}>Editar</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CourseForm({ initial, onCancel, onSaved }: { initial: AdminCourse; onCancel: () => void; onSaved: () => void }) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const set = <K extends keyof AdminCourse>(k: K, v: AdminCourse[K]) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.title.trim()) { setErr("Informe o título."); return; }
    setSaving(true); setErr(null);
    try {
      await saveAdminCourse({ ...form, slug: form.slug.trim() || slugify(form.title) });
      onSaved();
    } catch (e) { setErr(e instanceof Error ? e.message : "Erro ao salvar."); } finally { setSaving(false); }
  };

  return (
    <div className="space-y-3 rounded-2xl border border-orbit-electric/25 bg-orbit-electric/[0.03] p-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <div><label className={label}>Título</label><input className={input} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Lógica de Programação com Python" /></div>
        <div><label className={label}>Slug (URL)</label><input className={input} value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="auto a partir do título" /></div>
      </div>
      <div><label className={label}>Descrição</label><textarea className={input} rows={2} value={form.description} onChange={(e) => set("description", e.target.value)} /></div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div><label className={label}>Nível</label><input className={input} value={form.level} onChange={(e) => set("level", e.target.value)} placeholder="Iniciante" /></div>
        <div>
          <label className={label}>Capa</label>
          <div className="flex items-center gap-2">
            <input className={input} value={form.coverUrl} onChange={(e) => set("coverUrl", e.target.value)} placeholder="URL ou envie" />
            <label className={`${btnGhost} shrink-0 cursor-pointer`} title="Enviar imagem">
              {uploadingCover ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
              <input type="file" accept="image/*" className="hidden" disabled={uploadingCover} onChange={async (e) => {
                const file = e.target.files?.[0]; if (!file) return;
                setUploadingCover(true); setErr(null);
                try { set("coverUrl", await uploadAcademyAsset("covers", file)); }
                catch (er) { setErr(er instanceof Error ? er.message : "Erro ao enviar a capa."); }
                finally { setUploadingCover(false); e.target.value = ""; }
              }} />
            </label>
          </div>
        </div>
        <div><label className={label}>Ordem</label><input type="number" className={input} value={form.position} onChange={(e) => set("position", Number(e.target.value))} /></div>
      </div>
      {form.coverUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={form.coverUrl} alt="Prévia da capa" className="h-24 w-full max-w-xs rounded-lg border border-white/10 object-cover" />
      )}
      <label className="flex items-center gap-2 text-sm text-white/70"><input type="checkbox" checked={form.isPublished} onChange={(e) => set("isPublished", e.target.checked)} />Publicado (visível para alunos)</label>
      {err && <p className="text-sm text-red-300">{err}</p>}
      <div className="flex gap-2">
        <button className={btnPrimary} onClick={save} disabled={saving}>{saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}Salvar</button>
        <button className={btnGhost} onClick={onCancel}>Cancelar</button>
      </div>
    </div>
  );
}

function CourseEditor({ course, onBack, onChange }: { course: AdminCourse; onBack: () => void; onChange: () => void }) {
  const [editingCourse, setEditingCourse] = useState(false);
  const [creatingModule, setCreatingModule] = useState(false);
  const [lessonEditor, setLessonEditor] = useState<{ moduleId: string; lesson: AdminLesson } | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const reorderModules = async (from: number, to: number) => {
    if (from === to) return;
    const arr = [...course.modules];
    const [moved] = arr.splice(from, 1);
    arr.splice(to, 0, moved);
    await Promise.all(
      arr.map((m, i) => m.position === i
        ? null
        : saveAdminModule(course.id!, { id: m.id, slug: m.slug, title: m.title, description: m.description, position: i }))
        .filter(Boolean) as Promise<string>[]
    );
    onChange();
  };

  const removeCourse = async () => {
    if (!confirm(`Excluir o curso "${course.title}" e todo o conteúdo dele?`)) return;
    await deleteAdminCourse(course.id!); onBack(); onChange();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button className={btnGhost} onClick={onBack}><ArrowLeft className="size-4" />Voltar</button>
        <div className="flex gap-2">
          <button className={btnGhost} onClick={() => setEditingCourse((v) => !v)}>Editar curso</button>
          <button className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-red-500/25 px-3 text-sm font-semibold text-red-300 hover:bg-red-500/10" onClick={removeCourse}><Trash2 className="size-4" />Excluir</button>
        </div>
      </div>

      {editingCourse ? (
        <CourseForm initial={course} onCancel={() => setEditingCourse(false)} onSaved={() => { setEditingCourse(false); onChange(); }} />
      ) : (
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-black text-white">{course.title}
            <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${course.isPublished ? "bg-emerald-500/15 text-emerald-300" : "bg-white/10 text-white/40"}`}>{course.isPublished ? "Publicado" : "Rascunho"}</span>
          </h1>
          <p className="mt-1 text-sm text-white/40">/{course.slug}{course.level && ` · ${course.level}`}</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wider text-white/50">Módulos</h2>
        <button className={btnGhost} onClick={() => setCreatingModule(true)}><Plus className="size-4" />Novo módulo</button>
      </div>

      {creatingModule && (
        <ModuleForm courseId={course.id!} initial={emptyModule(course.modules.length)} onCancel={() => setCreatingModule(false)} onSaved={() => { setCreatingModule(false); onChange(); }} />
      )}

      <div className="space-y-3">
        {course.modules.map((m, idx) => (
          <div
            key={m.id}
            draggable
            onDragStart={() => setDragIdx(idx)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => { if (dragIdx !== null) reorderModules(dragIdx, idx); setDragIdx(null); }}
            className={dragIdx === idx ? "opacity-40" : ""}
          >
            <ModuleBlock courseId={course.id!} module={m} onChange={onChange} onEditLesson={(lesson) => setLessonEditor({ moduleId: m.id!, lesson })} />
          </div>
        ))}
        {course.modules.length === 0 && !creatingModule && <p className="text-sm text-white/35">Nenhum módulo ainda.</p>}
        {course.modules.length > 1 && <p className="text-[11px] text-white/25">Arraste os módulos pela alça para reordenar.</p>}
      </div>

      {lessonEditor && (
        <LessonEditor
          moduleId={lessonEditor.moduleId}
          lesson={lessonEditor.lesson}
          onClose={() => setLessonEditor(null)}
          onSaved={() => { setLessonEditor(null); onChange(); }}
        />
      )}
    </div>
  );
}

function ModuleBlock({ courseId, module: mod, onChange, onEditLesson }: { courseId: string; module: AdminModule; onChange: () => void; onEditLesson: (lesson: AdminLesson) => void }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [lessonDrag, setLessonDrag] = useState<number | null>(null);

  const remove = async () => {
    if (!confirm(`Excluir o módulo "${mod.title}" e suas aulas?`)) return;
    await deleteAdminModule(mod.id!); onChange();
  };

  const reorderLessons = async (from: number, to: number) => {
    if (from === to) return;
    const arr = [...mod.lessons];
    const [moved] = arr.splice(from, 1);
    arr.splice(to, 0, moved);
    await Promise.all(
      arr.map((l, i) => l.position === i
        ? null
        : saveAdminLesson(mod.id!, { id: l.id, slug: l.slug, title: l.title, description: l.description, youtubeVideoId: l.youtubeVideoId, content: l.content, isPublished: l.isPublished, position: i, quiz: l.quiz }))
        .filter(Boolean) as Promise<string>[]
    );
    onChange();
  };

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02]">
      <div className="flex items-center gap-2 p-3">
        <GripVertical className="size-4 shrink-0 cursor-grab text-white/25" />
        <button className="text-white/50 hover:text-white" onClick={() => setOpen((v) => !v)}>{open ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}</button>
        <div className="min-w-0 flex-1 cursor-pointer" onClick={() => setOpen((v) => !v)}>
          <p className="truncate text-sm font-bold text-white">{mod.title}</p>
          <p className="text-[11px] text-white/35">{mod.lessons.length} aula(s)</p>
        </div>
        <button className="text-xs text-white/50 hover:text-white" onClick={() => setEditing((v) => !v)}>Editar</button>
        <button className="text-red-300/70 hover:text-red-300" onClick={remove}><Trash2 className="size-4" /></button>
      </div>

      {editing && (
        <div className="border-t border-white/10 p-3">
          <ModuleForm courseId={courseId} initial={mod} onCancel={() => setEditing(false)} onSaved={() => { setEditing(false); onChange(); }} />
        </div>
      )}

      {open && (
        <div className="space-y-1.5 border-t border-white/10 p-3">
          {mod.lessons.map((l, idx) => (
            <div
              key={l.id}
              draggable
              onDragStart={(e) => { e.stopPropagation(); setLessonDrag(idx); }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.stopPropagation(); if (lessonDrag !== null) reorderLessons(lessonDrag, idx); setLessonDrag(null); }}
              className={`flex items-center justify-between gap-2 rounded-lg bg-black/30 px-3 py-2 ${lessonDrag === idx ? "opacity-40" : ""}`}
            >
              <div className="flex min-w-0 items-center gap-2">
                <GripVertical className="size-4 shrink-0 cursor-grab text-white/25" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm text-white">{l.title}</p>
                    {!l.isPublished && <span className="rounded-full bg-white/10 px-1.5 text-[8px] font-bold uppercase text-white/40">rascunho</span>}
                  </div>
                  <p className="text-[10px] text-white/30">{l.youtubeVideoId ? `yt:${l.youtubeVideoId}` : "sem vídeo"} · {l.quiz.length} quiz · {l.materials.length} material(is)</p>
                </div>
              </div>
              <button className="shrink-0 text-xs text-orbit-electric hover:underline" onClick={() => onEditLesson(l)}>Abrir</button>
            </div>
          ))}
          <button className={`${btnGhost} w-full`} onClick={() => onEditLesson(emptyLesson(mod.lessons.length))}><Plus className="size-4" />Nova aula</button>
        </div>
      )}
    </div>
  );
}

function ModuleForm({ courseId, initial, onCancel, onSaved }: { courseId: string; initial: AdminModule; onCancel: () => void; onSaved: () => void }) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const save = async () => {
    if (!form.title.trim()) { setErr("Informe o título."); return; }
    setSaving(true); setErr(null);
    try {
      await saveAdminModule(courseId, { ...form, slug: form.slug.trim() || slugify(form.title) });
      onSaved();
    } catch (e) { setErr(e instanceof Error ? e.message : "Erro ao salvar."); } finally { setSaving(false); }
  };

  return (
    <div className="space-y-3 rounded-xl border border-white/10 bg-black/30 p-4">
      <div className="grid gap-3 sm:grid-cols-[2fr_1fr_0.6fr]">
        <div><label className={label}>Título</label><input className={input} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
        <div><label className={label}>Slug</label><input className={input} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto" /></div>
        <div><label className={label}>Ordem</label><input type="number" className={input} value={form.position} onChange={(e) => setForm({ ...form, position: Number(e.target.value) })} /></div>
      </div>
      <div><label className={label}>Descrição</label><input className={input} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
      {err && <p className="text-sm text-red-300">{err}</p>}
      <div className="flex gap-2">
        <button className={btnPrimary} onClick={save} disabled={saving}>{saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}Salvar módulo</button>
        <button className={btnGhost} onClick={onCancel}>Cancelar</button>
      </div>
    </div>
  );
}

function LessonEditor({ moduleId, lesson, onClose, onSaved }: { moduleId: string; lesson: AdminLesson; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<AdminLesson>(lesson);
  const [originalMaterialIds] = useState<string[]>(lesson.materials.map((m) => m.id!).filter(Boolean));
  const [saving, setSaving] = useState(false);
  const [uploadingMaterial, setUploadingMaterial] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const set = <K extends keyof AdminLesson>(k: K, v: AdminLesson[K]) => setForm((f) => ({ ...f, [k]: v }));

  const uploadMaterial = async (file: File) => {
    setUploadingMaterial(true); setErr(null);
    try {
      const url = await uploadAcademyAsset("materials", file);
      const title = file.name.replace(/\.[^.]+$/, "");
      const kind = (file.name.split(".").pop() || "arquivo").toUpperCase();
      setForm((f) => ({ ...f, materials: [...f.materials, { title, kind, fileUrl: "", externalUrl: url, position: f.materials.length }] }));
    } catch (e) { setErr(e instanceof Error ? e.message : "Erro ao enviar o material."); }
    finally { setUploadingMaterial(false); }
  };

  const save = async () => {
    if (!form.title.trim()) { setErr("Informe o título da aula."); return; }
    // valida quizzes
    for (const q of form.quiz) {
      if (q.question.trim() && (!q.answer.trim() || !q.options.includes(q.answer))) {
        setErr("Em cada pergunta do quiz, a resposta correta precisa ser uma das alternativas."); return;
      }
    }
    setSaving(true); setErr(null);
    try {
      const cleanQuiz = form.quiz.filter((q) => q.question.trim() && q.options.filter((o) => o.trim()).length >= 2);
      const lessonId = await saveAdminLesson(moduleId, {
        ...form, slug: form.slug.trim() || slugify(form.title), quiz: cleanQuiz,
      });
      // materiais: remove os apagados, salva os atuais
      const currentIds = form.materials.map((m) => m.id).filter(Boolean) as string[];
      await Promise.all(originalMaterialIds.filter((id) => !currentIds.includes(id)).map((id) => deleteAdminMaterial(id)));
      await Promise.all(form.materials.filter((m) => m.title.trim()).map((m, i) => saveAdminMaterial(lessonId, { ...m, position: i })));
      onSaved();
    } catch (e) { setErr(e instanceof Error ? e.message : "Erro ao salvar."); } finally { setSaving(false); }
  };

  const addMaterial = () => set("materials", [...form.materials, { title: "", kind: "PDF", fileUrl: "", externalUrl: "", position: form.materials.length }]);
  const updateMaterial = (i: number, patch: Partial<AdminMaterial>) => set("materials", form.materials.map((m, idx) => idx === i ? { ...m, ...patch } : m));
  const removeMaterial = (i: number) => set("materials", form.materials.filter((_, idx) => idx !== i));

  const removeLesson = async () => {
    if (!form.id) return;
    if (!confirm(`Excluir a aula "${form.title}"?`)) return;
    setSaving(true); setErr(null);
    try { await deleteAdminLesson(form.id); onSaved(); }
    catch (e) { setErr(e instanceof Error ? e.message : "Erro ao excluir."); setSaving(false); }
  };

  const addQuestion = () => set("quiz", [...form.quiz, { question: "", options: ["", ""], answer: "" }]);
  const updateQuestion = (i: number, patch: Partial<AdminQuizQuestion>) => set("quiz", form.quiz.map((q, idx) => idx === i ? { ...q, ...patch } : q));
  const removeQuestion = (i: number) => set("quiz", form.quiz.filter((_, idx) => idx !== i));

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
      <div className="flex h-full w-full max-w-2xl flex-col border-l border-white/10 bg-[#0a0c14]">
        <header className="flex items-center justify-between border-b border-white/10 p-4">
          <h2 className="flex items-center gap-2 text-lg font-bold text-white"><FileText className="size-5 text-orbit-electric" />{form.id ? "Editar aula" : "Nova aula"}</h2>
          <button className="grid size-9 place-items-center rounded-lg text-white/50 hover:bg-white/10" onClick={onClose}><X className="size-5" /></button>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          <div className="grid gap-3 sm:grid-cols-[2fr_1fr]">
            <div><label className={label}>Título</label><input className={input} value={form.title} onChange={(e) => set("title", e.target.value)} /></div>
            <div><label className={label}>Slug</label><input className={input} value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="auto" /></div>
          </div>
          <div className="grid gap-3 sm:grid-cols-[2fr_1fr]">
            <div><label className={label}>ID do vídeo YouTube</label><input className={input} value={form.youtubeVideoId} onChange={(e) => set("youtubeVideoId", e.target.value)} placeholder="dQw4w9WgXcQ" /></div>
            <div><label className={label}>Ordem</label><input type="number" className={input} value={form.position} onChange={(e) => set("position", Number(e.target.value))} /></div>
          </div>
          <div><label className={label}>Descrição</label><input className={input} value={form.description} onChange={(e) => set("description", e.target.value)} /></div>
          <div><label className={label}>Conteúdo (texto ao lado do vídeo)</label><textarea className={input} rows={3} value={form.content} onChange={(e) => set("content", e.target.value)} /></div>
          <label className="flex items-center gap-2 text-sm text-white/70"><input type="checkbox" checked={form.isPublished} onChange={(e) => set("isPublished", e.target.checked)} />Publicada</label>

          <section className="space-y-2 rounded-xl border border-white/10 p-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white/50">Materiais</h3>
              <div className="flex gap-2">
                <label className={`${btnGhost} cursor-pointer`} title="Enviar arquivo (PDF, DOCX, imagem...)">
                  {uploadingMaterial ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}Enviar
                  <input type="file" className="hidden" disabled={uploadingMaterial} onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadMaterial(f); e.target.value = ""; }} />
                </label>
                <button className={btnGhost} onClick={addMaterial}><Plus className="size-4" />Link</button>
              </div>
            </div>
            {form.materials.map((m, i) => (
              <div key={i} className="grid gap-2 rounded-lg bg-black/30 p-2 sm:grid-cols-[1.4fr_0.8fr_1.4fr_auto]">
                <input className={input} placeholder="Título" value={m.title} onChange={(e) => updateMaterial(i, { title: e.target.value })} />
                <input className={input} placeholder="Tipo (PDF)" value={m.kind} onChange={(e) => updateMaterial(i, { kind: e.target.value })} />
                <input className={input} placeholder="URL (arquivo ou link externo)" value={m.externalUrl || m.fileUrl} onChange={(e) => updateMaterial(i, { externalUrl: e.target.value, fileUrl: "" })} />
                <button className="grid place-items-center px-2 text-red-300/70 hover:text-red-300" onClick={() => removeMaterial(i)}><Trash2 className="size-4" /></button>
              </div>
            ))}
            {form.materials.length === 0 && <p className="text-[11px] text-white/30">Nenhum material.</p>}
          </section>

          <section className="space-y-2 rounded-xl border border-white/10 p-3">
            <div className="flex items-center justify-between"><h3 className="text-xs font-bold uppercase tracking-wider text-white/50">Quiz de revisão</h3><button className={btnGhost} onClick={addQuestion}><Plus className="size-4" />Pergunta</button></div>
            {form.quiz.map((q, i) => (
              <div key={i} className="space-y-2 rounded-lg bg-black/30 p-3">
                <div className="flex items-start gap-2">
                  <input className={input} placeholder="Pergunta" value={q.question} onChange={(e) => updateQuestion(i, { question: e.target.value })} />
                  <button className="mt-1 text-red-300/70 hover:text-red-300" onClick={() => removeQuestion(i)}><Trash2 className="size-4" /></button>
                </div>
                {q.options.map((opt, oi) => (
                  <div key={oi} className="flex items-center gap-2 pl-2">
                    <input type="radio" name={`ans-${i}`} checked={q.answer === opt && opt !== ""} onChange={() => updateQuestion(i, { answer: opt })} title="Marcar como correta" />
                    <input className={input} placeholder={`Alternativa ${oi + 1}`} value={opt} onChange={(e) => {
                      const options = q.options.map((o, idx) => idx === oi ? e.target.value : o);
                      updateQuestion(i, { answer: q.answer === opt ? e.target.value : q.answer, options });
                    }} />
                    {q.options.length > 2 && <button className="text-white/30 hover:text-red-300" onClick={() => updateQuestion(i, { options: q.options.filter((_, idx) => idx !== oi) })}><X className="size-4" /></button>}
                  </div>
                ))}
                <button className="ml-2 text-[11px] text-orbit-electric hover:underline" onClick={() => updateQuestion(i, { options: [...q.options, ""] })}>+ alternativa</button>
              </div>
            ))}
            {form.quiz.length === 0 && <p className="text-[11px] text-white/30">Sem quiz. O aluno verá o quiz automático por área.</p>}
          </section>

          {err && <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{err}</p>}
        </div>

        <footer className="flex items-center gap-2 border-t border-white/10 p-4">
          <button className={btnPrimary} onClick={save} disabled={saving}>{saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}Salvar aula</button>
          <button className={btnGhost} onClick={onClose}>Cancelar</button>
          {form.id && (
            <button className="ml-auto inline-flex min-h-10 items-center gap-2 rounded-lg border border-red-500/25 px-3 text-sm font-semibold text-red-300 hover:bg-red-500/10" onClick={removeLesson} disabled={saving}><Trash2 className="size-4" />Excluir aula</button>
          )}
        </footer>
      </div>
    </div>
  );
}
