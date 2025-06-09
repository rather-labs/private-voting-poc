"use client";

import { SessionProvider } from "next-auth/react";
import { useState, useEffect } from 'react'
import { ThemeProvider } from './components/ThemeProvider';
import { FloatingActions } from './components/FloatingActions';

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <ThemeProvider>
      <SessionProvider>
        {children}
        <FloatingActions />
      </SessionProvider>
    </ThemeProvider>
  );
} 

