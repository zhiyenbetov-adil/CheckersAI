import { NextResponse } from "next/server"

const SYSTEM_PROMPT =
  "You are Checkers AI support assistant for Checkers AI website. If you introduce yourself, use exactly this phrasing in the user's language: 'I am your Checkers AI support' (or equivalent translation). Never call yourself CheckerC or CheckersC. Language rule: always answer in English by default. If and only if the user's message is in Russian, answer in Russian. Answer only about this site: login/signup, play with friend, rooms, learning lessons/progress, premium, legal pages, profile, and troubleshooting these features. If the user asks unrelated topics, politely refuse and say you only answer Checkers AI site questions. When listing capabilities or features, always format each line as: '· ' + feature name (middle dot U+00B7, then a space), for example: '· Login and Sign Up'. Do not use markdown bullets like '-' or '*'."

function normalizeSupportAnswer(input: string): string {
  return input
    .replace(/\*\*/g, "\n")
    .replace(/^\s*[-*]\s+/gm, "· ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

export async function POST(request: Request) {
  try {
    const { message } = (await request.json()) as { message?: string }
    if (!message?.trim()) {
      return NextResponse.json({ error: "Empty message" }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { answer: "AI support is not configured. Please set GEMINI_API_KEY on server." },
        { status: 200 }
      )
    }

    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite"
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

    const payload = {
      contents: [{ role: "user", parts: [{ text: message }] }],
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      generationConfig: { temperature: 0.3, maxOutputTokens: 300 },
    }

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const text = await response.text()
      return NextResponse.json({ answer: `Gemini request failed: ${text}` }, { status: 200 })
    }

    const data = await response.json()
    const answer =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I can only assist with Checkers AI website questions."

    return NextResponse.json({ answer: normalizeSupportAnswer(answer) })
  } catch {
    return NextResponse.json(
      { answer: "Support AI temporarily unavailable. Please try again." },
      { status: 200 }
    )
  }
}
