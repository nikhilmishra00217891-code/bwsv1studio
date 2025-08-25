
import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  addDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  onSnapshot,
  query,
  where,
  getDocs,
  setDoc,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import type { Room, RoomMember, ChatMessage } from "@/types";

const roomsCollection = collection(db, "rooms");

const generateRoomId = (length: number = 8): string => {
    const chars = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789'; // Removed O, 0 to avoid confusion
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

export const createRoom = async (
  type: 'focus-zone' | 'warzone',
  host: RoomMember
): Promise<string> => {
  const roomId = generateRoomId();
  const roomRef = doc(db, "rooms", roomId);
  
  const newRoom: Room = {
    id: roomId,
    type,
    hostId: host.uid,
    hostName: host.displayName,
    members: [host],
    status: 'waiting',
    createdAt: serverTimestamp() as Timestamp, // Cast for type consistency
  };

  await setDoc(roomRef, newRoom);
  return roomId;
};

export const joinRoom = async (roomId: string, user: RoomMember): Promise<Room | null> => {
    const roomRef = doc(db, "rooms", roomId);
    const roomSnap = await getDoc(roomRef);

    if (!roomSnap.exists()) {
        throw new Error("Room not found");
    }

    const roomData = roomSnap.data() as Room;
    if (roomData.members.some(member => member.uid === user.uid)) {
        return { id: roomSnap.id, ...roomData };
    }
    
    // Ensure you don't exceed a reasonable member limit
    if (roomData.members.length >= 20) {
        throw new Error("This room is full.");
    }

    await updateDoc(roomRef, {
        members: arrayUnion(user)
    });
    
    const updatedSnap = await getDoc(roomRef);
    return { id: updatedSnap.id, ...updatedSnap.data() } as Room;
}

export const removeMemberFromRoom = async (roomId: string, memberIdToRemove: string) => {
    const roomRef = doc(db, 'rooms', roomId);
    const roomSnap = await getDoc(roomRef);
    if (!roomSnap.exists()) {
        throw new Error("Room not found");
    }
    const roomData = roomSnap.data() as Room;
    const memberToRemove = roomData.members.find(m => m.uid === memberIdToRemove);
    if (memberToRemove) {
        await updateDoc(roomRef, {
            members: arrayRemove(memberToRemove)
        });
    }
}

export const updateMemberStatusInRoom = async (roomId: string, memberId: string, data: Partial<RoomMember>) => {
    const roomRef = doc(db, "rooms", roomId);
    const roomSnap = await getDoc(roomRef);

    if (roomSnap.exists()) {
        const roomData = roomSnap.data() as Room;
        const memberIndex = roomData.members.findIndex(m => m.uid === memberId);

        if (memberIndex !== -1) {
            const updatedMembers = [...roomData.members];
            updatedMembers[memberIndex] = { ...updatedMembers[memberIndex], ...data };
            
            await updateDoc(roomRef, {
                members: updatedMembers
            });
        }
    }
}

export const listenForRoomUpdates = (
  roomId: string,
  callback: (room: Room | null) => void
): (() => void) => {
  const roomRef = doc(db, "rooms", roomId);
  const unsubscribe = onSnapshot(roomRef, (docSnap) => {
    if (docSnap.exists()) {
      callback({ id: docSnap.id, ...docSnap.data() } as Room);
    } else {
      callback(null); 
    }
  }, (error) => {
    console.error("Error listening for room updates:", error);
    callback(null);
  });
  return unsubscribe;
};

export const getRoom = async (roomId: string): Promise<Room | null> => {
    const roomRef = doc(db, "rooms", roomId);
    const roomSnap = await getDoc(roomRef);
    if (roomSnap.exists()) {
        return { id: roomSnap.id, ...roomSnap.data() } as Room;
    }
    return null;
}

// --- Chat Functions ---

export const sendChatMessage = async (roomId: string, message: { senderId: string, senderName: string, text: string }) => {
    const messagesCol = collection(db, `rooms/${roomId}/messages`);
    await addDoc(messagesCol, {
        ...message,
        timestamp: serverTimestamp(),
    });
};

export const listenForChatMessages = (roomId: string, callback: (messages: ChatMessage[]) => void): (() => void) => {
    const messagesCol = collection(db, `rooms/${roomId}/messages`);
    const q = query(messagesCol, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage));
        callback(messages);
    }, (error) => {
        console.error("Error listening for chat messages:", error);
    });

    return unsubscribe;
};
