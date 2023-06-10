import { getBookmarks, saveAllBookmarks } from "@/features/bookmarks/bookmark-persistence";
import { NextResponse } from "next/server";

export interface TagRequest {
  bookmarkIds: number[];
  tag: string;
}

export const POST = async (req: Request) => {
  const { bookmarkIds, tag } = (await req.json()) as TagRequest;
  const final = (await getBookmarks())
    .map(x =>
      bookmarkIds.includes(x.id)
        ? { ...x, tags: (x.tags && !x.tags.includes(tag)) ? x.tags.concat(tag) : [tag] }
        : x
    );

  await saveAllBookmarks(final);
  return NextResponse.json(final);
}
