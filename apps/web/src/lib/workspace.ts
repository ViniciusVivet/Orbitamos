import { requireSupabase } from "@/lib/supabase";

type ContactRow = { name: string; email: string; avatarUrl: string | null };

/**
 * Le nome/email/foto de um conjunto de usuarios para telas de staff.
 * Usa a funcao definer v3_profiles_contact (migration 014); se ela ainda nao
 * existir, cai para leitura direta (compatibilidade antes da migration).
 */
async function fetchProfilesContact(ids: string[]): Promise<Map<string, ContactRow>> {
  const map = new Map<string, ContactRow>();
  const unique = [...new Set(ids)];
  if (!unique.length) return map;
  const client = requireSupabase();
  const rpc = await client.rpc("v3_profiles_contact", { ids: unique });
  const rows = rpc.error
    ? (await client.from("v3_profiles").select("id,name,email,avatar_url").in("id", unique)).data ?? []
    : rpc.data ?? [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const r of rows as any[]) {
    map.set(r.id, { name: r.name ?? "", email: r.email ?? "", avatarUrl: r.avatar_url ?? null });
  }
  return map;
}

export type AdminJob = {
  id?: number; title:string; description:string; type:string; workModel:string; status:"draft"|"open"|"paused"|"closed";
  skills:string[]; requirements:string[]; budgetLabel:string; scope:string; openings:number; applicationDeadline:string;
};
export type AdminApplication = { id:number; jobId:number; userId:string; candidateName:string; candidateEmail:string; jobTitle:string; status:"pending"|"reviewing"|"accepted"|"declined"|"withdrawn"; coverLetter:string; feedback:string; createdAt:string };
export type AdminProject = { id?:number; title:string; description:string; status:"todo"|"in_progress"|"completed"|"paused"; clientName:string; priority:"low"|"medium"|"high"|"urgent"; startDate:string; dueDate:string; progress:number; briefing:string; links:Array<{label:string;url:string}> };
export type WorkspaceMember = { id:string; name:string; email:string; avatarUrl?:string|null; roleLabel?:string };
export type NotificationItem = { id:number; type:string; title:string; body:string; href?:string|null; readAt?:string|null; createdAt:string };
export type PortfolioItem = { id?:number; title:string; description:string; projectUrl:string; imageUrl:string; skills:string[]; featured:boolean; sortOrder:number };

export async function listAdminJobs():Promise<AdminJob[]> { const {data,error}=await requireSupabase().from("v3_jobs").select("*").order("created_at",{ascending:false}); if(error)throw new Error("Não foi possível carregar as vagas."); return (data??[]).map(r=>({id:r.id,title:r.title,description:r.description,type:r.type,workModel:r.work_model,status:r.status,skills:r.skills??[],requirements:r.requirements??[],budgetLabel:r.budget_label??"",scope:r.scope??"",openings:r.openings??1,applicationDeadline:r.application_deadline??""})); }
export async function saveAdminJob(job:AdminJob):Promise<void> { const client=requireSupabase(); const {data:{user}}=await client.auth.getUser(); const payload={title:job.title.trim(),description:job.description.trim(),type:job.type,work_model:job.workModel,status:job.status,skills:job.skills,requirements:job.requirements,budget_label:job.budgetLabel.trim()||null,scope:job.scope.trim()||null,openings:job.openings,application_deadline:job.applicationDeadline||null,published_at:job.status==="open"?new Date().toISOString():null,created_by:user?.id}; const query=job.id?client.from("v3_jobs").update(payload).eq("id",job.id):client.from("v3_jobs").insert(payload); const {error}=await query;if(error)throw new Error(error.message||"Não foi possível salvar a vaga."); }

