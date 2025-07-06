// src/components/ui/notifications-panel.tsx
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { 
  Bell, 
  BellRing, 
  CheckCircle, 
  XCircle, 
  Users, 
  MoreVertical,
  Check,
  Trash2
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
      return <Bell className="h-4 w-4 text-muted-foreground" />;
  }
};

const getNotificationColor = (type: NotificationData['type']) => {
  switch (type) {
    case 'mentor_request_approved':
      return 'border-l-green-500';
    case 'mentor_request_rejected':
      return 'border-l-red-500';
    case 'mentor_decision':
      return 'border-l-blue-500';
    default:
      return 'border-l-border';
  }
};

export default function NotificationsPanel({ userId, className }: NotificationsPanelProps) {
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } = useNotifications(userId);
  const [isOpen, setIsOpen] = useState(false);

  if (isLoading) {
    return (
      <div className={cn("fixed top-6 right-6 z-50", className)}>
        <Button variant="outline" size="icon" disabled className="rounded-full h-12 w-12 bg-background/50 backdrop-blur-sm shadow-lg">
          <Bell className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("fixed top-6 right-6 z-50", className)}>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button variant="outline" size="icon" className="relative h-12 w-12 rounded-full bg-background/50 backdrop-blur-lg border-border/50 shadow-lg hover:bg-accent/10 hover:border-accent/30 transition-all duration-200">
              {unreadCount > 0 ? (
                <BellRing className="h-5 w-5 text-accent" />
              ) : (
                <Bell className="h-5 w-5" />
              )}
              {unreadCount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-600 text-white text-xs flex items-center justify-center border-2 border-background"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </motion.div>
              )}
            </Button>
          </motion.div>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-80 md:w-96 max-h-[70vh] bg-background/80 backdrop-blur-xl border-border/50 shadow-2xl"
          side="bottom"
          sideOffset={10}
        >
          <div className="flex items-center justify-between p-3 border-b border-border/50">
            <h3 className="font-semibold text-foreground">Notifications</h3>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={markAllAsRead}
                className="text-xs h-auto p-1 text-muted-foreground hover:text-foreground"
              >
                <Check className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
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
        "flex flex-col items-start p-3 cursor-pointer hover:bg-muted/50 border-l-4 transition-colors focus:bg-accent/20",
        !notification.read ? "bg-accent/10 border-accent" : "border-transparent",
      )}
      onClick={handleClick}
    >
      <div className="flex items-start space-x-3 w-full">
        <div className="flex-shrink-0 mt-0.5">
          {getNotificationIcon(notification.type)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate text-foreground">
            {notification.title}
          </p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            {notification.message}
          </p>
          {notification.mentorName && (
            <p className="text-xs text-muted-foreground mt-1">
              Mentor: {notification.mentorName}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            {formatDistanceToNow(notification.createdAt.toDate(), { addSuffix: true })}
          </p>
        </div>
      </div>
    </DropdownMenuItem>
  );
}
