import { href, Link } from "react-router";

import type { Route } from "./+types/$formId.checkout";

import { validateForm } from "~/services/form/validation.server";
import { getFormSession } from "~/services/form-session.server";
import { ROUTES } from "~/routes";

export async function loader({ params, request }: Route.LoaderArgs) {
  const { formId } = params;
  validateForm(formId);

  const formSession = await getFormSession(request, formId);

  return {
    formId,
    formData: formSession?.data || {},
  };
}

export default function Checkout({ loaderData: { formId, formData } }: Route.ComponentProps) {
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>
      <p className="mb-4">Review your form submission:</p>

      <pre className="bg-gray-100 p-4 rounded mb-4 text-sm overflow-auto">
        {JSON.stringify(formData, null, 2)}
      </pre>

      <div className="flex gap-4">
        <Link
          to={href(ROUTES.FLOW.FORM, { formId, stepSlug: "step-1" })}
          className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
        >
          Back to Form
        </Link>
        <Link
          to={href(ROUTES.FLOW.FINISHED, { formId })}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Complete
        </Link>
      </div>
    </div>
  );
}
