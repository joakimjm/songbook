import { Bookmark } from "@/app/api/bookmarks/route";
import { Just, Maybe } from "purify-ts";

export const getDuplicates = (bookmarks: Bookmark[]): Bookmark[] => {
  const allUrls = bookmarks.filter(x => x.url).map(x => x.url);
  const duplicateUrls = Array.from(new Set(allUrls.filter((x, i) => allUrls.indexOf(x) !== i)));
  return duplicateUrls.map(url => bookmarks.findLast(x => x.url === url)!);
}

export const getBookmarksWithTags = (tags: string[], bookmarks: Bookmark[]) =>
  bookmarks.filter(x => x.tags && x.tags.some(t => tags.includes(t)));

export const getUniqueTags = (bookmarks: Bookmark[]): string[] =>
  Array.from(new Set(
    bookmarks
      .filter(x => Array.isArray(x.tags))
      .flatMap(x => x.tags as string[])
  ));

const tryCleanUltimateGuitar = (title: string): string => {
  if (!title.toLocaleLowerCase().includes("ultimate-guitar.com")) {
    return title;
  }

  const [songRaw, artist] = title.split(/ by | @/);
  const song = songRaw.replace(/\(ver \d+\)/is, "").replace(`${artist} -`, "");
  return `${artist?.trim() ?? "[ARTIST NOT PARSED]"} - ${song.trim()}`;
}

const tryCleanOtherShittyBookmarkManager = (title: string): string => {
  if (!title.toLocaleLowerCase().includes("#repertoire")) {
    return title;
  }
  return title.split("#")[0].trim()
}

const toTitleCase = (value: string) =>
  value.replace(
    /\w\S*/g,
    (txt) =>
      txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
  )

const removeChords = (value: string) =>
  value.replace(/chords/is, "").trim()

const removeParentesizedNumbers = (value: string) =>
  value.replace(/\(\d+\)/is, "").trim();

const stages = [
  tryCleanUltimateGuitar,
  tryCleanOtherShittyBookmarkManager,
  removeParentesizedNumbers,
  toTitleCase,
  removeChords,
]

export const tryGetGroomedTitle = (bookmark: Bookmark): Maybe<string> => {
  return Just(
    stages.reduce(
      (acc, step) => step(acc),
      bookmark.title
    )
  )
    .filter(x => x !== bookmark.title)
}