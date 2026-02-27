import Link from "next/link"
import Image from "next/image"
import { prisma } from "@/lib/prisma"

async function getData(cursor?: string) {
  const items = await prisma.clip.findMany({
    take: 12,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    orderBy: { createdAt: "desc" },
    include: { author: { select: { handle: true, image: true, name: true } }, likes: true, favorites: true }
  })
  return items
}

export default async function Page() {
  const clips = await getData()
  return (
    <div className="grid">
      {clips.map(c => (
        <div key={c.id} className="card">
          {c.poster ? (
            <Image alt="" src={c.poster} width={960} height={540} />
          ) : (
            <video muted playsInline preload="metadata" src={c.url} />
          )}
          <div className="meta">
            <div className="row">
              {c.author.image ? <Image alt="" src={c.author.image} width={24} height={24} style={{ borderRadius: 999 }} /> : <div style={{ width: 24, height: 24, borderRadius: 999, background: "#223" }} />}
              <div>{c.title}</div>
            </div>
            <div className="row">
              <span className="chip">{c.likes.length} ❤️</span>
              <span className="chip">{c.favorites.length} ⭐</span>
              <Link className="chip" href={`/clip/${c.id}`}>Ouvrir</Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

