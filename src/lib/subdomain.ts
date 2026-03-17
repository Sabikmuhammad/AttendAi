/**
 * Subdomain-based multi-tenant routing is currently disabled.
 *
 * The codebase still stores `Institution.subdomain` for potential future use,
 * but runtime routing/auth should not depend on the hostname.
 */
export function areSubdomainsEnabled() {
  return false;
}

/**
  Extracts the institution slug from a hostname.

  Dev:  sahyadri.localhost:3000  → "sahyadri"
  Prod: sahyadri.attendai.com   → "sahyadri"

  Returns null when subdomains are disabled, when there is no slug, or when the
  provided hostname is the root domain or localhost without a subdomain.
 */
export function extractSubdomain(hostname: string): string | null {
  void hostname;
  return null;
}
