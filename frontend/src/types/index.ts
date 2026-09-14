// 用户类型
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  date_joined: string;
}

// 服务器类型
export interface Server {
  id: number;
  name: string;
  ip_address: string;
  status: 'running' | 'stopped' | 'warning' | 'error';
  status_display: string;
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  os_type: string;
  location: string;
  created_at: string;
  updated_at: string;
}

// 告警类型
export interface Alert {
  id: number;
  title: string;
  description: string;
  level: 'info' | 'warning' | 'danger';
  level_display: string;
  status: 'pending' | 'processing' | 'resolved';
  status_display: string;
  server_id: number | null;
  server_name: string | null;
  created_at: string;
  resolved_at: string | null;
}

// 任务类型
export interface Task {
  id: number;
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  status_display: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  priority_display: string;
  assigned_to: number | null;
  assigned_to_name: string | null;
  created_at: string;
  completed_at: string | null;
}

// 操作日志类型
export interface OperationLog {
  id: number;
  action: string;
  description: string;
  user_id: number | null;
  username: string | null;
  ip_address: string;
  created_at: string;
}

// 仪表板统计类型
export interface DashboardStats {
  total_servers: number;
  running_servers: number;
  stopped_servers: number;
  warning_servers: number;
  total_alerts: number;
  pending_alerts: number;
  danger_alerts: number;
  total_tasks: number;
  pending_tasks: number;
  in_progress_tasks: number;
  completed_tasks: number;
  avg_cpu_usage: number;
  avg_memory_usage: number;
  avg_disk_usage: number;
}

// API响应类型
export interface ApiResponse<T> {
  success: boolean;
  code: number;
  message: string;
  data: T;
}

// 登录响应
export interface LoginResponse {
  token: string;
  user: User;
}
