# Conform Example

A minimal React Router example for testing Conform form validation upgrades.

## Overview

This is a reduced example of a multi-step form flow using:

- **React Router 7** - File-based routing with SSR
- **[Conform](https://github.com/edmundhung/conform)** - Form validation library (`@conform-to/react`, `@conform-to/zod`)
- **Zod 4** - Schema validation
- **Base UI** - Accessible UI components
- **Tailwind CSS 4** - Styling

## Getting Started

```bash
# Install dependencies
npm install

# Generate React Router types
npm run types

# Start development server
npm run dev
```

Visit `http://localhost:5173` and click "Start Test Form" to test the multi-step form.

## Project Structure

```
app/
├── routes/
│   ├── home.tsx                    # Landing page
│   └── flow/
│       ├── $formId.$stepSlug.tsx   # Main form step route
│       ├── $formId.checkout.tsx    # Checkout/review page
│       └── $formId.finished.tsx    # Completion page
├── components/
│   └── flow/
│       ├── form-renderer.tsx       # Dynamic form renderer
│       └── progress-indicator.tsx  # Step progress bar
├── services/
│   ├── form/
│   │   ├── config.server.ts        # Form configurations
│   │   ├── schema.ts               # Zod schema builder
│   │   ├── validation.ts           # Custom validators
│   │   ├── validation.server.ts    # Server-side validation
│   │   ├── constants.ts            # Button text constants
│   │   ├── form-options.ts         # Select options (US states, etc.)
│   │   └── meta.server.ts          # Meta tag generation
│   ├── form-session.server.ts      # Session storage (cookies + SQLite database)
│   └── db.server.ts                # Prisma database client
├── ui/                             # Form UI components
│   ├── input/
│   ├── select/
│   ├── checkbox-group/
│   ├── radio-group/
│   ├── switch/
│   ├── textarea/
│   ├── combobox/
│   ├── masked-input/
│   ├── progress/
│   └── popover/
└── utils/
    └── cn.ts                       # Tailwind class merge utility
```

## Testing Conform Upgrades

To test Conform upgrades:

1. Update the Conform packages in `package.json`:
   ```json
   {
     "@conform-to/react": "NEW_VERSION",
     "@conform-to/zod": "NEW_VERSION"
   }
   ```

2. Run `npm install`

3. Start the dev server and test the form flow

4. Check for:
   - Form submission and validation
   - Error message display
   - Field value coercion
   - Multi-step navigation
   - Session data persistence

## Key Conform Integration Points

### Server-side (Action)

```typescript
import { parseSubmission, report } from "@conform-to/react/future";
import { parseWithZod } from "@conform-to/zod/v4";
import { coerceFormValue } from "@conform-to/zod/v4/future";

// Parse submission
const submission = parseSubmission(formData);

// Build schema and coerce values
const baseSchema = buildSchemaFromStep(step);
const schema = coerceFormValue(baseSchema);

// Validate
const result = parseWithZod(formData, { schema });

// Return errors
if (result.status !== "success") {
  return { result: report(submission, result) };
}
```

### Client-side (Component)

```typescript
import { useForm } from "@conform-to/react/future";
import { coerceFormValue } from "@conform-to/zod/v4/future";

const { form, fields } = useForm({
  lastResult: actionData?.result,
  schema: coerceFormValue(baseSchema),
  shouldValidate: "onBlur",
  shouldRevalidate: "onInput",
  defaultValue: existingData,
});
```

## E2E Tests

The project includes comprehensive Playwright e2e tests for the form flow.

### Running E2E Tests

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run all e2e tests
npm run test:e2e

# Run e2e tests with UI
npm run test:e2e:ui
```

### Test Coverage

The e2e tests cover:

- Form field interactions (text, checkbox, radio, switch, select, combobox, textarea, masked inputs)
- Form validation (required fields, field-specific validators)
- Multi-step navigation (forward/back)
- Form state persistence across steps
- Accessibility attributes
- Info popovers
- URL parameter preservation during redirects

### Test Files

```
tests/
└── e2e/
    └── form-flow-basic.spec.ts   # Comprehensive form flow tests
```

## Notes

- Session storage uses cookies + SQLite database (via Prisma). Session IDs are stored in cookies, form data is stored in the database.
- The `test` form config has debug mode enabled
- All field types are demonstrated in the 3-step test form

## Database Setup

This project uses Prisma with SQLite for session storage. To set up the database:

```bash
# Run migrations (creates database if it doesn't exist)
npm run db:setup
```

The database file (`dev.db`) will be created in the project root.
