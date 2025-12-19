import type { MetaDescriptor } from "react-router";

import {
  type FormConfig,
  findStep,
  getCheckoutMeta,
  getFinishedMeta,
} from "./config.server";

const noFollowMeta: MetaDescriptor[] = [
  { name: "robots", content: "noindex, nofollow" },
  { name: "googlebot", content: "noindex, nofollow" },
];

const createMetaWithNoFollow = (meta: MetaDescriptor[]) => [
  ...meta,
  ...noFollowMeta,
];

export const getStepMetaData = ({
  formConfig,
  stepSlug,
}: {
  formConfig: FormConfig;
  stepSlug?: string | undefined;
}) => {
  if (!stepSlug) {
    throw new Error("Step slug not found");
  }

  const step = findStep(formConfig, stepSlug);
  return createMetaWithNoFollow(step?.meta || formConfig.meta);
};

export const getCheckoutMetaData = (formConfig: FormConfig) => {
  const checkoutMeta = getCheckoutMeta(formConfig);
  return createMetaWithNoFollow(checkoutMeta);
};

export const getFinishedMetaData = (formConfig: FormConfig) => {
  const finishedMeta = getFinishedMeta(formConfig);
  return createMetaWithNoFollow(finishedMeta);
};
