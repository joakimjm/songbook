"use client";

import type { Bookmark } from "@/app/api/bookmarks/route";
import { TagRequest } from "@/app/api/bookmarks/tag/route";
import classNames from "classnames";
import { DateTime } from "luxon";
import { NonEmptyList } from "purify-ts";
import { useMemo, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { HiFolder, HiOutlineTrash, HiPlus } from "react-icons/hi2";
import { getBookmarksWithTags, getDuplicates, getUniqueTags } from "../bookmark-utils";
import { getBookmarksForRemoval, isFilterMatch, isSelfOrParent } from "../utils";
import { Button } from "./Button";
import { Checkbox } from "./Checkbox";
import { Panel } from "./Panels";
import { Tag } from "./Tag";

export interface BookmarksProps {
  bookmarks: Bookmark[];
}
export const Bookmarks = ({ bookmarks: initialBookmarks }: BookmarksProps) => {
  const [bookmarks, setBookmarks] = useState(initialBookmarks);
  const [filterTextInput, setFilterText] = useState<string>("");
  const filterText = filterTextInput.trim().toLocaleLowerCase();
  const [selectedBookmarks, setSelected] = useState<Bookmark[]>([]);
  const [showFolders, setShowFolders] = useState<boolean>(false);
  const [showGroomingTools, setShowGroomingTools] = useState<boolean>(true);

  const select = (bookmark: Bookmark): void =>
    setSelected(selection =>
      selection.includes(bookmark)
        ? selection.filter(x => x !== bookmark)
        : selection.concat(bookmarks.filter(b => isSelfOrParent(bookmark.id, b)))
    )

  useHotkeys("alt+f", (e) => {
    e.preventDefault();
    const input = document.querySelector("input[type=search]") as HTMLInputElement;
    input.focus();
  })

  const usedTags = useMemo(() => getUniqueTags(bookmarks), [bookmarks]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const filteredBookmarks = bookmarks
    .filter(x =>
      filterText.startsWith("!")
        ? !isFilterMatch(filterText.substring(1), x)
        : isFilterMatch(filterText, x)
    )
    .filter(x => selectedTags.length === 0 || x.tags?.some(t => selectedTags.includes(t)))
    .filter(x => showFolders || x.url);

  return (
    <div className="flex flex-col h-full">
      <header className="flex flex-col border-b shadow-md z-10">
        <div className="flex border-b">
          <div className="w-5/6">
            <input type="search" placeholder="Search" className="w-full text-center text-lg p-4" value={filterTextInput}
              onChange={e => {
                setFilterText(e.target.value);
                setSelected([]);
              }} />
          </div>
          <Panel className="border-l">
            <Checkbox label="Folders" checked={showFolders} onChange={() => setShowFolders(!showFolders)} />
            <Checkbox label="Grooming" checked={showGroomingTools} onChange={() => setShowGroomingTools(!showGroomingTools)} />
          </Panel>
        </div>

        <div className="flex">
          <Panel className="flex gap-4">
            <Checkbox label={selectedBookmarks.length > 0 ? "Deselect all" : `Select all (${filteredBookmarks.length})`}
              checked={selectedBookmarks.length > 0}
              onChange={() => selectedBookmarks.length > 0 ? setSelected([]) : setSelected(filteredBookmarks)} />

            <Button
              disabled={selectedBookmarks.length === 0}
              className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
              onClick={async () => {
                const tag = prompt(`Enter tag to add to ${selectedBookmarks.length} bookmarks:`);
                if (!tag) {
                  return;
                }

                const request: TagRequest = { tag, bookmarkIds: selectedBookmarks.map(x => x.id) };
                const response = await fetch(
                  "/api/bookmarks/tag",
                  {
                    method: "POST",
                    body: JSON.stringify(request)
                  }).then(r => r.json());

                setBookmarks(response);
              }}>
              <HiPlus className="inline -ml-1.5 -mt-0.5" /> Add tag
            </Button>

            <Button
              disabled={selectedBookmarks.length === 0}
              className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
              onClick={async () => {
                if (!confirm(`Are you sure you want to delete ${selectedBookmarks.length} bookmarks?`)) {
                  return;
                }

                const final = NonEmptyList.fromArray(selectedBookmarks)
                  .map(toRemove =>
                    toRemove.reduce((acc, cur) =>
                      getBookmarksForRemoval(acc.final, cur.id),
                      getBookmarksForRemoval(bookmarks, toRemove[0].id)
                    )
                  )
                  .map(x => x.final)
                  .orDefault(bookmarks);

                if (final.length === bookmarks.length) {
                  return;
                }

                const result = await fetch("/api/bookmarks/remove", { method: "POST", body: JSON.stringify(selectedBookmarks.map(x => x.id)) })
                  .then(x => x.json());

                setBookmarks(result);
                setSelected([]);
              }}>
              <HiOutlineTrash className="inline -ml-1.5 -mt-0.5" /> Remove
            </Button>

          </Panel>
          <div className="flex flex-auto items-center">
            {usedTags.map(x =>
              <Tag
                key={x}
                className={classNames("border", selectedTags.includes(x) ? "border-blue-500 bg-blue-200 text-blue-900" : "")}
                onClick={() => setSelectedTags(tags => tags.includes(x) ? tags.filter(t => t !== x) : tags.concat(x))}
              >{x}</Tag>
            )}
          </div>
        </div>
      </header>

      <main className="overflow-scroll">
        <ul className="divide-y">
          {filteredBookmarks
            .map(bookmark => ({
              ...bookmark,
              isSelected: selectedBookmarks.includes(bookmark)
            }))
            .map((bookmark) =>
              <li
                key={bookmark.id}
                className={classNames(
                  "flex",
                  bookmark.isSelected ?
                    "bg-blue-100 hover:bg-blue-200"
                    : "bg-white hover:bg-gray-50"
                )}
              >
                <Panel>
                  {bookmark.url
                    ? (
                      <div className="flex gap-4">
                        <input type="checkbox" onChange={() => select(bookmark)} checked={bookmark.isSelected} />

                        {
                          /*
                        bookmark.parentId && bookmark.parentId !== "1" && <div onClick={() =>
                          List.find(x => String(x.id) === bookmark.parentId, bookmarks)
                            .ifJust(select)
                        }>
                          Select parent
                        </div>
                        */
                        }
                        <div className="flex flex-col">

                          <h2 className="flex flex-auto font-bold" onClick={() => select(bookmark)}>{bookmark.title}</h2>

                          <div className="flex gap-4">
                            <p className="opacity-50 text-xs">Added {DateTime.fromISO(bookmark.dateAddedUTC).toFormat("LLL dd, yyyy 'at' HH:mm")}</p>
                            {
                              bookmark.tags &&
                              <div className="flex items-center gap-1">
                                {bookmark.tags.map((tag, i) =>
                                  <>
                                    {i !== 0 && <svg viewBox="0 0 2 2" className="h-0.5 w-0.5 fill-current">
                                      <circle cx="1" cy="1" r="1"></circle>
                                    </svg>}
                                    <button onClick={() => setSelected(getBookmarksWithTags([tag], bookmarks))} className="text-xs" key={tag}>{tag}</button>
                                  </>
                                )
                                }
                              </div>
                            }
                          </div>
                        </div>
                      </div>
                    )
                    : (
                      <div className="flex items-center gap-2 uppercase text-gray-400">
                        <input type="checkbox" onChange={() => select(bookmark)} checked={selectedBookmarks.includes(bookmark)} />
                        <HiFolder />
                        <p onClick={() => select(bookmark)}>{bookmark.title}</p>
                      </div>
                    )
                  }
                </Panel>
              </li>
            )}
        </ul>
      </main>
      {showGroomingTools &&
        (
          <aside>
            <Panel>
              <h1>Grooming</h1>

              <Button onClick={() => setSelected(getDuplicates(bookmarks))}>
                Select duplicates ({getDuplicates(filteredBookmarks).length})
              </Button>
            </Panel>
          </aside>
        )
      }
    </div>
  )
}
