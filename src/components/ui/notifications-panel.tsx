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
      return 'border-green-200 bg-green-50/50';
    case 'mentor_request_rejected':
      return 'border-red-200 bg-red-50/50';
    case 'mentor_decision':
      return 'border-blue-200 bg-blue-50/50';
    default:
      return 'border-border bg-background';
  }
};

export default function NotificationsPanel({ userId, className }: NotificationsPanelProps) {
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } = useNotifications(userId);
  const [isOpen, setIsOpen] = useState(false);

  if (isLoading) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <Bell className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="relative">
            {unreadCount > 0 ? (
              <BellRing className="h-4 w-4" />
            ) : (
              <Bell className="h-4 w-4" />
            )}
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-80 max-h-96 overflow-y-auto"
          side="bottom"
          sideOffset={5}
        >
          <div className="flex items-center justify-between p-2 border-b">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={markAllAsRead}
                className="text-xs h-auto p-1"
              >
                <Check className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
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
        "flex flex-col items-start p-3 cursor-pointer hover:bg-muted/50 border-l-2 transition-colors",
        !notification.read && "bg-muted/30",
        getNotificationColor(notification.type)
      )}
      onClick={handleClick}
    >
      <div className="flex items-start space-x-3 w-full">
        <div className="flex-shrink-0 mt-0.5">
          {getNotificationIcon(notification.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium truncate">
              {notification.title}
            </p>
            {!notification.read && (
              <div className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0 ml-2" />
            )}
          </div>
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
