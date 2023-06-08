import { writeFile } from "fs/promises";
import { NextResponse } from "next/server";

import { getBookmarksForRemoval } from "@/features/bookmarks/utils";
import path from "path";
import { NonEmptyList } from "purify-ts";
import { getBookmarks } from "../route";

export const POST = async (req: Request) => {
  const ids = (await req.json()) as number[];
  const bookmarksForRemoval = NonEmptyList.fromArray(ids)
    .map(toRemove =>
      toRemove.reduce((acc, cur) =>
        getBookmarksForRemoval(acc.final, cur),
        getBookmarksForRemoval(getBookmarks(), toRemove[0])
      )
    )

  if (bookmarksForRemoval.isJust()) {
    const { final } = bookmarksForRemoval.unsafeCoerce();
    await writeFile(path.join(process.cwd(), "public/bookmarks.json"), JSON.stringify(final));
    return NextResponse.json(final);
  }

  return NextResponse.json("List for removal cannot be empty.", { status: 400 });
}
