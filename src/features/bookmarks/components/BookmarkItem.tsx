import { Bookmark } from "@/app/api/bookmarks/route";
import classNames from "classnames";
import { DateTime } from "luxon";
import { Fragment } from "react";
import { GiBroom } from "react-icons/gi";
import { HiFolder } from "react-icons/hi2";
import { Panel } from "../../../components/Panels";
import { tryGetGroomedTitle } from "../bookmark-utils";

interface BookmarkItemProps {
  bookmark: Bookmark;
  isSelected: boolean;
  onSelect: (bookmark: Bookmark) => void;
  onSelectTag: (tag: string) => void;
  onRename: (newName: string) => void;
}
export const BookmarkItem = ({ bookmark, isSelected, onSelect, onSelectTag, onRename }: BookmarkItemProps) =>
(
  <li
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
              <h2 className="flex flex-auto font-bold" onClick={() => onSelect(bookmark)}>
                {
                  tryGetGroomedTitle(bookmark)
                    .map(groomedTitle =>
                      <button
                        type="button"
                        key={groomedTitle}
                        title={groomedTitle}
                        onClick={() => onRename(groomedTitle)}
                        className="inline text-yellow-700 mr-1"
                      ><GiBroom /></button>
                    )
                    .extract()
                }
                {bookmark.title}
              </h2>
              <p>{tryGetGroomedTitle(bookmark).extract()}</p>
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

            <div className="flex items-start">

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