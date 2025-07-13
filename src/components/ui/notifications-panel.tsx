// src/components/ui/notifications-panel.tsx
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { 
  Bell, 
  CheckCircle, 
  XCircle, 
  Users, 
  Check
} from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import type { NotificationData } from '@/types/mentor-request';
import { motion } from 'framer-motion';

interface NotificationsPanelProps {
  userId: string;
  className?: string;
}

const getNotificationIcon = (type: NotificationData['type']) => {
  switch (type) {
    case 'mentor_request_approved':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'mentor_request_rejected':
      return <XCircle className="h-4 w-4 text-red-500" />;
    case 'mentor_decision':
      return <Users className="h-4 w-4 text-blue-500" />;
    default:
      return <Bell className="h-4 w-4 text-gray-500" />;
  }
};

export default function NotificationsPanel({ userId, className }: NotificationsPanelProps) {
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } = useNotifications(userId);
  const [isOpen, setIsOpen] = useState(false);

  if (isLoading) {
    return (
      <div className={cn("fixed top-4 right-4 z-50 md:relative md:top-0 md:right-0", className)}>
        <Button variant="ghost" size="icon" disabled className="h-10 w-10 rounded-full">
          <Bell className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("fixed top-4 right-4 z-50 md:relative md:top-0 md:right-0", className)}>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-900">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                  className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </motion.div>
              )}
              <span className="sr-only">Toggle notifications</span>
            </Button>
          </motion.div>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-80 md:w-96 max-h-[70vh] bg-white shadow-xl border border-gray-200 rounded-lg"
          sideOffset={10}
        >
          <div className="flex items-center justify-between p-3 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={markAllAsRead}
                className="text-xs h-auto p-1 text-gray-500 hover:text-gray-900"
              >
                <Check className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <Bell className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="max-h-[60vh] overflow-y-auto">
              {notifications.map((notification) => (
                <NotificationItem
                  key={(notification as any).id}
                  notification={notification as NotificationData & { id: string }}
                  onMarkAsRead={markAsRead}
                />
              ))}
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

interface NotificationItemProps {
  notification: NotificationData & { id: string };
  onMarkAsRead: (id: string) => void;
}

function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead((notification as any).id);
    }
  };

  return (
    <DropdownMenuItem
      className={cn(
        "flex flex-col items-start p-3 cursor-pointer focus:bg-gray-100",
        !notification.read && "bg-blue-50",
      )}
      onClick={handleClick}
    >
      <div className="flex items-start space-x-3 w-full">
        <div className="flex-shrink-0 mt-1">
          {getNotificationIcon(notification.type)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate text-gray-900">
            {notification.title}
          </p>
          <p className="text-xs text-gray-600 mt-1 leading-relaxed">
            {notification.message}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {formatDistanceToNow(notification.createdAt.toDate(), { addSuffix: true })}
          </p>
        </div>
      </div>
    </DropdownMenuItem>
  );
}
