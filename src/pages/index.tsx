import { getBookmarks } from "@/features/bookmarks/bookmark-persistence";
import { Bookmarks } from "@/features/bookmarks/components/Bookmarks";
import { GetServerSideProps } from "next";
import { Bookmark } from "../app/api/bookmarks/route";

interface BookmarksPageProps {
  bookmarks: Bookmark[];
}

const BookmarksPage = ({ bookmarks }: BookmarksPageProps) =>
  <Bookmarks bookmarks={bookmarks} />

export default BookmarksPage;

export const getServerSideProps: GetServerSideProps<BookmarksPageProps> = async () =>
({
  props: {
    bookmarks: await getBookmarks()
  }
});
