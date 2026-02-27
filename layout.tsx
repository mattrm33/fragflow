import "./globals.css"
import { ReactNode } from "react"
import { headers } from "next/headers"
import Link from "next/link"
import { auth } from "@/lib/auth"

export const metadata = {
  title: "FragFlow",
  description: "Réseau social de clips e‑sport"
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const session = await auth()
  const hdrs = headers()
  const path = hdrs.get("x-pathname") ?? "/"
  return (
    <html lang="fr">
      <body>
        <header className="hdr">
          <div className="brand">
            <div className="mark" />
            <Link href="/">FragFlow</Link>
          </div>
          <nav className="nav">
            <Link className={path === "/" ? "active" : ""} href="/">Feed</Link>
            <Link className={path.startsWith("/upload") ? "active" : ""} href="/upload">Uploader</Link>
            {session?.user ? (
              <>
                <Link href={`/u/${session.user.handle}`}>Profil</Link>
                <form action="/api/auth/signout" method="post">
                  <button className="btn">Déconnexion</button>
                </form>
              </>
            ) : (
              <Link className="btn primary" href="/api/auth/signin">Se connecter</Link>
            )}
          </nav>
        </header>
        <main className="main">{children}</main>
        <footer className="ftr">
          <div className="brand small"><div className="mark" />FragFlow</div>
          <span className="muted">Clips e‑sport</span>
        </footer>
      </body>
    </html>
  )
}
