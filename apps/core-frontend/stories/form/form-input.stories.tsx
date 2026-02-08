import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React from "react";
import { useForm } from "react-hook-form";
import { FormInput } from "@trustmed/components";
import { Mail } from "lucide-react";

const meta: Meta<typeof FormInput> = {
  title: "Form/FormInput",
  component: FormInput,
  tags: ["autodocs"],
  argTypes: {
    type: { control: "text" },
    required: { control: "boolean" },
    disabled: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof FormInput>;

const InputWithForm = (args: React.ComponentProps<typeof FormInput>) => {
  const { control } = useForm();
  return (
    <div className="w-[400px] p-4">
      <FormInput {...args} control={control} name="username" />
    </div>
  );
};

export const Default: Story = {
  render: (args) => <InputWithForm {...args} />,
  args: {
    label: "Username",
    placeholder: "Enter username",
    errorMessage: "",
    required: false,
  },
};

export const WithError: Story = {
  render: (args) => <InputWithForm {...args} />,
  args: {
    label: "Email",
    placeholder: "Enter email",
    errorMessage: "Invalid email address",
    type: "email",
    required: true,
  },
};

export const WithIcon: Story = {
  render: (args) => <InputWithForm {...args} />,
  args: {
    label: "Email",
    placeholder: "john@example.com",
    StartIcon: Mail,
  },
};

export const Disabled: Story = {
  render: (args) => <InputWithForm {...args} />,
  args: {
    label: "Disabled Input",
    placeholder: "Cannot type here",
    disabled: true,
  },
};
