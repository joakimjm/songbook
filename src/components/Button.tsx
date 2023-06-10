import classNames from "classnames";
import { ComponentProps } from "react";

export const Button = (props: ComponentProps<"button">) =>
  <button
    type="button"
    {...props}
    className={classNames(
      "flex border rounded-lg px-2 whitespace-nowrap text-sm disabled:border-gray-300 disabled:text-gray-300 disabled:bg-white items-center",
      props.className
    )}
  />

export const ButtonLink = (props: ComponentProps<"a">) =>
  <a {...props}
    className={classNames(
      "flex border rounded-lg px-2 text-sm disabled:border-gray-300 disabled:text-gray-300 disabled:bg-white items-center",
      props.className
    )}
  />