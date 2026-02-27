import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user) return new NextResponse("unauthorized", { status: 401 })
  const clipId = params.id
  const existing = await prisma.favorite.findUnique({ where: { userId_clipId: { userId: session.user.id, clipId } } })
  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } })
    return NextResponse.json({ favorited: false })
  }
  await prisma.favorite.create({ data: { userId: session.user.id, clipId } })
  return NextResponse.json({ favorited: true })
}
