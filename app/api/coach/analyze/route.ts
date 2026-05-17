import { NextResponse } from "next/server"

interface StoredGameSummary {
  id: string
  mode: "local" | "ai" | "online"
  winner: "light" | "dark" | "draw" | null
  finishedAt: number
  moveCount: number
  capturedPieces: { light: number; dark: number }
  moveHistory: Array<{
    notation: string
    move: { isCapture: boolean; captureSteps?: unknown[] }
  }>
}

function buildFallbackAnalysis(game: StoredGameSummary) {
  const captures = game.moveHistory.filter((m) => m.move.isCapture).length
  const captureRate = game.moveCount > 0 ? Math.round((captures / game.moveCount) * 100) : 0
  const recentMoves = game.moveHistory.slice(-5).map((m) => m.notation)

  return {
    strengths: [
      captureRate >= 35
        ? "You played actively and converted tactical opportunities with frequent captures."
        : "You kept the game stable and avoided unnecessary tactical risks.",
      "Your move sequence stayed consistent through the middle game.",
    ],
    improvements: [
      "Scan for double-jump threats before each non-capture move.",
      "In endgame, prioritize king activity and central control.",
    ],
    recommendation:
      "Train 10-15 minutes on endgame conversion puzzles. Focus on turning material advantage into forced wins.",
    highlights: recentMoves.length
      ? recentMoves.map((notation, idx) => `Move ${game.moveCount - recentMoves.length + idx + 1}: ${notation}`)
      : ["No moves recorded."],
    meta: {
      moveCount: game.moveCount,
      captures,
      captureRate,
      result: game.winner ?? "unfinished",
    },
  }
}

export async function POST(request: Request) {
  try {
    const { game } = (await request.json()) as { game?: StoredGameSummary }
    if (!game) {
      return NextResponse.json({ error: "Missing game data." }, { status: 400 })
    }

    const fallback = buildFallbackAnalysis(game)
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ analysis: fallback })
    }

    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash"
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
    const prompt = `
You are a checkers-only coach.
Analyze this finished game and respond as compact JSON with keys:
strengths (string[]), improvements (string[]), recommendation (string), highlights (string[]), meta (object).
Keep it practical and specific.
Game data:
${JSON.stringify(game)}
    `.trim()

    const geminiResponse = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 500, responseMimeType: "application/json" },
      }),
    })

    if (!geminiResponse.ok) {
      return NextResponse.json({ analysis: fallback })
    }

    const data = await geminiResponse.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) return NextResponse.json({ analysis: fallback })

    try {
      const parsed = JSON.parse(text)
      return NextResponse.json({ analysis: parsed })
    } catch {
      return NextResponse.json({ analysis: fallback })
    }
  } catch {
    return NextResponse.json({ error: "Unable to analyze game." }, { status: 500 })
  }
}
