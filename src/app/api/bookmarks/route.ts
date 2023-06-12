import { getBookmarks, getLinks, saveAllBookmarks } from "@/features/bookmarks/bookmark-persistence";
import { NextResponse } from "next/server";

export interface BookmarkLinks {
  self: string;
  rename: string;
}
export type Bookmark = {
  title: string;
  url?: string;
  id: number;
  dateAddedUTC: string;
  tags?: string[],
  links: BookmarkLinks
};

export const GET = async (_: Request) =>
  NextResponse.json(await getBookmarks());

export type AddBookmarkRequest = Omit<Bookmark, "tags" | "links" | "id" | "dateAddedLocal" | "dateAddedUTC" | "parentId">;
export const POST = async (req: Request) => {
  const request = await req.json() as AddBookmarkRequest;
  const bookmarks = (await getBookmarks()).sort((a, b) => a.id - b.id);
  const id = bookmarks[bookmarks.length - 1].id + 1;
  const bookmark: Bookmark = {
    ...request,
    id,
    dateAddedUTC: new Date().toISOString(),
    links: getLinks(id)
  };

  await saveAllBookmarks(bookmarks.concat(bookmark));
  return NextResponse.json(await getBookmarks());
};
