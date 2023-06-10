import { ComponentProps } from "react";

interface ModalProps extends ComponentProps<"div"> {
  isVisible: boolean;
  onClose: () => void;
}

export const Modal = ({ isVisible, onClose, ...props }: ModalProps) =>
(
  isVisible
    ? (
      <>
        <div className="fixed inset-0 px-20 py-40 z-10 flex justify-center items-center">
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-0 cursor-pointer" onClick={onClose}></div>
          <div {...props} className="z-10" />
        </div>
      </>
    )
    : <></>
)