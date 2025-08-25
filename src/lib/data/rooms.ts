
import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  addDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
  arrayUnion,
  onSnapshot,
  query,
  where,
  getDocs,
  setDoc,
} from "firebase/firestore";
import type { Room, RoomMember } from "@/types";

const roomsCollection = collection(db, "rooms");

const generateRoomId = (length: number = 8): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
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
  
  const newRoom = {
    id: roomId, // Store the ID within the document as well
    type,
    hostId: host.uid,
    hostName: host.displayName,
    members: [host],
    status: 'waiting',
    createdAt: serverTimestamp(),
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

    // Check if user is already a member
    const roomData = roomSnap.data() as Room;
    if (roomData.members.some(member => member.uid === user.uid)) {
        return { id: roomSnap.id, ...roomData };
    }

    await updateDoc(roomRef, {
        members: arrayUnion(user)
    });
    
    const updatedSnap = await getDoc(roomRef);
    return { id: updatedSnap.id, ...updatedSnap.data() } as Room;
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
      callback(null); // Room doesn't exist or was deleted
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
