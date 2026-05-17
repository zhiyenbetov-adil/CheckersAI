import { NextResponse } from "next/server"
import { createUser, writeLog } from "@/lib/server/db"

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { name?: string; email?: string; password?: string }
    if (!body.name?.trim() || !body.email?.trim() || !body.password?.trim()) {
      return NextResponse.json({ error: "Name, email and password are required." }, { status: 400 })
    }
    if (body.password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 })
    }

    const user = await createUser({ name: body.name, email: body.email, password: body.password })
    await writeLog({ userId: user.id, email: user.email, action: "auth.signup", details: { source: "web" } })
    return NextResponse.json({ user })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Signup failed."
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
