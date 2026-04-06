import crypto from "node:crypto";
import { loadConfig } from "../config.js";

const X_AUTHORIZE_URL = "https://x.com/i/oauth2/authorize";
const X_TOKEN_URL = "https://api.x.com/2/oauth2/token";
const X_ME_URL = "https://api.x.com/2/users/me";

export type XUserProfile = {
  id: string;
  username: string;
  name?: string;
  created_at: string;
  verified: boolean;
  verified_type?: string;
  is_identity_verified?: boolean;
};

function toBase64Url(input: Buffer): string {
  return input
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export function createPkcePair() {
  const codeVerifier = toBase64Url(crypto.randomBytes(48));
  const codeChallenge = toBase64Url(
    crypto.createHash("sha256").update(codeVerifier).digest()
  );

  return { codeVerifier, codeChallenge };
}

export function createOAuthState(): string {
  return toBase64Url(crypto.randomBytes(24));
}

export function buildXAuthorizationUrl(state: string, codeChallenge: string): string {
  const config = loadConfig();
  const query = [
    ["response_type", "code"],
    ["client_id", config.xOAuth.clientId],
    ["redirect_uri", config.xOAuth.callbackUrl],
    ["scope", config.xOAuth.scopes.join(" ")],
    ["state", state],
    ["code_challenge", codeChallenge],
    ["code_challenge_method", "S256"]
  ]
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join("&");

  return `${X_AUTHORIZE_URL}?${query}`;
}

export async function exchangeCodeForToken(
  code: string,
  codeVerifier: string
): Promise<string> {
  const config = loadConfig();
  const body = new URLSearchParams({
    code,
    grant_type: "authorization_code",
    redirect_uri: config.xOAuth.callbackUrl,
    code_verifier: codeVerifier
  });

  const headers: Record<string, string> = {
    "Content-Type": "application/x-www-form-urlencoded"
  };

  if (config.xOAuth.clientType === "confidential") {
    const basicAuth = Buffer.from(
      `${config.xOAuth.clientId}:${config.xOAuth.clientSecret}`
    ).toString("base64");
    headers.Authorization = `Basic ${basicAuth}`;
  } else {
    body.set("client_id", config.xOAuth.clientId);
  }

  const response = await fetch(X_TOKEN_URL, {
    method: "POST",
    headers,
    body
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(
      `X token exchange failed with status ${response.status}: ${detail}`
    );
  }

  const payload = (await response.json()) as { access_token?: string };

  if (!payload.access_token) {
    throw new Error("X token exchange did not return an access token");
  }

  return payload.access_token;
}

export async function getXUserProfile(accessToken: string): Promise<XUserProfile> {
  const url = new URL(X_ME_URL);
  url.searchParams.set(
    "user.fields",
    "created_at,verified,verified_type,is_identity_verified,username,name"
  );

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(
      `X user fetch failed with status ${response.status}: ${detail}`
    );
  }

  const payload = (await response.json()) as { data?: XUserProfile };

  if (!payload.data?.id || !payload.data?.created_at) {
    throw new Error("X user profile payload was incomplete");
  }

  return payload.data;
}

export function isVerifiedXUser(user: XUserProfile): boolean {
  return Boolean(
    user.verified ||
      user.is_identity_verified ||
      (user.verified_type && user.verified_type !== "none")
  );
}
