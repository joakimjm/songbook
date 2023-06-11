import classNames from "classnames";
import { ComponentProps } from "react";

export const Button = (props: ComponentProps<"button">) =>
  <button
    type="button"
    {...props}
    className={classNames(
      "flex border rounded-lg px-1.5 whitespace-nowrap text-xs disabled:border-gray-300 disabled:text-gray-300 disabled:bg-white items-center",
      props.className
    )}
  />

export const ButtonLink = (props: ComponentProps<"a">) =>
  <a {...props}
    className={classNames(
      "flex border rounded-lg px-1.5 text-sm disabled:border-gray-300 disabled:text-gray-300 disabled:bg-white items-center",
      props.className
    )}
  />