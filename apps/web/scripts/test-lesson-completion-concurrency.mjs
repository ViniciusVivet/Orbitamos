// Teste real de bloqueios Postgres. Executa SOMENTE no container local fixo;
// nao aceita URL de banco, project-ref, credenciais ou destino remoto.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

const container = "supabase_db_orbitamos-local";
const owner = "19100000-0000-0000-0000-000000000001";
const otherOwner = "19100000-0000-0000-0000-000000000002";
const course = "19100000-0000-0000-0000-000000000010";
const moduleId = "19100000-0000-0000-0000-000000000020";
const lessonA = "19100000-0000-0000-0000-000000000031";
const lessonB = "19100000-0000-0000-0000-000000000032";

function sql(source, onData = () => {}) {
  const child = spawn("docker", ["exec", "-i", container, "psql", "-U", "postgres", "-d", "postgres", "-X", "-qAt", "-v", "ON_ERROR_STOP=1"], { windowsHide: true, timeout: 30000, stdio: ["pipe", "pipe", "pipe"] });
  let stdout = "";
  let stderr = "";
  const done = new Promise((resolve, reject) => {
    child.stdout.on("data", (chunk) => { stdout += chunk; onData(stdout); });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("error", reject);
    child.on("close", (code) => code === 0 ? resolve(stdout.trim()) : reject(new Error(`Local psql failed (${code}): ${stderr}`)));
    child.stdin.on("error", () => {});
    child.stdin.end(source);
  });
  return done;
}

const identity = `set local role authenticated; select set_config('request.jwt.claims', '{"sub":"${owner}","role":"authenticated"}', true);`;
const completion = (id) => `select public.v3_complete_lesson('${id}','completion-concurrency-local','${owner}');`;
const cleanup = `delete from auth.users where id in ('${owner}','${otherOwner}'); delete from public.courses where id = '${course}';`;
const workers = [];
let fixturesCreated = false;
try {
  // Refuse collisions rather than replacing any preexisting local records.
  await sql(`begin;
    insert into auth.users (id,instance_id,aud,role,email,encrypted_password,raw_app_meta_data,raw_user_meta_data,created_at,updated_at) values
      ('${owner}','00000000-0000-0000-0000-000000000000','authenticated','authenticated','concurrency-a@local.test','','{"provider":"email","providers":["email"]}','{"name":"Concurrency A","role":"STUDENT"}',now(),now()),
      ('${otherOwner}','00000000-0000-0000-0000-000000000000','authenticated','authenticated','concurrency-b@local.test','','{"provider":"email","providers":["email"]}','{"name":"Concurrency B","role":"STUDENT"}',now(),now());
    update public.v3_user_progress set xp=90,level=3 where user_id='${owner}';
    update public.v3_user_progress set xp=40,level=2 where user_id='${otherOwner}';
    insert into public.courses(id,slug,title,is_published) values('${course}','completion-concurrency-local','Concurrency local',true);
    insert into public.course_modules(id,course_id,slug,title) values('${moduleId}','${course}','local','Local');
    insert into public.lessons(id,module_id,slug,title,is_published) values
      ('${lessonA}','${moduleId}','local-a','Concurrent A',true),('${lessonB}','${moduleId}','local-b','Concurrent B',true);
    commit;`);
  fixturesCreated = true;

  let notifyHolding;
  const holding = new Promise((resolve) => { notifyHolding = resolve; });
  const first = sql(`set application_name='orbitamos_completion_race_first'; begin; ${identity} ${completion(lessonA)} select 'LOCK_HELD'; select pg_sleep(6); commit;`, (output) => {
    if (output.includes("LOCK_HELD")) notifyHolding();
  });
  workers.push(first);
  await Promise.race([holding, first.then(() => { throw new Error("First transaction did not hold the lock"); })]);
  const duplicate = sql(`set application_name='orbitamos_completion_race_duplicate'; begin; ${identity} ${completion(lessonA)} commit;`);
  const distinct = sql(`set application_name='orbitamos_completion_race_distinct'; begin; ${identity} ${completion(lessonB)} commit;`);
  workers.push(duplicate, distinct);

  let observedWaiters = 0;
  const deadline = Date.now() + 5000;
  while (Date.now() < deadline && observedWaiters < 2) {
    observedWaiters = Number(await sql("select count(*) from pg_stat_activity where application_name in ('orbitamos_completion_race_duplicate','orbitamos_completion_race_distinct') and wait_event_type='Lock';"));
    if (observedWaiters < 2) await delay(100);
  }
  assert.equal(observedWaiters, 2, "duplicate lesson and distinct lesson must actually wait on database locks");
  const outputs = await Promise.all(workers);
  const results = outputs.map((output) => output.split(/\r?\n/).map((line) => {
    try { return JSON.parse(line); } catch { return null; }
  }).find((value) => value && "xp_awarded" in value));
  assert.deepEqual(results.map((value) => value.xp_awarded), [10, 0, 10]);
  assert.deepEqual(results.map((value) => value.newly_completed), [true, false, true]);
  const final = JSON.parse(await sql(`select json_build_object('xp',p.xp,'level',p.level,'completed',(select count(*) from public.lesson_progress where user_id='${owner}' and completed_at is not null),'other_xp',(select xp from public.v3_user_progress where user_id='${otherOwner}')) from public.v3_user_progress p where p.user_id='${owner}';`));
  assert.deepEqual(final, { xp: 10, level: 4, completed: 2, other_xp: 40 });
  console.log("PASS: real concurrent duplicate/distinct completions, XP boundary, idempotency and account isolation.");
} finally {
  await Promise.allSettled(workers);
  if (fixturesCreated) await sql(cleanup);
}
