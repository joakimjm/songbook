"use client";

import type { Bookmark } from "@/app/api/bookmarks/route";
import { TagRequest } from "@/app/api/bookmarks/tag/route";
import classNames from "classnames";
import { DateTime } from "luxon";
import { NonEmptyList } from "purify-ts";
import { ComponentProps, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { HiFolder, HiOutlineTrash, HiPlus } from "react-icons/hi2";
import { getBookmarksForRemoval, isFilterMatch, isSelfOrParent } from "../utils";

const Checkbox = ({ label, ...props }: ComponentProps<"input"> & { label?: string }) =>
  <label className="flex gap-4 text-sm items-center">
    <input type="checkbox" {...props} />
    {label && <span>{label}</span>}
  </label>

const Button = (props: ComponentProps<"button">) =>
  <button
    type="button"
    {...props}
    className={classNames(
      "border rounded-full px-3 text-sm disabled:border-gray-300 disabled:text-gray-300 disabled:bg-white items-center",
      props.className
    )}
  />

const Tag = (props: ComponentProps<"span">) =>
  <span {...props} className={classNames("block bg-gray-200 rounded-full px-2 py-1 text-xs items-center", props.className)} />

const getBookmarksWithTags = (tags: string[], bookmarks: Bookmark[]) =>
  bookmarks.filter(x => x.tags && x.tags.some(t => tags.includes(t)));

export interface BookmarksProps {
  bookmarks: Bookmark[];
}
export const Bookmarks = ({ bookmarks: initialBookmarks }: BookmarksProps) => {
  const [bookmarks, setBookmarks] = useState(initialBookmarks);
  const [filterTextInput, setFilterText] = useState<string>("");
  const filterText = filterTextInput.trim().toLocaleLowerCase();
  const [selectedBookmarks, setSelected] = useState<Bookmark[]>([]);
  const [showFolders, setShowFolders] = useState<boolean>(false);
  const [showGroom, setShowGroom] = useState<boolean>(true);

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

  const filteredBookmarks = bookmarks
    .filter(x =>
      filterText.startsWith("!")
        ? !isFilterMatch(filterText.substring(1), x)
        : isFilterMatch(filterText, x)
    )
    .filter(x => showFolders || x.url);

  const usedTags = Array.from(new Set(
    bookmarks
      .filter(x => x.tags)
      .flatMap(x => x.tags)
  ));

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
          <div className="border-l px-5 py-1">
            <Checkbox label="Folders" checked={showFolders} onChange={() => setShowFolders(!showFolders)} />
          </div>
        </div>

        <div className="flex">
          <div className="flex px-4 py-2 gap-4">
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

          </div>
          <div className="flex flex-auto items-center">
            {usedTags.map(x => <Tag key={x}>{x}</Tag>)}
          </div>
        </div>
      </header>

      <main className="overflow-scroll">
        <ul className="divide-y">
          {filteredBookmarks
            .map(x => ({
              ...x,
            }))
            .map((bookmark) =>
              <li
                key={bookmark.id}
                className="flex hover:bg-gray-50 px-4 py-2"
              >
                {bookmark.url
                  ? (
                    <div className="flex gap-4">
                      <input type="checkbox" onChange={() => select(bookmark)} checked={selectedBookmarks.includes(bookmark)} />

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
              </li>
            )}
        </ul>
      </main>
      {showGroom &&
        (
          <aside>
            <h1>Grooming</h1>

          </aside>
        )
      }
    </div>
  )
}