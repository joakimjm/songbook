import { getBookmarks, saveAllBookmarks } from "@/features/bookmarks/bookmark-persistence";
import { NextResponse } from "next/server";
import { Bookmark } from "../route";

export interface TagRequest {
  bookmarkIds: number[];
  tag: string;
}

const tag = ({ bookmarkIds, tag }: TagRequest, bookmarks: Bookmark[]) =>
  bookmarks.map(x =>
    bookmarkIds.includes(x.id)
      ? { ...x, tags: (x.tags && !x.tags.includes(tag)) ? x.tags.concat(tag) : [tag] }
      : x
  )

export interface UntagRequest {
  bookmarkIds: number[];
  untag: string;
}
const untag = ({ bookmarkIds, untag }: UntagRequest, bookmarks: Bookmark[]) =>
  bookmarks.map(x =>
    bookmarkIds.includes(x.id)
      ? { ...x, tags: x.tags?.filter(t => t !== untag) }
      : x
  );

const isTagRequest = (value: unknown): value is TagRequest =>
  typeof value === "object" && value !== null && "tag" in value && "bookmarkIds" in value;

export const POST = async (req: Request) => {
  const request = await req.json() as TagRequest | UntagRequest;

  const bookmarks = await getBookmarks();
  const final = isTagRequest(request)
    ? tag(request, bookmarks)
    : untag(request, bookmarks);

  await saveAllBookmarks(final);
  return NextResponse.json(final);
}