export async function listAdminApplications():Promise<AdminApplication[]> { const client=requireSupabase(); const {data,error}=await client.from("v3_job_applications").select("*").order("created_at",{ascending:false}); if(error)throw new Error("Não foi possível carregar candidaturas."); const rows=data??[]; const userIds=[...new Set(rows.map(r=>r.user_id))]; const jobIds=[...new Set(rows.map(r=>r.job_id))]; const [contacts,{data:jobs}]=await Promise.all([fetchProfilesContact(userIds),jobIds.length?client.from("v3_jobs").select("id,title").in("id",jobIds):Promise.resolve({data:[]})]); return rows.map(r=>{const p=contacts.get(r.user_id);const j=(jobs??[]).find(x=>x.id===r.job_id);return{id:r.id,jobId:r.job_id,userId:r.user_id,candidateName:p?.name||"Candidato",candidateEmail:p?.email??"",jobTitle:j?.title??"Vaga",status:r.status,coverLetter:r.cover_letter??"",feedback:r.feedback??"",createdAt:r.created_at};}); }
export async function updateAdminApplication(id:number,status:AdminApplication["status"],feedback:string):Promise<void>{const {error}=await requireSupabase().from("v3_job_applications").update({status,feedback:feedback.trim()||null,updated_at:new Date().toISOString()}).eq("id",id);if(error)throw new Error("Não foi possível atualizar a candidatura.");}

export async function listAdminProjects():Promise<AdminProject[]>{const {data,error}=await requireSupabase().from("v3_collaborator_projects").select("*").order("updated_at",{ascending:false});if(error)throw new Error("Não foi possível carregar projetos.");return(data??[]).map(r=>({id:r.id,title:r.title,description:r.description,status:r.status,clientName:r.client_name??"",priority:r.priority??"medium",startDate:r.start_date??"",dueDate:r.due_date??"",progress:r.progress??0,briefing:r.briefing??"",links:Array.isArray(r.links)?r.links:[]}));}
export async function saveAdminProject(project:AdminProject):Promise<void>{const payload={title:project.title.trim(),description:project.description.trim(),status:project.status,client_name:project.clientName.trim()||null,priority:project.priority,start_date:project.startDate||null,due_date:project.dueDate||null,progress:project.progress,briefing:project.briefing.trim()||null,links:project.links,updated_at:new Date().toISOString()};const client=requireSupabase();const query=project.id?client.from("v3_collaborator_projects").update(payload).eq("id",project.id):client.from("v3_collaborator_projects").insert(payload);const{error}=await query;if(error)throw new Error("Não foi possível salvar o projeto.");}
export async function listProjectMembers(projectId:number):Promise<WorkspaceMember[]>{const client=requireSupabase();const{data,error}=await client.from("v3_project_members").select("user_id,role_label").eq("project_id",projectId);if(error)throw new Error("Não foi possível carregar o squad.");const ids=(data??[]).map(r=>r.user_id);if(!ids.length)return[];const contacts=await fetchProfilesContact(ids);return ids.map(id=>{const p=contacts.get(id);return{id,name:p?.name||"Colaborador",email:p?.email??"",avatarUrl:p?.avatarUrl??null,roleLabel:(data??[]).find(m=>m.user_id===id)?.role_label??"Colaborador"};});}
export async function listAvailableCollaborators():Promise<WorkspaceMember[]>{const{data,error}=await requireSupabase().from("v3_profiles").select("id,name,avatar_url").or("role.eq.FREELANCER,is_internal.eq.true").order("name");if(error)throw new Error("Não foi possível carregar colaboradores.");const rows=data??[];const contacts=await fetchProfilesContact(rows.map(p=>p.id));return rows.map(p=>({id:p.id,name:p.name??"Colaborador",email:contacts.get(p.id)?.email??"",avatarUrl:p.avatar_url}));}
export async function addProjectMember(projectId:number,userId:string,roleLabel:string):Promise<void>{const{error}=await requireSupabase().from("v3_project_members").upsert({project_id:projectId,user_id:userId,role_label:roleLabel.trim()||"Colaborador"});if(error)throw new Error("Não foi possível adicionar o colaborador.");}
export async function removeProjectMember(projectId:number,userId:string):Promise<void>{const{error}=await requireSupabase().from("v3_project_members").delete().eq("project_id",projectId).eq("user_id",userId);if(error)throw new Error("Não foi possível remover o colaborador.");}

