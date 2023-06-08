import classNames from "classnames"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Songboook",
  description: "The bookmark based songbook for bonfire musicians",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={classNames(inter.className, "h-full")}>{children}</body>
    </html>
  )
}
