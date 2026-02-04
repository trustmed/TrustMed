import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React from "react";
import { useForm } from "react-hook-form";
import { FormSwitch } from "../../components/core/form-switch";

const meta: Meta<typeof FormSwitch> = {
  title: "Form/FormSwitch",
  component: FormSwitch,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof FormSwitch>;

const SwitchWithForm = (args: React.ComponentProps<typeof FormSwitch>) => {
  const { control } = useForm({
    defaultValues: {
      notifications: false,
    }
  });
  return (
    <div className="w-[400px] p-4">
      <FormSwitch {...args} control={control} name="notifications" />
    </div>
  );
};

export const Default: Story = {
  render: (args) => <SwitchWithForm {...args} />,
  args: {
    label: "Enable Notifications",
    description: "Receive updates via email",
  },
};

export const Disabled: Story = {
  render: (args) => <SwitchWithForm {...args} />,
  args: {
    label: "Enable Notifications",
    disabled: true,
  },
};
