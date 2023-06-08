import { Bookmark } from "@/app/api/bookmarks/route";

export const getDuplicates = (bookmarks: Bookmark[]): Bookmark[] => {
  const urls = bookmarks.filter(x => x.url).map(x => x.url);
  const duplicates = urls.filter((x, i) => urls.indexOf(x) !== i);
  return bookmarks.filter(x => duplicates.includes(x.url));
}

export const getBookmarksWithTags = (tags: string[], bookmarks: Bookmark[]) =>
  bookmarks.filter(x => x.tags && x.tags.some(t => tags.includes(t)));

export const getUniqueTags = (bookmarks: Bookmark[]): string[] =>
  Array.from(new Set(
    bookmarks
      .filter(x => Array.isArray(x.tags))
      .flatMap(x => x.tags as string[])
  ));
