import { writeFile } from "fs/promises";
import { NextResponse } from "next/server";

import { getBookmarksForRemoval } from "@/features/bookmarks/utils";
import path from "path";
import { Maybe } from "purify-ts";
import { getBookmarks } from "../route";

export const DELETE = async (_: Request, { params: { id }, }: { params: { id: string }; }) => {
  const bookmarksForRemoval = Maybe.fromNullable(id)
    .map(x => parseInt(x, 10))
    .filter(x => Number.isInteger(x))
    .map(id => getBookmarksForRemoval(getBookmarks(), id))
    .filter(x => x.removed.length > 0);

  if (bookmarksForRemoval.isJust()) {
    const { final } = bookmarksForRemoval.unsafeCoerce();
    await writeFile(path.join(process.cwd(), "public/bookmarks.json"), JSON.stringify(final));
  }

  return new NextResponse(null, { status: 204 });
}
