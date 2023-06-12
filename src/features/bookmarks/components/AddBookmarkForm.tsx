import { AddBookmarkRequest } from "@/app/api/bookmarks/route";
import { InputText } from "@/components/InputText";

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
    <input type="submit" hidden />
  </form>
)