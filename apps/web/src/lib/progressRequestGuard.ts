type ProgressOwner = string | number | null;
interface ProgressTicket { owner: string; revision: number; request: number }

/** Vincula a resposta ao dono, sessao e ultima requisicao que a iniciou. */
export function createProgressRequestGuard() {
  let owner: string | null = null;
  let token: string | null = null;
  let revision = 0;
  let request = 0;
  let active = true;
  const sameIdentity = (nextOwner: ProgressOwner, nextToken: string | null) =>
    owner === (nextOwner == null ? null : String(nextOwner)) && token === nextToken;
  return {
    observe(nextOwner: ProgressOwner, nextToken: string | null) {
      if (!sameIdentity(nextOwner, nextToken)) { revision += 1; request += 1; }
      owner = nextOwner == null ? null : String(nextOwner);
      token = nextToken;
    },
    sameIdentity,
    start() { active = true; },
    stop() { active = false; revision += 1; request += 1; },
    begin(expectedOwner: ProgressOwner, expectedToken: string | null): ProgressTicket | null {
      if (!active || !owner || !token || !sameIdentity(expectedOwner, expectedToken)) return null;
      return { owner, revision, request: ++request };
    },
    current(ticket: ProgressTicket, responseOwner?: string | number) {
      return active && ticket.owner === owner && ticket.revision === revision && ticket.request === request
        && (responseOwner === undefined || String(responseOwner) === owner);
    },
  };
}
