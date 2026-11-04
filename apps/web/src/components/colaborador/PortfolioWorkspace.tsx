"use client";

/* eslint-disable @next/next/no-img-element -- User supplied covers and file previews use their original URLs. */
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, ExternalLink, ImagePlus, Pencil, Plus, RotateCcw, Save, Star, Trash2, Upload, X } from "lucide-react";
import OrbitPhoto from "@/components/brand/OrbitPhoto";
import { useAuth } from "@/contexts/AuthContext";
import { getCollaboratorProfile, type CollaboratorProfile } from "@/lib/api";
import { deletePortfolioItem, listPortfolioItems, savePortfolioItem, type PortfolioItem } from "@/lib/workspace";
import { portfolioDraftKey, portfolioFileError, portfolioItemError, portfolioUrl, preparePortfolioCover, readPortfolioDraft, uploadPortfolioCover, type PortfolioDraft, type PreparedPortfolioCover } from "@/lib/portfolioMedia";
import CollaboratorProfileGuide from "./CollaboratorProfileGuide";
import s from "./PortfolioWorkspace.module.css";

const blank = (sortOrder: number): PortfolioItem => ({ title: "", description: "", projectUrl: "", imageUrl: "", skills: [], featured: false, sortOrder });
const clone = (item: PortfolioItem) => ({ ...item, skills: [...item.skills] });
const previewKey = "orbitamos-portfolio-preview-v1";
const dataUrl = (blob: Blob) => new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(new Error("Não foi possível preparar a prévia.")); reader.readAsDataURL(blob); });

