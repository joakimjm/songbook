import { Bookmarks } from "@/features/bookmarks/components/Bookmarks";
import { getBookmarks } from "./api/bookmarks/route";

export default async function Home() {
  const bookmarks = getBookmarks();

  return <Bookmarks bookmarks={bookmarks} />;
}
