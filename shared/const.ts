export const COOKIE_NAME = "manus_session";
export const OAUTH_STATE_COOKIE = "oauth_state";
export const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;
export const AXIOS_TIMEOUT_MS = 15_000;
export const UNAUTHED_ERR_MSG = "Please login to continue";
export const NOT_ADMIN_ERR_MSG = "Admin access required";

type OAuthState = { redirectUri: string; nonce: string };

export function encodeOAuthState(state: OAuthState): string {
  const json = JSON.stringify(state);
  if (typeof btoa === "function") return btoa(json).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
  return Buffer.from(json).toString("base64url");
}

export function decodeOAuthState(encoded: string): OAuthState {
  try {
    const normalized = encoded.replaceAll("-", "+").replaceAll("_", "/");
    const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
    const json = typeof atob === "function" ? atob(padded) : Buffer.from(padded, "base64").toString("utf8");
    const parsed = JSON.parse(json) as Partial<OAuthState>;
    if (typeof parsed.redirectUri !== "string" || typeof parsed.nonce !== "string") throw new Error("Invalid OAuth state");
    return { redirectUri: parsed.redirectUri, nonce: parsed.nonce };
  } catch {
    throw new Error("Invalid OAuth state");
  }
}
