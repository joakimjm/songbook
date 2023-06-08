import classNames from "classnames"
import { ComponentProps } from "react"

export const Panel = (props: ComponentProps<"div">) =>
  <div {...props} className={classNames("px-5 py-2", props.className)} />