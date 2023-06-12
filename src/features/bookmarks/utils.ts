import { Bookmark } from "@/app/api/bookmarks/route";
import { List, Maybe, curry } from "purify-ts";

export const tryParseId = (id: string) =>
  Maybe.fromNullable(id)
    .map(x => parseInt(x, 10))
    .filter(x => Number.isInteger(x));

export const tryGetBookmarkById = curry(
  (bookmarks: Bookmark[], id: number) =>
    List.find(x => x.id === id, bookmarks)
)

export const isFilterMatch = (filterText: string, bookmark: Bookmark) =>
  bookmark.tags?.some(x => x.toLocaleLowerCase().includes(filterText)) || bookmark.title.toLocaleLowerCase().includes(filterText)

interface RemoveResult {
  final: Bookmark[];
  removed: Bookmark[];
}

export const getBookmarksForRemoval = (bookmarks: Bookmark[], removeId: number): RemoveResult =>
  bookmarks.reduce((acc, bookmark) => bookmark.id === removeId
    ? ({
      ...acc,
      removed: acc.removed.concat(bookmark),
    })
    : ({
      ...acc,
      final: acc.final.concat(bookmark),
    }),
    {
      final: [],
      removed: [],
    } as RemoveResult
  )