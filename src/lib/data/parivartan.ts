

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
  deleteDoc,
  arrayRemove,
  runTransaction,
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
      photoURL: '', 
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
    
    return runTransaction(db, async (transaction) => {
        const chamberSnap = await transaction.get(chamberRef);
        if (!chamberSnap.exists()) {
            throw new Error("Chamber not found.");
        }

        const chamberData = chamberSnap.data() as Chamber;
        if (chamberData.memberIds.includes(userId)) {
            return {id: chamberId, ...chamberData}; // Already a member
        }

        const newMember: RoomMember = {
            uid: userId,
            displayName: userName,
            photoURL: userAvatar,
            avatar: 'brain',
        }

        const userRef = doc(db, 'users', userId);
        
        transaction.update(chamberRef, {
            members: arrayUnion(newMember),
            memberIds: arrayUnion(userId)
        });
        transaction.update(userRef, {
            chambers: arrayUnion(chamberId)
        });

        return { id: chamberId, ...chamberData, members: [...chamberData.members, newMember] };
    });
}

/**
 * Listens for real-time changes to the chambers a user is a member of.
 */
export const listenForUserChambers = (
    userId: string,
    callback: (chambers: Chamber[]) => void
): (() => void) => {
    const chambersCol = collection(db, 'chambers');
    const q = query(chambersCol, where("memberIds", "array-contains", userId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const chambers = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Chamber));
        
        chambers.sort((a, b) => {
            const timeA = a.createdAt?.toMillis() || 0;
            const timeB = b.createdAt?.toMillis() || 0;
            return timeB - timeA;
        });

        callback(chambers);
    }, (error) => {
        console.error("Error listening for user chambers:", error);
        callback([]);
    });

    return unsubscribe;
}

export const removeMember = async (chamberId: string, memberIdToRemove: string) => {
  const chamberRef = doc(db, 'chambers', chamberId);
  const userRef = doc(db, 'users', memberIdToRemove);

  await runTransaction(db, async (transaction) => {
    const chamberDoc = await transaction.get(chamberRef);
    if (!chamberDoc.exists()) {
      throw new Error("Chamber doesn't exist!");
    }

    const chamberData = chamberDoc.data() as Chamber;
    const updatedMembers = chamberData.members.filter(m => m.uid !== memberIdToRemove);
    const updatedMemberIds = chamberData.memberIds.filter(id => id !== memberIdToRemove);

    if (chamberData.creatorId === memberIdToRemove) {
      if (updatedMembers.length > 0) {
        transaction.update(chamberRef, {
          members: updatedMembers,
          memberIds: updatedMemberIds,
          creatorId: updatedMembers[0].uid, // Transfer ownership
        });
      } else {
        transaction.delete(chamberRef); // Delete if last member
      }
    } else {
      transaction.update(chamberRef, {
        members: updatedMembers,
        memberIds: updatedMemberIds,
      });
    }
    
    transaction.update(userRef, {
        chambers: arrayRemove(chamberId)
    });
  });
};

export const deleteChamber = async (chamberId: string) => {
    const chamberRef = doc(db, 'chambers', chamberId);
    const chamberSnap = await getDoc(chamberRef);

    if (!chamberSnap.exists()) {
        throw new Error("Chamber not found.");
    }
    
    const chamberData = chamberSnap.data() as Chamber;
    
    const batch = writeBatch(db);
    chamberData.memberIds.forEach(memberId => {
        const userRef = doc(db, 'users', memberId);
        batch.update(userRef, {
            chambers: arrayRemove(chamberId)
        });
    });
    
    // Note: This does not delete subcollections (like messages).
    // For a production app, a Cloud Function would be needed for cascading deletes.
    batch.delete(chamberRef);
    
    await batch.commit();
}


// --- Channel & Message Functions ---

const generateChannelId = (name: string): string => {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export const createChannel = async (chamberId: string, channelName: string) => {
    const chamberRef = doc(db, 'chambers', chamberId);
    const newChannel: Channel = {
        id: generateChannelId(channelName),
        name: channelName.toLowerCase(),
        type: 'text'
    };

    // Check for duplicate channel names/IDs before adding
    const chamberSnap = await getDoc(chamberRef);
    if (chamberSnap.exists()) {
        const chamberData = chamberSnap.data() as Chamber;
        if (chamberData.channels.some(c => c.id === newChannel.id || c.name === newChannel.name)) {
            throw new Error("A channel with this name already exists.");
        }
    }

    await updateDoc(chamberRef, {
        channels: arrayUnion(newChannel)
    });
};

export const updateChannel = async (chamberId: string, channelId: string, newName: string) => {
    const chamberRef = doc(db, 'chambers', chamberId);
    
    await runTransaction(db, async (transaction) => {
        const chamberDoc = await transaction.get(chamberRef);
        if (!chamberDoc.exists()) throw new Error("Chamber not found.");

        const chamberData = chamberDoc.data() as Chamber;
        const channels = chamberData.channels;

        const newChannelId = generateChannelId(newName);
        if (channels.some(c => (c.name === newName.toLowerCase() || c.id === newChannelId) && c.id !== channelId)) {
            throw new Error("Another channel with this name already exists.");
        }

        const channelIndex = channels.findIndex(c => c.id === channelId);
        if (channelIndex === -1) throw new Error("Channel not found.");
        
        channels[channelIndex].name = newName.toLowerCase();
        // It's often better not to change the ID, as it can break references.
        // If IDs must change, it requires migrating message subcollections, which is complex for the client.
        // channels[channelIndex].id = newChannelId;

        transaction.update(chamberRef, { channels: channels });
    });
};

export const deleteChannel = async (chamberId: string, channelId: string) => {
    const chamberRef = doc(db, 'chambers', chamberId);

    await runTransaction(db, async (transaction) => {
        const chamberDoc = await transaction.get(chamberRef);
        if (!chamberDoc.exists()) throw new Error("Chamber not found.");

        const chamberData = chamberDoc.data() as Chamber;
        if (chamberData.channels.length <= 1) {
            throw new Error("You cannot delete the last channel in a chamber.");
        }
        
        const updatedChannels = chamberData.channels.filter(c => c.id !== channelId);
        transaction.update(chamberRef, { channels: updatedChannels });
        // Note: Does not delete message subcollection.
    });
};


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
