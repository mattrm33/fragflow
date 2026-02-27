"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

function detectTags(str: string, duration: number) {
  const s = str.toLowerCase()
  const t = new Set<string>()
  if (s.includes("ace")) t.add("Ace")
  if (s.includes("clutch") || s.includes("1v")) { t.add("Clutch"); t.add("1vX") }
  if (s.includes("hs") || s.includes("headshot")) t.add("Headshot")
  if (s.includes("flick")) t.add("Flick")
  if (s.includes("noscope") || s.includes("no-scope")) t.add("No‑scope")
  if (duration <= 8) t.add("Highlight")
  return Array.from(t)
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState("")
  const [duration, setDuration] = useState(0)
  const [poster, setPoster] = useState<string | null>(null)
  const [tags, setTags] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const router = useRouter()

  async function makePoster(f: File) {
    return new Promise<string>((resolve) => {
      const v = document.createElement("video")
      v.muted = true
      v.preload = "metadata"
      v.src = URL.createObjectURL(f)
      v.onloadedmetadata = () => {
        v.currentTime = Math.min(v.duration * 0.25, Math.max(0, v.duration - 0.1))
      }
      v.onseeked = () => {
        const c = document.createElement("canvas")
        const r = v.videoWidth / v.videoHeight || 16 / 9
        const w = 960, h = Math.round(w / r)
        c.width = w; c.height = h
        const ctx = c.getContext("2d")!
        ctx.drawImage(v, 0, 0, w, h)
        resolve(c.toDataURL("image/jpeg", 0.7))
      }
    })
  }

  function onPick(f: File) {
    if (!f || !f.type.startsWith("video/")) return
    setFile(f)
    const url = URL.createObjectURL(f)
    const v = document.getElementById("pv") as HTMLVideoElement
    v.src = url
    v.onloadedmetadata = async () => {
      const d = Math.round(v.duration || 0)
      setDuration(d)
      const base = f.name.replace(/\.[^/.]+$/, "").replace(/[_-]+/g, " ").trim()
      if (!title) setTitle(base)
      const p = await makePoster(f)
      setPoster(p)
      setTags(detectTags(base, d))
    }
  }

  async function onPublish() {
    if (!file) return
    setBusy(true)
    const res = await fetch("/api/upload", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ type: file.type, size: file.size }) })
    if (!res.ok) { setBusy(false); return }
    const { url, fileUrl } = await res.json()
    await fetch(url, { method: "PUT", headers: { "content-type": file.type }, body: file })
    const meta = await fetch("/api/clips", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title, duration, tags, url: fileUrl, poster })
    })
    if (!meta.ok) { setBusy(false); return }
    const clip = await meta.json()
    setBusy(false)
    router.push(`/clip/${clip.id}`)
  }

  return (
    <div className="grid">
      <div className="card" style={{ padding: 12 }}>
        <input type="file" accept="video/*" onChange={e => e.target.files && onPick(e.target.files[0])} />
        <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
          <video id="pv" controls playsInline />
          <input className="input" placeholder="Titre" value={title} onChange={e => setTitle(e.target.value)} />
          <div className="chips">
            {tags.map(t => <span key={t} className="chip">{t}</span>)}
          </div>
          <button disabled={!file || busy} onClick={onPublish} className="btn primary">{busy ? "Publication…" : "Publier"}</button>
        </div>
      </div>
    </div>
  )
}

