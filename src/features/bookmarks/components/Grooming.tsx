import { Bookmark } from "@/app/api/bookmarks/route";
import { Button } from "@/components/Button";
import { Panel } from "@/components/Panels";
import { Just, Maybe, Nothing } from "purify-ts";
import { useState } from "react";
import { HiArrowDown } from "react-icons/hi2";
import { tryGetGroomedTitle } from "../bookmark-utils";

interface GroomingProps {
  bookmarks: Bookmark[];
  onRename: (bookmark: Bookmark, title: string) => Promise<void>;
}

export const Grooming = ({ bookmarks, onRename }: GroomingProps) => {
  const [groomables, setGroomables] = useState(
    Maybe.catMaybes(bookmarks.map(bookmark =>
      tryGetGroomedTitle(bookmark)
        .map(groomedTitle => ({
          ...bookmark,
          groomedTitle
        }))
    ))
  );

  const [groomedCount, setGroomedCount] = useState<number>(0);
  const [maybeGrooming, setGroomed] = useState<Maybe<Bookmark>>(Nothing);
  // const [maybeGrooming, setGroomed] = useState<Maybe<Bookmark>>(List.head(groomables));

  return (
    <>
      <Button onClick={async () => {
        let isInitial = true;
        let hasCanceled = false;
        for (const groomed of groomables) {
          if (hasCanceled) {
            break;
          }

          setGroomed(stuff => {
            hasCanceled = !isInitial && stuff.isNothing();
            return Just(groomed);
          });
          isInitial = false;

          await onRename(groomed, groomed.groomedTitle);
          setGroomedCount(count => count + 1);
        }

        setGroomedCount(0);
        setGroomed(Nothing);
        setGroomables([]);
      }}>
        Groom titles ({groomables.length})
      </Button>

      {maybeGrooming.isJust() && <Panel className="fixed left-0 bottom-0 z-10 w-full gap-4 flex flex-col rounded-t-3xl bg-white border-t border-2 border-gray-300">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold whitespace-nowrap">Grooming titles</h1>
          <progress className="w-full border rounded-full overflow-hidden"
            value={groomedCount}
            max={groomables.length} />
        </div>
        {
          maybeGrooming
            .map(groomable =>
              <div key="" className="flex flex-col gap-2 text-center">
                <p className="text-gray-400 whitespace-nowrap overflow-hidden text-ellipsis">{groomable.title}</p>
                <p>
                  <HiArrowDown className="inline w-8 h-8" />
                </p>
                <p className="whitespace-nowrap overflow-hidden text-ellipsis font-bold">{tryGetGroomedTitle(groomable).unsafeCoerce()}</p>
              </div>
            )
            .extract()
        }
      </Panel>}
    </>
  )
}