import { AddBookmarkRequest } from "@/app/api/bookmarks/route";
import { Button } from "@/components/Button";
import { InputText } from "@/components/InputText";
import { HiPlus } from "react-icons/hi2";

interface AddBookmarkFormProps {
  onSubmit: (request: AddBookmarkRequest) => void;
}

export const AddBookmarkForm = ({ onSubmit }: AddBookmarkFormProps) => (
  <form className="flex flex-col gap-2 bg-gray-100 p-4 rounded-lg" onSubmit={e => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const title = form.bookmarkTitle.value;
    const url = form.bookmarkUrl.value;
    if (!url || !title) {
      return;
    }
    form.reset();
    onSubmit({ url, title });
  }}>
    <h1 className="font-bold">Add bookmarks</h1>
    <div className="flex gap-4">
      <InputText name="bookmarkUrl" placeholder="URL" />
      <InputText name="bookmarkTitle" placeholder="Title" />
    </div>
    <Button className="self-end border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white" type="submit"><HiPlus className="inline -ml-0.5" /> Add bookmark</Button>
  </form>
)