'use client';

import React, { useState } from 'react';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  Info, 
  CheckCircle2, 
  AlertCircle,
  X
} from 'lucide-react';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCocofyStore } from '@/hooks/use-cocofy-store';
import { Notification } from '@/lib/types';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

export function NotificationBell() {
  const { notifications, markAsRead, clearAllNotifications, deleteNotification } = useCocofyStore();
  const unreadCount = notifications.filter(n => !n.read).length;
  const [open, setOpen] = useState(false);

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-accent" />;
      default: return <Info className="w-4 h-4 text-blue-500 dark:text-blue-400" />;
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors group">
          <Bell className="w-6 h-6 group-hover:scale-110 transition-transform" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-primary text-primary-foreground border-2 border-background animate-in zoom-in">
              {unreadCount}
            </Badge>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 sm:w-96 p-0 glass border-black/10 dark:border-white/10 shadow-2xl z-[100]" align="end">
        <div className="p-4 border-b border-black/5 dark:border-white/5 flex items-center justify-between bg-black/[0.02] dark:bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">Notifications</h3>
            {unreadCount > 0 && <Badge variant="secondary" className="h-4 text-[9px] px-1.5 bg-primary/10 text-primary">{unreadCount} New</Badge>}
          </div>
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-muted-foreground hover:text-primary"
              title="Mark all as read"
              onClick={markAsRead}
            >
              <CheckCheck className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-muted-foreground hover:text-accent"
              title="Clear all"
              onClick={clearAllNotifications}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <ScrollArea className="h-[400px]">
          {notifications.length > 0 ? (
            <div className="divide-y divide-black/5 dark:divide-white/5">
              {notifications.map((n) => (
                <div 
                  key={n.id} 
                  className={cn(
                    "p-4 relative group transition-colors hover:bg-black/[0.01] dark:hover:bg-white/[0.01]",
                    !n.read && "bg-primary/[0.03]"
                  )}
                >
                  <div className="flex gap-3">
                    <div className="mt-1 shrink-0">{getIcon(n.type)}</div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className={cn("text-xs font-bold", n.read ? "text-muted-foreground" : "text-foreground")}>{n.title}</p>
                        <span className="text-[9px] text-muted-foreground whitespace-nowrap">
                          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{n.message}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => deleteNotification(n.id)}
                    className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-accent opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  {!n.read && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-8 bg-primary rounded-r" />}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 opacity-50">
              <Bell className="w-12 h-12 mb-3 text-muted-foreground/20" />
              <p className="text-sm italic text-foreground">No notifications yet</p>
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}