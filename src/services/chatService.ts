import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './firebase';
import { ChatMessage } from '../types';

const TEAMS_COLLECTION = 'teams';
const MESSAGES_SUBCOLLECTION = 'messages';

// 1. Send message to a team
export const sendMessage = async (
  teamId: string,
  senderId: string,
  senderName: string,
  text: string
): Promise<void> => {
  if (!text.trim()) return;

  const messagesRef = collection(db, TEAMS_COLLECTION, teamId, MESSAGES_SUBCOLLECTION);
  await addDoc(messagesRef, {
    senderId,
    senderName,
    text: text.trim(),
    createdAt: Date.now(),
  });
};

// 2. Subscribe to real-time messages in a team
export const subscribeToMessages = (
  teamId: string,
  callback: (messages: ChatMessage[]) => void
) => {
  const messagesRef = collection(db, TEAMS_COLLECTION, teamId, MESSAGES_SUBCOLLECTION);
  const q = query(messagesRef, orderBy('createdAt', 'asc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const messages: ChatMessage[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          senderId: data.senderId,
          senderName: data.senderName,
          text: data.text,
          createdAt: data.createdAt,
        };
      });
      callback(messages);
    },
    (error) => {
      console.error('Error listening to chat messages:', error);
      callback([]);
    }
  );
};
