
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
} from "firebase/firestore";
import type { Chamber, ChamberMessage, Channel, RoomMember } from "@/types";

// --- Chamber Functions ---

/**
 * Creates a new Parivartan Chamber (study group).
 */
export const createChamber = async (
  name: string,
  description: string,
  creatorId: string,
  creatorName: string,
): Promise<string> => {
  const chambersCol = collection(db, "chambers");

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
    members: [creatorMember], // Creator is the first member
    channels: [defaultChannel],
    createdAt: serverTimestamp() as any,
  };

  const docRef = await addDoc(chambersCol, newChamberData);

  // Also add this chamber to the user's list of chambers
  const userRef = doc(db, 'users', creatorId);
  
  // Use setDoc with merge: true to create the user doc if it doesn't exist,
  // or update it if it does. This is safer than just updateDoc.
  await setDoc(userRef, {
      chambers: arrayUnion(docRef.id)
  }, { merge: true });
  
  return docRef.id;
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

    await updateDoc(chamberRef, {
        members: arrayUnion(newMember)
    });
    
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
        chambers: arrayUnion(chamberId)
    });

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
    
    // We need to query for the user's UID within the 'members' array of objects.
    const q = query(chambersCol, where('members', 'array-contains', { 
        uid: userId, 
        // We need to provide all fields of the RoomMember object that we are querying against.
        // The values don't matter as much as the structure, but let's be safe.
        // Firestore doesn't support partial object matches in array-contains.
        // This is a limitation. A better structure would be a subcollection of members.
        // Given the current structure, we'll have to filter on the client.
    }));

    const userChambersQuery = query(chambersCol, where("memberIds", "array-contains", userId));

    
    const unsubscribe = onSnapshot(chambersCol, (snapshot) => {
        const allChambers = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Chamber));

        const userChambers = allChambers.filter(chamber => 
            chamber.members.some(member => member.uid === userId)
        );
        
        // Sort by creation date on the client side
        userChambers.sort((a, b) => {
            const timeA = a.createdAt?.toMillis() || 0;
            const timeB = b.createdAt?.toMillis() || 0;
            return timeB - timeA; // Descending order
        });

        callback(userChambers);
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
