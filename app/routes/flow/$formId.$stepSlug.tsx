import { parseSubmission, report } from "@conform-to/react/future";
import { parseWithZod } from "@conform-to/zod/v4";
import { coerceFormValue } from "@conform-to/zod/v4/future";
import { href, redirect } from "react-router";
import invariant from "tiny-invariant";

import type { Route } from "./+types/$formId.$stepSlug";

import {
  getNextStep,
  getStep,
  getStepNavigation,
} from "~/services/form/config.server";
import { getStepMetaData } from "~/services/form/meta.server";
import { buildSchemaFromStep } from "~/services/form/schema";
import { validateFormAndStep } from "~/services/form/validation.server";
import {
  getFormSessionData,
  saveFormSession,
} from "~/services/form-session.server";

import FormRenderer from "~/components/flow/form-renderer";
import { ROUTES } from "~/routes";

export function meta({ loaderData: { metaData } }: Route.MetaArgs) {
  return metaData;
}

export async function loader({ params, request }: Route.LoaderArgs) {
  const { formId, stepSlug } = params;
  const formConfig = validateFormAndStep({ formId, stepSlug, request });
  const step = getStep({ formConfig, stepSlug });
  const navigation = getStepNavigation({ formConfig, stepSlug, formId });
  const metaData = getStepMetaData({ formConfig, stepSlug });

  // Get existing form session data to populate the form
  const formSession = await getFormSessionData(request, formId);
  const existingData = formSession?.data;

  // Guard against primitive types - ensure data is an object or undefined
  invariant(
    existingData === undefined ||
      (typeof existingData === "object" && existingData !== null),
    "Form session data must be an object",
  );

  return {
    formConfig,
    step,
    navigation,
    stepSlug,
    metaData,
    existingData,
  };
}

export async function action({ request, params }: Route.ActionArgs) {
  const formData = await request.formData();
  const { formId, stepSlug } = params;

  // Parse the submission using Conform
  const submission = parseSubmission(formData);

  // Get form config and current step
  const formConfig = validateFormAndStep({ formId, stepSlug, request });
  const step = getStep({ formConfig, stepSlug });

  // Build schema for current step and apply form value coercion
  const baseSchema = buildSchemaFromStep(step);
  const schema = coerceFormValue(baseSchema);

  // Validate form data using Zod - can pass result directly to report
  const result = parseWithZod(formData, { schema });

  if (result.status !== "success") {
    return {
      result: report(submission, result),
    };
  }

  // Save form data to session
  const sessionCookie = await saveFormSession({
    formId,
    data: result.value,
    request,
  });
  console.log("Form submitted:", result.value);

  // Determine next step using utility function
  const nextStep = getNextStep(formConfig, step.slug);

  if (nextStep) {
    // Redirect to next step with session cookie
    return redirect(
      href(ROUTES.FLOW.FORM, { formId, stepSlug: nextStep.slug }),
      {
        headers: {
          "Set-Cookie": sessionCookie,
        },
      },
    );
  } else {
    // This is the last step, redirect to checkout with session cookie
    return redirect(href(ROUTES.FLOW.CHECKOUT, { formId }), {
      headers: {
        "Set-Cookie": sessionCookie,
      },
    });
  }
}

export default function FormFlow({
  loaderData: { formConfig, step, navigation, stepSlug, existingData },
}: Route.ComponentProps) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-3 p-3">
      <FormRenderer
        step={step}
        navigation={navigation}
        existingData={existingData}
      />
      {formConfig.debug && (
        <details className="mt-4 rounded bg-gray-100 p-4">
          <summary className="cursor-pointer font-medium">
            Debug Information
          </summary>
          <div className="mt-2 space-y-2">
            <details>
              <summary className="cursor-pointer">Form Config</summary>
              <pre className="mt-1 overflow-auto text-xs">
                {JSON.stringify(formConfig, null, 2)}
              </pre>
            </details>
            <details>
              <summary className="cursor-pointer">Step</summary>
              <pre className="mt-1 overflow-auto text-xs">
                {JSON.stringify(step, null, 2)}
              </pre>
            </details>
            <details>
              <summary className="cursor-pointer">Step Slug</summary>
              <code>{stepSlug}</code>
            </details>
            <details>
              <summary className="cursor-pointer">Existing Data</summary>
              <pre className="mt-1 overflow-auto text-xs">
                {JSON.stringify(existingData, null, 2)}
              </pre>
            </details>
          </div>
        </details>
      )}
    </div>
  );
}
