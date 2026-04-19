"use client";

import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  LogOut, 
  Bell, 
  Menu, 
  X,
  Sprout
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { UserProfile } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const SidebarItem = ({ icon: Icon, label, active, onClick }: SidebarItemProps) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-all duration-200 group",
      active 
        ? "bg-primary text-white shadow-lg shadow-primary/20" 
        : "text-muted-foreground hover:bg-white/5 hover:text-white"
    )}
  >
    <Icon className={cn("w-5 h-5", active ? "text-white" : "group-hover:text-primary")} />
    <span className="font-medium">{label}</span>
  </button>
);

interface DashboardLayoutProps {
  user: UserProfile;
  onLogout: () => void;
  children: React.ReactNode;
}

export function DashboardLayout({ user, onLogout, children }: DashboardLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = user.role === 'manager' 
    ? [
        { icon: LayoutDashboard, label: 'Overview' },
      ]
    : [
        { icon: LayoutDashboard, label: 'My Jobs' },
      ];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 glass border-r border-white/5 p-6 space-y-8">
        <div className="flex items-center gap-2 px-2">
          <div className="w-10 h-10 rounded-xl orange-gradient flex items-center justify-center text-white">
            <Sprout className="w-6 h-6" />
          </div>
          <span className="text-2xl font-headline font-bold tracking-tight">Cocofy</span>
        </div>

        <nav className="flex-1 space-y-2">
          {navigation.map((item) => (
            <SidebarItem 
              key={item.label} 
              icon={item.icon} 
              label={item.label} 
              active={item.label === (user.role === 'manager' ? 'Overview' : 'My Jobs')}
            />
          ))}
        </nav>

        <div className="pt-6 border-t border-white/5 space-y-4">
          <div className="flex items-center gap-3 px-2">
            <Avatar className="w-10 h-10 border border-white/10">
              <AvatarImage src={`https://picsum.photos/seed/${user.id}/100/100`} />
              <AvatarFallback>{user.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-semibold truncate">{user.name}</span>
              <span className="text-xs text-muted-foreground capitalize">{user.role}</span>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-muted-foreground hover:text-accent hover:bg-accent/10"
            onClick={onLogout}
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Mobile Header & Menu */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between p-4 md:px-8 md:py-6 glass border-b border-white/5 z-20">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden p-2 text-muted-foreground"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
            <h1 className="text-xl md:text-2xl font-headline font-bold">
              {user.role === 'manager' ? 'Manager Dashboard' : 'Worker Portal'}
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative text-muted-foreground">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full border-2 border-background"></span>
            </Button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          {children}
        </main>
      </div>

      {/* Mobile Navigation Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div 
            className="absolute left-0 top-0 bottom-0 w-3/4 glass border-r border-white/5 p-6 flex flex-col"
            onClick={e => e.stopPropagation()}
          >
             <div className="flex items-center gap-2 mb-10">
              <div className="w-10 h-10 rounded-xl orange-gradient flex items-center justify-center text-white">
                <Sprout className="w-6 h-6" />
              </div>
              <span className="text-2xl font-headline font-bold tracking-tight">Cocofy</span>
            </div>
            
            <nav className="flex-1 space-y-2">
              {navigation.map((item) => (
                <SidebarItem 
                  key={item.label} 
                  icon={item.icon} 
                  label={item.label} 
                  active={item.label === (user.role === 'manager' ? 'Overview' : 'My Jobs')}
                  onClick={() => setIsMobileMenuOpen(false)}
                />
              ))}
            </nav>

            <div className="pt-6 border-t border-white/5">
              <Button 
                variant="destructive" 
                className="w-full justify-start"
                onClick={onLogout}
              >
                <LogOut className="w-5 h-5 mr-3" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
