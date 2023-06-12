import { ComponentProps } from "react";

export const InputText = ({ label, ...props }: ComponentProps<"input"> & { label?: string }) =>
  <label className="flex flex-col text-sm w-full">
    {label && <span className="text-xs">{label}</span>}
    <input className="border-b px-2 py-1 rounded-md" type="text" {...props} />
  </label>