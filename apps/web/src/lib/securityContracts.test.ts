import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

const repositoryRoot = path.resolve(process.cwd(), "../..");
const migrationsDirectory = path.join(repositoryRoot, "supabase", "migrations");
const migration = async (name: string) => {
  const files = await readdir(migrationsDirectory);
  const [sequence, ...parts] = name.split("_");
  const suffix = `${sequence}00_${parts.join("_")}`;
  const filename = files.find((file) => file.endsWith(suffix));
  if (!filename) throw new Error(`Migration not found: ${name}`);
  return readFile(path.join(migrationsDirectory, filename), "utf8");
};

describe("Supabase security migrations", () => {
  it("revokes profile PII and only exposes the current profile through a guarded RPC", async () => {
    const sql = await migration("013_profiles_pii_hardening.sql");
    expect(sql).toMatch(/revoke select \(phone, address, birth_date, zip_code\)[\s\S]*from anon, authenticated/i);
    expect(sql).toMatch(/security definer[\s\S]*select \* from public\.v3_profiles where id = auth\.uid\(\)/i);
    expect(sql).toMatch(/revoke all on function public\.v3_get_my_profile\(\) from public/i);
    expect(sql).toMatch(/grant execute on function public\.v3_get_my_profile\(\) to authenticated/i);
  });

  it("keeps profile email private and limits contact lookup to staff", async () => {
    const sql = await migration("014_profile_email_hardening.sql");
    expect(sql).toMatch(/revoke select \(email\).*from anon, authenticated/i);
    expect(sql).toMatch(/where public\.v3_is_staff\(\) and p\.id = any\(ids\)/i);
    expect(sql).toMatch(/revoke all on function public\.v3_profiles_contact\(uuid\[\]\) from public/i);
  });

  it("prevents users from approving their own applications", async () => {
    const sql = await migration("012_admin_operations_security.sql");
    expect(sql).toMatch(/drop policy if exists "update own applications"/i);
    expect(sql).toMatch(/where id=application_id and user_id=auth\.uid\(\) and status in \('pending','reviewing'\)/i);
    expect(sql).toMatch(/staff update applications[\s\S]*public\.v3_is_staff\(\)/i);
  });

  it("protects every newly-created operational table with RLS", async () => {
    const sql = await migration("012_admin_operations_security.sql");
    for (const table of ["v3_notifications", "v3_portfolio_items", "v3_account_requests"]) {
      expect(sql, `${table} must enable RLS`).toMatch(
        new RegExp(`alter table public\\.${table} enable row level security`, "i")
      );
    }
  });

  it("stores only hashed contact identifiers and hides the limiter table", async () => {
    const sql = await migration("015_contact_rate_limit.sql");
    expect(sql).toMatch(/ip_hash text not null/i);
    expect(sql).not.toMatch(/\bip_address\b|\bclient_ip\b/i);
    expect(sql).toMatch(/alter table public\.v3_contact_attempts enable row level security/i);
    expect(sql).toMatch(/revoke all on function public\.v3_contact_rate_check\(text, int, int\) from public/i);
  });

  it("sets a fixed search_path on every SECURITY DEFINER function in hardened migrations", async () => {
    for (const name of [
      "012_admin_operations_security.sql",
      "013_profiles_pii_hardening.sql",
      "014_profile_email_hardening.sql",
      "015_contact_rate_limit.sql",
    ]) {
      const sql = await migration(name);
      const declarations = sql.split(/create or replace function/i).slice(1);
      for (const declaration of declarations) {
        if (/security definer/i.test(declaration)) {
          expect(declaration, `${name} has an unsafe SECURITY DEFINER`).toMatch(/set search_path\s*=\s*public/i);
        }
      }
    }
  });
});