export async function listNotifications():Promise<NotificationItem[]>{const{data,error}=await requireSupabase().from("v3_notifications").select("*").order("created_at",{ascending:false}).limit(50);if(error)throw new Error("Não foi possível carregar notificações.");return(data??[]).map(r=>({id:r.id,type:r.type,title:r.title,body:r.body,href:r.href,readAt:r.read_at,createdAt:r.created_at}));}
export async function markNotificationRead(id:number):Promise<void>{const{error}=await requireSupabase().from("v3_notifications").update({read_at:new Date().toISOString()}).eq("id",id);if(error)throw new Error("Não foi possível marcar a notificação.");}
export async function markAllNotificationsRead():Promise<void>{const{error}=await requireSupabase().from("v3_notifications").update({read_at:new Date().toISOString()}).is("read_at",null);if(error)throw new Error("Não foi possível atualizar notificações.");}

export async function listPortfolioItems():Promise<PortfolioItem[]>{const{data,error}=await requireSupabase().from("v3_portfolio_items").select("*").order("sort_order");if(error)throw new Error("Não foi possível carregar o portfólio.");return(data??[]).map(r=>({id:r.id,title:r.title,description:r.description,projectUrl:r.project_url??"",imageUrl:r.image_url??"",skills:r.skills??[],featured:r.featured,sortOrder:r.sort_order}));}
export async function savePortfolioItem(item:PortfolioItem):Promise<void>{const client=requireSupabase();const{data:{user}}=await client.auth.getUser();if(!user)throw new Error("Sessão expirada.");const payload={user_id:user.id,title:item.title.trim(),description:item.description.trim(),project_url:item.projectUrl.trim()||null,image_url:item.imageUrl.trim()||null,skills:item.skills,featured:item.featured,sort_order:item.sortOrder,updated_at:new Date().toISOString()};const query=item.id?client.from("v3_portfolio_items").update(payload).eq("id",item.id):client.from("v3_portfolio_items").insert(payload);const{error}=await query;if(error)throw new Error("Não foi possível salvar o case.");}
export async function deletePortfolioItem(id:number):Promise<void>{const{error}=await requireSupabase().from("v3_portfolio_items").delete().eq("id",id);if(error)throw new Error("Não foi possível remover o case.");}

export async function requestAccountAction(type:"deletion"|"data_export",reason:string):Promise<void>{const client=requireSupabase();const{data:{user}}=await client.auth.getUser();if(!user)throw new Error("Sessão expirada.");const{error}=await client.from("v3_account_requests").insert({user_id:user.id,type,reason:reason.trim()||null});if(error?.code==="23505")throw new Error("Já existe uma solicitação em andamento.");if(error)throw new Error("Não foi possível registrar a solicitação.");}
export type AccountRequest={id:number;userId:string;userName:string;userEmail:string;type:"deletion"|"data_export";status:"pending"|"processing"|"completed"|"cancelled";reason:string;createdAt:string};
export async function listAccountRequests():Promise<AccountRequest[]>{const client=requireSupabase();const{data,error}=await client.from("v3_account_requests").select("*").order("created_at",{ascending:false});if(error)throw new Error("Não foi possível carregar solicitações.");const rows=data??[];const contacts=await fetchProfilesContact(rows.map(r=>r.user_id));return rows.map(r=>{const p=contacts.get(r.user_id);return{id:r.id,userId:r.user_id,userName:p?.name||"Usuário",userEmail:p?.email??"",type:r.type,status:r.status,reason:r.reason??"",createdAt:r.created_at};});}
export async function updateAccountRequest(id:number,status:AccountRequest["status"]):Promise<void>{const{error}=await requireSupabase().from("v3_account_requests").update({status,updated_at:new Date().toISOString()}).eq("id",id);if(error)throw new Error("Não foi possível atualizar a solicitação.");}

// ==================== ORBITACADEMY (admin de cursos) ====================

