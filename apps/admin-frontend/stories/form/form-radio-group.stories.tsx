import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React from "react";
import { useForm, FieldValues } from "react-hook-form";
import { FormRadioGroup } from "@trustmed/components";
import { Button } from "../../components/ui/button";

const meta: Meta<typeof FormRadioGroup> = {
  title: "Form/FormRadioGroup",
  component: FormRadioGroup,
  tags: ["autodocs"],
  argTypes: {
    control: { table: { disable: true } },
  },
};

export default meta;
type Story = StoryObj<typeof FormRadioGroup>;

const RadioGroupWithForm = (args: React.ComponentProps<typeof FormRadioGroup>) => {
  const { control, handleSubmit } = useForm();
  const onSubmit = (data: FieldValues) => console.log(data);


  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-[400px] space-y-4 p-4">
      <FormRadioGroup {...args} control={control} />
      
      <div className="mt-4 p-4 bg-slate-100 rounded-md">
        <p className="text-xs font-mono">Select an option above</p>
      </div>
      
      <Button type="submit">Submit</Button>
    </form>
  );
};

export const Default: Story = {
  render: (args) => <RadioGroupWithForm {...args} />,
  args: {
    name: "gender",
    label: "Gender",
    options: [
      { label: "Male", value: "male" },
      { label: "Female", value: "female" },
      { label: "Other", value: "other" },
    ],
  },
};

export const Required: Story = {
  render: (args) => <RadioGroupWithForm {...args} />,
  args: {
    name: "subscription",
    label: "Choose a plan",
    required: true,
    options: [
      { label: "Free (Ads)", value: "free" },
      { label: "Pro ($10/mo)", value: "pro" },
      { label: "Enterprise ($50/mo)", value: "enterprise" },
    ],
  },
};
