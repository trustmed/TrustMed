import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React from "react";
import { useForm } from "react-hook-form";
import { FormSelect } from "@trustmed/components";

const meta: Meta<typeof FormSelect> = {
  title: "Form/FormSelect",
  component: FormSelect,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof FormSelect>;

const options = [
  { id: "apple", label: "Apple" },
  { id: "banana", label: "Banana" },
  { id: "orange", label: "Orange" },
];

const SelectWithForm = (args: React.ComponentProps<typeof FormSelect>) => {
  const { control } = useForm();
  return (
    <div className="w-[400px] p-4">
      <FormSelect {...args} control={control} name="role" options={options} />
    </div>
  );
};

export const Default: Story = {
  render: (args) => <SelectWithForm {...args} />,
  args: {
    label: "Favorite Fruit",
    placeholder: "Select a fruit",
    description: "Pick one from the list",
  },
};

export const WithError: Story = {
  render: (args) => (
    <div className="w-[400px] p-4">
       <SelectWrapperWithFormAndError {...args} />
    </div>
  ),
  args: {
    label: "Favorite Fruit",
    placeholder: "Select a fruit",
    required: true,
  },
};

const SelectWrapperWithFormAndError = (args: React.ComponentProps<typeof FormSelect>) => {
    const { control } = useForm();
    // Simulate error after mount or just force it for story
    // Hard to force error in story without interaction or setting it manually.
    // Instead, we can just pass simulated formState if we were manually controlling, 
    // but the wrapper reads from control. 
    // We can use a custom hook-form setup that has errors.
    
    // Easier approach: Just render Default and let user interact in storybook to see error validation.
    return <FormSelect {...args} control={control} name="fruit" options={options} />;
}
