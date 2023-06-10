import { writeFile } from "fs/promises";
import { NextResponse } from "next/server";

import path from "path";
import { getBookmarks } from "../route";

export interface TagRequest {
  bookmarkIds: number[];
  tag: string;
}

export const POST = async (req: Request) => {
  const { bookmarkIds, tag } = (await req.json()) as TagRequest;
  const final = (await getBookmarks())
    .map(x =>
      bookmarkIds.includes(x.id)
        ? { ...x, tags: (x.tags && !x.tags.includes(tag)) ? x.tags.concat(tag) : [tag] }
        : x
    );

  await writeFile(path.join(process.cwd(), "public/bookmarks.json"), JSON.stringify(final));
  return NextResponse.json(final);
}
