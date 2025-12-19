import { index, type RouteConfig, route } from "@react-router/dev/routes";

export const ROUTES = {
  INDEX: "/",
  FLOW: {
    FORM: "/flow/:formId/:stepSlug?",
    CHECKOUT: "/flow/:formId/checkout",
    FINISHED: "/flow/:formId/finished",
  },
} as const;

export default [
  index("routes/home.tsx"),
  route("flow/:formId/:stepSlug?", "routes/flow/$formId.$stepSlug.tsx"),
  route("flow/:formId/checkout", "routes/flow/$formId.checkout.tsx"),
  route("flow/:formId/finished", "routes/flow/$formId.finished.tsx"),
] satisfies RouteConfig;
