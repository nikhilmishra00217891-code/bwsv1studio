
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  doc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
  limit,
  where,
  updateDoc,
  arrayUnion,
  getDoc,
  Timestamp,
  writeBatch,
  setDoc,
} from "firebase/firestore";
import type { Chamber, ChamberMessage, Channel, RoomMember } from "@/types";

// --- Chamber Functions ---

const generateChamberId = (length: number = 8): string => {
    const chars = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * Creates a new Parivartan Chamber (study group).
 */
export const createChamber = async (
  name: string,
  description: string,
  creatorId: string,
  creatorName: string,
): Promise<string> => {
  const chamberId = generateChamberId();
  const chamberRef = doc(db, "chambers", chamberId);

  const defaultChannel: Channel = {
    id: "general",
    name: "kuch-bhi-pucho",
    type: "text",
  };
  
  const creatorMember: RoomMember = {
      uid: creatorId,
      displayName: creatorName,
      photoURL: '', // This should be updated from user profile later if available
      avatar: 'brain',
  }

  const newChamberData: Omit<Chamber, 'id'> = {
    name,
    description,
    creatorId,
    members: [creatorMember],
    memberIds: [creatorId],
    channels: [defaultChannel],
    createdAt: serverTimestamp() as any,
  };

  const userRef = doc(db, 'users', creatorId);

  // Use a batch to ensure atomicity
  const batch = writeBatch(db);
  batch.set(chamberRef, newChamberData);
  batch.update(userRef, { chambers: arrayUnion(chamberId) });
  
  await batch.commit();
  
  return chamberId;
};

export const joinChamber = async (
    chamberId: string,
    userId: string,
    userName: string,
    userAvatar: string
): Promise<Chamber | null> => {
    const chamberRef = doc(db, 'chambers', chamberId);
    const chamberSnap = await getDoc(chamberRef);

    if (!chamberSnap.exists()) {
        throw new Error("Chamber not found.");
    }
    
    const chamberData = chamberSnap.data() as Chamber;

    if (chamberData.members.some(m => m.uid === userId)) {
        return {id: chamberId, ...chamberData}; // Already a member
    }

    const newMember: RoomMember = {
        uid: userId,
        displayName: userName,
        photoURL: userAvatar,
        avatar: 'brain',
    }

    const userRef = doc(db, 'users', userId);
    
    const batch = writeBatch(db);
    batch.update(chamberRef, {
        members: arrayUnion(newMember),
        memberIds: arrayUnion(userId)
    });
    batch.update(userRef, {
        chambers: arrayUnion(chamberId)
    });
    
    await batch.commit();

    return { id: chamberId, ...chamberData, members: [...chamberData.members, newMember] };
}

/**
 * Listens for real-time changes to the chambers a user is a member of.
 */
export const listenForUserChambers = (
    userId: string,
    callback: (chambers: Chamber[]) => void
): (() => void) => {
    const chambersCol = collection(db, 'chambers');
    // REMOVED: orderBy("createdAt", "desc") to prevent index error. Sorting will be handled client-side.
    const q = query(chambersCol, where("memberIds", "array-contains", userId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const chambers = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Chamber));
        
        // Sort chambers by creation date in the application code
        chambers.sort((a, b) => {
            const timeA = a.createdAt?.toMillis() || 0;
            const timeB = b.createdAt?.toMillis() || 0;
            return timeB - timeA; // Sort descending (newest first)
        });

        callback(chambers);
    }, (error) => {
        console.error("Error listening for user chambers:", error);
        callback([]);
    });

    return unsubscribe;
}


// --- Channel & Message Functions ---

/**
 * Listens for real-time messages in a specific channel.
 */
export const listenForChannelMessages = (
    chamberId: string,
    channelId: string,
    callback: (messages: ChamberMessage[]) => void
): (() => void) => {
    const messagesCol = collection(db, `chambers/${chamberId}/channels/${channelId}/messages`);
    const q = query(messagesCol, orderBy("timestamp", "asc"), limit(100));

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const messages = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                timestamp: data.timestamp as Timestamp, // Ensure it's a Timestamp
            } as ChamberMessage;
        });
        callback(messages);
    }, (error) => {
        console.error(`Error listening for messages in ${chamberId}/${channelId}:`, error);
        callback([]);
    });

    return unsubscribe;
}

/**
 * Sends a message to a specific channel.
 */
export const sendChannelMessage = async (
    chamberId: string,
    channelId: string,
    messageData: Omit<ChamberMessage, 'id' | 'timestamp'>
) => {
    const messagesCol = collection(db, `chambers/${chamberId}/channels/${channelId}/messages`);
    await addDoc(messagesCol, {
        ...messageData,
        timestamp: serverTimestamp()
    });
};
