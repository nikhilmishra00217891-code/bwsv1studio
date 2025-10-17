

import { db } from "@/lib/firebase/client";
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
    joinRequests: [],
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

    try {
        const updatedRoom = await runTransaction(db, async (transaction) => {
            const roomSnap = await transaction.get(roomRef);
            if (!roomSnap.exists()) {
                throw new Error("Room not found");
            }
            const roomData = roomSnap.data() as Room;

            const isAlreadyMember = roomData.members.some(member => member.uid === user.uid);
            const isAlreadyPending = roomData.joinRequests?.some(req => req.uid === user.uid);

            if (isAlreadyMember || isAlreadyPending) {
                return roomData; // User is already in or waiting, do nothing but return room data
            }
            
            if (roomData.members.length >= 20) {
                throw new Error("This room is full.");
            }
            
            transaction.update(roomRef, {
                joinRequests: arrayUnion(user)
            });
            
            // Return optimistic data
            return {
                ...roomData,
                joinRequests: [...(roomData.joinRequests || []), user]
            };
        });
        return updatedRoom;
    } catch(error) {
        throw error;
    }
}

export const admitUserToRoom = async (roomId: string, userToAdmit: RoomMember) => {
    const roomRef = doc(db, 'rooms', roomId);
    await runTransaction(db, async (transaction) => {
        const roomSnap = await transaction.get(roomRef);
        if (!roomSnap.exists()) {
            throw new Error("Room not found");
        }
        const roomData = roomSnap.data() as Room;
        const pendingUser = roomData.joinRequests?.find(req => req.uid === userToAdmit.uid);
        if (!pendingUser) {
            return; // User is no longer in the request list
        }
        
        transaction.update(roomRef, {
            joinRequests: arrayRemove(pendingUser),
            members: arrayUnion(pendingUser)
        });
    });
};

export const denyUserFromRoom = async (roomId: string, userIdToDeny: string) => {
     const roomRef = doc(db, 'rooms', roomId);
     await runTransaction(db, async (transaction) => {
        const roomSnap = await transaction.get(roomRef);
        if (!roomSnap.exists()) {
            throw new Error("Room not found");
        }
        const roomData = roomSnap.data() as Room;
        const pendingUser = roomData.joinRequests?.find(req => req.uid === userIdToDeny);
        if (!pendingUser) {
            return; // User is no longer in the request list
        }

        transaction.update(roomRef, {
            joinRequests: arrayRemove(pendingUser)
        });
    });
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
                // If the last member is leaving, delete the room
                transaction.delete(roomRef);
            } else {
                let newHostId = roomData.hostId;
                let newHostName = roomData.hostName;
                // If the host is leaving and there are others, make the next person host
                if (roomData.hostId === memberIdToRemove) {
                    newHostId = updatedMembers[0].uid;
                    newHostName = updatedMembers[0].displayName;
                }
                transaction.update(roomRef, { members: updatedMembers, hostId: newHostId, hostName: newHostName });
            }
        });
    } catch (error) {
        throw error; // Re-throw so the client knows something went wrong
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
    }
}

export const finishQuizForMember = async (roomId: string, userId: string, score: number, accuracy: number, timeTaken: number) => {
    const roomRef = doc(db, "rooms", roomId);
    try {
        await runTransaction(db, async (transaction) => {
            const roomSnap = await transaction.get(roomRef);
            if (!roomSnap.exists()) return;

            const roomData = roomSnap.data() as Room;
            const members = roomData.members;
            const memberIndex = members.findIndex(m => m.uid === userId);
            if (memberIndex === -1) return;

            // Update just the specific member's status
            const updatedMember = {
                ...members[memberIndex],
                status: 'finished',
                score,
                accuracy,
                timeTaken,
            };
            members[memberIndex] = updatedMember;

            // Check if all members are finished
            const allFinished = members.every(m => m.status === 'finished');

            // Update the document
            transaction.update(roomRef, {
                members: members,
                ...(allFinished && { status: 'finished' }) // Conditionally update room status
            });
        });
    } catch (error) {
        throw error;
    }
};


export const updateQuizSettings = async (roomId: string, settings: Partial<GenerateQuizInput>) => {
    const roomRef = doc(db, "rooms", roomId);
    await updateDoc(roomRef, {
        quizSettings: settings,
    });
};

export const startQuiz = async (roomId: string): Promise<void> => {
    const roomRef = doc(db, "rooms", roomId);
    
    // Immediately set the status to 'generating'
    await updateDoc(roomRef, { status: 'generating' });

    try {
        const roomSnap = await getDoc(roomRef);
        if (!roomSnap.exists()) {
            throw new Error("Room not found.");
        }
        const roomData = roomSnap.data() as Room;

        if (!roomData.quizSettings?.topic) {
            throw new Error("Quiz topic must be set before starting.");
        }

        // Generate the quiz in the background
        const quizData = await generateQuiz(roomData.quizSettings);
        
        const updatedMembers = roomData.members.map(member => ({ 
            ...member, 
            answers: {}, 
            score: 0, 
            accuracy: 0, 
            timeTaken: 0,
            status: 'playing' 
        }));

        // Update the room with the quiz data and start the game
        await updateDoc(roomRef, {
            quizData,
            status: 'in-progress',
            members: updatedMembers
        });
    } catch (error) {
        // If an error occurs, set the status back to 'waiting'
        await updateDoc(roomRef, { status: 'waiting' });
        throw error; // Re-throw to be handled by the client
    }
}

export const resetRoomForNewQuiz = async (roomId: string): Promise<void> => {
    const roomRef = doc(db, "rooms", roomId);
    const roomSnap = await getDoc(roomRef);

    if (!roomSnap.exists()) {
        throw new Error("Room not found.");
    }
    const roomData = roomSnap.data() as Room;

    const resetMembers = roomData.members.map(member => ({
        ...member,
        status: 'playing',
        answers: {},
        score: 0,
        accuracy: 0,
        timeTaken: 0,
    }));
    
    await updateDoc(roomRef, {
        status: 'waiting',
        quizData: null,
        members: resetMembers,
    });
};


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
    });

    return unsubscribe;
};
