import classNames from "classnames";
import { ComponentProps } from "react";

export const Tag = (props: ComponentProps<"span">) =>
  <span {...props} className={classNames("flex bg-gray-200 rounded-full cursor-pointer px-1.5 py-.5 text-xs items-center", props.className)} />