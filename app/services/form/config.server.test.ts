import { describe, expect, it } from "vitest";

import { testSuite } from "~/services/form/config.server";

type Allowed = string;

type Rule = {
  fieldName: string;
  allowed: Allowed[];
  mode: "requireOneOf" | "disableWithOneOf";
};

const RULES: Rule[] = [
  {
    fieldName: "name",
    allowed: ["name", "given-name", "family-name"],
    mode: "requireOneOf",
  },
  { fieldName: "email", allowed: ["email"], mode: "requireOneOf" },
  {
    fieldName: "phone",
    allowed: ["tel", "tel-national", "tel-country-code", "tel-area-code"],
    mode: "requireOneOf",
  },
  { fieldName: "zipCode", allowed: ["postal-code"], mode: "requireOneOf" },
  { fieldName: "website", allowed: ["url"], mode: "requireOneOf" },
  {
    fieldName: "ein",
    allowed: ["off", "false", "nope"],
    mode: "disableWithOneOf",
  },
];

const ruleByField = new Map(RULES.map((r) => [r.fieldName, r] as const));

const formatPath = (formId: string, stepSlug: string, fieldName: string) =>
  `${formId}/${stepSlug}/${fieldName}`;

function checkViolations(formConfigs: (typeof testSuite)["formConfigs"]) {
  return Object.entries(formConfigs).flatMap(([formId, config]) =>
    (config.steps ?? []).flatMap((step) =>
      (step.rows ?? []).flatMap((row) =>
        row.columns.flatMap((col) =>
          col.fields.flatMap((field) => {
            const rule = ruleByField.get(field.name);
            if (!rule) return [] as string[];

            const value =
              "autoComplete" in field ? field.autoComplete : undefined;
            const path = formatPath(formId, step.slug, field.name);

            if (rule.mode === "requireOneOf") {
              if (!value) {
                return [
                  `${path} missing autoComplete (one of: ${rule.allowed.join(", ")})`,
                ];
              }
              if (!rule.allowed.includes(value)) {
                return [
                  `${path} has autoComplete="${value}"; expected one of: ${rule.allowed.join(", ")}`,
                ];
              }
              return [];
            }

            // disableWithOneOf
            if (!value) {
              return [
                `${path} should disable autoComplete (one of: ${rule.allowed.join(", ")})`,
              ];
            }
            if (!rule.allowed.includes(value)) {
              return [
                `${path} autoComplete="${value}"; expected disable value (one of: ${rule.allowed.join(", ")})`,
              ];
            }
            return [];
          }),
        ),
      ),
    ),
  );
}

describe("Form config best practices", () => {
  it("enforces autocomplete hints on recommended fields", () => {
    const { formConfigs } = testSuite;

    const violations = checkViolations(formConfigs);

    expect(
      violations,
      `Autocomplete best-practice violations:\n${violations.join("\n")}`,
    ).toHaveLength(0);
  });

  it("enforces structural and accessibility-friendly config rules", () => {
    const { formConfigs } = testSuite;

    const structuralViolations = Object.entries(formConfigs).flatMap(
      ([formId, config]) =>
        (config.steps ?? []).flatMap((step) => {
          // names must be unique within each step
          const stepFieldNames = new Set<string>();

          const nameUniquenessViolations = (step.rows ?? [])
            .flatMap((row) => row.columns.flatMap((c) => c.fields))
            .flatMap((field) => {
              const messages: string[] = [];

              // label non-empty
              if (!field.label || field.label.trim().length === 0) {
                messages.push(
                  `${formId}/${step.slug}/${field.name} has empty label`,
                );
              }

              // name is required and should be camelCase (basic check)
              if (!/^[a-z][a-zA-Z0-9]*$/.test(field.name)) {
                messages.push(
                  `${formId}/${step.slug}/${field.name} is not camelCase`,
                );
              }

              // uniqueness within a step
              if (stepFieldNames.has(field.name)) {
                messages.push(
                  `${formId}/${step.slug}/${field.name} is duplicated in the same step`,
                );
              } else {
                stepFieldNames.add(field.name);
              }

              // option-bearing fields: ensure non-empty options, valid labels/values, unique values
              if (
                field.type === "CheckboxGroup" ||
                field.type === "RadioGroup" ||
                field.type === "Select" ||
                field.type === "Combobox"
              ) {
                const options = (
                  field as { options?: { label: string; value: string }[] }
                ).options;
                if (!options || options.length === 0) {
                  messages.push(
                    `${formId}/${step.slug}/${field.name} has no options`,
                  );
                } else {
                  const valueSet = new Set<string>();
                  options.forEach((opt, idx) => {
                    if (!opt.label || opt.label.trim().length === 0) {
                      messages.push(
                        `${formId}/${step.slug}/${field.name} option[${idx}] has empty label`,
                      );
                    }
                    if (!opt.value || opt.value.trim().length === 0) {
                      messages.push(
                        `${formId}/${step.slug}/${field.name} option[${idx}] has empty value`,
                      );
                    }
                    if (valueSet.has(opt.value)) {
                      messages.push(
                        `${formId}/${step.slug}/${field.name} option value "${opt.value}" is duplicated`,
                      );
                    } else {
                      valueSet.add(opt.value);
                    }
                  });
                }
              }

              return messages;
            });

          return nameUniquenessViolations;
        }),
    );

    expect(
      structuralViolations,
      `Config structure violations:\n${structuralViolations.join("\n")}`,
    ).toHaveLength(0);
  });

  it("ensures all field names are unique across all steps in a form", () => {
    const { formConfigs } = testSuite;

    const uniquenessViolations = Object.entries(formConfigs).flatMap(
      ([formId, config]) => {
        const allFieldNames = new Map<string, string[]>(); // fieldName -> [paths]

        (config.steps ?? []).forEach((step) => {
          (step.rows ?? []).forEach((row) => {
            row.columns.forEach((col) => {
              col.fields.forEach((field) => {
                const path = formatPath(formId, step.slug, field.name);
                const existing = allFieldNames.get(field.name) ?? [];
                allFieldNames.set(field.name, [...existing, path]);
              });
            });
          });
        });

        return Array.from(allFieldNames.entries())
          .filter(([, paths]) => paths.length > 1)
          .map(([fieldName, paths]) => {
            return `${formId}: field "${fieldName}" is duplicated across steps: ${paths.join(", ")}`;
          });
      },
    );

    expect(
      uniquenessViolations,
      `Field name uniqueness violations:\n${uniquenessViolations.join("\n")}`,
    ).toHaveLength(0);
  });
});
