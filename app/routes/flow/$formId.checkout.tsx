import { href, Link } from "react-router";

import type { Route } from "./+types/$formId.checkout";

import { validateForm } from "~/services/form/validation.server";
import { getFormSessionData } from "~/services/form-session.server";

import { ROUTES } from "~/routes";

export async function loader({ params, request }: Route.LoaderArgs) {
  const { formId } = params;
  validateForm(formId);

  const formSession = await getFormSessionData(request, formId);

  return {
    formId,
    formData: formSession?.data || {},
  };
}

export default function Checkout({
  loaderData: { formId, formData },
}: Route.ComponentProps) {
  return (
    <div className="mx-auto max-w-2xl p-8">
      <h1 className="mb-4 font-bold text-2xl">Checkout</h1>
      <p className="mb-4">Review your form submission:</p>

      <pre className="mb-4 overflow-auto rounded bg-gray-100 p-4 text-sm">
        {JSON.stringify(formData, null, 2)}
      </pre>

      <div className="flex gap-4">
        <Link
          to={href(ROUTES.FLOW.FORM, { formId, stepSlug: "step-1" })}
          className="rounded border border-gray-300 px-4 py-2 hover:bg-gray-50"
        >
          Back to Form
        </Link>
        <Link
          to={href(ROUTES.FLOW.FINISHED, { formId })}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Complete
        </Link>
      </div>
    </div>
  );
}
