import { create } from 'zustand';
import { User } from '@/types';
import { api } from '@/lib/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  /** 是否正在向服务端确认会话（页面刷新/初始化时为 true） */
  loading: boolean;
  setAuth: (user: User) => void;
  clearAuth: () => void;
  /**
   * 向服务端校验当前会话：
   * 请求自动携带 sessionid Cookie，由后端 Django Session 判断是否登录。
   * 刷新浏览器后 zustand 内存状态丢失，靠该方法恢复登录态。
   */
  checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => {
  // 任何接口返回 401（session 过期 / 未登录）时，清空内存登录态
  api.setUnauthorizedHandler(() => {
    if (get().isAuthenticated) {
      set({ user: null, isAuthenticated: false });
    }
  });

  return {
    user: null,
    isAuthenticated: false,
    loading: true,

    setAuth: (user: User) => {
      set({ user, isAuthenticated: true, loading: false });
    },

    clearAuth: () => {
      set({ user: null, isAuthenticated: false, loading: false });
    },

    checkSession: async () => {
      set({ loading: true });
      try {
        const response = await api.getUserInfo();
        if (response.success && response.data) {
          set({ user: response.data, isAuthenticated: true });
        } else {
          set({ user: null, isAuthenticated: false });
        }
      } catch {
        set({ user: null, isAuthenticated: false });
      } finally {
        set({ loading: false });
      }
    },
  };
});
