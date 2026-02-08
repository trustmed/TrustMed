import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React from "react";
import { useForm } from "react-hook-form";
import { FormCheckbox } from "../../components/core/form-checkbox";

const meta: Meta<typeof FormCheckbox> = {
  title: "Form/FormCheckbox",
  component: FormCheckbox,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof FormCheckbox>;

const CheckboxWithForm = (args: React.ComponentProps<typeof FormCheckbox>) => {
  const { control } = useForm({
    defaultValues: {
      terms: false,
    }
  });
  return (
    <div className="w-[400px] p-4">
      <FormCheckbox {...args} control={control} name="terms" />
    </div>
  );
};

export const Default: Story = {
  render: (args) => <CheckboxWithForm {...args} />,
  args: {
    label: "Accept Terms and Conditions",
    description: "You agree to our Terms of Service and Privacy Policy.",
  },
};

export const Simple: Story = {
  render: (args) => <CheckboxWithForm {...args} />,
  args: {
    label: "Subscribe to newsletter",
  },
};
