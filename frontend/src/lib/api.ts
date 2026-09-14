import { ApiResponse, LoginResponse, DashboardStats, Server, Alert, Task, OperationLog } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}/api${endpoint}`;
    const token = this.getToken();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();
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

  // 登录
  async login(username: string, password: string): Promise<ApiResponse<LoginResponse>> {
    return this.request<LoginResponse>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  // 登出
  async logout(): Promise<ApiResponse<null>> {
    return this.request<null>('/auth/logout/', {
      method: 'POST',
    });
  }

  // 获取当前用户信息
  async getUserInfo(): Promise<ApiResponse<any>> {
    return this.request<any>('/auth/user/');
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
