import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React from "react";
import { useForm } from "react-hook-form";
import { FormTextarea } from "../../components/core/form-textarea";

const meta: Meta<typeof FormTextarea> = {
  title: "Form/FormTextarea",
  component: FormTextarea,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof FormTextarea>;

const TextareaWithForm = (args: React.ComponentProps<typeof FormTextarea>) => {
  const { control } = useForm();
  return (
    <div className="w-[400px] p-4">
      <FormTextarea {...args} control={control} name="description" />
    </div>
  );
};

export const Default: Story = {
  render: (args) => <TextareaWithForm {...args} />,
  args: {
    label: "Bio",
    placeholder: "Tell us about yourself",
  },
};

export const WithError: Story = {
  render: (args) => <TextareaWithForm {...args} />,
  args: {
    label: "Bio",
    placeholder: "Tell us about yourself",
    errorMessage: "Bio is too short",
  },
};
