import classNames from "classnames";
import { ComponentProps } from "react";

export const Tag = (props: ComponentProps<"span">) =>
  <span {...props} className={classNames("block bg-gray-200 rounded-full cursor-pointer px-2 py-1 text-xs items-center", props.className)} />