type Owner = string | null;
export interface AuthIdentityTicket { owner: Owner; revision: number }
interface ProfileTicket extends AuthIdentityTicket { request: number }
interface OperationTicket extends AuthIdentityTicket { operation: number; email?: string }

/** Invalida trabalho assíncrono sem depender do momento em que React renderiza. */
export function createAuthSessionGuard() {
  let active = true;
  let owner: Owner = null;
  let token: string | null = null;
  let revision = 0;
  let profileRequest = 0;
  let profilePending = false;
  let profileReady = false;
  let operation = 0;
  let operationPending = false;
  const identity = (): AuthIdentityTicket => ({ owner, revision });
  const current = (ticket: AuthIdentityTicket, responseOwner?: string | number) => active
    && ticket.revision === revision && ticket.owner === owner
    && (responseOwner == null || String(responseOwner) === owner);
  const profileCurrent = (ticket: ProfileTicket, responseOwner?: string | number) => current(ticket, responseOwner) && ticket.request === profileRequest;
  const operationCurrent = (ticket: OperationTicket, responseOwner?: string | number, responseEmail?: string) => active && ticket.operation === operation && operationPending
    && (ticket.email == null || responseEmail == null || ticket.email === responseEmail.trim().toLowerCase())
    && (responseOwner == null || String(responseOwner) === owner || (owner == null && ticket.revision === revision));
  return {
    get owner() { return owner; },
    get token() { return token; },
    get active() { return active; },
    get profileReady() { return profileReady; },
    identity,
    current,
    profileCurrent,
    operationCurrent,
    start() { active = true; },
    stop() { active = false; revision++; profileRequest++; profilePending = false; operation++; operationPending = false; },
    observe(nextOwner: Owner, nextToken: string | null, signedOut = false) {
      const changed = nextOwner !== owner;
      if (changed || signedOut) {
        revision++;
        profileRequest++;
        profilePending = false;
        profileReady = false;
      }
      if (signedOut) { operation++; operationPending = false; }
      owner = nextOwner;
      token = nextToken;
      return changed;
    },
    beginProfile(): ProfileTicket | null {
      if (!active || owner == null || profilePending) return null;
      profilePending = true;
      return { ...identity(), request: ++profileRequest };
    },
    finishProfile(ticket: ProfileTicket, success: boolean) {
      if (!profileCurrent(ticket)) return;
      profilePending = false;
      profileReady = success;
    },
    beginOperation(email?: string): OperationTicket {
      operationPending = true;
      return { ...identity(), operation: ++operation, email: email?.trim().toLowerCase() };
    },
    adoptOperation(ticket: OperationTicket, nextOwner: string | number, nextToken: string, responseEmail?: string) {
      if (!operationCurrent(ticket, nextOwner, responseEmail)) return false;
      const alreadyObserved = owner === String(nextOwner) && token != null;
      if (owner !== String(nextOwner)) revision++;
      owner = String(nextOwner);
      if (!alreadyObserved) token = nextToken;
      profileRequest++;
      profilePending = false;
      profileReady = true;
      return true;
    },
    finishOperation(ticket: OperationTicket) {
      if (ticket.operation === operation) operationPending = false;
    },
    markProfileReady(responseOwner: string | number) {
      if (!active || owner !== String(responseOwner)) return false;
      profileRequest++;
      profilePending = false;
      profileReady = true;
      return true;
    },
    updateToken(ticket: AuthIdentityTicket, nextToken: string) {
      if (!current(ticket)) return false;
      token = nextToken;
      return true;
    },
  };
}
