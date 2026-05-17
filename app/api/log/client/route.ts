import { NextResponse } from "next/server"
import { writeLog } from "@/lib/server/db"

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      userId?: string
      email?: string
      action?: string
      details?: Record<string, unknown>
    }
    if (!body.action) {
      return NextResponse.json({ error: "Action is required." }, { status: 400 })
    }
    await writeLog({
      userId: body.userId ?? null,
      email: body.email ?? null,
      action: body.action,
      details: body.details,
    })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Unable to store log." }, { status: 500 })
  }
}
