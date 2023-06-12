import type { AddBookmarkRequest, Bookmark } from "@/app/api/bookmarks/route";
import { TagRequest, UntagRequest } from "@/app/api/bookmarks/tag/route";
import classNames from "classnames";
import { NonEmptyList } from "purify-ts";
import { useMemo, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { HiMinus, HiOutlineTrash, HiPlus } from "react-icons/hi2";
import { Button } from "../../../components/Button";
import { InputCheckbox } from "../../../components/InputCheckbox";
import { Panel } from "../../../components/Panels";
import { Tag } from "../../../components/Tag";
import { getBookmarksWithTags, getDuplicates, getUniqueTags } from "../bookmark-utils";
import { getBookmarksForRemoval, isFilterMatch } from "../utils";
import { AddBookmarkForm } from "./AddBookmarkForm";
import { BookmarkItem } from "./BookmarkItem";
import { Grooming } from "./Grooming";

export interface BookmarksProps {
  bookmarks: Bookmark[];
}

export const Bookmarks = ({ bookmarks: initialBookmarks }: BookmarksProps) => {
  const [bookmarks, setBookmarks] = useState(initialBookmarks);
  const [filterTextInput, setFilterText] = useState<string>("");
  const filterText = filterTextInput.trim().toLocaleLowerCase();
  const [selectedBookmarks, setSelected] = useState<Bookmark[]>([]);
  const [showGroomingTools, setShowGroomingTools] = useState<boolean>(false);
  const [showAddBookmarkForm, setShowAddBookmarkForm] = useState<boolean>(false);

  const onSelect = (bookmark: Bookmark): void =>
    setSelected(selection =>
      selection.some(x => x.id === bookmark.id)
        ? selection.filter(x => x.id !== bookmark.id)
        : selection.concat(bookmarks.filter(b => b.id === bookmark.id))
    )

  const onAddBookmark = async (data: AddBookmarkRequest) => {
    const response = await fetch(
      "/api/bookmarks",
      {
        method: "POST",
        body: JSON.stringify(data)
      }).then(r => r.json());

    setBookmarks(response);
  }
  const onRename = async (bookmark: Bookmark, title: string) => {
    const response = await fetch(bookmark.links.rename, {
      method: "PUT",
      body: JSON.stringify({ title })
    });

    if (response.ok) {
      setBookmarks(bookmarks => bookmarks.map(x => x.id === bookmark.id ? { ...x, title } : x));
    }
  }

  const onAddTag = async (tag: string) => {
    const request: TagRequest = { tag, bookmarkIds: selectedBookmarks.map(x => x.id) };
    const response = await fetch(
      "/api/bookmarks/tag",
      {
        method: "POST",
        body: JSON.stringify(request)
      }).then(r => r.json());

    setBookmarks(response);
  }

  const onRemoveTag = async (tag: string) => {
    const request: UntagRequest = { untag: tag, bookmarkIds: selectedBookmarks.map(x => x.id) };
    const response = await fetch(
      "/api/bookmarks/tag",
      {
        method: "POST",
        body: JSON.stringify(request)
      }).then(r => r.json());

    setBookmarks(response);
  }

  const onPromptForAddTag = async () => {
    const tag = prompt(`Enter tag to add to ${selectedBookmarks.length} bookmarks:`);
    if (!tag) {
      return;
    }

    onAddTag(tag);
  }

  useHotkeys("ctrl+f", (e) => {
    const input = document.querySelector("input[type=search]") as HTMLInputElement;
    input.focus();
    input.selectionStart = 0;
    input.selectionEnd = input.value.length;
  }, { enableOnFormTags: true })

  useHotkeys("ctrl+t", (e) => {
    onPromptForAddTag();
  }, { enableOnFormTags: true })

  useHotkeys("ctrl+a", (e) => {
    setSelected(filteredBookmarks);
  }, { enableOnFormTags: true })

  const usedTags = useMemo(() => getUniqueTags(bookmarks), [bookmarks]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const filteredBookmarks = bookmarks
    .filter(x =>
      filterText.startsWith("!")
        ? !isFilterMatch(filterText.substring(1), x)
        : isFilterMatch(filterText, x)
    )
    .filter(x => selectedTags.length === 0 || x.tags?.some(t => selectedTags.includes(t)));

  return (
    <div className="flex flex-col h-full">
      <header className="flex flex-col border-b shadow-md z-10">
        <div className="flex border-b">
          <div className="w-5/6">
            <input type="search" placeholder="Search"
              className={classNames("w-full text-center text-lg p-4", {
                "bg-blue-100": filterText.length > 0
              })}
              value={filterTextInput}
              onChange={e => {
                setFilterText(e.target.value);
                setSelected([]);
              }} />
          </div>
          <Panel className="border-l whitespace-nowrap">
            <InputCheckbox label="Grooming" checked={showGroomingTools} onChange={() => setShowGroomingTools(!showGroomingTools)} />
            <InputCheckbox label="Add bookmarks" checked={showAddBookmarkForm} onChange={() => setShowAddBookmarkForm(!showAddBookmarkForm)} />
          </Panel>
        </div>

        <Panel className="flex flex-col mb-2 gap-2">
          <div className="flex gap-1">
            <InputCheckbox label={selectedBookmarks.length > 0 ? "Deselect all" : `Select all (${filteredBookmarks.length})`}
              checked={selectedBookmarks.length > 0}
              onChange={() => selectedBookmarks.length > 0 ? setSelected([]) : setSelected(filteredBookmarks)} />

            <Button
              disabled={selectedBookmarks.length === 0}
              className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
              onClick={onPromptForAddTag}>
              <HiPlus className="inline -ml-0.5" /> Add tag
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
              <HiOutlineTrash className="inline -ml-0.5" /> Remove
            </Button>
          </div>
          <div className="flex flex-auto items-center gap-1 flex-wrap">
            {usedTags.map(x =>
              <Tag
                key={x}
                className={classNames("border", selectedTags.includes(x) ? "border-blue-500 bg-blue-200 text-blue-900" : "border-gray-300")}
                onClick={e => {
                  const clicked = e.target as HTMLElement;
                  if (clicked.closest("button")) {
                    return;
                  }

                  if (selectedTags.includes(x)) {
                    setSelectedTags(selectedTags.filter(t => t !== x))
                  } else {
                    setFilterText("");
                    setSelected([]);
                    setSelectedTags(selectedTags.concat(x))
                  }
                }}
              >
                {x}
                {selectedBookmarks.length > 0 && <button title="Tag selection" type="button"
                  className="ml-1 bg-blue-200 text-blue-700 rounded-full -mr-0.5"
                  onClick={() => onAddTag(x)}
                ><HiPlus /></button>}
                {selectedBookmarks.length > 0 && <button title="Untag selection" type="button"
                  className="ml-1 bg-red-200 text-red-700 rounded-full -mr-0.5"
                  onClick={() => onRemoveTag(x)}
                ><HiMinus /></button>}
              </Tag>
            )}
          </div>
        </Panel>
      </header>

      <main className="overflow-scroll">
        <ul className="divide-y">
          {filteredBookmarks
            .map(bookmark => ({
              bookmark,
              isSelected: selectedBookmarks.some(x => x.id === bookmark.id)
            }))
            .map(({ bookmark, isSelected }) =>
              <BookmarkItem
                key={bookmark.id}
                bookmark={bookmark}
                onSelect={onSelect}
                onRemove={async () => {
                  if (!confirm(`Are you sure you want to delete ${bookmark.title}?`)) {
                    return;
                  }

                  const result = await fetch(bookmark.links.self, { method: "DELETE" });
                  if (!result.ok) {
                    alert("Failed to delete bookmark");
                    return;
                  }

                  setBookmarks(bookmarks => bookmarks.filter(x => x.id !== bookmark.id));
                  setSelected(selected => selected.filter(x => x.id !== bookmark.id));
                }}
                onSelectTag={tag => setSelected(getBookmarksWithTags([tag], bookmarks))}
                onRename={(title) => onRename(bookmark, title)}
                isSelected={isSelected}
              />
            )}
        </ul>
      </main>

      {showGroomingTools &&
        (
          <aside>
            <Panel className="flex gap-4">
              <h1 className="font-bold">Grooming</h1>

              <Button onClick={() => {
                console.log("what the rfuck");

                return setSelected(getDuplicates(bookmarks));
              }}>
                Select duplicates ({getDuplicates(filteredBookmarks).length})
              </Button>

              <Grooming bookmarks={bookmarks} onRename={onRename} />
            </Panel>

          </aside>
        )
      }
      {showAddBookmarkForm && (
        <aside>
          <Panel>
            <AddBookmarkForm onSubmit={onAddBookmark} />
          </Panel>
        </aside>
      )}

    </div>
  )
}
