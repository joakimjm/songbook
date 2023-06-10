import classNames from "classnames"
import { AppProps } from "next/app"
import { Inter } from "next/font/google"
import "../styles/globals.css"

// If loading a variable font, you don't need to specify the font weight
const inter = Inter({ subsets: ["latin"] })

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={classNames(inter.className, "h-full")}>
      <Component {...pageProps} />
    </div>
  )
}