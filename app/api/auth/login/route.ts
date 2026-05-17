import { NextResponse } from "next/server"
import { authenticateUser, writeLog } from "@/lib/server/db"

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string; password?: string }
  if (!body.email?.trim() || !body.password?.trim()) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 })
  }

  const user = await authenticateUser({ email: body.email, password: body.password })
  if (!user) {
    await writeLog({ email: body.email.toLowerCase(), action: "auth.login.failed" })
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 })
  }

  await writeLog({ userId: user.id, email: user.email, action: "auth.login.success" })
  return NextResponse.json({ user })
}
