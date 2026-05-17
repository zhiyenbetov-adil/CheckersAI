import express from "express"
import cors from "cors"
import { createServer } from "node:http"
import { Server } from "socket.io"

const app = express()
app.use(cors({ origin: "*" }))
app.use(express.json())

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "checkers-ai-realtime" })
})

const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: { origin: "*" },
})

const rooms = new Map()
const playerRoomById = new Map()

const createRoomCode = () => Math.random().toString(36).slice(2, 8).toUpperCase()

const createRoomState = (roomCode, hostPlayerId, hostSocketId) => ({
  roomId: `room_${roomCode}`,
  roomCode,
  players: {
    light: { id: hostPlayerId, name: "Host", rating: 1385, isConnected: true },
    dark: null,
  },
  gameState: null,
  status: "waiting",
  createdAt: Date.now(),
  sockets: new Map([[hostPlayerId, hostSocketId]]),
})

const emitRoomSnapshot = (room, eventName = "room:joined") => {
  io.to(room.roomCode).emit(eventName, {
    roomId: room.roomId,
    roomCode: room.roomCode,
    players: room.players,
    gameState: room.gameState,
    status: room.status,
    createdAt: room.createdAt,
  })
}

io.on("connection", (socket) => {
  socket.on("room:create", ({ playerId }) => {
    const roomCode = createRoomCode()
    const room = createRoomState(roomCode, playerId, socket.id)
    rooms.set(roomCode, room)
    playerRoomById.set(playerId, roomCode)
    socket.join(roomCode)
    emitRoomSnapshot(room, "room:joined")
  })

  socket.on("room:join", ({ roomCode, playerId, playerName }) => {
    const normalized = String(roomCode || "").toUpperCase()
    const room = rooms.get(normalized)
    if (!room) {
      socket.emit("room:error", { message: "Room not found" })
      return
    }
    if (room.players.dark && room.players.dark.id !== playerId) {
      socket.emit("room:error", { message: "Room is full" })
      return
    }
    room.players.dark = {
      id: playerId,
      name: playerName || "Guest",
      rating: 1385,
      isConnected: true,
    }
    room.status = "ready"
    room.sockets.set(playerId, socket.id)
    playerRoomById.set(playerId, normalized)
    socket.join(normalized)
    emitRoomSnapshot(room, "room:joined")
    emitRoomSnapshot(room, "room:playerJoined")
    io.to(normalized).emit("game:start", { roomCode: normalized })
  })

  socket.on("player:reconnect", ({ roomCode, playerId, playerName }) => {
    const normalized = String(roomCode || "").toUpperCase()
    const room = rooms.get(normalized)
    if (!room) {
      socket.emit("room:error", { message: "Room not found" })
      return
    }
    if (room.players.light?.id === playerId) {
      room.players.light.isConnected = true
    } else if (room.players.dark?.id === playerId) {
      room.players.dark.isConnected = true
      if (playerName) room.players.dark.name = playerName
    } else if (!room.players.dark) {
      room.players.dark = { id: playerId, name: playerName || "Guest", rating: 1385, isConnected: true }
      room.status = "ready"
    } else {
      socket.emit("room:error", { message: "Player does not belong to this room" })
      return
    }
    room.sockets.set(playerId, socket.id)
    playerRoomById.set(playerId, normalized)
    socket.join(normalized)
    emitRoomSnapshot(room, "room:joined")
    io.to(normalized).emit("player:reconnect", { playerId })
    if (room.gameState) {
      socket.emit("game:state", { gameState: room.gameState })
    }
  })

  socket.on("game:sync", ({ roomCode, playerId, gameState }) => {
    const normalized = String(roomCode || "").toUpperCase()
    const room = rooms.get(normalized)
    if (!room) return
    const isLight = room.players.light?.id === playerId
    const isDark = room.players.dark?.id === playerId
    if (!isLight && !isDark) return

    // Enforce turn ownership on server too (prevents both devices from moving both sides)
    if (!room.gameState) {
      if (!isLight) return
    } else {
      const expectedColor = room.gameState.currentPlayer
      if ((expectedColor === "light" && !isLight) || (expectedColor === "dark" && !isDark)) {
        return
      }
    }

    room.gameState = gameState
    room.status = gameState?.gameStatus === "finished" ? "finished" : "playing"
    io.to(normalized).emit("game:state", { gameState: room.gameState })
    if (gameState?.gameStatus === "finished") {
      io.to(normalized).emit("game:over", { winner: gameState.winner ?? "draw" })
    }
  })

  socket.on("disconnect", () => {
    for (const [roomCode, room] of rooms.entries()) {
      const found = [...room.sockets.entries()].find(([, socketId]) => socketId === socket.id)
      if (!found) continue
      const [playerId] = found
      room.sockets.delete(playerId)
      if (room.players.light?.id === playerId) room.players.light.isConnected = false
      if (room.players.dark?.id === playerId) room.players.dark.isConnected = false
      io.to(roomCode).emit("player:disconnect", { playerId })
      break
    }
  })
})

const PORT = Number(process.env.PORT || 3001)
httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`Realtime server listening on ${PORT}`)
})
