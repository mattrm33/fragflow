import { prisma } from "@/lib/prisma"
import Image from "next/image"
import { notFound } from "next/navigation"

export default async function ClipPage({ params }: { params: { id: string } }) {
  const clip = await prisma.clip.findUnique({
    where: { id: params.id },
    include: { author: { select: { handle: true, image: true, name: true } }, likes: true, favorites: true }
  })
  if (!clip) return notFound()
  return (
    <div className="grid">
      <div className="card">
        {clip.poster ? <Image alt="" src={clip.poster} width={960} height={540} /> : <video controls playsInline src={clip.url} />}
        <div className="meta">
          <div className="row">
            {clip.author.image ? <Image alt="" src={clip.author.image} width={28} height={28} style={{ borderRadius: 999 }} /> : <div style={{ width: 28, height: 28, borderRadius: 999, background: "#223" }} />}
            <div>{clip.title}</div>
          </div>
          <div className="actions">
            <form action={`/api/clips/${clip.id}/like`} method="post"><button className="btn">{clip.likes.length} ❤️</button></form>
            <form action={`/api/clips/${clip.id}/favorite`} method="post"><button className="btn">{clip.favorites.length} ⭐</button></form>
            <a className="btn" href={clip.url} download>⬇️</a>
          </div>
        </div>
      </div>
      <Comments id={clip.id} />
    </div>
  )
}

async function getComments(id: string) {
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/clips/${id}/comments`, { cache: "no-store" })
  if (!res.ok) return []
  return res.json()
}

async function Comments({ id }: { id: string }) {
  const comments = await getComments(id)
  return (
    <div className="card" style={{ padding: 12 }}>
      <form action={`/api/clips/${id}/comments`} method="post" style={{ display: "flex", gap: 8 }}>
        <input name="body" className="input" placeholder="Ajouter un commentaire…" />
        <button className="btn">Envoyer</button>
      </form>
      <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
        {comments.map((c: any) => (
          <div key={c.id} className="row">
            {c.user.image ? <Image alt="" src={c.user.image} width={24} height={24} style={{ borderRadius: 999 }} /> : <div style={{ width: 24, height: 24, borderRadius: 999, background: "#223" }} />}
            <div>{c.body}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

