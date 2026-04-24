'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/theme-provider';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="rounded-xl text-muted-foreground hover:text-primary transition-all duration-300"
      title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5 animate-in zoom-in-50 duration-300" />
      ) : (
        <Sun className="w-5 h-5 animate-in zoom-in-50 duration-300" />
      )}
    </Button>
  );
}