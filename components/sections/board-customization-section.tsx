"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { 
  Paintbrush, 
  Palette,
  Volume2,
  VolumeX,
  Gauge,
  Check
} from "lucide-react"
import { cn } from "@/lib/utils"

const boardThemes = [
  { 
    id: "classic", 
    name: "Classic",
    light: "bg-amber-100", 
    dark: "bg-amber-800",
    preview: "from-amber-100 to-amber-800"
  },
  { 
    id: "modern", 
    name: "Modern",
    light: "bg-slate-100", 
    dark: "bg-slate-700",
    preview: "from-slate-100 to-slate-700"
  },
  { 
    id: "orange", 
    name: "Premium",
    light: "bg-orange-50", 
    dark: "bg-orange-600",
    preview: "from-orange-50 to-orange-600",
    isPremium: true
  },
  { 
    id: "tournament", 
    name: "Tournament",
    light: "bg-emerald-50", 
    dark: "bg-emerald-700",
    preview: "from-emerald-50 to-emerald-700"
  },
]

const pieceStyles = [
  { id: "standard", name: "Standard", shape: "rounded-full" },
  { id: "flat", name: "Flat", shape: "rounded-lg" },
  { id: "classic", name: "Classic", shape: "rounded-full ring-2 ring-offset-2" },
]

export function BoardCustomizationSection() {
  const [selectedTheme, setSelectedTheme] = useState("orange")
  const [selectedPieceStyle, setSelectedPieceStyle] = useState("standard")
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [animationSpeed, setAnimationSpeed] = useState([50])

  const currentTheme = boardThemes.find(t => t.id === selectedTheme) || boardThemes[2]

  return (
    <section className="py-24 lg:py-32 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Paintbrush className="w-4 h-4" />
            Personalize Your Game
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-balance">
            Customize Your Board
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Make the game truly yours with custom themes, piece styles, and animations.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Preview Board */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative order-2 lg:order-1"
          >
            <div className="relative max-w-md mx-auto">
              {/* Glow */}
              <div className="absolute -inset-4 bg-primary/10 blur-3xl rounded-full" />
              
              {/* Mini board preview */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border/50">
                <div className="grid grid-cols-8 aspect-square">
                  {Array.from({ length: 64 }).map((_, i) => {
                    const row = Math.floor(i / 8)
                    const col = i % 8
                    const isDark = (row + col) % 2 === 1
                    const hasPiece = isDark && (row < 3 || row > 4)
                    const isLightPiece = row > 4
                    const pieceStyle = pieceStyles.find(p => p.id === selectedPieceStyle)

                    return (
                      <div
                        key={i}
                        className={cn(
                          "aspect-square relative transition-colors duration-300",
                          isDark ? currentTheme.dark : currentTheme.light
                        )}
                      >
                        {hasPiece && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ 
                              delay: i * 0.01,
                              type: "spring",
                              stiffness: 300
                            }}
                            className="absolute inset-1.5 sm:inset-2"
                          >
                            <div
                              className={cn(
                                "w-full h-full border-2 shadow-md transition-all duration-300",
                                pieceStyle?.shape,
                                isLightPiece 
                                  ? "bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200"
                                  : "bg-gradient-to-br from-stone-800 to-stone-900 border-stone-700"
                              )}
                            >
                              <div className="absolute top-0.5 left-0.5 w-1/3 h-1/3 bg-white/30 rounded-full blur-sm" />
                            </div>
                          </motion.div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Customization Controls */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-8 order-1 lg:order-2"
          >
            {/* Board Theme */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Board Theme</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {boardThemes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedTheme(theme.id)}
                    className={cn(
                      "relative p-1 rounded-xl transition-all",
                      selectedTheme === theme.id 
                        ? "ring-2 ring-primary ring-offset-2 ring-offset-background" 
                        : "ring-1 ring-border hover:ring-primary/50"
                    )}
                  >
                    <div className={cn(
                      "aspect-square rounded-lg bg-gradient-to-br",
                      theme.preview
                    )} />
                    <div className="mt-2 text-xs font-medium flex items-center justify-center gap-1">
                      {theme.name}
                      {theme.isPremium && (
                        <span className="text-primary text-[10px]">★</span>
                      )}
                    </div>
                    {selectedTheme === theme.id && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Piece Style */}
            <div className="space-y-4">
              <h3 className="font-semibold">Piece Style</h3>
              <div className="flex gap-3">
                {pieceStyles.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedPieceStyle(style.id)}
                    className={cn(
                      "flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all",
                      selectedPieceStyle === style.id 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted hover:bg-muted/80"
                    )}
                  >
                    {style.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Animation Speed */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gauge className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Animation Speed</h3>
                </div>
                <span className="text-sm text-muted-foreground">{animationSpeed[0]}%</span>
              </div>
              <Slider
                value={animationSpeed}
                onValueChange={setAnimationSpeed}
                max={100}
                step={10}
                className="w-full"
              />
            </div>

            {/* Sound Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
              <div className="flex items-center gap-3">
                {soundEnabled ? (
                  <Volume2 className="w-5 h-5 text-primary" />
                ) : (
                  <VolumeX className="w-5 h-5 text-muted-foreground" />
                )}
                <div>
                  <h3 className="font-semibold">Game Sounds</h3>
                  <p className="text-sm text-muted-foreground">Piece movement & captures</p>
                </div>
              </div>
              <Switch
                checked={soundEnabled}
                onCheckedChange={setSoundEnabled}
              />
            </div>

            {/* Save Button */}
            <Button className="w-full rounded-xl h-12 bg-primary hover:bg-primary/90 text-primary-foreground">
              Save Preferences
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
