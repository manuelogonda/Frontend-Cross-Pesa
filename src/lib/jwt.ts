/**
 * Decodes the payload segment of a JWT access token WITHOUT signature
 * verification. Signature integrity is enforced server-side on every API
 * call; the client uses this only for routing decisions (which the backend
 * re-authorizes per request anyway).
 */
export const decodeJwtPayload = (token: string): Record<string, unknown> | null => {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(window.atob(base64));
    return typeof payload === 'object' && payload !== null ? payload : null;
  } catch {
    // Malformed / mangled token — fail closed for callers checking roles.
    return null;
  }
};

/**
 * Whether the token carries an ADMIN authority (Spring Boot style: "ROLE_ADMIN").
 */
export const isAdminToken = (token: string): boolean => {
  const payload = decodeJwtPayload(token);
  const role = String(payload?.role ?? '').toUpperCase();
  return role.includes('ADMIN');
};
