import type { FieldMetadata, FormOptions } from "@conform-to/react/future";
import { useForm } from "@conform-to/react/future";
import { coerceFormValue } from "@conform-to/zod/v4/future";
import { Form, href, Link, useActionData } from "react-router";

import type {
  Field,
  Step,
  StepNavigation,
} from "~/services/form/config.server";
import {
  DEFAULT_BACK_TEXT,
  DEFAULT_CONTINUE_TEXT,
} from "~/services/form/constants";
import { buildSchemaFromStep } from "~/services/form/schema";

import { ProgressIndicator } from "~/components/flow/progress-indicator";
import CheckboxGroup from "~/ui/checkbox-group";
import Combobox from "~/ui/combobox";
import Input from "~/ui/input";
import MaskedInput from "~/ui/masked-input";
import RadioGroup from "~/ui/radio-group";
import Select from "~/ui/select";
import Switch from "~/ui/switch";
import Textarea from "~/ui/textarea";
import { ROUTES } from "~/routes";

function RenderField(
  props: Field & FieldMetadata<Record<string, unknown>, string>,
) {
  switch (props.type) {
    case "CheckboxGroup":
      return <CheckboxGroup {...props} />;

    case "RadioGroup":
      return <RadioGroup {...props} />;

    case "Select":
      return <Select {...props} />;

    case "Combobox":
      return <Combobox {...props} />;

    case "Switch":
      return <Switch {...props} />;

    case "MaskedInput":
      return <MaskedInput {...props} />;

    case "Textarea":
      return <Textarea {...props} />;

    default:
      return <Input {...props} />;
  }
}

export default function FormRenderer({
  step,
  navigation,
  existingData = {},
}: {
  step: Step;
  navigation: StepNavigation;
  existingData?: FormOptions["defaultValue"];
}) {
  const actionData = useActionData();

  // Build schema and apply form value coercion
  const baseSchema = buildSchemaFromStep(step);
  const schema = coerceFormValue(baseSchema);

  const { form, fields } = useForm({
    lastResult: actionData?.result,
    schema,
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
    defaultValue: existingData,
  });

  return (
    <div>
      <ProgressIndicator navigation={navigation} />
      <Form method="post" {...form.props}>
        {step.rows?.map((row, rowIndex) => (
          <div key={rowIndex} className="mb-4">
            {row.columns.map((column, colIndex) => (
              <div key={colIndex} className="mb-3">
                {column.fields.map((field) => {
                  const fieldConfig = fields[field.name];

                  const { key: _, ...fieldsetWithoutKey } = fieldConfig;

                  return (
                    <RenderField
                      key={field.name}
                      {...fieldsetWithoutKey}
                      {...field}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        ))}

        <div className="mt-6 flex gap-4">
          {!navigation.isFirstStep && (
            <Link
              to={href(ROUTES.FLOW.FORM, {
                formId: navigation.formId,
                stepSlug: navigation.previousStepSlug,
              })}
              className="rounded border border-gray-300 px-4 py-2 hover:bg-gray-50"
            >
              {step.buttons?.back || DEFAULT_BACK_TEXT}
            </Link>
          )}
          <button
            type="submit"
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            {step.buttons?.continue || DEFAULT_CONTINUE_TEXT}
          </button>
        </div>
      </Form>
    </div>
  );
}
