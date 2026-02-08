import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React from "react";
import { useForm } from "react-hook-form";
import { FormPhoneInput } from "@trustmed/components";

const meta: Meta<typeof FormPhoneInput> = {
  title: "Form/FormPhoneInput",
  component: FormPhoneInput,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof FormPhoneInput>;

const PhoneInputWithForm = (args: React.ComponentProps<typeof FormPhoneInput>) => {
  const { control } = useForm();
  return (
    <div className="w-[400px] p-4">
      <FormPhoneInput {...args} control={control} name="phone" />
    </div>
  );
};

export const Default: Story = {
  render: (args) => <PhoneInputWithForm {...args} />,
  args: {
    label: "Phone Number",
    placeholder: "+1 (555) 000-0000",
    description: "Enter your contact number",
  },
};

export const Required: Story = {
  render: (args) => <PhoneInputWithForm {...args} />,
  args: {
    label: "Phone Number",
    required: true,
  },
};
