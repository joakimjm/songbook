import { AddBookmarkRequest } from "@/app/api/bookmarks/route";
import { Button } from "@/components/Button";
import { InputText } from "@/components/InputText";
import { Just, Nothing } from "purify-ts";
import { useState } from "react";
import { HiPlus } from "react-icons/hi2";

interface AddBookmarkFormProps {
  onSubmit: (request: AddBookmarkRequest) => void;
}

const tryGetUrl = (text: string) => {
  try {
    return Just(new URL(text));
  } catch {
    return Nothing;
  }
}

export const AddBookmarkForm = ({ onSubmit }: AddBookmarkFormProps) => {
  const [title, setTitle] = useState<string>("");
  const [url, setUrl] = useState<string>("");

  return (
    <form className="flex flex-col gap-2 bg-gray-100 p-4 rounded-lg" onSubmit={e => {
      e.preventDefault();
      if (!url || !title) {
        return;
      }
      onSubmit({ url, title });
      (e.target as HTMLFormElement).reset();
    }}>
      <h1 className="font-bold">Add bookmarks</h1>
      <div className="flex gap-4">
        <InputText
          placeholder="URL"
          value={url}
          onChange={e => setUrl(e.target.value)}

          onBlur={async e => {
            const requestUrl = tryGetUrl(e.target.value)
              .map(url => encodeURIComponent(url.toString()))
              .map(encoded => `/api/title?url=${encoded}`)

            if (requestUrl.isNothing()) {
              return;
            }

            const response = await fetch(requestUrl.unsafeCoerce());
            if (!response.ok) {
              return;
            }

            const result = await response.json();
            if (!title) {
              setTitle(result.title);
            }
          }} />
        <InputText
          placeholder="Title"
          onChange={e => setTitle(e.target.value)}
          value={title}
        />
      </div>
      <Button className="self-end border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white" type="submit"><HiPlus className="inline -ml-0.5" /> Add bookmark</Button>
    </form>
  );
}