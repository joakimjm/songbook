import { writeFile } from "fs/promises";
import { NextResponse } from "next/server";

import { getBookmarksForRemoval, tryGetBookmarkById, tryParseId } from "@/features/bookmarks/utils";
import path from "path";
import { getBookmarks } from "../route";

export const DELETE = async (_: Request, { params: { id }, }: { params: { id: string }; }) => {
  const initialBookmarks = await getBookmarks();
  const bookmarksForRemoval = tryParseId(id)
    .map(id => getBookmarksForRemoval(initialBookmarks, id))
    .filter(x => x.removed.length > 0);

  if (bookmarksForRemoval.isJust()) {
    const { final } = bookmarksForRemoval.unsafeCoerce();
    await writeFile(path.join(process.cwd(), "public/bookmarks.json"), JSON.stringify(final));
  }

  return new NextResponse(null, { status: 204 });
}

export const GET = async (_: Request, { params: { id }, }: { params: { id: string }; }) => {
  const maybeId = tryParseId(id);

  if (maybeId.isNothing()) {
    return new NextResponse("The requested id is invalid.", { status: 400 });
  }

  const maybeResult = maybeId.chain(tryGetBookmarkById(await getBookmarks()));
  if (maybeResult.isNothing()) {
    return new NextResponse("The requested book mark does not exist.", { status: 404 });
  }

  return NextResponse.json(maybeResult.unsafeCoerce());
}
