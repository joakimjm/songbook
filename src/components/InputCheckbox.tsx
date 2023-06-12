import { ComponentProps } from "react";

export const InputCheckbox = ({ label, ...props }: ComponentProps<"input"> & { label?: string }) =>
  <label className="flex gap-4 text-sm items-center">
    <input type="checkbox" {...props} />
    {label && <span>{label}</span>}
  </label>