import type { MetaDescriptor } from "react-router";

import { US_STATES } from "./form-options";
import type { ValidatorKey } from "./validation";

export type FieldOption = {
  label: string;
  value: string;
};

type BaseField = {
  label: string;
  name: string;
  required: boolean;
  validators?: ValidatorKey[];
  info?: string;
  autoComplete?: string;
};

type TextInputField = BaseField & {
  type: "text" | "email" | "password" | "tel" | "url" | "number";
  placeholder?: string;
};

export type MaskType = "ein" | "zipcode" | "phone";

type MaskedInputField = BaseField & {
  type: "MaskedInput";
  maskType: MaskType;
  placeholder?: string;
};

type FieldWithOptions = BaseField & {
  type: "CheckboxGroup" | "RadioGroup" | "Select";
  options: FieldOption[];
};

type ComboboxField = BaseField & {
  type: "Combobox";
  options: FieldOption[];
  placeholder?: string;
};

type SwitchField = BaseField & {
  type: "Switch";
};

type TextareaField = BaseField & {
  type: "Textarea";
  rows?: number;
  placeholder?: string;
};

export type Field =
  | TextInputField
  | MaskedInputField
  | FieldWithOptions
  | ComboboxField
  | SwitchField
  | TextareaField;

export type Step = {
  slug: string;
  meta: MetaDescriptor[];
  rows?: {
    columns: {
      fields: Field[];
    }[];
  }[];
  buttons?: {
    continue?: string;
    back?: string;
  };
};

export type FormConfig = {
  hidden?: boolean;
  disabled?: boolean;
  debug?: boolean;
  meta: MetaDescriptor[];
  steps?: Step[];
  checkout?: { meta: MetaDescriptor[] };
  finished?: { meta: MetaDescriptor[] };
};

export type formConfigKey = keyof typeof formConfigs;

