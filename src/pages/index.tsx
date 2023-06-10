import { Bookmarks } from "@/features/bookmarks/components/Bookmarks";
import { getBookmarks } from "../app/api/bookmarks/route";

export default function Home() {
  const bookmarks = getBookmarks();
  return <Bookmarks bookmarks={bookmarks} />;
}
