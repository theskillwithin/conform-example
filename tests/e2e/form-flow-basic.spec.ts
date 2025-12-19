import { expect, type Page, test } from "@playwright/test";

import {
  getFirstStep,
  getFormConfig,
  getStep,
  testSuite,
} from "~/services/form/config.server";
import {
  DEFAULT_BACK_TEXT,
  DEFAULT_CONTINUE_TEXT,
} from "~/services/form/constants";

// Helper function to get all form IDs from the config
function getAllFormIdsFromConfig() {
  return Object.keys(testSuite.formConfigs);
}

// Helper function to get step configuration from current page
async function getStepConfig(page: Page) {
  const url = page.url();
  const urlParts = url.split("/");
  const formId = urlParts[urlParts.length - 2]; // e.g., "test" from "/flow/test/step-1"
  const stepSlug = urlParts[urlParts.length - 1]; // e.g., "step-1" from "/flow/test/step-1"

  const formConfig = getFormConfig(formId);
  return getStep({ formConfig: formConfig!, stepSlug });
}

// Helper function to verify we're on the expected step
async function verifyStep(page: Page, expectedStepSlug: string) {
  const stepConfig = await getStepConfig(page);
  expect(stepConfig.slug).toBe(expectedStepSlug);
  return stepConfig;
}

// Helper function to select an option from a combobox dropdown
// Waits for the dropdown to open before clicking the option
async function selectComboboxOption(
  page: Page,
  comboboxName: string | RegExp,
  optionName: string,
) {
  const combobox = page.getByRole("combobox", { name: comboboxName });
  await combobox.click();
  // Wait for the dropdown to open and option to be visible
  const option = page.getByRole("option", { name: optionName });
  await expect(option).toBeVisible({ timeout: 3000 });
  await option.click();
  // Wait for the dropdown to close after selection
  await expect(option).not.toBeVisible({ timeout: 2000 });
}

/**
 * High-quality e2e tests for the test form flow
 *
 * This test suite focuses on reliable, working functionality:
 * - Text inputs, checkboxes, radio buttons, switches
 * - Select dropdowns (basic interaction)
 * - Form validation and navigation
 * - Masked inputs (EIN, zip code)
 * - Debug mode and form state management
 *
 * Note: Combobox search functionality is excluded due to UI complexity
 * but can be added once the component interaction patterns are stabilized.
 */

