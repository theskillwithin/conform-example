import { data, redirect } from "react-router";

import {
  getFirstStep,
  getFormConfig,
  isValidFormId,
  isValidStepSlug,
} from "~/services/form/config.server";

export const validateFormAndStep = ({
  formId,
  stepSlug,
  request,
}: {
  formId: string;
  stepSlug?: string;
  request?: Request;
}) => {
  if (!formId || !isValidFormId(formId)) {
    throw data("Form not found", { status: 404 });
  }

  const formConfig = getFormConfig(formId);
  if (!formConfig || formConfig.disabled) {
    throw data("Form not found", { status: 404 });
  }

  // If no step provided, redirect to first step
  if (!stepSlug) {
    const firstStep = getFirstStep(formConfig);
    if (firstStep) {
      // Only redirect if we have a valid request URL (for step routes)
      if (request?.url) {
        const url = new URL(request.url);
        const searchParams = url.searchParams.toString();
        const redirectUrl = `/flow/${formId}/${firstStep}${searchParams ? `?${searchParams}` : ""}`;
        throw redirect(redirectUrl);
      }
      // For checkout/finished routes, just return the form config without redirecting
    }
  }

  if (stepSlug && !isValidStepSlug(formConfig, stepSlug)) {
    throw data("Step not found", { status: 404 });
  }

  return formConfig;
};

export const validateForm = (formId: string) => {
  if (!formId || !isValidFormId(formId)) {
    throw data("Form not found", { status: 404 });
  }

  const formConfig = getFormConfig(formId);
  if (!formConfig || formConfig.disabled) {
    throw data("Form not found", { status: 404 });
  }

  return formConfig;
};
