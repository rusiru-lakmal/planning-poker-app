import { io, Socket } from "socket.io-client";
import {
  JoinRoomPayload,
  RoomJoinedPayload,
  UserJoinedPayload,
  UserLeftPayload,
} from "@/types/api";

import { Config } from "@/constants/Config";

// Configuration
const SOCKET_URL = Config.SOCKET_URL;

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();

  /**
   * Initialize socket connection
   */
  connect(token?: string): void {
    if (this.socket?.connected) {
      console.log("Socket already connected");
      return;
    }

    const options: any = {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    };

    // Add auth token if provided
    if (token) {
      options.auth = { token: `Bearer ${token}` };
      console.log("[SocketService] Connecting with auth token");
    }

    this.socket = io(SOCKET_URL, options);

    this.socket.on("connect", () => {
      console.log("Socket connected:", this.socket?.id);
    });

    this.socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });

    this.socket.on("error", (error) => {
      console.error("Socket error:", error);
    });

    // Restore event listeners after reconnection
    this.socket.on("connect", () => {
      this.restoreListeners();
    });
  }

  /**
   * Disconnect socket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
    }
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * Join a room
   */
  joinRoom(payload: JoinRoomPayload): Promise<any> {
    if (!this.socket) {
      throw new Error("Socket not connected");
    }
    console.log("[SocketService] Emitting joinRoom event:", payload);
    return new Promise((resolve) => {
      this.socket!.emit("joinRoom", payload, (response: any) => {
        console.log(
          "[SocketService] joinRoom acknowledged by server:",
          response
        );
        resolve(response);
      });
    });
  }

  /**
   * Leave a room
   */
  leaveRoom(roomId: string): void {
    if (!this.socket) {
      throw new Error("Socket not connected");
    }
    this.socket.emit("leaveRoom", { roomId });
  }

  /**
   * Listen for room joined event
   */
  onRoomJoined(callback: (data: RoomJoinedPayload) => void): void {
    this.on("room_joined", callback);
  }

  /**
   * Listen for user joined event
   */
  onUserJoined(callback: (data: UserJoinedPayload) => void): void {
    this.on("userJoined", callback);
  }

  /**
   * Listen for user left event
   */
  onUserLeft(callback: (data: UserLeftPayload) => void): void {
    this.on("userLeft", callback);
  }

  /**
   * Generic event listener
   */
  on(event: string, callback: Function): void {
    // Store listener for reconnection/initial connection
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);

    // Add listener to socket if connected
    if (this.socket) {
      this.socket.on(event, callback as any);
    }
  }

  /**
   * Remove event listener
   */
  off(event: string, callback?: Function): void {
    if (!this.socket) return;

    if (callback) {
      // Remove specific listener
      this.socket.off(event, callback as any);

      // Remove from stored listeners
      const listeners = this.listeners.get(event);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    } else {
      // Remove all listeners for event
      this.socket.off(event);
      this.listeners.delete(event);
    }
  }

  /**
   * Restore listeners after reconnection
   */
  private restoreListeners(): void {
    if (!this.socket) return;

    this.listeners.forEach((callbacks, event) => {
      callbacks.forEach((callback) => {
        this.socket!.on(event, callback as any);
      });
    });
  }

  startVoting(roomId: string): void {
    if (!this.socket) return;
    console.log("[SocketService] Emitting startVoting for room:", roomId);
    this.socket.emit("startVoting", { roomId });
  }

  submitVote(roomId: string, userId: string, vote: string): void {
    if (!this.socket) return;
    console.log(
      `[SocketService] Emitting submitVote: ${vote} for user ${userId}`
    );
    this.socket.emit("submitVote", { roomId, userId, vote });
  }

  revealVotes(roomId: string): void {
    if (!this.socket) return;
    console.log("[SocketService] Emitting revealVotes for room:", roomId);
    this.socket.emit("revealVotes", { roomId });
  }

  resetGame(roomId: string): void {
    if (!this.socket) return;
    console.log("[SocketService] Emitting resetGame for room:", roomId);
    this.socket.emit("resetGame", { roomId });
  }

  updateSettings(roomId: string, settings: any): void {
    if (!this.socket) return;
    console.log("[SocketService] Emitting updateSettings:", {
      roomId,
      settings,
    });
    this.socket.emit("updateSettings", { roomId, settings });
  }

  startTimer(roomId: string, duration: number): void {
    if (!this.socket) return;
    console.log(
      `[SocketService] Emitting startTimer: ${duration}s for room ${roomId}`
    );
    this.socket.emit("startTimer", { roomId, duration });
  }

  pauseTimer(roomId: string): void {
    if (!this.socket) return;
    console.log("[SocketService] Emitting pauseTimer for room:", roomId);
    this.socket.emit("pauseTimer", { roomId });
  }

  stopTimer(roomId: string): void {
    if (!this.socket) return;
    console.log("[SocketService] Emitting stopTimer for room:", roomId);
    this.socket.emit("stopTimer", { roomId });
  }
}

export default new SocketService();
