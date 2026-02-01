import { configureForms } from "@conform-to/react/future";
import { getConstraints } from "@conform-to/zod/v4/future";

export const { useForm, useField, FormProvider } = configureForms({
  shouldValidate: "onBlur",
  shouldRevalidate: "onInput",
  getConstraints,
  // extendFieldMetadata(metadata) {
  //   return {
  //     get textFieldProps() {
  //       return {
  //         name: metadata.name,
  //         defaultValue: metadata.defaultValue,
  //         "aria-invalid": !metadata.valid,
  //       };
  //     },
  //   };
  // },
});
