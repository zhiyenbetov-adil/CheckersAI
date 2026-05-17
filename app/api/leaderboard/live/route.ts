import { NextResponse } from "next/server"
import { getRecentLogs, listUsers } from "@/lib/server/db"

function asNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

export async function GET() {
  const users = await listUsers(5000)
  const logs = await getRecentLogs(5000)
  const gameLogs = logs.filter((l) => l.action === "game.finished")

  const rows = users.map((u) => {
    const userGames = gameLogs.filter((g) => g.userId === u.id || g.email === u.email)
    const ratingDelta = userGames.reduce((acc, g) => acc + asNumber(g.details?.ratingDelta, 0), 0)
    const elo = 800 + ratingDelta
    const wins = userGames.filter((g) => g.details?.winner === "light").length
    const losses = userGames.filter((g) => g.details?.winner === "dark").length
    const draws = userGames.filter((g) => g.details?.winner === "draw").length
    const totalGames = userGames.length
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      elo,
      totalGames,
      wins,
      losses,
      draws,
      winRate: totalGames > 0 ? (wins / totalGames) * 100 : 0,
      trend: ratingDelta,
    }
  })

  const ranked = rows
    .sort((a, b) => b.elo - a.elo || b.totalGames - a.totalGames)
    .map((r, idx) => ({
      ...r,
      rank: idx + 1,
    }))

  return NextResponse.json({ leaderboard: ranked.slice(0, 100) })
}

