import { z } from "zod";

import type { Field, Step } from "./config.server";
import { getValidator } from "./validation";

/**
 * Extract all fields from a step configuration
 */
export function extractFieldsFromStep(step: Step) {
  return (
    step.rows?.flatMap((row) =>
      row.columns.flatMap((column) => column.fields),
    ) || []
  );
}

/**
 * Combine multiple Zod schemas with intersection
 */
export function combineSchemas(schemas: z.ZodTypeAny[]) {
  return schemas.reduce((acc, schema) => acc.and(schema));
}

/**
 * Get the base schema for a field type
 */
function getBaseSchemaForFieldType(field: Field) {
  switch (field.type) {
    case "CheckboxGroup":
      return z.array(z.string());
    case "Switch":
      return z.any().transform((val) => {
        // Handle various form input formats
        if (val === "on" || val === true || val === "true") return true;
        if (val === "off" || val === false || val === "false") return false;
        // If no value is sent (unchecked), default to false
        return false;
      });
    default:
      // if not a string, this usually means its undefined, so the error message is "Required"
      return z.string("Required");
  }
}

/**
 * Apply validators to a base schema
 */
function applyValidators(baseSchema: z.ZodTypeAny, field: Field) {
  if (!field.validators?.length) {
    return baseSchema;
  }

  const validatorSchemas = field.validators.map(getValidator);
  const combinedValidatorSchema = combineSchemas(validatorSchemas);

  // For checkboxes, validate each item in the array
  if (field.type === "CheckboxGroup") {
    return z.array(combinedValidatorSchema);
  }

  // For other fields, combine with base schema
  return baseSchema.and(combinedValidatorSchema);
}

/**
 * Apply required validation to a schema
 */
function applyRequiredValidation(schema: z.ZodTypeAny, field: Field) {
  if (!field.required) {
    return schema.optional();
  }
  if (schema instanceof z.ZodArray || schema instanceof z.ZodString) {
    return schema.min(1, `${field.label} is required`);
  }
  return schema;
}

/**
 * Create a Zod schema for a single field
 */
export function createFieldSchema(field: Field) {
  const baseSchema = getBaseSchemaForFieldType(field);
  const schemaWithValidators = applyValidators(baseSchema, field);
  const finalSchema = applyRequiredValidation(schemaWithValidators, field);

  return [field.name, finalSchema] as const;
}

/**
 * Build a Zod schema from a step configuration
 *
 * Uses .extend() instead of Object.fromEntries() to preserve type inference.
 * This allows Zod v4 to maintain literal key types throughout the schema building process.
 */
export function buildSchemaFromStep(step: Step) {
  const allFields = extractFieldsFromStep(step);

  // Start with empty object and extend with each field
  // This preserves literal key types better than Object.fromEntries()
  return allFields.reduce((schema, field) => {
    const [key, fieldSchema] = createFieldSchema(field);
    return schema.extend({ [key]: fieldSchema });
  }, z.object({}));
}
