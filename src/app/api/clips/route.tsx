import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createClipSchema } from "@/lib/validation"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const cursor = searchParams.get("cursor") ?? undefined
  const take = Math.min(Number(searchParams.get("take") || 12), 24)
  const items = await prisma.clip.findMany({
    take: take + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { id: true, handle: true, image: true, name: true } },
      likes: true,
      favorites: true
    }
  })
  let nextCursor: string | null = null
  if (items.length > take) {
    const next = items.pop()
    nextCursor = next?.id ?? null
  }
  return NextResponse.json({ items, nextCursor })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return new NextResponse("unauthorized", { status: 401 })
  const parsed = createClipSchema.safeParse(await req.json())
  if (!parsed.success) return new NextResponse("invalid", { status: 400 })
  const data = parsed.data
  const clip = await prisma.clip.create({
    data: {
      title: data.title,
      duration: data.duration,
      url: data.url,
      poster: data.poster,
      tags: data.tags,
      authorId: session.user.id
    }
  })
  return NextResponse.json(clip)
}
