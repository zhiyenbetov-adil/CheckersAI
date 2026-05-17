import { NextResponse } from "next/server"
import { getRecentLogs } from "@/lib/server/db"

export async function GET() {
  const logs = await getRecentLogs(200)
  return NextResponse.json({ logs })
}
