import api from "./api";
import { CreateRoomDto, JoinRoomDto, Room } from "@/types/api";

/**
 * Transform backend room response (_id) to frontend format (id)
 */
const transformRoom = (backendRoom: any): Room => {
  return {
    id: backendRoom._id || backendRoom.id,
    code: backendRoom.code,
    name: backendRoom.name,
    hostUserId: backendRoom.hostUserId,
    deckType: backendRoom.deckType,
    settings: backendRoom.settings || {
      autoReveal: false,
      allowSpectators: true,
      timerDuration: 0,
    },
    createdAt: backendRoom.createdAt,
    participants: backendRoom.participants || [],
    gameState: backendRoom.gameState || "LOBBY",
    stories: backendRoom.stories || [],
    timer: backendRoom.timer,
  };
};

/**
 * Rooms API service
 */
class RoomsAPI {
  /**
   * Create a new room
   */
  async createRoom(createRoomDto: CreateRoomDto): Promise<Room> {
    const response = await api.post<any>("/rooms", createRoomDto);
    return transformRoom(response.data);
  }

  /**
   * Join a room by code
   */
  async joinRoom(joinRoomDto: JoinRoomDto): Promise<Room> {
    const response = await api.post<any>("/rooms/join", joinRoomDto);
    return transformRoom(response.data);
  }

  /**
   * Get room by ID
   */
  async getRoomById(id: string): Promise<Room> {
    const response = await api.get<any>(`/rooms/${id}`);
    return transformRoom(response.data);
  }

  /**
   * Get current user's rooms
   */
  async getMyRooms(): Promise<Room[]> {
    const response = await api.get<any[]>("/rooms/my/rooms");
    return response.data.map(transformRoom);
  }
}

export default new RoomsAPI();
