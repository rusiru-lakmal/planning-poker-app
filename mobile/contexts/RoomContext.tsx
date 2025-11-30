import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Room, CreateRoomDto, RoomParticipant } from '@/types/api';
import roomsAPI from '@/services/rooms.api';
import socketService from '@/services/socket';
import { useAuth } from './AuthContext';

interface RoomContextType {
  currentRoom: Room | null;
  participants: RoomParticipant[];
  myRooms: Room[];
  isLoadingRooms: boolean;
  createRoom: (createRoomDto: CreateRoomDto) => Promise<Room>;
  joinRoomByCode: (code: string, role?: 'player' | 'spectator') => Promise<Room>;
  joinRoomById: (roomId: string) => Promise<void>;
  leaveRoom: () => void;
  fetchMyRooms: () => Promise<void>;
}

const RoomContext = createContext<RoomContextType | undefined>(undefined);

export const useRoom = () => {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error('useRoom must be used within RoomProvider');
  }
  return context;
};

interface RoomProviderProps {
  children: ReactNode;
}

export const RoomProvider: React.FC<RoomProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [participants, setParticipants] = useState<RoomParticipant[]>([]);
  const [myRooms, setMyRooms] = useState<Room[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);

  // Set up WebSocket listeners
  useEffect(() => {
    const handleRoomUpdated = async (room: any) => {
      console.log('[RoomContext] Room updated event received:', room);
      console.log('[RoomContext] New Settings:', room.settings);
      
      // Force refresh from API to ensure we have the latest data
      // This fixes issues where socket payload might be partial or stale
      if (room.id || room._id) {
        try {
           console.log('[RoomContext] Fetching fresh room data...');
           // Add timestamp to prevent caching
           const freshRoom = await roomsAPI.getRoomById((room.id || room._id) + '?t=' + Date.now());
           const roomWithId = { ...freshRoom, id: (freshRoom.id || freshRoom._id)! };
           setCurrentRoom(roomWithId);
           if (freshRoom.participants) {
             setParticipants(freshRoom.participants);
           }
           return;
        } catch (err) {
           console.error('[RoomContext] Failed to refresh room:', err);
        }
      }

      // Fallback to socket payload if fetch fails
      const roomWithId = {
        ...room,
        id: room.id || room._id
      };
      setCurrentRoom(roomWithId);
      if (room.participants) {
        console.log('[RoomContext] Setting participants:', room.participants);
        setParticipants(room.participants);
      }
    };

    const handleUserJoined = (data: any) => {
      console.log('[RoomContext] User joined event:', data);
      setParticipants((prev) => {
        if (prev.some((p) => p.userId === data.userId)) {
          return prev;
        }
        return [...prev, { 
          userId: data.userId, 
          name: data.name,
          role: data.role || 'player',
          avatar: data.avatar
        }];
      });
    };

    const handleUserLeft = (data: any) => {
      console.log('[RoomContext] User left event:', data);
      setParticipants((prev) => prev.filter((p) => p.userId !== data.userId));
    };

    socketService.on('roomUpdated', handleRoomUpdated);
    socketService.onUserJoined(handleUserJoined);
    socketService.onUserLeft(handleUserLeft);

    return () => {
      socketService.off('roomUpdated', handleRoomUpdated);
      socketService.off('userJoined', handleUserJoined);
      socketService.off('userLeft', handleUserLeft);
    };
  }, []);

  useEffect(() => {
    if (!user) {
      setCurrentRoom(null);
      setParticipants([]);
      setMyRooms([]);
      setIsLoadingRooms(false);
    }
  }, [user]);

  const createRoom = async (createRoomDto: CreateRoomDto): Promise<Room> => {
    try {
      const room = await roomsAPI.createRoom(createRoomDto);
      const roomWithId = { ...room, id: (room.id || room._id)! };
      setCurrentRoom(roomWithId);
      setParticipants(room.participants || []);
      
      if (user && socketService.isConnected()) {
        await socketService.joinRoom({
          roomId: roomWithId.id,
          userId: user.id,
          name: user.name,
        });
      }
      
      return roomWithId;
    } catch (error) {
      console.error('Create room error:', error);
      throw error;
    }
  };

  const joinRoomByCode = async (code: string, role: 'player' | 'spectator' = 'player'): Promise<Room> => {
    try {
      const room = await roomsAPI.joinRoom({ code });
      const roomWithId = { ...room, id: (room.id || room._id)! };
      setCurrentRoom(roomWithId);
      setParticipants(room.participants || []);
      
      if (user && socketService.isConnected()) {
        await socketService.joinRoom({
          roomId: roomWithId.id,
          userId: user.id,
          name: user.name,
        });
      }
      
      return roomWithId;
    } catch (error) {
      console.error('Join room error:', error);
      throw error;
    }
  };

  const joinRoomById = async (roomId: string): Promise<void> => {
    try {
      console.log('[RoomContext] joinRoomById called with roomId:', roomId);
      // Add timestamp to prevent caching
      const room = await roomsAPI.getRoomById(roomId + '?t=' + Date.now());
      console.log('[RoomContext] Got room from API:', room);
      
      const roomWithId = { ...room, id: (room.id || room._id)! };
      setCurrentRoom(roomWithId);
      setParticipants(room.participants || []);
      
      console.log('[RoomContext] Socket connected?', socketService.isConnected());
      
      if (user && socketService.isConnected()) {
        console.log('[RoomContext] Calling socketService.joinRoom');
        const response = await socketService.joinRoom({
          roomId: roomWithId.id,
          userId: user.id,
          name: user.name,
        });
        
        if (response && response.status === 'ok' && response.room && response.room.participants) {
          console.log('[RoomContext] Setting participants from acknowledgement:', response.room.participants);
          setParticipants(response.room.participants);
        }
      } else {
        console.warn('[RoomContext] Cannot join room via socket - socket not connected or user not set');
      }
    } catch (error) {
      console.error('Join room by ID error:', error);
      throw error;
    }
  };

  const leaveRoom = () => {
    if (currentRoom && socketService.isConnected()) {
      socketService.leaveRoom(currentRoom.id);
    }
    setCurrentRoom(null);
    setParticipants([]);
  };

  const fetchMyRooms = async () => {
    try {
      setIsLoadingRooms(true);
      const rooms = await roomsAPI.getMyRooms();
      setMyRooms(rooms);
    } catch (error) {
      console.error('Fetch my rooms error:', error);
      throw error;
    } finally {
      setIsLoadingRooms(false);
    }
  };

  const value: RoomContextType = {
    currentRoom,
    participants,
    myRooms,
    isLoadingRooms,
    createRoom,
    joinRoomByCode,
    joinRoomById,
    leaveRoom,
    fetchMyRooms,
  };

  return <RoomContext.Provider value={value}>{children}</RoomContext.Provider>;
};