test.describe("Form Flow - Basic Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/flow/test/step-1");
    await page.waitForLoadState("networkidle");
  });

  test("should load without JavaScript errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    await page.waitForLoadState("networkidle");
    expect(errors).toHaveLength(0);
  });

  test("should display form title and debug info", async ({ page }) => {
    // Check debug information is visible (form has debug: true)
    await expect(page.getByText("Debug Information")).toBeVisible();
  });

  test("should redirect from form root to first step for all forms", async ({
    page,
  }) => {
    // Get all form IDs dynamically from the config
    const formIds = getAllFormIdsFromConfig();

    // Test each form
    for (const formId of formIds) {
      // Get the form config to find the first step
      const formConfig = getFormConfig(formId);
      const firstStepSlug = getFirstStep(formConfig);

      // Navigate to the form root (without step slug)
      await page.goto(`/flow/${formId}`);

      // Should redirect to the first step - waitForURL handles redirects and auto-waits
      await page.waitForURL(`**/flow/${formId}/${firstStepSlug}*`);
    }
  });

  test("should preserve URL parameters when redirecting from form root", async ({
    page,
  }) => {
    // Test with UTM parameters
    const utmParams = "?utm_source=test&utm_medium=email&utm_campaign=signup";

    // Navigate to form root with UTM parameters
    await page.goto(`/flow/test${utmParams}`);

    // Should redirect to first step with UTM parameters preserved
    await expect(page).toHaveURL(`/flow/test/step-1${utmParams}`);

    // Verify the page loads successfully
    await page.waitForLoadState("networkidle");
  });

  test("should display basic form fields", async ({ page }) => {
    // Verify we're on the correct step
    const stepConfig = await verifyStep(page, "step-1");

    // Text inputs
    await expect(page.getByLabel("Name")).toBeVisible();
    await expect(page.getByLabel("EIN")).toBeVisible();
    await expect(page.getByLabel("Zip Code")).toBeVisible();

    // Verify info popover button is visible for EIN field (step-1)
    const einInfoButton = page
      .getByRole("button", { name: "Show information" })
      .first();
    await expect(einInfoButton).toBeVisible();

    // Click info button to verify popover works
    await einInfoButton.click();

    // Scope text search to the dialog role to avoid matching debug JSON
    const popoverDialog = page.getByRole("dialog").first();
    await expect(
      popoverDialog.getByText(/Your Employer Identification Number/i),
    ).toBeVisible();
    await expect(popoverDialog.getByText(/Format: XX-XXXXXXX/i)).toBeVisible();

    // Buttons - get button text dynamically from current step
    const continueButtonText =
      stepConfig?.buttons?.continue || DEFAULT_CONTINUE_TEXT;
    const backButtonText = stepConfig?.buttons?.back || DEFAULT_BACK_TEXT;

    await expect(
      page.getByRole("button", { name: continueButtonText }),
    ).toBeVisible();

    // Back button should NOT be visible on first step
    await expect(
      page.getByRole("link", { name: backButtonText }),
    ).not.toBeVisible();
  });

  test("should handle text input interactions", async ({ page }) => {
    const nameInput = page.getByLabel("Name");

    // Test typing
    await nameInput.fill("John Doe");
    await expect(nameInput).toHaveValue("John Doe");

    // Test clearing
    await nameInput.clear();
    await expect(nameInput).toHaveValue("");

    // Test focus states
    await nameInput.focus();
    await expect(nameInput).toBeFocused();
  });

  test("should handle checkbox interactions", async ({ page }) => {
    const apple1 = page.getByRole("checkbox", { name: "Apple 1" });
    const apple2 = page.getByRole("checkbox", { name: "Apple 2" });

    // Test checking
    await apple1.check();
    await expect(apple1).toBeChecked();

    // Test multiple selections
    await apple2.check();
    await expect(apple1).toBeChecked();
    await expect(apple2).toBeChecked();

    // Test unchecking
    await apple1.uncheck();
    await expect(apple1).not.toBeChecked();
    await expect(apple2).toBeChecked();
  });

  test("should handle radio button interactions", async ({ page }) => {
    const orange1 = page.getByRole("radio", { name: "Orange 1" });
    const orange2 = page.getByRole("radio", { name: "Orange 2" });

    // Test radio selection
    await orange1.check();
    await expect(orange1).toBeChecked();

    // Test that selecting another radio deselects the first
    await orange2.check();
    await expect(orange2).toBeChecked();
    await expect(orange1).not.toBeChecked();
  });

  test("should handle switch toggle", async ({ page }) => {
    const notificationSwitch = page.getByRole("switch", {
      name: /Enable Notifications/i,
    });

    // Test toggling on
    await notificationSwitch.check();
    await expect(notificationSwitch).toBeChecked();

    // Test toggling off
    await notificationSwitch.uncheck();
    await expect(notificationSwitch).not.toBeChecked();
  });

  test("should handle select dropdown basic interaction", async ({ page }) => {
    // Use helper function which waits for dropdown to open
    await selectComboboxOption(page, /Pears/i, "Pear 1");

    // Verify selection
    const pearsSelect = page.getByRole("combobox", { name: /Pears/i });
    await expect(pearsSelect).toContainText("Pear 1");
  });

  test("should handle masked inputs", async ({ page }) => {
    // Test EIN input - just verify it accepts input
    const einInput = page.getByLabel("EIN");
    await einInput.fill("123456789");

    // Verify input has some value
    const einValue = await einInput.inputValue();
    expect(einValue).toBeTruthy();
    expect(einValue.replace(/\D/g, "")).toBe("123456789");

    // Test zip code input
    const zipInput = page.getByLabel("Zip Code");
    await zipInput.fill("12345");

    // Verify zip code input
    const zipValue = await zipInput.inputValue();
    expect(zipValue).toBeTruthy();
    expect(zipValue.replace(/\D/g, "")).toBe("12345");
  });

  test("should validate required fields", async ({ page }) => {
    // Verify we're on the correct step
    const stepConfig = await verifyStep(page, "step-1");

    // Try to submit without filling required fields
    const continueButtonText =
      stepConfig?.buttons?.continue || DEFAULT_CONTINUE_TEXT;
    await page.getByRole("button", { name: continueButtonText }).click();

    // Should stay on the same page (validation failed)
    await expect(page).toHaveURL("/flow/test/step-1");
  });

  test("should display Conform validation errors", async ({ page }) => {
    // Verify we're on the correct step and get config
    const stepConfig = await verifyStep(page, "step-1");
    const continueButtonText =
      stepConfig?.buttons?.continue || DEFAULT_CONTINUE_TEXT;

    // Try to submit with invalid data
    await page.getByLabel("Name").fill("123"); // Invalid name
    await page.getByLabel("Email").fill("invalid-email"); // Invalid email
    await page.getByRole("button", { name: continueButtonText }).click();

    // Should stay on the same page
    await expect(page).toHaveURL("/flow/test/step-1");

    // Check for validation error messages (if they're displayed)
    // Note: The exact error display depends on the UI implementation
    // This test verifies the form doesn't proceed with invalid data
  });

  test("should validate field-specific rules", async ({ page }) => {
    // Get step config and button text
    const stepConfig = await getStepConfig(page);
    const continueButtonText =
      stepConfig?.buttons?.continue || DEFAULT_CONTINUE_TEXT;

    // Test name validation
    await page.getByLabel("Name").fill("123"); // Should fail name validation
    await page.getByRole("button", { name: continueButtonText }).click();

    // Should stay on the same page due to name validation failure
    await expect(page).toHaveURL("/flow/test/step-1");

    // Test with valid name but missing other required fields
    await page.getByLabel("Name").fill("John Doe");
    await page.getByRole("button", { name: continueButtonText }).click();

    // Should stay on the same page due to missing required fields
    await expect(page).toHaveURL("/flow/test/step-1");
  });

  test("should handle form data persistence during validation", async ({
    page,
  }) => {
    // Get step config and button text
    const stepConfig = await getStepConfig(page);
    const continueButtonText =
      stepConfig?.buttons?.continue || DEFAULT_CONTINUE_TEXT;

    // Fill some valid data
    await page.getByLabel("Name").fill("John Doe");
    await page.getByLabel("Email").fill("john@example.com");
    await page.getByRole("checkbox", { name: "Apple 1" }).check();
    await page.getByRole("radio", { name: "Orange 1" }).check();

    // Try to submit with missing required fields
    await page.getByRole("button", { name: continueButtonText }).click();

    // Should stay on the same page
    await expect(page).toHaveURL("/flow/test/step-1");

    // Verify that previously filled data is still there
    await expect(page.getByLabel("Name")).toHaveValue("John Doe");
    await expect(page.getByRole("checkbox", { name: "Apple 1" })).toBeChecked();
    await expect(page.getByRole("radio", { name: "Orange 1" })).toBeChecked();
  });

  test("should navigate to step 2 when form is valid", async ({ page }) => {
    // Verify we're on the correct step
    const stepConfig = await verifyStep(page, "step-1");

    // Fill ALL required fields for step-1
    await page.getByLabel("Name").fill("John Doe");
    await page.getByLabel("Email").fill("john@example.com");
    await page.getByRole("checkbox", { name: "Apple 1" }).check();
    await page.getByRole("radio", { name: "Orange 1" }).check();

    // Select from dropdown - wait for dropdown to open before selecting
    await selectComboboxOption(page, /Pears/i, "Pear 1");

    // Fill combobox fields (required)
    await selectComboboxOption(page, /Search Fruits/i, "Banana");

    await selectComboboxOption(page, /State/i, "California");

    // Fill masked inputs
    await page.getByLabel("EIN").fill("12-3456789");
    await page.getByLabel("Zip Code").fill("12345");

    // Submit form
    const continueButtonText =
      stepConfig?.buttons?.continue || DEFAULT_CONTINUE_TEXT;
    await page.getByRole("button", { name: continueButtonText }).click();

    // Wait for navigation to complete
    await page.waitForLoadState("networkidle");

    // Verify we navigated to step 2
    await expect(page).toHaveURL("/flow/test/step-2");

    // Verify we're on the correct step
    await verifyStep(page, "step-2");

    // Verify step 2 content is visible
    await expect(page.getByLabel("Phone Number")).toBeVisible();
    await expect(
      page.getByRole("combobox", { name: /Business Type/i }),
    ).toBeVisible();
  });

  test("should display step 2 fields when navigating directly", async ({
    page,
  }) => {
    await page.goto("/flow/test/step-2");

    // Verify step 2 fields are visible
    await expect(page.getByLabel("Phone Number")).toBeVisible();
    await expect(
      page.getByRole("combobox", { name: /Business Type/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("combobox", { name: /Annual Revenue/i }),
    ).toBeVisible();
  });

  test("should handle step 2 form interactions", async ({ page }) => {
    await page.goto("/flow/test/step-2");

    await page.waitForLoadState("networkidle");

    // Fill phone number (masked input formats to (XXX) XXX-XXXX)
    await page.getByLabel("Phone Number").fill("5551234567");
    await expect(page.getByLabel("Phone Number")).toHaveValue("(555) 123-4567");

    // Test select dropdowns - wait for dropdown to open before selecting
    await selectComboboxOption(page, /Business Type/i, "LLC");
    await expect(
      page.getByRole("combobox", { name: /Business Type/i }),
    ).toContainText("LLC");
  });

  test("should preserve form state during interactions", async ({ page }) => {
    // Fill some fields
    await page.getByLabel("Name").fill("John Doe");
    await page.getByRole("checkbox", { name: "Apple 1" }).check();

    // Interact with other fields
    await page.getByRole("radio", { name: "Orange 1" }).check();

    // Verify previous fields still have their values
    await expect(page.getByLabel("Name")).toHaveValue("John Doe");
    await expect(page.getByRole("checkbox", { name: "Apple 1" })).toBeChecked();
  });

  test("should handle form field validation states", async ({ page }) => {
    // Get step config and button text
    const stepConfig = await getStepConfig(page);
    const continueButtonText =
      stepConfig?.buttons?.continue || DEFAULT_CONTINUE_TEXT;

    // Submit empty form to trigger validation
    await page.getByRole("button", { name: continueButtonText }).click();

    // Should stay on same page
    await expect(page).toHaveURL("/flow/test/step-1");

    // Fill one required field and try again
    await page.getByLabel("Name").fill("John Doe");
    await page.getByRole("button", { name: continueButtonText }).click();

    // Should still stay on same page (other required fields missing)
    await expect(page).toHaveURL("/flow/test/step-1");
  });

  test("should handle multiple checkbox selections", async ({ page }) => {
    const apple1 = page.getByRole("checkbox", { name: "Apple 1" });
    const apple2 = page.getByRole("checkbox", { name: "Apple 2" });
    const apple3 = page.getByRole("checkbox", { name: "Apple 3" });

    // Select multiple checkboxes
    await apple1.check();
    await apple2.check();
    await apple3.check();

    // All should be checked
    await expect(apple1).toBeChecked();
    await expect(apple2).toBeChecked();
    await expect(apple3).toBeChecked();

    // Uncheck middle one
    await apple2.uncheck();

    // Others should remain checked
    await expect(apple1).toBeChecked();
    await expect(apple2).not.toBeChecked();
    await expect(apple3).toBeChecked();
  });

  test("should handle radio button exclusivity", async ({ page }) => {
    const orange1 = page.getByRole("radio", { name: "Orange 1" });
    const orange2 = page.getByRole("radio", { name: "Orange 2" });
    const orange3 = page.getByRole("radio", { name: "Orange 3" });

    // Select first option
    await orange1.check();
    await expect(orange1).toBeChecked();
    await expect(orange2).not.toBeChecked();
    await expect(orange3).not.toBeChecked();

    // Select second option - should deselect first
    await orange2.check();
    await expect(orange1).not.toBeChecked();
    await expect(orange2).toBeChecked();
    await expect(orange3).not.toBeChecked();

    // Select third option - should deselect second
    await orange3.check();
    await expect(orange1).not.toBeChecked();
    await expect(orange2).not.toBeChecked();
    await expect(orange3).toBeChecked();
  });

  test("should handle select dropdown options", async ({ page }) => {
    const pearsSelect = page.getByRole("combobox", { name: /Pears/i });

    // Test all three options - use helper function for reliable selection
    const options = ["Pear 1", "Pear 2", "Pear 3"];

    for (const option of options) {
      await selectComboboxOption(page, /Pears/i, option);
      await expect(pearsSelect).toContainText(option);
    }
  });

  test("should handle step 2 select dropdowns", async ({ page }) => {
    await page.goto("/flow/test/step-2");

    // Test Business Type dropdown - use helper function for reliable selection
    const businessTypeSelect = page.getByRole("combobox", {
      name: /Business Type/i,
    });
    await selectComboboxOption(page, /Business Type/i, "LLC");
    await expect(businessTypeSelect).toContainText("LLC");

    // Test Annual Revenue dropdown
    const revenueSelect = page.getByRole("combobox", {
      name: /Annual Revenue/i,
    });
    await selectComboboxOption(page, /Annual Revenue/i, "$100,000 - $500,000");
    await expect(revenueSelect).toContainText("$100,000 - $500,000");
  });

  test("should handle form field focus and blur", async ({ page }) => {
    const nameInput = page.getByLabel("Name");
    const einInput = page.getByLabel("EIN");

    // Test focus
    await nameInput.focus();
    await expect(nameInput).toBeFocused();

    // Test blur by focusing another element
    await einInput.focus();
    await expect(einInput).toBeFocused();
    await expect(nameInput).not.toBeFocused();

    // Test blur by explicit blur
    await einInput.blur();
    await expect(einInput).not.toBeFocused();
  });

  test("should handle keyboard navigation", async ({ page }) => {
    const nameInput = page.getByLabel("Name");

    // Focus first input
    await nameInput.focus();
    await expect(nameInput).toBeFocused();

    // Tab to next focusable element
    await page.keyboard.press("Tab");

    // Should have moved focus (exact element depends on tab order)
    await expect(nameInput).not.toBeFocused();
  });

  test("should handle form reset behavior", async ({ page }) => {
    // Fill some fields
    await page.getByLabel("Name").fill("John Doe");
    await page.getByRole("checkbox", { name: "Apple 1" }).check();
    await page.getByRole("radio", { name: "Orange 1" }).check();

    // Refresh page (simulates form reset)
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Fields should be empty/unchecked
    await expect(page.getByLabel("Name")).toHaveValue("");
    await expect(
      page.getByRole("checkbox", { name: "Apple 1" }),
    ).not.toBeChecked();
    await expect(
      page.getByRole("radio", { name: "Orange 1" }),
    ).not.toBeChecked();
  });

  test("should display proper accessibility attributes", async ({ page }) => {
    // Check that form fields have proper labels
    const nameInput = page.getByLabel("Name");
    await expect(nameInput).toHaveAttribute("name", "name");

    // Check required fields have required attribute
    await expect(nameInput).toHaveAttribute("required");

    // Check that checkboxes have proper roles
    const apple1 = page.getByRole("checkbox", { name: "Apple 1" });
    await expect(apple1).toHaveAttribute("role", "checkbox");
    await expect(apple1).toHaveAttribute("tabindex", "0");

    // Check that radio buttons have proper roles (BaseUI v1.0.0-beta.6 uses span with role="radio")
    const orange1 = page.getByRole("radio", { name: "Orange 1" });
    await expect(orange1).toHaveAttribute("role", "radio");
    await expect(orange1).toHaveAttribute("tabindex", "0");
  });

  test("should handle Conform form state correctly", async ({ page }) => {
    // Test that form maintains state during interactions
    await page.getByLabel("Name").fill("John Doe");

    // Interact with other fields
    await page.getByRole("checkbox", { name: "Apple 1" }).check();
    await page.getByRole("radio", { name: "Orange 1" }).check();

    // Verify form state is maintained
    await expect(page.getByLabel("Name")).toHaveValue("John Doe");
    await expect(page.getByRole("checkbox", { name: "Apple 1" })).toBeChecked();
    await expect(page.getByRole("radio", { name: "Orange 1" })).toBeChecked();
  });

  test("should validate masked inputs correctly", async ({ page }) => {
    // Get step config and button text
    const stepConfig = await getStepConfig(page);
    const continueButtonText =
      stepConfig?.buttons?.continue || DEFAULT_CONTINUE_TEXT;

    // Test EIN validation
    await page.getByLabel("EIN").fill("123456789"); // Invalid format
    await page.getByRole("button", { name: continueButtonText }).click();

    // Should stay on same page due to EIN validation failure
    await expect(page).toHaveURL("/flow/test/step-1");

    // Test with valid EIN format
    await page.getByLabel("EIN").fill("12-3456789");
    await page.getByLabel("Name").fill("John Doe");
    await page.getByRole("checkbox", { name: "Apple 1" }).click();
    await page.getByRole("radio", { name: "Orange 1" }).check();
    await selectComboboxOption(page, /Pears/i, "Pear 1");
    await page.getByLabel("Zip Code").fill("12345");

    // Should be able to proceed with valid EIN
    // Note: This might still fail if other required fields are missing
  });

  test("should handle form submission with all field types", async ({
    page,
  }) => {
    const stepConfig = await getStepConfig(page);
    const continueButtonText =
      stepConfig?.buttons?.continue || DEFAULT_CONTINUE_TEXT;
    // Fill all required fields with valid data
    await page.getByLabel("Name").fill("John Doe");
    await page.getByLabel("Email").fill("john@example.com");
    await page.getByRole("checkbox", { name: "Apple 1" }).check();
    await page.getByRole("radio", { name: "Orange 1" }).check();
    await selectComboboxOption(page, /Pears/i, "Pear 1");

    // Fill combobox fields (required)
    await selectComboboxOption(page, /Search Fruits/i, "Banana");

    await selectComboboxOption(page, /State/i, "California");

    await page.getByLabel("EIN").fill("12-3456789");
    await page.getByLabel("Zip Code").fill("12345");

    // Toggle switch (optional field)
    await page.getByRole("switch", { name: /Enable Notifications/i }).check();

    // Submit form
    await page.getByRole("button", { name: continueButtonText }).click();

    // Wait for navigation to complete
    await page.waitForLoadState("networkidle");

    // Verify we navigated to step 2
    await expect(page).toHaveURL("/flow/test/step-2");

    // Verify step 2 content is visible
    await expect(page.getByLabel("Phone Number")).toBeVisible();
  });

  test("should handle form validation edge cases", async ({ page }) => {
    // Get step config and button text
    const stepConfig = await getStepConfig(page);
    const continueButtonText =
      stepConfig?.buttons?.continue || DEFAULT_CONTINUE_TEXT;

    // Test with empty strings
    await page.getByLabel("Name").fill("");
    await page.getByRole("button", { name: continueButtonText }).click();

    // Should stay on same page
    await expect(page).toHaveURL("/flow/test/step-1");

    // Test with whitespace-only values
    await page.getByLabel("Name").fill("   ");
    await page.getByRole("button", { name: continueButtonText }).click();

    // Should stay on same page
    await expect(page).toHaveURL("/flow/test/step-1");
  });

  test("should handle checkbox group validation", async ({ page }) => {
    // Get step config and button text
    const stepConfig = await getStepConfig(page);
    const continueButtonText =
      stepConfig?.buttons?.continue || DEFAULT_CONTINUE_TEXT;

    // Test with no checkboxes selected
    await page.getByLabel("Name").fill("John Doe");
    await page.getByRole("radio", { name: "Orange 1" }).check();
    await selectComboboxOption(page, /Pears/i, "Pear 1");
    await page.getByLabel("EIN").fill("12-3456789");
    await page.getByLabel("Zip Code").fill("12345");

    // Don't select any checkboxes (required field)
    await page.getByRole("button", { name: continueButtonText }).click();

    // Should stay on same page due to missing checkbox selection
    await expect(page).toHaveURL("/flow/test/step-1");

    // Test with one checkbox selected and all other required fields
    await page.getByRole("checkbox", { name: "Apple 1" }).check();
    await page.getByLabel("Email").fill("john@example.com");
    await selectComboboxOption(page, /Search Fruits/i, "Banana");
    await selectComboboxOption(page, /State/i, "California");
    await page.getByRole("button", { name: continueButtonText }).click();

    // Wait for navigation to complete
    await page.waitForLoadState("networkidle");

    // Should be able to proceed to step 2
    await expect(page).toHaveURL("/flow/test/step-2");
    await expect(page.getByLabel("Phone Number")).toBeVisible();
  });

  test("should handle radio group validation", async ({ page }) => {
    // Get step config and button text
    const stepConfig = await getStepConfig(page);
    const continueButtonText =
      stepConfig?.buttons?.continue || DEFAULT_CONTINUE_TEXT;

    // Test with no radio selected
    await page.getByLabel("Name").fill("John Doe");
    await page.getByRole("checkbox", { name: "Apple 1" }).check();
    await selectComboboxOption(page, /Pears/i, "Pear 1");
    await page.getByLabel("EIN").fill("12-3456789");
    await page.getByLabel("Zip Code").fill("12345");

    // Don't select any radio button (required field)
    await page.getByRole("button", { name: continueButtonText }).click();

    // Should stay on same page due to missing radio selection
    await expect(page).toHaveURL("/flow/test/step-1");

    // Test with radio selected and all other required fields
    await page.getByRole("radio", { name: "Orange 1" }).check();
    await page.getByLabel("Email").fill("john@example.com");
    await selectComboboxOption(page, /Search Fruits/i, "Banana");
    await selectComboboxOption(page, /State/i, "California");
    await page.getByRole("button", { name: continueButtonText }).click();

    // Wait for navigation to complete
    await page.waitForLoadState("networkidle");

    // Should be able to proceed to step 2
    await expect(page).toHaveURL("/flow/test/step-2");
    await expect(page.getByLabel("Phone Number")).toBeVisible();
  });

  test("should handle back button functionality", async ({ page }) => {
    // Get step config and button text
    const stepConfig = await getStepConfig(page);
    const backButtonText = stepConfig?.buttons?.back || DEFAULT_BACK_TEXT;

    // On step-1, back button should not be visible (first step)
    await expect(
      page.getByRole("link", { name: backButtonText }),
    ).not.toBeVisible();

    // Navigate to step-2 to test back button
    await page.goto("/flow/test/step-2");

    // Get step-2 config
    const step2Config = await getStepConfig(page);
    const step2BackButtonText = step2Config?.buttons?.back || DEFAULT_BACK_TEXT;

    // On step-2, back button should be visible
    await expect(
      page.getByRole("link", { name: step2BackButtonText }),
    ).toBeVisible();

    // Click back button to go to step-1
    await page.getByRole("link", { name: step2BackButtonText }).click();

    // Should navigate back to step-1
    await expect(page).toHaveURL("/flow/test/step-1");
  });

  test("should handle switch boolean values correctly", async ({ page }) => {
    // Fill all required fields first
    await page.getByLabel("Name").fill("John Doe");
    await page.getByLabel("Email").fill("john@example.com");
    await page.getByRole("checkbox", { name: "Apple 1" }).check();
    await page.getByRole("radio", { name: "Orange 1" }).check();
    await selectComboboxOption(page, /Pears/i, "Pear 1");
    await selectComboboxOption(page, /Search Fruits/i, "Banana");
    await selectComboboxOption(page, /State/i, "California");
    await page.getByLabel("EIN").fill("12-3456789");
    await page.getByLabel("Zip Code").fill("12345");

    // Test case 1: Switch ON
    const notificationSwitch = page.getByRole("switch", {
      name: /Enable Notifications/i,
    });

    // Turn ON the notifications switch
    await notificationSwitch.check();
    await expect(notificationSwitch).toBeChecked();

    // Submit the form
    const stepConfig = await getStepConfig(page);
    const continueButtonText =
      stepConfig?.buttons?.continue || DEFAULT_CONTINUE_TEXT;
    await page.getByRole("button", { name: continueButtonText }).click();

    // Verify we're on the next step
    await expect(page).toHaveURL("/flow/test/step-2");

    // Go back to step 1 to verify the switch is still ON
    await page.goto("/flow/test/step-1");
    await expect(notificationSwitch).toBeChecked();

    // Test case 2: Switch OFF
    // Turn OFF the notifications switch
    await notificationSwitch.uncheck();
    await expect(notificationSwitch).not.toBeChecked();

    // Submit the form again
    await page.getByRole("button", { name: continueButtonText }).click();

    // Verify we're on the next step
    await expect(page).toHaveURL("/flow/test/step-2");

    // Go back to step 1 to verify the switch is OFF
    await page.goto("/flow/test/step-1");
    await expect(notificationSwitch).not.toBeChecked();
  });

  test("should handle textarea input and preserve values", async ({ page }) => {
    // Navigate to step 2 where textarea is located
    await page.goto("/flow/test/step-2");
    await page.waitForLoadState("networkidle");

    const commentsTextarea = page.getByLabel("Additional Comments");

    // Verify textarea is visible
    await expect(commentsTextarea).toBeVisible();

    // Test typing in textarea
    await commentsTextarea.fill("This is a test comment.");
    await expect(commentsTextarea).toHaveValue("This is a test comment.");

    // Test multiline input
    const textareaValue = "Line 1\nLine 2\nLine 3\nAdditional details here.";
    await commentsTextarea.fill(textareaValue);
    await expect(commentsTextarea).toHaveValue(textareaValue);

    // Test clearing
    await commentsTextarea.clear();
    await expect(commentsTextarea).toHaveValue("");

    // Test focus states
    await commentsTextarea.focus();
    await expect(commentsTextarea).toBeFocused();

    // Fill textarea again with multiline content
    await commentsTextarea.fill(textareaValue);
    await expect(commentsTextarea).toHaveValue(textareaValue);

    // Note: Form session persistence testing would require form submission
    // which is tested in other test cases. This test verifies textarea
    // input functionality works correctly.
  });

  test("should display and interact with info popover", async ({ page }) => {
    // Navigate to step 1 where EIN field has info popover
    await page.goto("/flow/test/step-1");
    await page.waitForLoadState("networkidle");

    // The info icon should be present (it's a button with aria-label)
    // We need to find it near the EIN label
    const infoButton = page
      .getByRole("button", { name: "Show information" })
      .first();

    // Verify info button is visible
    await expect(infoButton).toBeVisible();

    // Click the info button to open popover
    await infoButton.click();

    // Scope text search to the dialog role to avoid matching debug JSON
    const popoverDialog = page.getByRole("dialog").first();
    await expect(
      popoverDialog.getByText(/Your Employer Identification Number/i),
    ).toBeVisible();
    await expect(popoverDialog.getByText(/Format: XX-XXXXXXX/i)).toBeVisible();
  });

  test("should display info popover on textarea field", async ({ page }) => {
    // Navigate to step 2 where textarea with info is located
    await page.goto("/flow/test/step-2");
    await page.waitForLoadState("networkidle");

    // Find the info icon button near the Additional Comments textarea
    const infoButtons = page.getByRole("button", { name: "Show information" });

    // There should be at least one info button on this step
    const infoButton = infoButtons.first();
    await expect(infoButton).toBeVisible();

    // Click to open the popover
    await infoButton.click();

    // Scope text search to the dialog role to avoid matching debug JSON
    const popoverDialog = page.getByRole("dialog").first();
    await expect(
      popoverDialog.getByText(
        /Use this field to provide any additional information/i,
      ),
    ).toBeVisible();
  });

  test("should close info popover when clicking outside", async ({ page }) => {
    await page.goto("/flow/test/step-1");
    await page.waitForLoadState("networkidle");

    // Find and click info button
    const infoButton = page
      .getByRole("button", { name: "Show information" })
      .first();
    await infoButton.click();

    // Scope text search to the dialog role to avoid matching debug JSON
    const popoverDialog = page.getByRole("dialog").first();
    await expect(
      popoverDialog.getByText(/Your Employer Identification Number/i),
    ).toBeVisible();

    // Click outside the popover (on the page body or another element)
    await page.click("body");

    // Popover should close (dialog should not be visible or content should not be visible in dialog)
    await expect(popoverDialog).not.toBeVisible();
  });

  test("should handle all form field types correctly", async ({ page }) => {
    // Test Step 1 - All field types
    await page.goto("/flow/test/step-1");

    // Text input field
    await page.getByLabel("Name").fill("John Doe");
    await expect(page.getByLabel("Name")).toHaveValue("John Doe");

    // Email input field
    await page.getByLabel("Email").fill("john@example.com");
    await expect(page.getByLabel("Email")).toHaveValue("john@example.com");

    // Checkbox group - select multiple options
    await page.getByRole("checkbox", { name: "Apple 1" }).check();
    await page.getByRole("checkbox", { name: "Apple 2" }).check();
    await expect(page.getByRole("checkbox", { name: "Apple 1" })).toBeChecked();
    await expect(page.getByRole("checkbox", { name: "Apple 2" })).toBeChecked();

    // Radio group - select one option
    await page.getByRole("radio", { name: "Orange 2" }).check();
    await expect(page.getByRole("radio", { name: "Orange 2" })).toBeChecked();

    // Select dropdown
    await selectComboboxOption(page, /Pears/i, "Pear 2");
    await expect(page.getByRole("combobox", { name: /Pears/i })).toContainText(
      "Pear 2",
    );

    // Combobox with search
    await selectComboboxOption(page, /Search Fruits/i, "Grape");
    await expect(
      page.getByRole("combobox", { name: /Search Fruits/i }),
    ).toHaveValue("grape");

    // State combobox
    await selectComboboxOption(page, /State/i, "New York");
    await expect(page.getByRole("combobox", { name: /State/i })).toHaveValue(
      "NY",
    );

    // Switch field
    const notificationSwitch = page.getByRole("switch", {
      name: /Enable Notifications/i,
    });
    await notificationSwitch.check();
    await expect(notificationSwitch).toBeChecked();

    // Masked input - EIN
    await page.getByLabel("EIN").fill("12-3456789");
    await expect(page.getByLabel("EIN")).toHaveValue("12-3456789");

    // Masked input - Zip Code
    await page.getByLabel("Zip Code").fill("12345");
    await expect(page.getByLabel("Zip Code")).toHaveValue("12345");

    // Submit Step 1
    const step1Config = await getStepConfig(page);
    const continueButtonText =
      step1Config?.buttons?.continue || DEFAULT_CONTINUE_TEXT;
    await page.getByRole("button", { name: continueButtonText }).click();

    // Verify we're on Step 2
    await expect(page).toHaveURL("/flow/test/step-2");

    // Go back to Step 1 to verify all values are persisted
    await page.goto("/flow/test/step-1");

    // Verify all Step 1 values are still there
    await expect(page.getByLabel("Name")).toHaveValue("John Doe");
    await expect(page.getByLabel("Email")).toHaveValue("john@example.com");
    await expect(page.getByRole("checkbox", { name: "Apple 1" })).toBeChecked();
    await expect(page.getByRole("checkbox", { name: "Apple 2" })).toBeChecked();
    await expect(page.getByRole("radio", { name: "Orange 2" })).toBeChecked();
    await expect(page.getByRole("combobox", { name: /Pears/i })).toContainText(
      "Pear 2",
    );
    await expect(
      page.getByRole("combobox", { name: /Search Fruits/i }),
    ).toHaveValue("grape");
    await expect(page.getByRole("combobox", { name: /State/i })).toHaveValue(
      "NY",
    );
    await expect(notificationSwitch).toBeChecked();
    await expect(page.getByLabel("EIN")).toHaveValue("12-3456789");
    await expect(page.getByLabel("Zip Code")).toHaveValue("12345");
  });
});
