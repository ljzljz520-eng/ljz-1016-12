import { ApiResponse, LoginResponse, DashboardStats, Server, Alert, Task, OperationLog, User } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

type UnauthorizedHandler = () => void;

// 不需要 CSRF 校验的“安全” HTTP 方法
const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS', 'TRACE'];

class ApiClient {
  private baseUrl: string;
  private onUnauthorized?: UnauthorizedHandler;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /** 注册 401 回调（会话失效时由 auth store 清空登录态） */
  setUnauthorizedHandler(handler: UnauthorizedHandler) {
    this.onUnauthorized = handler;
  }

  /** 读取后端通过 Set-Cookie 下发、允许 JS 读取的 csrftoken */
  private getCsrfCookie(): string | null {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : null;
  }

  /**
   * 确保持有 CSRF Token。
   * 登录前本地没有 csrftoken Cookie 时，先向后端申请一次。
   */
  async ensureCsrfToken(): Promise<string | null> {
    const existing = this.getCsrfCookie();
    if (existing) return existing;

    const res = await this.request<{ csrfToken: string }>('/auth/csrf/', {
      method: 'GET',
    });
    return res.success ? res.data?.csrfToken ?? this.getCsrfCookie() : null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}/api${endpoint}`;
    const method = (options.method || 'GET').toUpperCase();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> | undefined),
    };

    // 非安全方法必须携带 CSRF Token（Django 校验 X-CSRFToken 头）
    if (!SAFE_METHODS.includes(method)) {
      const csrfToken = this.getCsrfCookie();
      if (csrfToken) {
        headers['X-CSRFToken'] = csrfToken;
      }
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        // 关键：跨端口请求也要携带 sessionid / csrftoken Cookie
        credentials: 'include',
      });

      // 后端正常响应均为 JSON；个别情况（如 CSRF 校验被 Django 中间件拦截）
      // 会返回 HTML，此时按对应状态码构造错误，避免 JSON 解析失败误报网络错误
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const result: ApiResponse<T> = {
          success: false,
          code: response.status,
          message:
            response.status === 403
              ? '安全校验失败，请刷新页面后重试'
              : `请求失败（${response.status}）`,
          data: null as unknown as T,
        };
        if (response.status === 401) {
          this.onUnauthorized?.();
        }
        return result;
      }

      const data = await response.json();

      // 会话失效或未登录，通知 auth store 清空状态
      if (response.status === 401) {
        this.onUnauthorized?.();
      }

      return data as ApiResponse<T>;
    } catch (error) {
      return {
        success: false,
        code: 500,
        message: '网络请求失败，请检查网络连接',
        data: null as unknown as T,
      };
    }
  }

  // 登录：先确保有 CSRF Token，再由后端校验账号密码并写入 Session
  async login(
    username: string,
    password: string,
    remember: boolean = false
  ): Promise<ApiResponse<LoginResponse>> {
    await this.ensureCsrfToken();
    return this.request<LoginResponse>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ username, password, remember }),
    });
  }

  // 登出：后端清空 Session 并使 Cookie 失效
  async logout(): Promise<ApiResponse<null>> {
    await this.ensureCsrfToken();
    return this.request<null>('/auth/logout/', {
      method: 'POST',
    });
  }

  // 获取当前登录用户（依赖 Cookie 中的 sessionid，刷新页面后用于恢复登录态）
  async getUserInfo(): Promise<ApiResponse<User>> {
    return this.request<User>('/auth/user/');
  }

  // 获取仪表板统计
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return this.request<DashboardStats>('/dashboard/stats/');
  }

  // 获取服务器列表
  async getServers(): Promise<ApiResponse<Server[]>> {
    return this.request<Server[]>('/servers/');
  }

  // 获取告警列表
  async getAlerts(status?: string, level?: string): Promise<ApiResponse<Alert[]>> {
    let endpoint = '/alerts/';
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (level) params.append('level', level);
    if (params.toString()) endpoint += `?${params.toString()}`;
    return this.request<Alert[]>(endpoint);
  }

  // 获取任务列表
  async getTasks(status?: string, priority?: string): Promise<ApiResponse<Task[]>> {
    let endpoint = '/tasks/';
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (priority) params.append('priority', priority);
    if (params.toString()) endpoint += `?${params.toString()}`;
    return this.request<Task[]>(endpoint);
  }

  // 获取操作日志
  async getOperationLogs(): Promise<ApiResponse<OperationLog[]>> {
    return this.request<OperationLog[]>('/logs/');
  }
}

export const api = new ApiClient(API_BASE_URL);
