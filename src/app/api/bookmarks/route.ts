import { getBookmarks } from "@/features/bookmarks/bookmark-persistence";
import { NextResponse } from "next/server";

interface BookmarkLinks {
  self: string;
  rename: string;
}
export type Bookmark = {
  index: number;
  title: string;
  url?: string;
  id: number;
  parentId: string;
  dateAddedLocal: string;
  dateAddedUTC: string;
  tags?: string[],
  links: BookmarkLinks
};

export const GET = async (_: Request) =>
  NextResponse.json(await getBookmarks());
