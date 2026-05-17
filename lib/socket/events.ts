// Socket event type definitions

// Event names for WebSocket communication
export const SOCKET_EVENTS = {
  // Room events
  ROOM_CREATE: "room:create",
  ROOM_JOIN: "room:join",
  ROOM_JOINED: "room:joined",
  ROOM_LEFT: "room:left",
  ROOM_ERROR: "room:error",
  
  // Game events  
  GAME_START: "game:start",
  GAME_SYNC: "game:sync",
  GAME_OVER: "game:over",
  
  // Move events
  MOVE_MAKE: "move:make",
  MOVE_MULTI_CAPTURE_STEP: "move:multiCaptureStep",
  MOVE_COMPLETE: "move:complete",
  
  // Player events
  PLAYER_DISCONNECT: "player:disconnect",
  PLAYER_RECONNECT: "player:reconnect",
  
  // Connection events
  CONNECTED: "connected",
  DISCONNECTED: "disconnected",
  ERROR: "error",
} as const

export type SocketEventName = typeof SOCKET_EVENTS[keyof typeof SOCKET_EVENTS]
