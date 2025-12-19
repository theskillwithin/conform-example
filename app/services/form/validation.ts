import { z } from "zod";

const PasswordSchema = z
  .string()
  .min(8, {
    error: "Use 8+ characters with a mix of letters, numbers, and symbols.",
  })
  .regex(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[\W_]).+$/, {
    error: "Use 8+ characters with a mix of letters, numbers, and symbols.",
  });

const EinSchema = z.string().regex(/^\d{2}-\d{7}$/, {
  error: "EIN must be in the format XX-XXXXXXX (e.g., 12-3456789)",
});

const ZipCodeSchema = z.string().regex(/^\d{5}$/, {
  error: "ZIP code must be 5 digits",
});

const PhoneSchema = z.string().regex(/^\(\d{3}\)\s\d{3}-\d{4}$/, {
  error: "Phone number must be in the format (XXX) XXX-XXXX",
});

const VinSchema = z.string().regex(/^\S{17}$/, {
  error: "VIN must be exactly 17 characters with no spaces",
});

const RoutingNumberSchema = z.string().regex(/^\d{9}$/, {
  error: "Routing number must be exactly 9 digits",
});

const EmailSchema = z.email({
  error: "Please enter a valid email address",
});

const OwnershipPercentageSchema = z.string().refine(
  (val) => {
    // Allow empty for optional fields
    if (!val) return true;

    // Remove % if present and check if it's a valid number
    const cleanVal = val.replace("%", "");
    const num = Number.parseFloat(cleanVal);

    return !Number.isNaN(num) && num >= 0 && num <= 100;
  },
  {
    error: "Ownership percentage must be between 0 and 100",
  },
);

const LettersOnlySchema = z.string().regex(/^[a-zA-Z]+$/, {
  error: "Must contain only letters",
});

const NameSchema = z
  .string()
  .min(2, {
    error: "Name must be at least 2 characters",
  })
  .max(50, {
    error: "Name must be no more than 50 characters",
  })
  .regex(/^[a-zA-Z]+(['\-\s][a-zA-Z]+)*\.?$/, {
    error: "Name must contain only letters, spaces, hyphens, and apostrophes",
  })
  .refine((val) => val.trim().length > 0, {
    error: "Name cannot be just whitespace",
  });

const validationMapping = {
  ein: EinSchema,
  zipCode: ZipCodeSchema,
  phone: PhoneSchema,
  vin: VinSchema,
  routingNumber: RoutingNumberSchema,
  email: EmailSchema,
  ownershipPercentage: OwnershipPercentageSchema,
  password: PasswordSchema,
  lettersOnly: LettersOnlySchema,
  name: NameSchema,
};

export type ValidatorKey = keyof typeof validationMapping;

export const getValidator = (key: ValidatorKey) => {
  return validationMapping[key];
};
