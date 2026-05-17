import { NextResponse } from "next/server"
import { activatePremium, writeLog } from "@/lib/server/db"

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; months?: number; plan?: "premium" | "pro" }
    if (!body.email?.trim()) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 })
    }
    const premium = await activatePremium({ email: body.email, months: body.months ?? 1, plan: body.plan ?? "premium" })
    await writeLog({
      userId: premium.id,
      email: body.email.toLowerCase(),
      action: "subscription.activated",
      details: { months: body.months ?? 1, plan: body.plan ?? "premium" },
    })
    return NextResponse.json({ premium })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to activate subscription."
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