export default function PortfolioWorkspace({ preview = false, initialItems = [] }: { preview?: boolean; initialItems?: PortfolioItem[] }) {
  const { user } = useAuth();
  const identity = preview ? "portfolio-preview" : user?.id;
  const draftKey = identity == null ? null : portfolioDraftKey(identity);
  const [items, setItems] = useState<PortfolioItem[]>(initialItems);
  const [profile, setProfile] = useState<CollaboratorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [editing, setEditing] = useState<PortfolioItem | null>(null);
  const [pendingDraft, setPendingDraft] = useState<PortfolioDraft | null>(null);
  const [cover, setCover] = useState<PreparedPortfolioCover | null>(null);
  const [coverName, setCoverName] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [message, setMessage] = useState("");
  const [storageError, setStorageError] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PortfolioItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [discardConfirm, setDiscardConfirm] = useState(false);
  const loadGeneration = useRef(0);
  const invalidateLoad = useCallback(() => { loadGeneration.current++; }, []);
  const identityRef = useRef(identity);
  identityRef.current = identity;
  const dialog = useRef<HTMLDivElement>(null);
  const deletionDialog = useRef<HTMLDivElement>(null);
  const titleInput = useRef<HTMLInputElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const editingRef = useRef<PortfolioItem | null>(null);
  const coverObject = useRef<string | null>(null);
  const imageRequest = useRef(0);
  const busy = useRef(false);
  busy.current = saving || processing || deleting;
  const opened = editing !== null;

  const writeDraft = useCallback((next: PortfolioDraft | null) => {
    setPendingDraft(next);
    if (!draftKey) return;
    try { if (next) localStorage.setItem(draftKey, JSON.stringify(next)); else localStorage.removeItem(draftKey); setStorageError(false); }
    catch { setStorageError(true); }
  }, [draftKey]);

  const load = useCallback(async () => {
    const generation = ++loadGeneration.current;
    setLoading(true); setLoadError("");
    try {
      if (preview) {
        const raw = localStorage.getItem(previewKey);
        if (raw) {
          const saved = JSON.parse(raw);
          if (Array.isArray(saved) && generation === loadGeneration.current) setItems(saved.map(item => readPortfolioDraft(JSON.stringify({ version: 1, item, coverName: null, updatedAt: Date.now() }))?.item).filter((item): item is PortfolioItem => !!item?.id));
        }
      } else { const result = await listPortfolioItems(); if (generation === loadGeneration.current) setItems(result); }
    } catch { if (generation === loadGeneration.current) setLoadError("Não foi possível carregar seus trabalhos. Tente novamente; seus rascunhos continuam guardados."); }
    finally { if (generation === loadGeneration.current) setLoading(false); }
  }, [preview]);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      editingRef.current = null; setEditing(null); setProfile(null); setCover(null); setCoverName(null); setCoverPreview(null); setMessage("");
      imageRequest.current++; setProcessing(false); setSaving(false); setDeleteTarget(null); setDeleting(false); setFormError(""); setDiscardConfirm(false);
      if (coverObject.current) { URL.revokeObjectURL(coverObject.current); coverObject.current = null; }
      void load();
      try { setPendingDraft(readPortfolioDraft(draftKey ? localStorage.getItem(draftKey) : null)); } catch { setStorageError(true); }
      if (!preview) void getCollaboratorProfile().then(value => { if (active) setProfile(value); }).catch(() => {});
    });
    return () => { active = false; invalidateLoad(); };
  }, [draftKey, load, preview, invalidateLoad]);
  useEffect(() => () => { imageRequest.current++; if (coverObject.current) URL.revokeObjectURL(coverObject.current); }, []);

  const closeEditor = useCallback(() => {
    if (busy.current) return;
    editingRef.current = null; setEditing(null); setFormError(""); setDiscardConfirm(false);
    requestAnimationFrame(() => opener.current?.focus());
  }, []);

  useEffect(() => {
    const target = opened ? dialog.current : deleteTarget ? deletionDialog.current : null;
    if (!target) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = requestAnimationFrame(() => (opened ? titleInput.current : target.querySelector<HTMLButtonElement>("button"))?.focus());
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); if (opened) closeEditor(); else if (!busy.current) { setDeleteTarget(null); requestAnimationFrame(() => opener.current?.focus()); } }
      if (event.key !== "Tab") return;
      const controls = Array.from(target.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled])')).filter(node => node.getClientRects().length);
      const first = controls[0], last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener("keydown", keydown);
    return () => { cancelAnimationFrame(frame); document.body.style.overflow = previousOverflow; document.removeEventListener("keydown", keydown); };
  }, [opened, deleteTarget, closeEditor]);

  function change(next: PortfolioItem, nextCoverName = coverName) {
    editingRef.current = next; setEditing(next); setFormError("");
    writeDraft({ version: 1, item: clone(next), coverName: nextCoverName, updatedAt: Date.now() });
  }

  function openEditor(item?: PortfolioItem, resume = false) {
    if (pendingDraft && !resume && pendingDraft.item.id !== item?.id) { setMessage("Você tem uma edição guardada. Continue o rascunho ou descarte-o antes de abrir outro trabalho."); return; }
    opener.current = document.activeElement as HTMLElement | null;
    setFormError(""); setMessage(""); setDiscardConfirm(false);
    const draft = resume || pendingDraft?.item.id === item?.id ? pendingDraft : null;
    const next = clone(draft?.item ?? item ?? blank(items.length));
    setCover(null); setCoverName(draft?.coverName ?? null);
    if (coverObject.current) { URL.revokeObjectURL(coverObject.current); coverObject.current = null; }
    setCoverPreview(null); editingRef.current = next; setEditing(next);
    if (draft?.coverName) setFormError(`Seu texto foi recuperado. Escolha novamente o arquivo ${draft.coverName} para usar essa capa.`);
    writeDraft({ version: 1, item: next, coverName: draft?.coverName ?? null, updatedAt: Date.now() });
  }

  async function chooseFile(file: File) {
    const invalid = portfolioFileError(file);
    if (invalid) { setFormError(invalid); return; }
    const request = ++imageRequest.current; setProcessing(true); setFormError("");
    try {
      const prepared = await preparePortfolioCover(file);
      if (request !== imageRequest.current || !editingRef.current) return;
      if (coverObject.current) URL.revokeObjectURL(coverObject.current);
      const local = URL.createObjectURL(prepared.blob); coverObject.current = local;
      setCoverPreview(local); setCover(prepared); setCoverName(file.name); change({ ...editingRef.current, imageUrl: "" }, file.name);
    } catch (error) { if (request === imageRequest.current) setFormError(error instanceof Error ? error.message : "Não foi possível abrir a imagem."); }
    finally { if (request === imageRequest.current) setProcessing(false); }
  }

  function removeCover() {
    if (!editing) return;
    imageRequest.current++; setCover(null); setCoverName(null); setProcessing(false);
    if (coverObject.current) URL.revokeObjectURL(coverObject.current);
    coverObject.current = null; setCoverPreview(null); change({ ...editing, imageUrl: "" }, null);
  }

  async function save() {
    if (!editing || busy.current) return;
    const error = portfolioItemError(editing, preview);
    if (error) { setFormError(error); return; }
    if (coverName && !cover) { setFormError("Escolha novamente a imagem do rascunho ou remova essa capa antes de salvar."); return; }
    setSaving(true); setFormError("");
    const startedFor = identity;
    try {
      const imageUrl = cover ? preview ? await dataUrl(cover.blob) : await uploadPortfolioCover(cover) : editing.imageUrl.trim();
      if (identityRef.current !== startedFor) return;
      const next = { ...editing, title: editing.title.trim(), description: editing.description.trim(), projectUrl: portfolioUrl(editing.projectUrl) ?? "", imageUrl, skills: [...new Set(editing.skills.map(skill => skill.trim()).filter(Boolean))] };
      if (cover) { editingRef.current = next; setEditing(next); setCover(null); setCoverName(null); writeDraft({ version: 1, item: next, coverName: null, updatedAt: Date.now() }); }
      if (preview) {
        const saved = { ...next, id: next.id ?? Math.max(0, ...items.map(item => item.id ?? 0)) + 1 };
        const updated = next.id ? items.map(item => item.id === next.id ? saved : item) : [...items, saved];
        localStorage.setItem(previewKey, JSON.stringify(updated)); setItems(updated);
      } else { await savePortfolioItem(next); if (identityRef.current !== startedFor) return; await load(); }
      if (identityRef.current !== startedFor) return;
      writeDraft(null); editingRef.current = null; setEditing(null); setCoverPreview(null); setCover(null); setCoverName(null);
      setMessage(preview ? "Case salvo nesta prévia local." : "Seu trabalho foi salvo no portfólio.");
      requestAnimationFrame(() => opener.current?.focus());
    } catch (error) { if (identityRef.current === startedFor) setFormError(error instanceof Error ? error.message : "Não conseguimos salvar. Sua edição continua aqui."); }
    finally { if (identityRef.current === startedFor) setSaving(false); }
  }

  async function confirmDelete() {
    if (!deleteTarget?.id || deleting) return;
    const startedFor = identity;
    setDeleting(true); busy.current = true; setMessage("");
    try {
      if (preview) { const next = items.filter(item => item.id !== deleteTarget.id); localStorage.setItem(previewKey, JSON.stringify(next)); setItems(next); }
      else { await deletePortfolioItem(deleteTarget.id); if (identityRef.current !== startedFor) return; await load(); }
      if (identityRef.current !== startedFor) return;
      setMessage("Case removido do portfólio."); setDeleteTarget(null);
    } catch { if (identityRef.current === startedFor) setMessage("Não foi possível remover esse trabalho. Tente novamente."); }
    finally { if (identityRef.current === startedFor) { busy.current = false; setDeleting(false); requestAnimationFrame(() => opener.current?.focus()); } }
  }

  const renderedCover = coverPreview ?? (editing ? preview && /^data:image\/(?:png|jpeg|webp);base64,/.test(editing.imageUrl) ? editing.imageUrl : portfolioUrl(editing.imageUrl, preview) : null);
  return <div className={s.workspace} data-portfolio-workspace>
    <header className={s.header}><div><span>MINHA APRESENTAÇÃO</span><h1>Mostre o que você constrói.</h1><p>Um trabalho, sua contribuição e o resultado. Seu primeiro case pode vir dos estudos.</p></div><button className={s.primary} onClick={() => openEditor()}><Plus size={18}/>Novo case</button></header>
    {preview && <p className={s.previewNote}>Prévia local: os trabalhos desta tela não são publicados na sua conta.</p>}
    {message && <p className={s.notice} role="status">{message}</p>}
    {pendingDraft && !editing && <section className={s.resume} aria-label="Rascunho de portfólio"><div><strong>Seu rascunho está aqui.</strong><p>{pendingDraft.item.title || "Seu próximo case"}{pendingDraft.coverName ? " · escolha a capa novamente ao continuar" : ""}</p></div><button onClick={() => openEditor(undefined, true)}><RotateCcw size={16}/>Continuar rascunho</button><button className={s.mutedButton} onClick={() => setDiscardConfirm(true)}>Descartar</button>{discardConfirm && <div className={s.discard}><p>Descartar o rascunho local? Os cases já publicados continuam salvos.</p><button onClick={() => setDiscardConfirm(false)}>Manter rascunho</button><button onClick={() => { writeDraft(null); setDiscardConfirm(false); }}>Sim, descartar rascunho</button></div>}</section>}
    {loadError ? <div className={s.notice} role="alert"><p>{loadError}</p><button onClick={() => void load()}>Tentar novamente</button></div> : loading ? <p role="status" className={s.loading}>Carregando seus trabalhos…</p> : items.length ? <div className={s.grid}>{items.map(item => {
      const image = preview && /^data:image\/(?:png|jpeg|webp);base64,[a-zA-Z0-9+/=]+$/.test(item.imageUrl) ? item.imageUrl : portfolioUrl(item.imageUrl, preview);
      const project = portfolioUrl(item.projectUrl);
      return <article key={item.id} className={s.card}><div className={s.cardCover}>{image ? <img src={image} alt={`Capa de ${item.title}`} loading="lazy"/> : <OrbitPhoto kind="criacao" fill sizes="(max-width:767px) 100vw, 33vw"/>}{item.featured && <span className={s.featured}><Star size={13}/>Em destaque</span>}</div><div className={s.cardBody}><h2>{item.title}</h2><p>{item.description || "Conte o problema, sua contribuição e o resultado para dar contexto a este trabalho."}</p><div className={s.skills}>{item.skills.map(skill => <span key={skill}>{skill}</span>)}</div><div className={s.cardActions}>{project && <a href={project} target="_blank" rel="noreferrer" aria-label={`Visitar projeto ${item.title}`}><ExternalLink size={16}/>Ver projeto</a>}<button onClick={() => openEditor(item)} aria-label={`Editar case ${item.title}`}><Pencil size={16}/>Editar</button><button onClick={() => { opener.current = document.activeElement as HTMLElement; setDeleteTarget(item); }} aria-label={`Remover case ${item.title}`}><Trash2 size={16}/></button></div></div></article>;
    })}</div> : <section className={s.empty}><OrbitPhoto kind="criacao" className={s.emptyPhoto} sizes="(max-width:767px) 100vw, 50vw"/><div><span>SEU PRIMEIRO TRABALHO</span><h2>O que você já fez merece aparecer.</h2><p>Escolha um projeto real, adicione um print e conte qual parte foi feita por você.</p><button className={s.primary} onClick={() => openEditor()}>Adicionar meu primeiro case<ArrowRight size={18}/></button></div></section>}
    <CollaboratorProfileGuide profile={profile} portfolioCount={loading || loadError ? undefined : items.length} loading={loading} preview={preview}/>
    {storageError && <p role="alert" className={s.notice}>O navegador não conseguiu guardar o rascunho. Copie seu texto antes de fechar.</p>}
    {deleteTarget && <div className={s.confirmDelete}><div ref={deletionDialog} role="alertdialog" aria-modal="true" aria-labelledby="delete-case-title"><h2 id="delete-case-title">Remover este case?</h2><p>{deleteTarget.title} sairá do seu portfólio.</p><div><button disabled={deleting} onClick={() => { setDeleteTarget(null); requestAnimationFrame(() => opener.current?.focus()); }}>Manter case</button><button disabled={deleting} onClick={() => void confirmDelete()}>{deleting ? "Removendo…" : "Remover case"}</button></div></div></div>}
    {editing && <div className={s.backdrop}><div ref={dialog} role="dialog" aria-modal="true" aria-labelledby="portfolio-editor-title" className={s.dialog}>
      <header><div><span>{editing.id ? "ATUALIZAR TRABALHO" : "NOVO TRABALHO"}</span><h2 id="portfolio-editor-title">{editing.id ? "Dê mais contexto ao seu case." : "Vamos apresentar seu trabalho."}</h2></div><button aria-label="Fechar edição e guardar rascunho" disabled={saving || processing} onClick={closeEditor}><X size={21}/></button></header>
      <form onSubmit={event => { event.preventDefault(); void save(); }}>
        <div className={s.coverEditor}><div className={s.coverPreview}>{renderedCover ? <img src={renderedCover} alt="Prévia da capa do case"/> : <div><ImagePlus size={31}/><strong>Uma imagem ajuda a entender seu trabalho.</strong><span>Use um print ou uma foto feita por você.</span></div>}</div><div><label className={s.uploadButton}><Upload size={17}/>{processing ? "Preparando imagem…" : coverName ? "Trocar arquivo" : "Escolher imagem"}<input aria-label="Escolher arquivo da capa" type="file" accept="image/jpeg,image/png,image/webp" disabled={saving || processing} onChange={event => { const file = event.target.files?.[0]; event.target.value = ""; if (file) void chooseFile(file); }}/></label><p>{coverName ?? "JPG, PNG ou WebP · até 25 MB"}</p>{(coverName || editing.imageUrl) && <button type="button" className={s.mutedButton} disabled={saving || processing} onClick={removeCover}>Remover capa</button>}</div></div>
        <details className={s.urlAlternative}><summary>Já tenho um link da imagem</summary><label htmlFor="portfolio-image-url">Link da capa<input id="portfolio-image-url" value={editing.imageUrl} maxLength={2048} disabled={saving || processing} onChange={event => { setCover(null); setCoverName(null); if (coverObject.current) URL.revokeObjectURL(coverObject.current); coverObject.current = null; setCoverPreview(null); change({ ...editing, imageUrl: event.target.value }, null); }} placeholder="https://…" inputMode="url"/></label></details>
        <label htmlFor="portfolio-title">Nome do trabalho<input ref={titleInput} id="portfolio-title" value={editing.title} maxLength={120} disabled={saving} onChange={event => change({ ...editing, title: event.target.value })} placeholder="Ex.: Meu primeiro sistema de pedidos"/></label>
        <label htmlFor="portfolio-description">O que você fez?<span className={s.fieldHint}>Qual era o problema? Qual foi sua contribuição? O que conseguiu entregar?</span><textarea id="portfolio-description" rows={5} value={editing.description} maxLength={4000} disabled={saving} onChange={event => change({ ...editing, description: event.target.value })} placeholder="O projeto precisava de… Eu cuidei de… O resultado foi…"/></label>
        <div className={s.fieldPair}><label htmlFor="portfolio-project-url">Link do projeto <span>opcional</span><input id="portfolio-project-url" value={editing.projectUrl} maxLength={2048} disabled={saving} onChange={event => change({ ...editing, projectUrl: event.target.value })} placeholder="https://…" inputMode="url"/></label><label htmlFor="portfolio-skills">Tecnologias <span>separe por vírgulas</span><input id="portfolio-skills" value={editing.skills.join(", ")} maxLength={1000} disabled={saving} onChange={event => change({ ...editing, skills: event.target.value.split(",").slice(0, 20).map(skill => skill.trim().slice(0, 50)) })} placeholder="C#, SQL, HTML…"/></label></div>
        <label className={s.checkbox}><input type="checkbox" checked={editing.featured} disabled={saving} onChange={event => change({ ...editing, featured: event.target.checked })}/><span>Destacar este trabalho na minha apresentação</span></label>
        {formError && <p className={s.formError} role="alert">{formError}</p>}
        <footer><p>{saving ? "Enviando e salvando seu trabalho…" : "Seu texto fica guardado neste navegador até você salvar ou descartar."}</p><div><button type="button" disabled={saving || processing} onClick={closeEditor}>Fechar e guardar rascunho</button><button className={s.primary} disabled={saving || processing} type="submit">{saving ? <span className={s.spinner}/> : <Save size={17}/>} {saving ? "Salvando…" : preview ? "Salvar na prévia" : "Salvar case"}</button></div></footer>
      </form>
    </div></div>}
  </div>;
}
