import { Bookmark } from "@/app/api/bookmarks/route";
import { readFile, writeFile } from "fs/promises";
import path from "path";

export const getBookmarks = async (): Promise<Bookmark[]> =>
  (JSON.parse(await readFile(path.join(process.cwd(), "public/bookmarks.json"), "utf-8")) as Bookmark[])
    .sort((a, b) => a.title.localeCompare(b.title))
    .map(x => ({
      ...x,
      links: {
        self: `/api/bookmarks/${x.id}`,
        rename: `/api/bookmarks/${x.id}/rename`,
      }
    }));

export const saveAllBookmarks = async (bookmarks: Bookmark[]) =>
  await writeFile(path.join(process.cwd(), "public/bookmarks.json"), JSON.stringify(bookmarks));