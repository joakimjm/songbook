import { Bookmark } from "@/app/api/bookmarks/route";
import classNames from "classnames";
import { DateTime } from "luxon";
import { Fragment } from "react";
import { HiFolder, HiOutlineArrowTopRightOnSquare, HiOutlinePencilSquare, HiOutlineTrash, HiSparkles } from "react-icons/hi2";
import { Panel } from "../../../components/Panels";
import { tryGetGroomedTitle } from "../bookmark-utils";

interface BookmarkItemProps {
  bookmark: Bookmark;
  isSelected: boolean;
  onSelect: (bookmark: Bookmark) => void;
  onSelectTag: (tag: string) => void;
  onRename: (newName: string) => void;
  onRemove: () => void;
}
export const BookmarkItem = ({ bookmark, isSelected, onSelect, onSelectTag, onRename, onRemove }: BookmarkItemProps) =>
(
  <li
    className={classNames(
      "flex",
      isSelected
        ? "bg-blue-100 hover:bg-blue-200"
        : "bg-white hover:bg-gray-50"
    )}
  >
    <Panel className="flex flex-auto" onClick={e => {
      const clicked = e.target as HTMLElement
      if (e.isDefaultPrevented() || clicked.closest("button") || clicked.closest("a")) {
        return;
      }

      onSelect(bookmark);
    }}>
      {bookmark.url
        ? (
          <div className="flex flex-auto gap-4">
            <div className="flex"><input type="checkbox" onChange={() => onSelect(bookmark)} checked={isSelected} /></div>
            <div className="flex flex-col">
              <h2 className="flex flex-auto font-bold">
                {bookmark.title}
              </h2>
              {
                tryGetGroomedTitle(bookmark)
                  .map(groomedTitle => <p key="">{groomedTitle}</p>)
                  .extract()
              }
              <div className="flex gap-4">
                <p className="opacity-50 text-xs">Added {DateTime.fromISO(bookmark.dateAddedUTC).toFormat("LLL dd, yyyy 'at' HH:mm")}</p>
                {
                  bookmark.tags &&
                  <div className="flex items-center gap-1">
                    {bookmark.tags.map((tag, i) =>
                      <Fragment key={tag}>
                        {i !== 0 && <svg viewBox="0 0 2 2" className="h-0.5 w-0.5 fill-current">
                          <circle cx="1" cy="1" r="1"></circle>
                        </svg>}
                        <button type="button" onClick={() => onSelectTag(tag)} className="text-xs">{tag}</button>
                      </Fragment>
                    )
                    }
                  </div>
                }
              </div>
            </div>

            <div className="flex flex-auto justify-end items-center gap-2">
              {
                tryGetGroomedTitle(bookmark)
                  .map(groomedTitle =>
                    <button
                      type="button"
                      key={groomedTitle}
                      title={groomedTitle}
                      onClick={() => {
                        if (confirm(`Want to rename this bookmark to "${groomedTitle}"?`)) {
                          onRename(groomedTitle)
                        }
                      }}

                    ><HiSparkles className="text-yellow-500" /></button>
                  )
                  .extract()
              }
              <button type="button" title="Remove" className="p-2" onClick={onRemove}><HiOutlineTrash /></button>
              <button type="button" title="Rename" className="p-2" onClick={() => {
                const newName = prompt("Rename bookmark", bookmark.title);
                if (newName && bookmark.title !== newName) {
                  onRename(newName);
                }
              }}><HiOutlinePencilSquare /></button>
              <a title="Rename" className="p-2" href={bookmark.url} target="_blank"><HiOutlineArrowTopRightOnSquare /></a>
            </div>
          </div>
        )
        : (
          <div className="flex items-center gap-2 uppercase text-gray-400">
            <input type="checkbox" onChange={() => onSelect(bookmark)} checked={isSelected} />
            <HiFolder />
            <p onClick={() => onSelect(bookmark)}>{bookmark.title}</p>
          </div>
        )
      }
    </Panel>
  </li>
)