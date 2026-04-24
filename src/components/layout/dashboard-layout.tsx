"use client";

import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  LogOut, 
  Menu, 
  X,
  Sprout,
  Trophy,
  Truck,
  IndianRupee,
  Contact,
  History,
  Settings2,
  Wallet,
  Coins,
  BarChart3,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { UserProfile } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { NotificationBell } from './notification-bell';
import { ThemeToggle } from './theme-toggle';

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
      "flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-all duration-300 group text-left relative",
      active 
        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
        : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground hover:pl-5"
    )}
  >
    <Icon className={cn("w-5 h-5 shrink-0 transition-transform duration-300", active ? "text-primary-foreground" : "group-hover:text-primary group-hover:scale-110")} />
    <span className="font-medium truncate">{label}</span>
    {active && <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white/50 animate-pulse" />}
  </button>
);

interface DashboardLayoutProps {
  user: UserProfile;
  onLogout: () => void;
  children: React.ReactNode;
  activeView: string;
  onNavigate: (view: string) => void;
}

export function DashboardLayout({ user, onLogout, children, activeView, onNavigate }: DashboardLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getNavigation = () => {
    switch (user.role) {
      case 'manager':
        return [
          { id: 'dashboard', icon: LayoutDashboard, label: 'Overview' },
          { id: 'calendar', icon: Calendar, label: 'Scheduling' },
          { id: 'staff', icon: Contact, label: 'Workers List' },
          { id: 'leaderboard', icon: Trophy, label: 'Workers Ranking' },
          { id: 'presets', icon: Settings2, label: 'Pricing Presets' },
          { id: 'history', icon: History, label: 'Job History' },
        ];
      case 'finance_manager':
        return [
          { id: 'dashboard', icon: LayoutDashboard, label: 'Accounts Overview' },
          { id: 'analytics', icon: BarChart3, label: 'Advanced Analytics' },
          { id: 'due_amount', icon: Wallet, label: 'Due Amount' },
          { id: 'worker_salary', icon: Coins, label: 'Worker Salary' },
          { id: 'payment_history', icon: History, label: 'Payment History' },
        ];
      case 'delivery_boy':
        return [
          { id: 'dashboard', icon: Truck, label: 'Deliveries' },
          { id: 'leaderboard', icon: Trophy, label: 'Leaderboard' },
        ];
      default:
        return [
          { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
          { id: 'salary', icon: IndianRupee, label: 'Salary' },
          { id: 'leaderboard', icon: Trophy, label: 'Leaderboard' },
        ];
    }
  };

  const navigation = getNavigation();

  const handleNavigate = (id: string) => {
    onNavigate(id);
    setIsMobileMenuOpen(false);
  };

  const getHeaderTitle = () => {
    if (activeView === 'leaderboard') return 'Leaderboard';
    if (activeView === 'staff') return 'Workers Directory';
    if (activeView === 'managers') return 'Administrative Team';
    if (activeView === 'presets') return 'Pricing Configuration';
    if (activeView === 'due_amount') return 'Pending Receivables';
    if (activeView === 'worker_salary') return 'Worker Payroll';
    if (activeView === 'payment_history') return 'Payment History';
    if (activeView === 'history') return 'Job History';
    if (activeView === 'salary') return 'Accounts';
    if (activeView === 'analytics') return 'Business Intelligence';
    if (activeView === 'calendar') return 'Schedule Overview';
    
    switch (user.role) {
      case 'manager': return 'Managers Dashboard';
      case 'finance_manager': return 'Accounts Control';
      case 'delivery_boy': return 'Delivery Portal';
      default: return 'Worker Portal';
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside className="hidden md:flex flex-col w-64 glass border-r border-black/5 dark:border-white/5 p-6 space-y-8 animate-in slide-in-from-left duration-500">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 px-2 group cursor-pointer">
            <div className="w-10 h-10 rounded-xl orange-gradient flex items-center justify-center text-primary-foreground transition-transform duration-500 group-hover:rotate-12">
              <Sprout className="w-6 h-6" />
            </div>
            <span className="text-2xl font-headline font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">Cocofy</span>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {navigation.map((item) => (
            <SidebarItem 
              key={item.id} 
              icon={item.icon} 
              label={item.label} 
              active={activeView === item.id}
              onClick={() => handleNavigate(item.id)}
            />
          ))}
        </nav>

        <div className="pt-6 border-t border-black/5 dark:border-white/5 space-y-4">
          <div className="flex items-center gap-3 px-2 group cursor-default">
            <Avatar className="w-10 h-10 border border-black/10 dark:border-white/10 transition-transform duration-500 group-hover:scale-110">
              <AvatarImage src={`https://picsum.photos/seed/${user.id}/100/100`} />
              <AvatarFallback className="bg-black/5 dark:bg-white/5 text-foreground">{user.name?.[0] || 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-semibold truncate text-foreground group-hover:text-primary transition-colors">{user.name}</span>
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{user.role.replace('_', ' ')}</span>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-muted-foreground hover:text-accent hover:bg-accent/10 transition-all active:scale-95"
            onClick={onLogout}
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between p-4 md:px-8 md:py-6 glass border-b border-black/5 dark:border-white/5 z-20 transition-all duration-300">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden p-2 text-muted-foreground hover:text-primary transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
            <h1 className="text-xl md:text-2xl font-headline font-bold truncate text-foreground animate-in fade-in slide-in-from-top-4 duration-500">
              {getHeaderTitle()}
            </h1>
          </div>
          
          <div className="flex items-center gap-3 md:gap-4">
            <ThemeToggle />
            <NotificationBell />
            <Badge variant="outline" className="hidden sm:flex bg-green-500/10 text-green-600 border-green-500/20 gap-1.5 font-bold transition-all hover:bg-green-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Active
            </Badge>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar bg-black/[0.01] dark:bg-white/[0.01]">
          {children}
        </main>
      </div>

      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div 
            className="absolute left-0 top-0 bottom-0 w-3/4 glass border-r border-black/5 dark:border-white/5 p-6 flex flex-col animate-in slide-in-from-left duration-300"
            onClick={e => e.stopPropagation()}
          >
             <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl orange-gradient flex items-center justify-center text-primary-foreground">
                    <Sprout className="w-6 h-6" />
                  </div>
                  <span className="text-2xl font-headline font-bold tracking-tight text-foreground">Cocofy</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="hover:rotate-90 transition-transform duration-300"><X className="w-6 h-6 text-muted-foreground" /></button>
            </div>
            
            <nav className="flex-1 space-y-2">
              {navigation.map((item) => (
                <SidebarItem 
                  key={item.id} 
                  icon={item.icon} 
                  label={item.label} 
                  active={activeView === item.id}
                  onClick={() => handleNavigate(item.id)}
                />
              ))}
            </nav>

            <div className="pt-6 border-t border-black/5 dark:border-white/5 space-y-4">
              <div className="flex items-center justify-between px-2">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Theme</span>
                <ThemeToggle />
              </div>
              <Button 
                variant="destructive" 
                className="w-full justify-start shadow-lg active:scale-95 transition-transform text-white"
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