// Authentication types
export interface LoginDto {
  email: string;
  password: string;
}

export interface SignupDto {
  email: string;
  name: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

// Room types
export interface CreateRoomDto {
  name: string;
  deckType?: string;
  settings?: Record<string, any>;
}

export interface JoinRoomDto {
  code: string;
}

export interface Room {
  _id?: string;
  id: string;
  code: string;
  name: string;
  hostUserId: string;
  deckType: string;
  createdAt: string;
  participants: Participant[];
  gameState: "LOBBY" | "VOTING" | "REVEALED";
  stories: Story[];
  currentStoryId?: string;
  settings?: {
    autoReveal: boolean;
    allowSpectators: boolean;
    timerDuration: number;
  };
  timer?: {
    startTime?: string | Date; // Date string or Date object
    duration: number;
    status: "running" | "paused" | "stopped";
  };
}

export interface Story {
  id: string;
  title: string;
  description?: string;
  estimate?: string;
  status: "pending" | "active" | "completed";
  votes?: { userId: string; vote: string }[];
}

export interface Participant {
  userId: string;
  name: string;
  avatar?: string;
  role: "host" | "player" | "observer" | "spectator";
  vote?: string | null;
}

// WebSocket types
export interface RoomParticipant {
  userId: string;
  name: string;
  avatar?: string;
  role: "host" | "player" | "observer" | "spectator";
  vote?: string | null;
}

export interface JoinRoomPayload {
  roomId: string;
  userId: string;
  name: string;
}

export interface RoomJoinedPayload {
  roomId: string;
  participants: RoomParticipant[];
}

export interface UserJoinedPayload {
  userId: string;
  name: string;
}

export interface UserLeftPayload {
  userId: string;
  name: string;
}
