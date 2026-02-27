import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(_: Request, { params }: { params: { handle: string } }) {
  const session = await auth()
  if (!session?.user) return new NextResponse("unauthorized", { status: 401 })
  const target = await prisma.user.findUnique({ where: { handle: params.handle } })
  if (!target || target.id === session.user.id) return new NextResponse("invalid", { status: 400 })
  const existing = await prisma.follow.findUnique({ where: { followerId_followingId: { followerId: session.user.id, followingId: target.id } } })
  if (existing) {
    await prisma.follow.delete({ where: { id: existing.id } })
    return NextResponse.json({ following: false })
  }
  await prisma.follow.create({ data: { followerId: session.user.id, followingId: target.id } })
  return NextResponse.json({ following: true })
}
