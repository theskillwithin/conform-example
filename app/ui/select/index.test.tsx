import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import Select from "~/ui/select";

describe("Select", () => {
  const options = [
    { label: "Option 1", value: "1" },
    { label: "Option 2", value: "2" },
  ];

  it("renders label, required indicator, and trigger", () => {
    render(
      <Select
        name="select-test"
        label="Choose option"
        options={options}
        required
      />,
    );

    expect(screen.getByText("Choose option")).toBeInTheDocument();
    expect(screen.getByText("*")).toBeInTheDocument();

    const trigger = screen.getByRole("combobox", { name: /Choose option/ });
    expect(trigger).toHaveAttribute("aria-labelledby", "select-test-label");
  });

  it("renders options in popup when opened", async () => {
    const user = userEvent.setup();

    render(
      <Select name="select-test" label="Choose option" options={options} />,
    );

    const trigger = screen.getByRole("combobox", { name: /Choose option/ });
    await user.click(trigger);

    expect(screen.getByText("Option 1")).toBeInTheDocument();
    expect(screen.getByText("Option 2")).toBeInTheDocument();
  });

  it("applies defaultValue and updates value when an option is selected", async () => {
    const user = userEvent.setup();

    render(
      <Select
        name="select-test"
        label="Choose option"
        options={options}
        defaultValue="1"
      />,
    );

    // Default value should be visible
    const trigger = screen.getByRole("combobox", { name: /Choose option/ });
    expect(trigger).toHaveTextContent("Option 1");

    // Change selection
    await user.click(trigger);
    await user.click(screen.getByText("Option 2"));

    expect(trigger).toHaveTextContent("Option 2");

    // Hidden input value should also be updated
    const hiddenInput = document.querySelector(
      'input[name="select-test"]',
    ) as HTMLInputElement | null;
    expect(hiddenInput?.value).toBe("2");
  });

  it("shows error message when provided", () => {
    render(
      <Select
        name="select-test"
        label="Choose option"
        options={options}
        errors={["Selection is required"]}
      />,
    );

    expect(screen.getByText("Selection is required")).toBeInTheDocument();
  });
});
