import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { commentSchema } from "@/lib/validation"
import { NextResponse } from "next/server"

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const items = await prisma.comment.findMany({
    where: { clipId: params.id },
    orderBy: { createdAt: "desc" },
    include: { user: { select: { id: true, handle: true, image: true, name: true } } }
  })
  return NextResponse.json(items)
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user) return new NextResponse("unauthorized", { status: 401 })
  const parsed = commentSchema.safeParse(await req.json())
  if (!parsed.success) return new NextResponse("invalid", { status: 400 })
  const c = await prisma.comment.create({
    data: { body: parsed.data.body, userId: session.user.id, clipId: params.id }
  })
  return NextResponse.json(c)
}
