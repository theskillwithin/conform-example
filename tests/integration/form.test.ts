import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { prisma } from "~/services/db.server";
import {
  createOrUpdateFormSession,
  getFormSessionById,
} from "~/services/form-session.server";

import { cleanupDatabase } from "./helpers/db";

// Mock request object for testing
const createMockRequest = (cookieHeader?: string) =>
  ({
    headers: {
      get: (name: string) => (name === "Cookie" ? cookieHeader : null),
    },
  }) as Request;

describe("Form Step Data Persistence", () => {
  beforeEach(async () => {
    // Clean up before each test to ensure isolation
    await prisma.formSession.deleteMany();
  });

  afterAll(async () => {
    // Disconnect from database after all tests
    await cleanupDatabase();
  });

  it("should preserve data from all previous steps when progressing through a multi-step form", async () => {
    // Step 1: Create initial form session with data from first step
    const request1 = createMockRequest();
    const formId = "test" as const;
    const step1Data = { name: "John Doe", apples: ["apple-1", "apple-2"] };

    const cookie1 = await createOrUpdateFormSession({
      data: step1Data,
      formId,
      request: request1,
    });

    // Verify Step 1 data was saved
    const sessionAfterStep1 = await getFormSessionById(
      createMockRequest(cookie1),
      formId,
    );
    expect(sessionAfterStep1).toBeDefined();
    expect(sessionAfterStep1?.data).toEqual({
      name: "John Doe",
      apples: ["apple-1", "apple-2"],
    });

    // Step 2: Submit second step data and duck tape it to the same cookie
    const request2 = createMockRequest(cookie1);
    const step2Data = { phone: "555-1234", businessType: "llc" };

    const cookie2 = await createOrUpdateFormSession({
      data: step2Data,
      formId,
      request: request2,
    });

    // Verify BOTH Step 1 and Step 2 data are preserved
    const sessionAfterStep2 = await getFormSessionById(request2, formId);
    expect(sessionAfterStep2).toBeDefined();
    expect(sessionAfterStep2?.data).toEqual({
      name: "John Doe", // Step 1 data
      apples: ["apple-1", "apple-2"], // Step 1 data
      phone: "555-1234", // Step 2 data
      businessType: "llc", // Step 2 data
    });

    // Step 3: Submit third step data
    const request3 = createMockRequest(cookie2);
    const step3Data = { website: "https://example.com", taxYear: "2023" };

    await createOrUpdateFormSession({
      data: step3Data,
      formId,
      request: request3,
    });

    // Verify ALL data from Steps 1, 2, and 3 are preserved
    const finalSession = await getFormSessionById(request3, formId);
    expect(finalSession).toBeDefined();
    expect(finalSession?.data).toEqual({
      // Step 1 data
      name: "John Doe",
      apples: ["apple-1", "apple-2"],
      // Step 2 data
      phone: "555-1234",
      businessType: "llc",
      // Step 3 data
      website: "https://example.com",
      taxYear: "2023",
    });
  });

  it("should handle data updates within the same step", async () => {
    // Step 1: Create initial form session
    const request1 = createMockRequest();
    const formId = "test" as const;
    const step1Data = { name: "John Doe", email: "john@example.com" };

    const cookie1 = await createOrUpdateFormSession({
      data: step1Data,
      formId,
      request: request1,
    });

    // Step 2: Update data on the same step (user goes back and changes)
    const request2 = createMockRequest(cookie1);
    const updatedStep1Data = { name: "Jane Doe", email: "jane@example.com" };

    const cookie2 = await createOrUpdateFormSession({
      data: updatedStep1Data,
      formId,
      request: request2,
    });

    // Verify updated data
    const session = await getFormSessionById(
      createMockRequest(cookie2),
      formId,
    );
    expect(session?.data).toEqual({
      name: "Jane Doe",
      email: "jane@example.com",
    });
  });

  it("should preserve complex data types across steps", async () => {
    // Step 1: Submit with various data types
    const request1 = createMockRequest();
    const formId = "test" as const;
    const step1Data = {
      name: "John Doe",
      colors: ["red", "blue", "green"], // Array
      notifications: true, // Boolean
      oranges: "orange-2", // String
    };

    const cookie1 = await createOrUpdateFormSession({
      data: step1Data,
      formId,
      request: request1,
    });

    // Step 2: Add more data with different types
    const request2 = createMockRequest(cookie1);
    const step2Data = {
      businessType: "corporation",
      revenue: "over-500k",
    };

    const cookie2 = await createOrUpdateFormSession({
      data: step2Data,
      formId,
      request: request2,
    });

    // Verify all data types are preserved correctly
    const session = await getFormSessionById(
      createMockRequest(cookie2),
      formId,
    );
    expect(session?.data).toEqual({
      name: "John Doe",
      colors: ["red", "blue", "green"],
      notifications: true,
      oranges: "orange-2",
      businessType: "corporation",
      revenue: "over-500k",
    });
  });

  it("should maintain separate data for different forms", async () => {
    // Create session for form A
    const request1 = createMockRequest();
    const formIdA = "test" as const;
    const formIdB = "form-2290" as const;
    const step1DataA = { name: "Form A User", email: "a@example.com" };

    const cookie1 = await createOrUpdateFormSession({
      data: step1DataA,
      formId: formIdA,
      request: request1,
    });

    // Add more data to form A
    const request2 = createMockRequest(cookie1);
    const step2DataA = { phone: "555-0000" };

    const cookie2 = await createOrUpdateFormSession({
      data: step2DataA,
      formId: formIdA,
      request: request2,
    });

    // Create session for form B (different formId)
    const request3 = createMockRequest(cookie1);
    const step1DataB = { name: "Form B User", company: "Company B" };

    const cookie3 = await createOrUpdateFormSession({
      data: step1DataB,
      formId: formIdB,
      request: request3,
    });

    // Verify form A data is preserved
    const sessionA = await getFormSessionById(
      createMockRequest(cookie2),
      formIdA,
    );
    expect(sessionA?.data).toEqual({
      name: "Form A User",
      email: "a@example.com",
      phone: "555-0000",
    });

    // Verify form B has its own separate data
    const sessionB = await getFormSessionById(
      createMockRequest(cookie3),
      formIdB,
    );
    expect(sessionB?.data).toEqual({
      name: "Form B User",
      company: "Company B",
    });
  });
});

