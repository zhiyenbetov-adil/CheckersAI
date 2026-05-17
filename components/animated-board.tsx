"use client"

import { useEffect, useState, useCallback } from "react"
import { motion } from "framer-motion"

interface Piece {
  id: string
  row: number
  col: number
  isKing: boolean
  color: "light" | "dark"
}

interface AnimatedBoardProps {
  size?: number
  theme?: "classic" | "modern" | "orange" | "tournament"
}

const themes = {
  classic: {
    light: "bg-amber-100",
    dark: "bg-amber-800",
    lightPiece: "bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200",
    darkPiece: "bg-gradient-to-br from-stone-800 to-stone-900 border-stone-700",
  },
  modern: {
    light: "bg-slate-100",
    dark: "bg-slate-700",
    lightPiece: "bg-gradient-to-br from-white to-slate-100 border-slate-200",
    darkPiece: "bg-gradient-to-br from-slate-800 to-slate-900 border-slate-600",
  },
  orange: {
    light: "bg-orange-50",
    dark: "bg-orange-600",
    lightPiece: "bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200",
    darkPiece: "bg-gradient-to-br from-stone-800 to-stone-900 border-stone-700",
  },
  tournament: {
    light: "bg-emerald-50",
    dark: "bg-emerald-700",
    lightPiece: "bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200",
    darkPiece: "bg-gradient-to-br from-red-900 to-red-950 border-red-800",
  },
}

export function AnimatedBoard({ size = 8, theme = "orange" }: AnimatedBoardProps) {
  const [pieces, setPieces] = useState<Piece[]>([])
  const [highlightedSquare, setHighlightedSquare] = useState<{ row: number; col: number } | null>(null)
  const [moveTrail, setMoveTrail] = useState<{ row: number; col: number }[]>([])
  const currentTheme = themes[theme]

  // Initialize pieces
  useEffect(() => {
    const initialPieces: Piece[] = []
    
    // Dark pieces (top)
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < size; col++) {
        if ((row + col) % 2 === 1) {
          initialPieces.push({
            id: `dark-${row}-${col}`,
            row,
            col,
            isKing: false,
            color: "dark",
          })
        }
      }
    }
    
    // Light pieces (bottom)
    for (let row = size - 3; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if ((row + col) % 2 === 1) {
          initialPieces.push({
            id: `light-${row}-${col}`,
            row,
            col,
            isKing: false,
            color: "light",
          })
        }
      }
    }
    
    setPieces(initialPieces)
  }, [size])

  // Animate pieces
  const animateMove = useCallback(() => {
    setPieces((currentPieces) => {
      if (currentPieces.length === 0) return currentPieces

      const movablePieces = currentPieces.filter((p) => {
        const possibleMoves = [
          { row: p.row + (p.color === "dark" ? 1 : -1), col: p.col - 1 },
          { row: p.row + (p.color === "dark" ? 1 : -1), col: p.col + 1 },
        ]
        return possibleMoves.some(
          (m) =>
            m.row >= 0 &&
            m.row < size &&
            m.col >= 0 &&
            m.col < size &&
            (m.row + m.col) % 2 === 1 &&
            !currentPieces.some((op) => op.row === m.row && op.col === m.col)
        )
      })

      if (movablePieces.length === 0) return currentPieces

      const pieceToMove = movablePieces[Math.floor(Math.random() * movablePieces.length)]
      const direction = pieceToMove.color === "dark" ? 1 : -1
      const possibleCols = [pieceToMove.col - 1, pieceToMove.col + 1].filter(
        (c) =>
          c >= 0 &&
          c < size &&
          !currentPieces.some(
            (op) => op.row === pieceToMove.row + direction && op.col === c
          )
      )

      if (possibleCols.length === 0) return currentPieces

      const newCol = possibleCols[Math.floor(Math.random() * possibleCols.length)]
      const newRow = pieceToMove.row + direction

      setHighlightedSquare({ row: newRow, col: newCol })
      setMoveTrail([{ row: pieceToMove.row, col: pieceToMove.col }])

      setTimeout(() => {
        setHighlightedSquare(null)
        setMoveTrail([])
      }, 800)

      return currentPieces.map((p) =>
        p.id === pieceToMove.id
          ? {
              ...p,
              row: newRow,
              col: newCol,
              isKing: p.isKing || newRow === 0 || newRow === size - 1,
            }
          : p
      )
    })
  }, [size])

  useEffect(() => {
    const interval = setInterval(animateMove, 2000)
    return () => clearInterval(interval)
  }, [animateMove])

  return (
    <div className="relative">
      {/* Glow effect */}
      <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-full" />
      
      {/* Board container */}
      <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border/50">
        <div 
          className="grid"
          style={{ 
            gridTemplateColumns: `repeat(${size}, 1fr)`,
            aspectRatio: "1/1",
            width: "100%",
            maxWidth: "400px",
          }}
        >
          {Array.from({ length: size * size }).map((_, index) => {
            const row = Math.floor(index / size)
            const col = index % size
            const isDark = (row + col) % 2 === 1
            const isHighlighted = highlightedSquare?.row === row && highlightedSquare?.col === col
            const isTrail = moveTrail.some((t) => t.row === row && t.col === col)
            const piece = pieces.find((p) => p.row === row && p.col === col)

            return (
              <div
                key={index}
                className={`
                  relative aspect-square
                  ${isDark ? currentTheme.dark : currentTheme.light}
                  ${isHighlighted ? "ring-2 ring-primary ring-inset" : ""}
                  ${isTrail ? "ring-2 ring-primary/50 ring-inset" : ""}
                `}
              >
                {/* Highlight glow */}
                {isHighlighted && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-1 bg-primary/30 rounded-full blur-sm"
                  />
                )}

                {/* Piece */}
                {piece && (
                  <motion.div
                    layoutId={piece.id}
                    initial={false}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                    }}
                    className="absolute inset-1.5 sm:inset-2"
                  >
                    <div
                      className={`
                        w-full h-full rounded-full border-2 shadow-lg
                        ${piece.color === "light" ? currentTheme.lightPiece : currentTheme.darkPiece}
                        ${piece.isKing ? "ring-2 ring-yellow-400 ring-offset-1" : ""}
                      `}
                    >
                      {/* Inner highlight */}
                      <div className="absolute top-1 left-1 w-1/3 h-1/3 bg-white/30 rounded-full blur-sm" />
                      
                      {/* King indicator */}
                      {piece.isKing && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-yellow-400 text-xs sm:text-sm font-bold">♔</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
