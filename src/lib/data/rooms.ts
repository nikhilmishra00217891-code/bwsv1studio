

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
  deleteDoc,
  runTransaction,
  writeBatch,
} from "firebase/firestore";
import type { Room, RoomMember, ChatMessage } from "@/types";
import { generateQuiz, type GenerateQuizInput } from "@/ai/flows";

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
  
  if (type === 'warzone') {
      newRoom.quizSettings = {
          topic: '',
          grade: 'Competitive Exams',
          difficulty: 'Medium',
          numberOfQuestions: 10,
      }
  }

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
    try {
        await runTransaction(db, async (transaction) => {
            const roomSnap = await transaction.get(roomRef);
            if (!roomSnap.exists()) {
                return;
            }
            const roomData = roomSnap.data() as Room;
            const updatedMembers = roomData.members.filter(m => m.uid !== memberIdToRemove);
            
            if (updatedMembers.length === 0) {
                transaction.delete(roomRef);
            } else {
                let newHostId = roomData.hostId;
                let newHostName = roomData.hostName;
                if (roomData.hostId === memberIdToRemove) {
                    newHostId = updatedMembers[0].uid;
                    newHostName = updatedMembers[0].displayName;
                }
                transaction.update(roomRef, { members: updatedMembers, hostId: newHostId, hostName: newHostName });
            }
        });
    } catch (error) {
        console.error("Error removing member from room: ", error);
        throw error;
    }
};


export const deleteRoom = async (roomId: string): Promise<void> => {
    const roomRef = doc(db, 'rooms', roomId);
    await deleteDoc(roomRef);
};

export const transferHost = async (roomId: string, newHostId: string): Promise<void> => {
    const roomRef = doc(db, 'rooms', roomId);
    const roomSnap = await getDoc(roomRef);
    if (!roomSnap.exists()) {
        throw new Error("Room not found");
    }
    const roomData = roomSnap.data() as Room;
    const newHost = roomData.members.find(m => m.uid === newHostId);

    if (!newHost) {
        throw new Error("New host not found in room members.");
    }

    await updateDoc(roomRef, {
        hostId: newHost.uid,
        hostName: newHost.displayName,
    });
};

export const updateMemberStatusInRoom = async (roomId: string, memberId: string, data: Partial<RoomMember>) => {
    const roomRef = doc(db, "rooms", roomId);
    try {
      await runTransaction(db, async (transaction) => {
        const roomSnap = await transaction.get(roomRef);
        if (!roomSnap.exists()) {
          return;
        }

        const roomData = roomSnap.data() as Room;
        const memberIndex = roomData.members.findIndex(m => m.uid === memberId);

        if (memberIndex !== -1) {
            const updatedMembers = [...roomData.members];
            updatedMembers[memberIndex] = { ...updatedMembers[memberIndex], ...data };
            transaction.update(roomRef, { members: updatedMembers });
        }
      });
    } catch (error) {
        console.error("Failed to update member status:", error);
    }
}

export const submitAnswer = async (roomId: string, userId: string, questionIndex: number, answer: string) => {
    const roomRef = doc(db, 'rooms', roomId);

    try {
        await runTransaction(db, async (transaction) => {
            const roomSnap = await transaction.get(roomRef);
            if (!roomSnap.exists()) return;

            const roomData = roomSnap.data() as Room;
            const memberIndex = roomData.members.findIndex(m => m.uid === userId);
            if (memberIndex === -1) return;

            const updatedMembers = [...roomData.members];
            if (!updatedMembers[memberIndex].answers) {
                updatedMembers[memberIndex].answers = {};
            }
            updatedMembers[memberIndex].answers![questionIndex] = answer;
            
            transaction.update(roomRef, { members: updatedMembers });
        });
    } catch(e) {
        console.error("Error submitting answer: ", e);
    }
}

export const finishQuizForMember = async (roomId: string, userId: string, score: number, accuracy: number, timeTaken: number) => {
     const roomRef = doc(db, "rooms", roomId);
    try {
      await runTransaction(db, async (transaction) => {
        const roomSnap = await transaction.get(roomRef);
        if (!roomSnap.exists()) {
          return;
        }

        const roomData = roomSnap.data() as Room;
        const memberIndex = roomData.members.findIndex(m => m.uid === userId);

        if (memberIndex !== -1) {
            const updatedMembers = [...roomData.members];
            updatedMembers[memberIndex] = { 
                ...updatedMembers[memberIndex], 
                status: 'finished',
                score,
                accuracy,
                timeTaken
            };
            
            const allFinished = updatedMembers.every(m => m.status === 'finished');

            transaction.update(roomRef, { 
                members: updatedMembers,
                status: allFinished ? 'finished' : 'in-progress'
            });
        }
      });
    } catch (error) {
        console.error("Failed to finish quiz for member:", error);
    }
}

export const updateQuizSettings = async (roomId: string, settings: Partial<GenerateQuizInput>) => {
    const roomRef = doc(db, "rooms", roomId);
    await updateDoc(roomRef, {
        quizSettings: settings,
    });
};

export const startQuiz = async (roomId: string): Promise<void> => {
    const roomRef = doc(db, "rooms", roomId);
    const roomSnap = await getDoc(roomRef);

    if (!roomSnap.exists()) {
        throw new Error("Room not found.");
    }
    const roomData = roomSnap.data() as Room;

    if (!roomData.quizSettings) {
        throw new Error("Quiz settings are not configured.");
    }

    const quizData = await generateQuiz(roomData.quizSettings);
    
    const updatedMembers = roomData.members.map(member => ({ 
        ...member, 
        answers: {}, 
        score: 0, 
        accuracy: 0, 
        timeTaken: 0,
        status: 'playing' 
    }));

    await updateDoc(roomRef, {
        quizData,
        status: 'in-progress',
        members: updatedMembers
    });
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
