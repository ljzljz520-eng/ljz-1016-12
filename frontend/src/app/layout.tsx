'use client';

import { HeroUIProvider } from '@heroui/react';
import { Toaster } from '@/components/Toaster';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        <title>运维管理后台 - OPS Admin</title>
        <meta name="description" content="企业级运维管理后台系统" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="min-h-screen bg-background antialiased">
        <HeroUIProvider>
          {children}
          <Toaster />
        </HeroUIProvider>
      </body>
    </html>
  );
}
