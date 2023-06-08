import bookmarks from "@/../public/bookmarks.json";
import { NextResponse } from "next/server";

export type Bookmark = (typeof bookmarks)[0] & { tags?: string[] };
export const getBookmarks = (): Bookmark[] => bookmarks;
export const GET = (_: Request) =>
  NextResponse.json(getBookmarks());
