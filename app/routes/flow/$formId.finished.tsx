import { Link } from "react-router";

import type { Route } from "./+types/$formId.finished";

import { validateForm } from "~/services/form/validation.server";

export async function loader({ params }: Route.LoaderArgs) {
  const { formId } = params;
  validateForm(formId);

  return { formId };
}

export default function Finished({ loaderData: { formId } }: Route.ComponentProps) {
  return (
    <div className="p-8 max-w-2xl mx-auto text-center">
      <h1 className="text-2xl font-bold mb-4">Form Complete!</h1>
      <p className="mb-4">Thank you for completing the {formId} form.</p>

      <Link
        to="/"
        className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Back to Home
      </Link>
    </div>
  );
}
