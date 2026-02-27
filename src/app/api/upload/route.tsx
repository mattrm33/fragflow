import { auth } from "@/lib/auth"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { NextResponse } from "next/server"
import { rateLimit } from "@/lib/rateLimit"

const s3 = new S3Client({ region: process.env.AWS_S3_REGION })

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return new NextResponse("unauthorized", { status: 401 })
  const ip = (req.headers.get("x-forwarded-for") ?? "local").split(",")[0].trim()
  const rl = rateLimit(`upload:${ip}`, 5, 60_000)
  if (!rl.allowed) return new NextResponse("slow down", { status: 429 })
  const body = await req.json()
  const type: string = body?.type ?? ""
  const size: number = body?.size ?? 0
  if (!type.startsWith("video/")) return new NextResponse("invalid type", { status: 400 })
  if (size <= 0 || size > 200 * 1024 * 1024) return new NextResponse("invalid size", { status: 400 })
  const ext = type.split("/")[1] || "mp4"
  const key = `clips/${session.user.id}/${crypto.randomUUID()}.${ext}`
  const cmd = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: key,
    ContentType: type,
    ACL: "public-read"
  } as any)
  const url = await getSignedUrl(s3, cmd, { expiresIn: 60 })
  const publicBase = process.env.PUBLIC_CDN_BASE || `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_S3_REGION}.amazonaws.com`
  const fileUrl = `${publicBase}/${key}`
  return NextResponse.json({ url, key, fileUrl })
}
