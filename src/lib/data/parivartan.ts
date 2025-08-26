
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  doc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
  limit
} from "firebase/firestore";
import type { Chamber, ChamberMessage, Channel } from "@/types";

// --- Chamber Functions ---

/**
 * Creates a new Parivartan Chamber (study group).
 */
export const createChamber = async (
  name: string,
  description: string,
  creatorId: string
): Promise<string> => {
  const chambersCol = collection(db, "chambers");

  // Create a default "general" channel for every new chamber
  const defaultChannel: Channel = {
    id: "general",
    name: "kuch-bhi-pucho",
    type: "text",
  };

  const newChamberData: Omit<Chamber, 'id'> = {
    name,
    description,
    creatorId,
    members: [creatorId], // Creator is the first member
    channels: [defaultChannel],
    createdAt: serverTimestamp() as any,
  };

  const docRef = await addDoc(chambersCol, newChamberData);
  return docRef.id;
};

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
        const messages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as ChamberMessage));
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
