import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Room, CreateRoomDto, RoomParticipant } from '@/types/api';
import { db } from '@/services/firebaseConfig';
import { useAuth } from './AuthContext';
import { 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  onSnapshot, 
  query, 
  where, 
  getDocs,
  arrayUnion,
  arrayRemove,
  getDoc,
  serverTimestamp,
  deleteDoc,
  orderBy
} from 'firebase/firestore';

interface RoomContextType {
  currentRoom: Room | null;
  participants: RoomParticipant[];
  myRooms: Room[];
  isLoadingRooms: boolean;
  createRoom: (createRoomDto: CreateRoomDto) => Promise<Room>;
  joinRoomByCode: (code: string, role?: 'player' | 'spectator') => Promise<Room>;
  joinRoomById: (roomId: string) => Promise<void>;
  leaveRoom: () => void;
  deleteRoom: (roomId: string) => Promise<void>;
  fetchMyRooms: () => Promise<void>;
  updateVote: (vote: string | null) => Promise<void>;
  revealCards: () => Promise<void>;
  resetRoom: () => Promise<void>;
  updateSettings: (settings: any) => Promise<void>;
  startVoting: () => Promise<void>;
  submitVote: (vote: string) => Promise<void>;
  startTimer: (duration: number) => Promise<void>;
  pauseTimer: () => Promise<void>;
  stopTimer: () => Promise<void>;
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
  const [unsubscribeRoom, setUnsubscribeRoom] = useState<(() => void) | null>(null);

  // Clean up listener on unmount or room leave
  useEffect(() => {
    return () => {
      if (unsubscribeRoom) {
        unsubscribeRoom();
      }
    };
  }, [unsubscribeRoom]);

  useEffect(() => {
    if (!user) {
      setCurrentRoom(null);
      setParticipants([]);
      setMyRooms([]);
      setIsLoadingRooms(false);
      if (unsubscribeRoom) {
        unsubscribeRoom();
        setUnsubscribeRoom(null);
      }
    }
  }, [user]);

