import { Bookmark } from "@/app/api/bookmarks/route";
import { Just, Maybe } from "purify-ts";

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

export const tryCleanUltimateGuitar = (title: string): Maybe<string> =>
  Just(title)
    .filter(title => title.toLocaleLowerCase().includes("ultimate-guitar.com"))
    .map(title => {
      const [songRaw, artist] = title.split(/ by | @/);
      const song = songRaw.replace(/Chords \(ver \d+\)/is, "").replace(`${artist} -`, "").trim();
      return `${artist} - ${song}`;
    })

export const tryCleanOtherShittyBookmarkManager = (title: string): Maybe<string> =>
  Just(title)
    .filter(title => title.toLocaleLowerCase().includes("#repertoire"))
    .map(title => title.split("#")[0])

export const tryGetGroomedTitle = (bookmark: Bookmark): Maybe<string> => {
  const first =
    tryCleanUltimateGuitar(bookmark.title)
      .orDefault(bookmark.title);

  const second =
    tryCleanOtherShittyBookmarkManager(first)
      .orDefault(first);

  return Just(second)
    .filter(x => x !== bookmark.title)
}