() => {
  beforeEach(async () => {
    // Clean up before each test to ensure isolation
    await prisma.formSession.deleteMany();
  });

  afterAll(async () => {
    // Disconnect from database after all tests
    await cleanupDatabase();
  });

  it("should handle deleted form session gracefully and create new one", async () => {
    // Step 1: Create a form session normally
    const request1 = createMockRequest();
    const formId = "test-form" as const;
    const initialData = { name: "John Doe", email: "john@example.com" };

    // Create initial session
    const cookie1 = await createOrUpdateFormSession({
      data: initialData,
      formId,
      request: request1,
    });

    // Verify the session was created by checking the database directly
    const sessions = await prisma.formSession.findMany({
      where: { formId },
    });
    expect(sessions).toHaveLength(1);
    const session1 = sessions[0];
    expect(session1.formId).toBe(formId);

    // Step 2: Simulate database deletion (e.g., by admin, cleanup job, etc.)
    await prisma.formSession.delete({
      where: { id: session1.id },
    });

    // Verify the session is deleted from database
    const deletedSession = await prisma.formSession.findUnique({
      where: { id: session1.id },
    });
    expect(deletedSession).toBeNull();

    // Step 3: Try to update the session with the same cookie
    // This should now work gracefully and create a new session
    const request2 = createMockRequest(cookie1);
    const updatedData = { name: "Jane Doe", email: "jane@example.com" };

    await createOrUpdateFormSession({
      data: updatedData,
      formId,
      request: request2,
    });

    // Verify a new session was created by checking the database
    const newSessions = await prisma.formSession.findMany({
      where: { formId },
    });
    expect(newSessions).toHaveLength(1);
    const newSession = newSessions[0];
    expect(newSession.formId).toBe(formId);
    expect(newSession.data).toEqual(updatedData);
    expect(newSession.id).not.toBe(session1.id); // Should be a new ID
  });

  it("should handle deleted form session gracefully with safe method", async () => {
    // Step 1: Create a form session
    const request1 = createMockRequest();
    const formId = "test-form-safe" as const;
    const initialData = { name: "John Doe", email: "john@example.com" };

    const cookie1 = await createOrUpdateFormSession({
      data: initialData,
      formId,
      request: request1,
    });

    // Verify session was created
    const sessions = await prisma.formSession.findMany({
      where: { formId },
    });
    expect(sessions).toHaveLength(1);
    const session1 = sessions[0];

    // Step 2: Delete the session from database
    await prisma.formSession.delete({
      where: { id: session1.id },
    });

    // Step 3: Use the safe method - this should return null instead of crashing
    const request2 = createMockRequest(cookie1);
    const safeResult = await getFormSessionById(request2, formId);
    expect(safeResult).toBeNull();
  });

  it("should demonstrate the fix works by not crashing", async () => {
    // Step 1: Create a form session
    const request1 = createMockRequest();
    const formId = "test-form-fix" as const;
    const initialData = { name: "John Doe", email: "john@example.com" };

    const cookie1 = await createOrUpdateFormSession({
      data: initialData,
      formId,
      request: request1,
    });

    // Verify session was created
    const sessions = await prisma.formSession.findMany({
      where: { formId },
    });
    expect(sessions).toHaveLength(1);
    const session1 = sessions[0];

    // Step 2: Delete the session from database
    await prisma.formSession.delete({
      where: { id: session1.id },
    });

    // Step 3: Try to update - this should now work without crashing
    const request2 = createMockRequest(cookie1);
    const updatedData = { name: "Jane Doe", email: "jane@example.com" };

    // This should NOT throw an error anymore
    await createOrUpdateFormSession({
      data: updatedData,
      formId,
      request: request2,
    });

    // Verify the new session was created successfully by checking the database
    const newSessions = await prisma.formSession.findMany({
      where: { formId },
    });
    expect(newSessions).toHaveLength(1);
    const newSession = newSessions[0];
    expect(newSession.data).toEqual(updatedData);
  });

  it("should prevent cross-form session access for security", async () => {
    // Step 1: Create a session for form A
    const request1 = createMockRequest();
    const formIdA = "form-a" as const;
    const formIdB = "form-b" as const;
    const initialData = { name: "John Doe", email: "john@example.com" };

    const cookie1 = await createOrUpdateFormSession({
      data: initialData,
      formId: formIdA,
      request: request1,
    });

    // Verify session was created for form A
    const sessionsA = await prisma.formSession.findMany({
      where: { formId: formIdA },
    });
    expect(sessionsA).toHaveLength(1);

    // Step 2: Try to use the same cookie for form B
    // This should create a new session for form B, not reuse form A's session
    const request2 = createMockRequest(cookie1);
    const updatedData = { name: "Jane Doe", email: "jane@example.com" };

    await createOrUpdateFormSession({
      data: updatedData,
      formId: formIdB,
      request: request2,
    });

    // Verify both sessions exist and are separate
    const sessionsAAfter = await prisma.formSession.findMany({
      where: { formId: formIdA },
    });
    const sessionsB = await prisma.formSession.findMany({
      where: { formId: formIdB },
    });

    expect(sessionsAAfter).toHaveLength(1);
    expect(sessionsB).toHaveLength(1);
    expect(sessionsAAfter[0].id).not.toBe(sessionsB[0].id);
    expect(sessionsAAfter[0].data).toEqual(initialData); // Form A data unchanged
    expect(sessionsB[0].data).toEqual(updatedData); // Form B has new data
  });
};
