import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React from "react";
import { useForm } from "react-hook-form";
import { FormPasswordInput } from "../../components/core/form-password-input";

const meta: Meta<typeof FormPasswordInput> = {
  title: "Form/FormPasswordInput",
  component: FormPasswordInput,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof FormPasswordInput>;

const PasswordWithForm = (args: React.ComponentProps<typeof FormPasswordInput>) => {
  const { control } = useForm();
  return (
    <div className="w-[400px] p-4">
      <FormPasswordInput {...args} control={control} name="password" />
    </div>
  );
};

export const Default: Story = {
  render: (args) => <PasswordWithForm {...args} />,
  args: {
    label: "Password",
    placeholder: "Enter password",
  },
};

export const WithError: Story = {
  render: (args) => <PasswordWithForm {...args} />,
  args: {
    label: "Password",
    placeholder: "Enter password",
    errorMessage: "Password is too weak",
  },
};
