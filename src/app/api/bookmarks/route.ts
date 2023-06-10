import { readFile } from "fs/promises";
import { NextResponse } from "next/server";
import path from "path";

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

export const getBookmarks = async (): Promise<Bookmark[]> =>
  (JSON.parse(await readFile(path.join(process.cwd(), "public/bookmarks.json"), "utf-8")) as Bookmark[])
    .map(x => ({
      ...x,
      links: {
        self: `/api/bookmarks/${x.id}`,
        rename: `/api/bookmarks/${x.id}/rename`,
      }
    }));

export const GET = async (_: Request) =>
  NextResponse.json(await getBookmarks());
