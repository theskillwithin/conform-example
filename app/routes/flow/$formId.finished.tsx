import { Link } from "react-router";

import type { Route } from "./+types/$formId.finished";

import { validateForm } from "~/services/form/validation.server";

export async function loader({ params }: Route.LoaderArgs) {
  const { formId } = params;
  validateForm(formId);

  return { formId };
}

export default function Finished({
  loaderData: { formId },
}: Route.ComponentProps) {
  return (
    <div className="mx-auto max-w-2xl p-8 text-center">
      <h1 className="mb-4 font-bold text-2xl">Form Complete!</h1>
      <p className="mb-4">Thank you for completing the {formId} form.</p>

      <Link
        to="/"
        className="inline-block rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        Back to Home
      </Link>
    </div>
  );
}
