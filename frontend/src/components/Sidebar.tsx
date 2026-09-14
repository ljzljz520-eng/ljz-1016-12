'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Avatar, Divider } from '@heroui/react';
import { 
  LayoutDashboard, 
  Server, 
  Bell, 
  ClipboardList, 
  FileText,
  LogOut,
  Menu,
  X,
  Settings,
  ChevronRight
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { toast } from '@/store/toast';
import { api } from '@/lib/api';

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: '仪表盘', path: '/dashboard' },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState('/dashboard');
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();

  const handleNavClick = (path: string) => {
    setActiveItem(path);
    router.push(path);
  };

  const handleLogout = async () => {
    try {
      await api.logout();
      clearAuth();
      toast.success('已安全退出');
      router.push('/login');
    } catch {
      clearAuth();
      router.push('/login');
    }
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-100 shadow-sm transition-all duration-300 z-40 flex flex-col ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo区域 */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Server className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-gray-800">OPS Admin</span>
          </div>
        )}
        <Button
          isIconOnly
          variant="light"
          size="sm"
          onPress={() => setCollapsed(!collapsed)}
          className="text-gray-500"
        >
          {collapsed ? <Menu size={20} /> : <X size={20} />}
        </Button>
      </div>

      {/* 导航菜单 */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.path;
            return (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon
                  size={20}
                  className={`flex-shrink-0 ${
                    isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-600'
                  }`}
                />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left font-medium text-sm">{item.label}</span>
                    {isActive && <ChevronRight size={16} className="text-primary-400" />}
                  </>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* 底部用户区域 */}
      <div className="border-t border-gray-100 p-4">
        {!collapsed ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-2 rounded-xl bg-gray-50">
              <Avatar
                name={user?.username?.charAt(0).toUpperCase() || 'A'}
                size="sm"
                className="bg-primary-500 text-white"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {user?.username || '管理员'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email || 'admin@ops.local'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="flat"
                color="danger"
                size="sm"
                className="flex-1"
                startContent={<LogOut size={16} />}
                onPress={handleLogout}
              >
                退出
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Avatar
              name={user?.username?.charAt(0).toUpperCase() || 'A'}
              size="sm"
              className="bg-primary-500 text-white"
            />
            <Button
              isIconOnly
              variant="flat"
              color="danger"
              size="sm"
              onPress={handleLogout}
            >
              <LogOut size={16} />
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
}
