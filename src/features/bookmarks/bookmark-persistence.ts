import { Bookmark, BookmarkLinks } from "@/app/api/bookmarks/route";
import { readFile, writeFile } from "fs/promises";
import path from "path";

export const getLinks = (id: number): BookmarkLinks => ({
  self: `/api/bookmarks/${id}`,
  rename: `/api/bookmarks/${id}/rename`,
});

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

export const saveAllBookmarks = async (bookmarks: Bookmark[]) => {
  const data = bookmarks
    .map(({ links, ...x }): Omit<Bookmark, "links"> => ({
      id: x.id,
      dateAddedUTC: x.dateAddedUTC,
      parentId: x.parentId,
      title: x.title,
      url: x.url,
      tags: x.tags,
    }))
    .sort((a, b) => a.title.localeCompare(b.title));

  return await writeFile(path.join(process.cwd(), "public/bookmarks.json"), JSON.stringify(data));
};