import { prisma } from "@/lib/prisma"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function Profile({ params }: { params: { handle: string } }) {
  const user = await prisma.user.findUnique({
    where: { handle: params.handle },
    include: {
      clips: { orderBy: { createdAt: "desc" } },
      followers: true,
      following: true
    }
  })
  if (!user) return notFound()
  return (
    <div className="grid">
      <div className="card" style={{ padding: 12 }}>
        <div className="row">
          {user.image ? <Image alt="" src={user.image} width={64} height={64} style={{ borderRadius: 999 }} /> : <div style={{ width: 64, height: 64, borderRadius: 999, background: "#223" }} />}
          <div>
            <div style={{ fontWeight: 700 }}>{user.name || user.handle}</div>
            <div className="muted">@{user.handle}</div>
            <div className="chips">
              <span className="chip">{user.clips.length} clips</span>
              <span className="chip">{user.followers.length} abonnés</span>
              <span className="chip">{user.following.length} abonnements</span>
            </div>
          </div>
        </div>
      </div>
      <div className="grid">
        {user.clips.map(c => (
          <div key={c.id} className="card">
            {c.poster ? <Image alt="" src={c.poster} width={960} height={540} /> : <video muted playsInline preload="metadata" src={c.url} />}
            <div className="meta">
              <div>{c.title}</div>
              <Link className="chip" href={`/clip/${c.id}`}>Ouvrir</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

