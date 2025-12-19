// Simplified in-memory session storage for the example
// In production, this would use cookies + database like the original

// Simple in-memory store (resets on server restart)
const sessions: Map<string, { formId: string; data: Record<string, unknown> }> = new Map();

function getSessionId(request: Request, formId: string): string {
  // In a real app, this would come from a cookie
  // For this example, we'll use a simple query param or generate one
  const url = new URL(request.url);
  return url.searchParams.get("sessionId") || `${formId}-default`;
}

export async function getFormSession(
  request: Request,
  formId: string
): Promise<{ data: Record<string, unknown> } | null> {
  const sessionId = getSessionId(request, formId);
  const session = sessions.get(sessionId);

  if (session && session.formId === formId) {
    return { data: session.data };
  }

  return null;
}

export async function saveFormSession({
  formId,
  data,
  request,
}: {
  formId: string;
  data: Record<string, unknown>;
  request: Request;
}): Promise<string> {
  const sessionId = getSessionId(request, formId);

  // Merge with existing data
  const existing = sessions.get(sessionId);
  const mergedData = existing ? { ...existing.data, ...data } : data;

  sessions.set(sessionId, { formId, data: mergedData });

  // Return a dummy cookie header (in production, this would be a real session cookie)
  return `form-session=${sessionId}; Path=/; HttpOnly; SameSite=Lax`;
}

export async function clearFormSession(
  request: Request,
  formId: string
): Promise<void> {
  const sessionId = getSessionId(request, formId);
  sessions.delete(sessionId);
}