export type AdminQuizQuestion = { question: string; options: string[]; answer: string };
export type AdminMaterial = { id?: string; title: string; kind: string; fileUrl: string; externalUrl: string; position: number };
export type AdminLesson = {
  id?: string; slug: string; title: string; description: string;
  youtubeVideoId: string; content: string; isPublished: boolean; position: number;
  quiz: AdminQuizQuestion[]; materials: AdminMaterial[];
};
export type AdminModule = { id?: string; slug: string; title: string; description: string; position: number; lessons: AdminLesson[] };
export type AdminCourse = {
  id?: string; slug: string; title: string; description: string;
  coverUrl: string; level: string; isPublished: boolean; position: number; modules: AdminModule[];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapQuiz(raw: any): AdminQuizQuestion[] {
  if (!Array.isArray(raw)) return [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return raw.map((q: any) => ({
    question: q?.question ?? "",
    options: Array.isArray(q?.options) ? q.options.map(String) : [],
    answer: q?.answer ?? "",
  }));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const byPosition = (a: any, b: any) => (a.position ?? 0) - (b.position ?? 0);

export async function listAdminCourses(): Promise<AdminCourse[]> {
  const { data, error } = await requireSupabase()
    .from("courses")
    .select(`
      id, slug, title, description, cover_url, level, is_published, position,
      course_modules (
        id, slug, title, description, position,
        lessons (
          id, slug, title, description, youtube_video_id, content, is_published, position, quiz,
          lesson_materials ( id, title, kind, file_url, external_url, position )
        )
      )
    `)
    .order("position", { ascending: true });
  if (error) throw new Error("Não foi possível carregar os cursos.");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((data ?? []) as any[]).map((c) => ({
    id: c.id, slug: c.slug, title: c.title, description: c.description ?? "",
    coverUrl: c.cover_url ?? "", level: c.level ?? "", isPublished: c.is_published, position: c.position ?? 0,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    modules: ((c.course_modules ?? []) as any[]).sort(byPosition).map((m) => ({
      id: m.id, slug: m.slug, title: m.title, description: m.description ?? "", position: m.position ?? 0,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      lessons: ((m.lessons ?? []) as any[]).sort(byPosition).map((l) => ({
        id: l.id, slug: l.slug, title: l.title, description: l.description ?? "",
        youtubeVideoId: l.youtube_video_id ?? "", content: l.content ?? "",
        isPublished: l.is_published, position: l.position ?? 0, quiz: mapQuiz(l.quiz),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        materials: ((l.lesson_materials ?? []) as any[]).sort(byPosition).map((mat) => ({
          id: mat.id, title: mat.title, kind: mat.kind ?? "PDF",
          fileUrl: mat.file_url ?? "", externalUrl: mat.external_url ?? "", position: mat.position ?? 0,
        })),
      })),
    })),
  }));
}

export async function saveAdminCourse(course: Omit<AdminCourse, "modules">): Promise<string> {
  const client = requireSupabase();
  const payload = {
    slug: course.slug.trim(), title: course.title.trim(), description: course.description.trim() || null,
    cover_url: course.coverUrl.trim() || null, level: course.level.trim() || null,
    is_published: course.isPublished, position: course.position, updated_at: new Date().toISOString(),
  };
  if (course.id) {
    const { error } = await client.from("courses").update(payload).eq("id", course.id);
    if (error) throw new Error(error.message);
    return course.id;
  }
  const { data, error } = await client.from("courses").insert(payload).select("id").single();
  if (error) throw new Error(error.message);
  return data.id as string;
}

export async function deleteAdminCourse(id: string): Promise<void> {
  const { error } = await requireSupabase().from("courses").delete().eq("id", id);
  if (error) throw new Error("Não foi possível remover o curso.");
}

export async function saveAdminModule(courseId: string, mod: Omit<AdminModule, "lessons">): Promise<string> {
  const client = requireSupabase();
  const payload = {
    course_id: courseId, slug: mod.slug.trim(), title: mod.title.trim(),
    description: mod.description.trim() || null, position: mod.position, updated_at: new Date().toISOString(),
  };
  if (mod.id) {
    const { error } = await client.from("course_modules").update(payload).eq("id", mod.id);
    if (error) throw new Error(error.message);
    return mod.id;
  }
  const { data, error } = await client.from("course_modules").insert(payload).select("id").single();
  if (error) throw new Error(error.message);
  return data.id as string;
}

export async function deleteAdminModule(id: string): Promise<void> {
  const { error } = await requireSupabase().from("course_modules").delete().eq("id", id);
  if (error) throw new Error("Não foi possível remover o módulo.");
}

export async function saveAdminLesson(moduleId: string, lesson: Omit<AdminLesson, "materials">): Promise<string> {
  const client = requireSupabase();
  const payload = {
    module_id: moduleId, slug: lesson.slug.trim(), title: lesson.title.trim(),
    description: lesson.description.trim() || null, youtube_video_id: lesson.youtubeVideoId.trim() || null,
    content: lesson.content.trim() || null, is_published: lesson.isPublished, position: lesson.position,
    quiz: lesson.quiz, updated_at: new Date().toISOString(),
  };
  if (lesson.id) {
    const { error } = await client.from("lessons").update(payload).eq("id", lesson.id);
    if (error) throw new Error(error.message);
    return lesson.id;
  }
  const { data, error } = await client.from("lessons").insert(payload).select("id").single();
  if (error) throw new Error(error.message);
  return data.id as string;
}

export async function deleteAdminLesson(id: string): Promise<void> {
  const { error } = await requireSupabase().from("lessons").delete().eq("id", id);
  if (error) throw new Error("Não foi possível remover a aula.");
}

export async function saveAdminMaterial(lessonId: string, material: AdminMaterial): Promise<string> {
  const client = requireSupabase();
  const payload = {
    lesson_id: lessonId, title: material.title.trim(), kind: material.kind.trim() || "PDF",
    file_url: material.fileUrl.trim() || null, external_url: material.externalUrl.trim() || null,
    position: material.position,
  };
  if (material.id) {
    const { error } = await client.from("lesson_materials").update(payload).eq("id", material.id);
    if (error) throw new Error(error.message);
    return material.id;
  }
  const { data, error } = await client.from("lesson_materials").insert(payload).select("id").single();
  if (error) throw new Error(error.message);
  return data.id as string;
}

export async function deleteAdminMaterial(id: string): Promise<void> {
  const { error } = await requireSupabase().from("lesson_materials").delete().eq("id", id);
  if (error) throw new Error("Não foi possível remover o material.");
}

// Redimensiona imagem no navegador para no maximo maxDim px (WebP leve). null se nao der.
async function resizeToWebp(file: File, maxDim: number, quality = 0.85): Promise<Blob | null> {
  if (typeof document === "undefined" || typeof createImageBitmap === "undefined") return null;
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" }).catch(() => null);
  if (!bitmap) return null;
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) { bitmap.close?.(); return null; }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();
  return new Promise((resolve) => canvas.toBlob(resolve, "image/webp", quality));
}

const MAX_ACADEMY_ASSET_BYTES = 25 * 1024 * 1024;

/**
 * Sobe um arquivo para o bucket 'academy' (migration 017) e retorna a URL publica.
 * Imagens sao redimensionadas (bom para o free tier); documentos vao como estao.
 * Aceita entrada generosa (ate 25 MB) porque imagem e comprimida antes de subir.
 */
export async function uploadAcademyAsset(folder: string, file: File): Promise<string> {
  if (file.size > MAX_ACADEMY_ASSET_BYTES) {
    throw new Error("Arquivo muito grande. Envie um arquivo de até 25 MB.");
  }
  const client = requireSupabase();
  const isImage = file.type.startsWith("image/") && file.type !== "image/gif";
  let blob: Blob = file;
  let ext = (file.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
  let contentType = file.type || "application/octet-stream";
  if (isImage) {
    const resized = await resizeToWebp(file, 1280);
    if (resized) { blob = resized; ext = "webp"; contentType = "image/webp"; }
  }
  const safeFolder = folder.replace(/[^a-z0-9/_-]/gi, "") || "misc";
  const path = `${safeFolder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await client.storage.from("academy").upload(path, blob, { upsert: false, contentType });
  if (error) throw new Error(error.message);
  return client.storage.from("academy").getPublicUrl(path).data.publicUrl;
}
