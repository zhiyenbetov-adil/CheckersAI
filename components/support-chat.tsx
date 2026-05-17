"use client"

import { useState } from "react"
import { MessageCircle, Send, X } from "lucide-react"

type ChatMessage = { role: "assistant" | "user"; text: string }

function formatAssistantText(raw: string): string[] {
  return raw
    .replace(/\r/g, "")
    .split(/\*\*+/)
    .map((part) => part.replace(/\*/g, "").trim())
    .filter(Boolean)
}

export function SupportChat() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", text: "Hello, I am your Checkers AI support. I can help only with Checkers AI website features." },
  ])

  const handleSend = async () => {
    if (!input.trim()) return
    const text = input.trim()
    const next: ChatMessage[] = [...messages, { role: "user", text }]
    setMessages(next)
    setInput("")
    setLoading(true)

    try {
      const response = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      })
      const data = (await response.json()) as { answer?: string }
      const answer = data.answer || "Support AI temporarily unavailable. Please try again."
      setMessages((prev) => [...prev, { role: "assistant", text: answer }])
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", text: "Support AI temporarily unavailable. Please try again." }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-orange-500 text-white shadow-xl hover:bg-orange-600"
        aria-label="Support"
      >
        {open ? <X className="mx-auto h-6 w-6" /> : <MessageCircle className="mx-auto h-6 w-6" />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[340px] rounded-2xl border border-border bg-card shadow-2xl">
          <div className="border-b border-border px-4 py-3 text-sm font-semibold">Поддержка Checkers AI</div>
          <div className="h-72 space-y-3 overflow-y-auto p-4">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`rounded-xl px-3 py-2 text-sm ${m.role === "assistant" ? "bg-muted text-foreground" : "ml-8 bg-orange-500 text-white"}`}
              >
                {m.role === "assistant" ? (
                  <div className="space-y-2">
                    {formatAssistantText(m.text).map((line, lineIdx) => (
                      <p key={lineIdx} className="leading-relaxed">
                        {line}
                      </p>
                    ))}
                  </div>
                ) : (
                  m.text
                )}
              </div>
            ))}
            {loading && <div className="rounded-xl bg-muted px-3 py-2 text-sm">Checkers AI support is typing...</div>}
          </div>
          <div className="flex gap-2 border-t border-border p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask about the website..."
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
            <button onClick={handleSend} className="rounded-lg bg-orange-500 px-3 text-white hover:bg-orange-600">
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
