import { redirect } from "next/navigation";

/**
 * Redireciona /mural para /forum (nome e página modernizados).
 */
export default function MuralPage() {
  redirect("/forum");
}
