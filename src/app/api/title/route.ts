import { tryGetGroomedTitle } from "@/features/bookmarks/bookmark-utils";
import { NextRequest, NextResponse, } from "next/server";
import { List, Maybe } from "purify-ts";

export const GET = async (request: NextRequest) => {

  const maybeUrl = Maybe.fromNullable(new URL(request.url).searchParams.get("url") as string)
    .map(url => decodeURIComponent(url as string))

  if (maybeUrl.isNothing()) {
    return new NextResponse("No url provided", { status: 400 });
  }

  const url = maybeUrl.unsafeCoerce();
  console.log(decodeURIComponent(url));

  const response = await fetch(decodeURIComponent(url));
  console.log(response.status);
  console.log(response.statusText);

  if (!response.ok) {
    return;
  }

  const title = Maybe.fromNullable(await response.text())
    .chainNullable(content => content.match(/<title>(.*?)<\/title>/))
    .chain(matches => List.head(matches))
    .map(tag => tag.replace(/<title>(.*?)<\/title>/, "$1"))
    .map(title => tryGetGroomedTitle(title).orDefault(title));

  return NextResponse.json({
    title: title.orDefault(""),
  });
}
