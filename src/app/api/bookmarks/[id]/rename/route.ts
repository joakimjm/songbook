import { getBookmarks, saveAllBookmarks } from "@/features/bookmarks/bookmark-persistence";
import { tryParseId } from "@/features/bookmarks/utils";
import { NextResponse } from "next/server";

export const PUT = async (req: Request, { params: { id: requestedId }, }: { params: { id: string }; }) => {
  const { title }: { title: string; } = await req.json();
  const maybeResult = tryParseId(requestedId);

  if (maybeResult.isNothing()) {
    return new NextResponse("The requested bookmark doesn't exist.", { status: 404 });
  }

  const initialBookmarks = await getBookmarks();
  const { final } = maybeResult.map(id => ({
    id,
    final: initialBookmarks.map(x => x.id === id ? ({
      ...x,
      title,
    }) : x)
  }))
    .unsafeCoerce();
  await saveAllBookmarks(final);
  return new NextResponse(null, { status: 200 });
}
