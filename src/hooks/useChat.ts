import { useEffect, useState, useCallback } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase';
import { useFirebaseAuth } from './useFirebaseAuth';

export interface ChatMessage {
  senderId: string;
  senderType: 'mentor' | 'user';
  text: string;
  timestamp: any;
}

export function useChat(chatId: string) {
  const { user } = useFirebaseAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!chatId) return;
    const q = query(collection(getFirebaseDb(), 'chats', chatId, 'messages'), orderBy('timestamp'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }) as ChatMessage));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [chatId]);

  const sendMessage = useCallback(
    async (text: string, senderType: 'mentor' | 'user') => {
      if (!user || !chatId || !text.trim()) return;
      await addDoc(collection(getFirebaseDb(), 'chats', chatId, 'messages'), {
        senderId: user.uid,
        senderType,
        text,
        timestamp: serverTimestamp(),
      });
    },
    [user, chatId]
  );

  return { messages, loading, sendMessage, user };
} 