import { getSession, useSession } from "next-auth/react";

export interface CustomSessionData {
  accessToken?: string;
  idToken?: string;
  customData?: {
    userId?: string;
    email?: string;
  };
}

export async function getJWTInfo() {
  const session = await getSession();
  if (!session) {
    return null;
  }

  const customSession = session as CustomSessionData;

  return {
    accessToken: customSession.accessToken,
    customData: customSession.customData,
  };
}

export function useJWTInfo() {
  const { data: session } = useSession();
  if (!session) {
    return null;
  }

  const customSession = session as CustomSessionData;
  return {
    accessToken: customSession.accessToken,
    idToken: customSession.idToken,
    customData: customSession.customData,
  };
}

// Helper function to decode JWT token
export function decodeJWT(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

// Helper function to get OpenID claims from ID token
export function getOpenIDClaims(idToken: string) {
  const decoded = decodeJWT(idToken);
  if (!decoded) return null;

  return {
    iss: decoded.iss, // Issuer
    sub: decoded.sub, // Subject (user ID)
    aud: decoded.aud, // Audience
    exp: decoded.exp, // Expiration time
    iat: decoded.iat, // Issued at
    email: decoded.email,
    email_verified: decoded.email_verified,
    name: decoded.name,
    picture: decoded.picture,
  };
} 