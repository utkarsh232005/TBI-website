// src/hooks/useNotifications.ts
"use client";

import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { NotificationData } from '@/types/mentor-request';

export function useNotifications(userId: string) {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) return;

    // Temporary: Remove orderBy while index is building
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs: NotificationData[] = [];
      snapshot.forEach((doc) => {
        notifs.push({
          id: doc.id,
          ...doc.data()
        } as NotificationData & { id: string });
      });
      
      // Sort manually since we removed orderBy
      notifs.sort((a, b) => {
        const aTime = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
        const bTime = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
        return bTime.getTime() - aTime.getTime();
      });
      
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.read).length);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const markAsRead = async (notificationId: string) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      await Promise.all(
        unreadNotifications.map(n => 
          updateDoc(doc(db, 'notifications', (n as any).id), { read: true })
        )
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead
  };
}
