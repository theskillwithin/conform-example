import type { Session } from "react-router";
import { createCookieSessionStorage } from "react-router";

// Simplified cookie-based session storage for the example
// In production, this would use cookies + database like the original

const FORM_SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// Form Session Storage
const formSessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__form_sessions",
    sameSite: "lax",
    maxAge: FORM_SESSION_MAX_AGE,
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  },
});

/**
 * Extracts the Cookie header from a request
 * @param request - The incoming request
 * @returns The cookie string or null
 */
export const getCookieHeader = (request: Request) =>
  request.headers.get("Cookie");

/**
 * Gets a form session from a cookie string
 * @param cookie - The cookie string from the request
 * @returns The form session
 */
export function getFormSessionFromCookie(cookie: string | null) {
  return formSessionStorage.getSession(cookie);
}

/**
 * Gets a form session from a request
 * @param request - The incoming request
 * @returns The form session
 */
export function getFormSession(request: Request) {
  const cookie = getCookieHeader(request);
  return getFormSessionFromCookie(cookie);
}

/**
 * Commits a form session with the configured max age
 * @param session - The session to commit
 * @returns Promise<string> - The session cookie string
 */
export function commitFormSession(session: Session) {
  return formSessionStorage.commitSession(session, {
    maxAge: FORM_SESSION_MAX_AGE,
  });
}

/**
 * Destroys a form session
 * @param session - The session to destroy
 * @returns Promise<string> - The destroy cookie string
 */
export function destroyFormSession(session: Session) {
  return formSessionStorage.destroySession(session);
}

/**
 * Generates a session key for a specific form
 * @param formId - The form ID
 * @returns The session key string
 */
const sessionKey = (formId: string) => `formSession_${formId}`;

/**
 * Gets form session data for a specific form
 * @param request - The incoming request
 * @param formId - The form ID
 * @returns Promise with form session data or null
 */
export async function getFormSessionData(request: Request, formId: string) {
  const session = await getFormSession(request);
  const key = sessionKey(formId);

  if (session.has(key)) {
    const sessionData = session.get(key) as
      | { formId: string; data: Record<string, unknown> }
      | undefined;

    if (sessionData && sessionData.formId === formId) {
      return { data: sessionData.data };
    }
  }

  return null;
}

/**
 * Creates or updates a form session for a specific form
 * @param request - The incoming request
 * @param data - Form data to store
 * @param formId - The form ID
 * @returns Promise<string> - Session cookie string
 */
export async function saveFormSession({
  formId,
  data,
  request,
}: {
  formId: string;
  data: Record<string, unknown>;
  request: Request;
}): Promise<string> {
  const session = await getFormSession(request);
  const key = sessionKey(formId);

  if (session.has(key)) {
    // Update existing session for this specific form
    const existingData = session.get(key) as
      | { formId: string; data: Record<string, unknown> }
      | undefined;

    if (existingData && existingData.formId === formId) {
      // Merge existing data with new data to preserve all step data
      session.set(key, {
        formId,
        data: {
          ...existingData.data,
          ...data,
        },
      });
      return commitFormSession(session);
    }
  }

  // Create new session for this form
  session.set(key, { formId, data });
  return commitFormSession(session);
}

/**
 * Clears a form session for a specific form
 * @param request - The incoming request
 * @param formId - The form ID
 * @returns Promise<string> - Session cookie string
 */
export async function clearFormSession(
  request: Request,
  formId: string,
): Promise<string> {
  const session = await getFormSession(request);
  const key = sessionKey(formId);

  if (session.has(key)) {
    session.unset(key);
    return commitFormSession(session);
  }

  return commitFormSession(session);
}
