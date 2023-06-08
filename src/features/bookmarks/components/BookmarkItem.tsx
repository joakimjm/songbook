import { Bookmark } from "@/app/api/bookmarks/route";
import classNames from "classnames";
import { DateTime } from "luxon";
import { HiFolder } from "react-icons/hi2";
import { Panel } from "./Panels";

interface BookmarkItemProps {
  bookmark: Bookmark;
  isSelected: boolean;
  onSelect: (bookmark: Bookmark) => void;
  onSelectTag: (tag: string) => void;
}
export const BookmarkItem = ({ bookmark, isSelected, onSelect, onSelectTag }: BookmarkItemProps) =>
(
  <li
    key={bookmark.id}
    className={classNames(
      "flex",
      isSelected ?
        "bg-blue-100 hover:bg-blue-200"
        : "bg-white hover:bg-gray-50"
    )}
  >
    <Panel>
      {bookmark.url
        ? (
          <div className="flex gap-4">
            <input type="checkbox" onChange={() => onSelect(bookmark)} checked={isSelected} />
            <div className="flex flex-col">
              <h2 className="flex flex-auto font-bold" onClick={() => onSelect(bookmark)}>{bookmark.title}</h2>
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
                        <button onClick={() => onSelectTag(tag)} className="text-xs" key={tag}>{tag}</button>
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
            <input type="checkbox" onChange={() => onSelect(bookmark)} checked={isSelected} />
            <HiFolder />
            <p onClick={() => onSelect(bookmark)}>{bookmark.title}</p>
          </div>
        )
      }
    </Panel>
  </li>
)