const formConfigs: Record<string, FormConfig> = {
  test: {
    hidden: true,
    debug: true,
    meta: [
      { title: "Test" },
      { name: "description", content: "Test description" },
    ],
    steps: [
      {
        slug: "step-1",
        meta: [{ title: "Step 1" }, { name: "description", content: "Step 1" }],
        buttons: {
          continue: "Continue to Step 2",
          back: "Go Back",
        },
        rows: [
          {
            columns: [
              {
                fields: [
                  {
                    label: "Name",
                    name: "name",
                    type: "text",
                    required: true,
                    validators: ["name"],
                    autoComplete: "name",
                  },
                ],
              },
              {
                fields: [
                  {
                    label: "Apples",
                    name: "apples",
                    type: "CheckboxGroup",
                    required: true,
                    options: [
                      { label: "Apple 1", value: "apple-1" },
                      { label: "Apple 2", value: "apple-2" },
                      { label: "Apple 3", value: "apple-3" },
                    ],
                  },
                ],
              },
            ],
          },
          {
            columns: [
              {
                fields: [
                  {
                    label: "Oranges",
                    name: "oranges",
                    type: "RadioGroup",
                    required: true,
                    options: [
                      { label: "Orange 1", value: "orange-1" },
                      { label: "Orange 2", value: "orange-2" },
                      { label: "Orange 3", value: "orange-3" },
                    ],
                  },
                ],
              },
              {
                fields: [
                  {
                    label: "Pears",
                    name: "pears",
                    type: "Select",
                    required: true,
                    options: [
                      { label: "Pear 1", value: "pear-1" },
                      { label: "Pear 2", value: "pear-2" },
                      { label: "Pear 3", value: "pear-3" },
                    ],
                  },
                ],
              },
            ],
          },
          {
            columns: [
              {
                fields: [
                  {
                    label: "Search Fruits",
                    name: "fruits",
                    type: "Combobox",
                    required: true,
                    options: [
                      { label: "Banana", value: "banana" },
                      { label: "Grape", value: "grape" },
                      { label: "Kiwi", value: "kiwi" },
                      { label: "Lemon", value: "lemon" },
                      { label: "Lime", value: "lime" },
                      { label: "Mango", value: "mango" },
                      { label: "Melon", value: "melon" },
                      { label: "Orange", value: "orange" },
                      { label: "Peach", value: "peach" },
                      { label: "Pear", value: "pear" },
                      { label: "Pineapple", value: "pineapple" },
                      { label: "Plum", value: "plum" },
                      { label: "Pomegranate", value: "pomegranate" },
                      { label: "Raspberry", value: "raspberry" },
                      { label: "Strawberry", value: "strawberry" },
                      { label: "Watermelon", value: "watermelon" },
                    ],
                  },
                ],
              },
              {
                fields: [
                  {
                    label: "State",
                    name: "state",
                    type: "Combobox",
                    required: true,
                    options: US_STATES,
                  },
                ],
              },
              {
                fields: [
                  {
                    label: "Enable Notifications",
                    name: "notifications",
                    type: "Switch",
                    required: false,
                  },
                ],
              },
            ],
          },
          {
            columns: [
              {
                fields: [
                  {
                    label: "EIN",
                    name: "ein",
                    type: "MaskedInput",
                    maskType: "ein",
                    required: true,
                    validators: ["ein"],
                    autoComplete: "off",
                    placeholder: "12-3456789",
                    info: "Your Employer Identification Number (EIN) is a 9-digit number assigned by the IRS. Format: XX-XXXXXXX",
                  },
                ],
              },
              {
                fields: [
                  {
                    label: "Zip Code",
                    name: "zipCode",
                    type: "MaskedInput",
                    maskType: "zipcode",
                    required: true,
                    validators: ["zipCode"],
                    autoComplete: "postal-code",
                    placeholder: "12345",
                  },
                ],
              },
            ],
          },
          {
            columns: [
              {
                fields: [
                  {
                    label: "Email",
                    name: "email",
                    type: "email",
                    required: true,
                    validators: ["email"],
                    autoComplete: "email",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        slug: "step-2",
        meta: [{ title: "Step 2" }, { name: "description", content: "Step 2" }],
        buttons: {
          continue: "Continue to Step 3",
          back: "Previous Step",
        },
        rows: [
          {
            columns: [
              {
                fields: [
                  {
                    label: "Phone Number",
                    name: "phone",
                    type: "MaskedInput",
                    maskType: "phone",
                    required: true,
                    validators: ["phone"],
                    autoComplete: "tel",
                    placeholder: "(555) 123-4567",
                  },
                ],
              },
            ],
          },
          {
            columns: [
              {
                fields: [
                  {
                    label: "Business Type",
                    name: "businessType",
                    type: "Select",
                    required: true,
                    options: [
                      {
                        label: "Sole Proprietorship",
                        value: "sole-proprietorship",
                      },
                      { label: "LLC", value: "llc" },
                      { label: "Corporation", value: "corporation" },
                      { label: "Partnership", value: "partnership" },
                    ],
                  },
                ],
              },
              {
                fields: [
                  {
                    label: "Annual Revenue",
                    name: "revenue",
                    type: "Select",
                    required: true,
                    options: [
                      { label: "Under $50,000", value: "under-50k" },
                      { label: "$50,000 - $100,000", value: "50k-100k" },
                      { label: "$100,000 - $500,000", value: "100k-500k" },
                      { label: "Over $500,000", value: "over-500k" },
                    ],
                  },
                ],
              },
            ],
          },
          {
            columns: [
              {
                fields: [
                  {
                    label: "Additional Comments",
                    name: "comments",
                    type: "Textarea",
                    required: false,
                    rows: 3,
                    info: "Use this field to provide any additional information or context that may be helpful.",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        slug: "step-3",
        meta: [{ title: "Step 3" }, { name: "description", content: "Step 3" }],
        buttons: {
          continue: "Submit Form",
          back: "Previous Step",
        },
        rows: [
          {
            columns: [
              {
                fields: [
                  {
                    label: "Company Website",
                    name: "website",
                    type: "url",
                    required: false,
                    autoComplete: "url",
                  },
                ],
              },
              {
                fields: [
                  {
                    label: "Tax Year",
                    name: "taxYear",
                    type: "number",
                    required: true,
                  },
                ],
              },
            ],
          },
          {
            columns: [
              {
                fields: [
                  {
                    label: "Department",
                    name: "department",
                    type: "Select",
                    required: true,
                    options: [
                      { label: "Accounting", value: "accounting" },
                      { label: "Finance", value: "finance" },
                      { label: "HR", value: "hr" },
                      { label: "IT", value: "it" },
                      { label: "Legal", value: "legal" },
                      { label: "Operations", value: "operations" },
                    ],
                  },
                ],
              },
              {
                fields: [
                  {
                    label: "Experience Level",
                    name: "experience",
                    type: "RadioGroup",
                    required: true,
                    options: [
                      { label: "Entry Level", value: "entry" },
                      { label: "Mid Level", value: "mid" },
                      { label: "Senior Level", value: "senior" },
                      { label: "Executive", value: "executive" },
                    ],
                  },
                ],
              },
            ],
          },
          {
            columns: [
              {
                fields: [
                  {
                    label: "Additional Notes",
                    name: "notes",
                    type: "text",
                    required: false,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
    checkout: {
      meta: [
        { title: "Complete Your Test" },
        { name: "description", content: "Complete your test" },
      ],
    },
    finished: {
      meta: [
        { title: "Test Complete" },
        { name: "description", content: "Test complete" },
      ],
    },
  },
};

export const getFormConfig = (formId: string) => {
  return formConfigs[formId];
};

export const isValidFormId = (formId: string) => {
  return Object.keys(formConfigs).includes(formId);
};

export const getAllFormIds = () => {
  return Object.keys(formConfigs);
};

export const getFormConfigSafe = (formId: string) => {
  if (!formId || !isValidFormId(formId)) {
    return null;
  }
  return getFormConfig(formId);
};

export const getFirstStep = (formConfig: FormConfig) => {
  if (!formConfig.steps) throw new Error("No steps found");
  return formConfig.steps[0].slug;
};

export const findStep = (formConfig: FormConfig, stepSlug: string) => {
  const step = formConfig.steps?.find((step) => step.slug === stepSlug);
  if (!step) throw new Error("Step not found");
  return step;
};

export const isValidStepSlug = (formConfig: FormConfig, stepSlug: string) => {
  return formConfig.steps?.some((step) => step.slug === stepSlug) ?? false;
};

export type StepNavigation = ReturnType<typeof getStepNavigation>;

export const getStepNavigation = ({
  formConfig,
  stepSlug,
  formId,
}: {
  formConfig: FormConfig;
  stepSlug: string | undefined;
  formId: string;
}) => {
  if (!formId) throw new Error("Form ID not found");
  if (!stepSlug) throw new Error("Step slug not found");

  const currentStepIndex =
    formConfig.steps?.findIndex((s) => s.slug === stepSlug) ?? 0;
  const totalSteps = formConfig.steps?.length ?? 0;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === totalSteps - 1;
  const previousStepSlug =
    currentStepIndex > 0
      ? formConfig.steps?.[currentStepIndex - 1]?.slug
      : undefined;
  const nextStepSlug =
    currentStepIndex < totalSteps - 1
      ? formConfig.steps?.[currentStepIndex + 1]?.slug
      : undefined;

  return {
    formId,
    currentStepIndex,
    totalSteps,
    isFirstStep,
    isLastStep,
    previousStepSlug,
    nextStepSlug,
  };
};

export const getStep = ({
  formConfig,
  stepSlug,
}: {
  formConfig: FormConfig;
  stepSlug: string | undefined;
}) => {
  if (!stepSlug) throw new Error("Step slug not found");
  return findStep(formConfig, stepSlug);
};

export const getNextStep = (
  formConfig: FormConfig,
  currentStepSlug: string,
) => {
  const currentStepIndex =
    formConfig.steps?.findIndex((s) => s.slug === currentStepSlug) ?? -1;
  return formConfig.steps?.[currentStepIndex + 1] ?? null;
};

export const getCheckoutMeta = (formConfig: FormConfig) => {
  return formConfig.checkout?.meta || formConfig.meta;
};

export const getFinishedMeta = (formConfig: FormConfig) => {
  return formConfig.finished?.meta || formConfig.meta;
};

// Test-only utilities
export const testSuite = {
  formConfigs,
};
