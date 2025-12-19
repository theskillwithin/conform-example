import type { Session } from "react-router";
import { createCookieSessionStorage, redirect } from "react-router";
import invariant from "tiny-invariant";

import type { formConfigKey } from "~/services/form/config.server";

import type { FormDataRecord } from "~/utils/validation";

import type { FormSession } from "../../generated/prisma/client";
import type { FormSessionCreateInput } from "../../generated/prisma/models/FormSession";
import { prisma } from "./db.server";
import { combineHeaders } from "./http.server";

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
 * @param formId - The form configuration key
 * @returns The session key string
 */
const sessionKey = (formId: formConfigKey) => `formSession_${formId}`;

/**
 * Creates a new form session and updates the session cookie
 * @param params - The parameters for creating a new form session
 * @returns Promise<string> - Session cookie string
 */
const createNewFormSession = async ({
  session,
  key,
  formSessionData,
}: {
  session: Session;
  key: string;
  formSessionData: {
    formId: FormSession["formId"];
    data: FormDataRecord;
    expiresAt: FormSession["expiresAt"];
    completedAt: FormSession["completedAt"];
  };
}) => {
  const formSession = await prisma.formSession.create({
    data: formSessionData,
  });
  session.set(key, formSession.id);
  return formSessionStorage.commitSession(session);
};

/**
 * Safely gets a specific form session by formId without throwing
 * @param request - The incoming request
 * @param formId - The form configuration key
 */
export const getFormSessionById = async (
  request: Request,
  formId: formConfigKey,
) => {
  const session = await formSessionStorage.getSession(getCookieHeader(request));
  const key = sessionKey(formId);

  if (session.has(key)) {
    const formSessionId = session.get(key);
    return await prisma.formSession.findUnique({
      where: { id: formSessionId },
    });
  }

  return undefined;
};

/**
 * Gets form session data for a specific form
 * @param request - The incoming request
 * @param formId - The form configuration key
 * @returns Promise with form session data or null
 */
export async function getFormSessionData(
  request: Request,
  formId: formConfigKey,
) {
  const formSession = await getFormSessionById(request, formId);

  if (formSession && formSession.formId === formId) {
    const existingSessionData = formSession.data;

    // Guard against primitive types - ensure data is an object or undefined
    invariant(
      existingSessionData === undefined ||
        (typeof existingSessionData === "object" &&
          existingSessionData !== null),
      "Form session data must be an object",
    );

    return { data: existingSessionData as FormDataRecord };
  }

  return null;
}

/**
 * Creates or updates a form session for a specific form
 * @param request - The incoming request
 * @param data - Form session data with validated formId
 * @param formId - The form configuration key
 * @returns Promise<string> - Session cookie string
 */
export const createOrUpdateFormSession = async ({
  data,
  formId,
  expiresAt,
  completedAt,
  request,
}: {
  data: FormDataRecord; // Validated Zod output: string, string[], or boolean
  formId: formConfigKey;
  expiresAt?: FormSession["expiresAt"];
  completedAt?: FormSession["completedAt"];
  request: Request;
}) => {
  const session = await formSessionStorage.getSession(getCookieHeader(request));
  const key = sessionKey(formId);

  const formSessionData = {
    formId,
    data,
    expiresAt: expiresAt ?? null,
    completedAt: completedAt ?? null,
  } satisfies FormSessionCreateInput;

  if (session.has(key)) {
    // Update existing session for this specific form
    const existingId = session.get(key);

    // First, verify the record exists and belongs to this form
    const existingSession = await prisma.formSession.findUnique({
      where: { id: existingId },
    });

    const existingSessionData = existingSession?.data;

    // Guard against primitive types - ensure data is an object or undefined
    invariant(
      existingSessionData === undefined ||
        (typeof existingSessionData === "object" &&
          existingSessionData !== null),
      "Form session data must be an object",
    );

    if (existingSession?.formId === formId) {
      // Safe to update - record exists and matches this form
      // Merge existing data with new data to preserve all step data
      await prisma.formSession.update({
        where: { id: existingId },
        data: {
          ...formSessionData,
          data: {
            ...existingSessionData,
            ...data,
          },
        },
      });
      return formSessionStorage.commitSession(session);
    } else {
      // Record doesn't exist or doesn't match - create new one
      return createNewFormSession({ session, key, formSessionData });
    }
  }

  // Create new session for this form
  return createNewFormSession({ session, key, formSessionData });
};

/**
 * Creates or updates a form session for a specific form (simplified wrapper)
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
  formId: formConfigKey;
  data: FormDataRecord;
  request: Request;
}): Promise<string> {
  return createOrUpdateFormSession({
    data,
    formId,
    request,
  });
}

/**
 * Redirects to a URL and destroys the form session
 * @param request - The incoming request
 * @param redirectUrl - The URL to redirect to
 * @param extraHeaders - Additional headers to include
 * @returns Promise<Response> - The redirect response
 */
export const redirectAndDestroyFormSession = async (
  request: Request,
  redirectUrl: string,
  ...extraHeaders: Array<ResponseInit["headers"] | undefined>
) => {
  const session = await formSessionStorage.getSession(getCookieHeader(request));
  const destroyCookie = await formSessionStorage.destroySession(session);
  const headers = combineHeaders(
    { "Set-Cookie": destroyCookie },
    ...extraHeaders,
  );
  return redirect(redirectUrl, {
    headers,
  });
};

/**
 * If this method is thrown it needs to be awaited, otherwise it can just be returned
 * @param redirectUrl Redirect url
 * @param session Session
 * @returns Returns redirect response with session cookie
 */
export async function redirectWithSession({
  redirectUrl,
  session,
}: {
  redirectUrl: string;
  session: Session;
}) {
  return redirect(redirectUrl, {
    headers: {
      "Set-Cookie": await commitFormSession(session),
    },
  });
}

/**
 * Clears a form session for a specific form
 * @param request - The incoming request
 * @param formId - The form configuration key
 * @returns Promise<string> - Session cookie string
 */
export async function clearFormSession(
  request: Request,
  formId: formConfigKey,
): Promise<string> {
  const session = await getFormSession(request);
  const key = sessionKey(formId);

  if (session.has(key)) {
    session.unset(key);
  }

  return commitFormSession(session);
}
