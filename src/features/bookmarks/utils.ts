import { Bookmark } from "@/app/api/bookmarks/route";

export const isFilterMatch = (filterText: string, bookmark: Bookmark) =>
  bookmark.tags?.some(x => x.toLocaleLowerCase().includes(filterText)) || bookmark.title.toLocaleLowerCase().includes(filterText)

export const isSelfOrParent = (id: number, bookmark: Bookmark) =>
  bookmark.id === id || bookmark.parentId === String(id);

interface RemoveResult {
  final: Bookmark[];
  removed: Bookmark[];
}

export const getBookmarksForRemoval = (bookmarks: Bookmark[], removeId: number): RemoveResult =>
  bookmarks.reduce((acc, bookmark) => isSelfOrParent(removeId, bookmark)
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