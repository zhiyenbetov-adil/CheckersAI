import { NextResponse } from "next/server"
import { getRecentLogs, getUserByEmail, getUserById } from "@/lib/server/db"

type GameResult = "win" | "loss" | "draw"

function asNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function resultFromWinner(winner: unknown): GameResult {
  if (winner === "light") return "win"
  if (winner === "dark") return "loss"
  return "draw"
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")?.trim()
  const email = searchParams.get("email")?.trim().toLowerCase()

  if (!userId && !email) {
    return NextResponse.json({ error: "userId or email is required" }, { status: 400 })
  }

  const user = userId ? await getUserById(userId) : await getUserByEmail(email || "")
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const logs = await getRecentLogs(2000)
  const gameLogs = logs.filter(
    (l) => l.action === "game.finished" && (l.userId === user.id || l.email === user.email)
  )

  const history = gameLogs
    .slice()
    .sort((a, b) => b.timestamp - a.timestamp)
    .map((l) => {
      const details = l.details || {}
      const ratingDelta = asNumber(details.ratingDelta, 0)
      const winner = details.winner
      const moveCount = asNumber(details.moveCount, 0)
      return {
        id: String(l.id),
        result: resultFromWinner(winner),
        ratingDelta,
        moveCount,
        opponent: String(details.opponent ?? "AI"),
        timestamp: l.timestamp,
      }
    })

  const totalGames = history.length
  const wins = history.filter((g) => g.result === "win").length
  const losses = history.filter((g) => g.result === "loss").length
  const draws = history.filter((g) => g.result === "draw").length
  const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0

  const baseElo = 800
  const elo = history.reduce((acc, g) => acc + g.ratingDelta, baseElo)

  const currentStreak = (() => {
    let streak = 0
    for (const g of history) {
      if (g.result === "win") streak += 1
      else break
    }
    return streak
  })()

  const premiumActive = Boolean(user.premiumUntil && user.premiumUntil > Date.now())

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      joinedAt: user.createdAt,
      subscriptionTier: user.subscriptionTier,
      premiumActive,
      elo,
    },
    stats: {
      totalGames,
      wins,
      losses,
      draws,
      winRate,
      currentStreak,
    },
    games: history.slice(0, 50),
  })
}
