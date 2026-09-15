'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { useAuthStore } from '@/store/auth';
import { Spinner } from '@heroui/react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated, loading, checkSession } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    // 刷新页面后内存状态清空，请求会带上 sessionid Cookie，
    // 由后端 Session 判定登录态，而不是依赖前端本地标记
    checkSession();
  }, [checkSession]);

  useEffect(() => {
    if (mounted && !loading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [mounted, loading, isAuthenticated, router]);

  // 服务端会话未确认前，展示加载态，避免受保护内容闪烁
  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main className="ml-64 min-h-screen p-6 transition-all duration-300">
        <div className="animate-fadeIn">
          {children}
        </div>
      </main>
    </div>
  );
}