  const subscribeToRoom = (roomId: string) => {
    if (unsubscribeRoom) {
      unsubscribeRoom();
    }

    const roomRef = doc(db, 'rooms', roomId);
    const unsubscribe = onSnapshot(roomRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const roomData = docSnapshot.data() as Room;
        const roomWithId = { ...roomData, id: docSnapshot.id };
        setCurrentRoom(roomWithId);
        if (roomData.participants) {
          setParticipants(roomData.participants);
        }
      } else {
        // Room deleted
        setCurrentRoom(null);
        setParticipants([]);
      }
    }, (error) => {
      console.error("Error listening to room:", error);
    });

    setUnsubscribeRoom(() => unsubscribe);
  };

  const createRoom = async (createRoomDto: CreateRoomDto): Promise<Room> => {
    if (!user) throw new Error('User not authenticated');

    try {
      const newRoomData = {
        name: createRoomDto.name,
        hostUserId: user.id,
        deckType: createRoomDto.deckType || 'fibonacci',
        createdAt: new Date().toISOString(), // Use ISO string for compatibility
        participants: [{
          userId: user.id,
          name: user.name,
          role: 'host',
          vote: null,
          avatar: null
        }],
        gameState: 'LOBBY',
        stories: [],
        settings: createRoomDto.settings || {
          autoReveal: false,
          allowSpectators: true,
          timerDuration: 0
        },
        code: Math.random().toString(36).substring(2, 8).toUpperCase() // Simple code generation
      };

      const docRef = await addDoc(collection(db, 'rooms'), newRoomData);
      const roomWithId = { ...newRoomData, id: docRef.id } as Room;
      
      setCurrentRoom(roomWithId);
      setParticipants(roomWithId.participants);
      subscribeToRoom(docRef.id);
      
      return roomWithId;
    } catch (error) {
      console.error('Create room error:', error);
      throw error;
    }
  };

  const joinRoomByCode = async (code: string, role: 'player' | 'spectator' = 'player'): Promise<Room> => {
    if (!user) throw new Error('User not authenticated');

    try {
      const q = query(collection(db, 'rooms'), where('code', '==', code));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error('Room not found');
      }

      const roomDoc = querySnapshot.docs[0];
      const roomData = roomDoc.data() as Room;
      const roomId = roomDoc.id;

      // Check if already joined
      const isParticipant = roomData.participants.some(p => p.userId === user.id);

      if (!isParticipant) {
        const newParticipant: RoomParticipant = {
          userId: user.id,
          name: user.name,
          role: role,
          vote: null
        };

        await updateDoc(doc(db, 'rooms', roomId), {
          participants: arrayUnion(newParticipant)
        });
      }

      const roomWithId = { ...roomData, id: roomId };
      setCurrentRoom(roomWithId);
      setParticipants(roomData.participants); // Optimistic update, listener will confirm
      subscribeToRoom(roomId);

      return roomWithId;
    } catch (error) {
      console.error('Join room error:', error);
      throw error;
    }
  };

  const joinRoomById = async (roomId: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    try {
      const roomRef = doc(db, 'rooms', roomId);
      const roomSnap = await getDoc(roomRef);

      if (!roomSnap.exists()) {
        throw new Error('Room not found');
      }

      const roomData = roomSnap.data() as Room;
      
      // Check if already joined
      const isParticipant = roomData.participants.some(p => p.userId === user.id);

      if (!isParticipant) {
        const newParticipant: RoomParticipant = {
          userId: user.id,
          name: user.name,
          role: 'player',
          vote: null
        };

        await updateDoc(roomRef, {
          participants: arrayUnion(newParticipant)
        });
      }

      const roomWithId = { ...roomData, id: roomId };
      setCurrentRoom(roomWithId);
      setParticipants(roomData.participants);
      subscribeToRoom(roomId);
    } catch (error) {
      console.error('Join room by ID error:', error);
      throw error;
    }
  };

  const leaveRoom = async () => {
    if (currentRoom && user) {
      // Optional: Remove user from participants
      // await updateDoc(doc(db, 'rooms', currentRoom.id), {
      //   participants: arrayRemove(...) // Requires exact object match which is hard
      // });
      
      // Better approach: filter and update
      try {
        const roomRef = doc(db, 'rooms', currentRoom.id);
        const roomSnap = await getDoc(roomRef);
        if (roomSnap.exists()) {
          const roomData = roomSnap.data() as Room;
          const updatedParticipants = roomData.participants.filter(p => p.userId !== user.id);
          await updateDoc(roomRef, { participants: updatedParticipants });
        }
      } catch (e) {
        console.error("Error leaving room:", e);
      }
    }
    
    if (unsubscribeRoom) {
      unsubscribeRoom();
      setUnsubscribeRoom(null);
    }
    setCurrentRoom(null);
    setParticipants([]);
  };

  const deleteRoom = async (roomId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'rooms', roomId));
      // Update local state
      setMyRooms(prev => prev.filter(room => room.id !== roomId));
      if (currentRoom?.id === roomId) {
        setCurrentRoom(null);
        setParticipants([]);
      }
    } catch (error) {
      console.error("Error deleting room:", error);
      throw error;
    }
  };

  const fetchMyRooms = async () => {
    if (!user) return;
    try {
      setIsLoadingRooms(true);
      // Query rooms where user is host, sorted by creation time
      // Note: Firestore requires an index for this query (hostUserId + createdAt)
      // If index is missing, it will fail gracefully or we can catch it
      try {
        const q = query(
          collection(db, 'rooms'), 
          where('hostUserId', '==', user.id),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        
        const rooms: Room[] = [];
        querySnapshot.forEach((doc) => {
          rooms.push({ ...doc.data(), id: doc.id } as Room);
        });
        
        setMyRooms(rooms);
      } catch (indexError) {
        console.log('Sorting failed (likely missing index), fetching without sort');
        const q = query(collection(db, 'rooms'), where('hostUserId', '==', user.id));
        const querySnapshot = await getDocs(q);
        
        const rooms: Room[] = [];
        querySnapshot.forEach((doc) => {
          rooms.push({ ...doc.data(), id: doc.id } as Room);
        });
        
        // Sort client-side as fallback
        rooms.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        
        setMyRooms(rooms);
      }
    } catch (error) {
      console.error('Fetch my rooms error:', error);
    } finally {
      setIsLoadingRooms(false);
    }
  };

  const updateVote = async (vote: string | null) => {
    if (!currentRoom || !user) return;
    
    try {
      const updatedParticipants = participants.map(p => 
        p.userId === user.id ? { ...p, vote } : p
      );
      
      await updateDoc(doc(db, 'rooms', currentRoom.id), {
        participants: updatedParticipants
      });
    } catch (error) {
      console.error("Error updating vote:", error);
    }
  };

  const revealCards = async () => {
    if (!currentRoom) return;
    try {
      await updateDoc(doc(db, 'rooms', currentRoom.id), {
        gameState: 'REVEALED'
      });
    } catch (error) {
      console.error("Error revealing cards:", error);
    }
  };

  const resetRoom = async () => {
    if (!currentRoom) return;
    try {
      const updatedParticipants = participants.map(p => ({ ...p, vote: null }));
      await updateDoc(doc(db, 'rooms', currentRoom.id), {
        gameState: 'VOTING',
        participants: updatedParticipants
      });
    } catch (error) {
      console.error("Error resetting room:", error);
    }
  };

  const updateSettings = async (settings: any) => {
    if (!currentRoom) return;
    try {
      await updateDoc(doc(db, 'rooms', currentRoom.id), {
        settings: settings
      });
    } catch (error) {
      console.error("Error updating settings:", error);
    }
  };

  const startVoting = async () => {
    await resetRoom();
  };

  const submitVote = async (vote: string) => {
    await updateVote(vote);
  };

  const startTimer = async (duration: number) => {
    if (!currentRoom) return;
    try {
      await updateDoc(doc(db, 'rooms', currentRoom.id), {
        timer: {
          startTime: new Date().toISOString(),
          duration: duration,
          status: 'running'
        }
      });
    } catch (error) {
      console.error("Error starting timer:", error);
    }
  };

  const pauseTimer = async () => {
    if (!currentRoom) return;
    try {
      await updateDoc(doc(db, 'rooms', currentRoom.id), {
        'timer.status': 'paused'
      });
    } catch (error) {
      console.error("Error pausing timer:", error);
    }
  };

  const stopTimer = async () => {
    if (!currentRoom) return;
    try {
      await updateDoc(doc(db, 'rooms', currentRoom.id), {
        'timer.status': 'stopped'
      });
    } catch (error) {
      console.error("Error stopping timer:", error);
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
    deleteRoom,
    fetchMyRooms,
    updateVote,
    revealCards,
    resetRoom,
    // New methods
    updateSettings,
    startVoting,
    submitVote,
    startTimer,
    pauseTimer,
    stopTimer
  };

  return <RoomContext.Provider value={value}>{children}</RoomContext.Provider>;
};
