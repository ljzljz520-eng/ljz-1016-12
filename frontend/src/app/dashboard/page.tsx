'use client';

import { useEffect, useState } from 'react';
import { Card, CardBody, CardHeader, Button, Spinner, Tabs, Tab } from '@heroui/react';
import { 
  Server, 
  AlertTriangle, 
  ClipboardList, 
  Cpu, 
  HardDrive,
  MemoryStick,
  RefreshCw,
  TrendingUp,
  Activity
} from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from '@/store/toast';
import { DashboardStats, Server as ServerType, Alert, Task } from '@/types';
import { StatsCard } from '@/components/StatsCard';
import { ServerStatusTable } from '@/components/ServerStatusTable';
import { AlertList } from '@/components/AlertList';
import { TaskList } from '@/components/TaskList';
import { UsageChart } from '@/components/UsageChart';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [servers, setServers] = useState<ServerType[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setRefreshing(true);

    try {
      const [statsRes, serversRes, alertsRes, tasksRes] = await Promise.all([
        api.getDashboardStats(),
        api.getServers(),
        api.getAlerts('pending'),
        api.getTasks(),
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (serversRes.success) setServers(serversRes.data);
      if (alertsRes.success) setAlerts(alertsRes.data);
      if (tasksRes.success) setTasks(tasksRes.data);

      if (!showLoading) {
        toast.success('数据已刷新');
      }
    } catch (error) {
      toast.error('获取数据失败');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Spinner size="lg" color="primary" />
          <p className="mt-4 text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">仪表盘</h1>
          <p className="text-gray-500 mt-1">运维系统概览与实时监控</p>
        </div>
        <Button
          color="primary"
          variant="flat"
          startContent={<RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />}
          onPress={() => fetchData(false)}
          isDisabled={refreshing}
        >
          刷新数据
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="服务器总数"
          value={stats?.total_servers || 0}
          icon={Server}
          color="primary"
          suffix="台"
        />
        <StatsCard
          title="运行中"
          value={stats?.running_servers || 0}
          icon={Activity}
          color="success"
          suffix="台"
        />
        <StatsCard
          title="待处理告警"
          value={stats?.pending_alerts || 0}
          icon={AlertTriangle}
          color="warning"
          suffix="条"
        />
        <StatsCard
          title="进行中任务"
          value={stats?.in_progress_tasks || 0}
          icon={ClipboardList}
          color="danger"
          suffix="项"
        />
      </div>

      {/* 资源使用率卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-none shadow-sm">
          <CardBody className="p-5">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-50">
                <Cpu className="w-6 h-6 text-blue-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">平均CPU使用率</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-800">
                    {stats?.avg_cpu_usage || 0}
                  </span>
                  <span className="text-sm text-gray-500">%</span>
                </div>
              </div>
              <div className="text-green-500 text-sm flex items-center gap-1">
                <TrendingUp size={14} />
                <span>正常</span>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border-none shadow-sm">
          <CardBody className="p-5">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-green-50">
                <MemoryStick className="w-6 h-6 text-green-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">平均内存使用率</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-800">
                    {stats?.avg_memory_usage || 0}
                  </span>
                  <span className="text-sm text-gray-500">%</span>
                </div>
              </div>
              <div className={`text-sm flex items-center gap-1 ${
                (stats?.avg_memory_usage || 0) > 70 ? 'text-yellow-500' : 'text-green-500'
              }`}>
                <TrendingUp size={14} />
                <span>{(stats?.avg_memory_usage || 0) > 70 ? '偏高' : '正常'}</span>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border-none shadow-sm">
          <CardBody className="p-5">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-orange-50">
                <HardDrive className="w-6 h-6 text-orange-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">平均磁盘使用率</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-800">
                    {stats?.avg_disk_usage || 0}
                  </span>
                  <span className="text-sm text-gray-500">%</span>
                </div>
              </div>
              <div className="text-green-500 text-sm flex items-center gap-1">
                <TrendingUp size={14} />
                <span>正常</span>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* 图表区域 */}
      <UsageChart
        cpuUsage={stats?.avg_cpu_usage || 0}
        memoryUsage={stats?.avg_memory_usage || 0}
        diskUsage={stats?.avg_disk_usage || 0}
      />

      {/* 服务器状态表格 */}
      <Card className="border-none shadow-sm">
        <CardHeader className="pb-0 px-6 pt-5">
          <div className="flex items-center justify-between w-full">
            <h3 className="text-lg font-semibold text-gray-800">服务器状态</h3>
            <Button
              size="sm"
              variant="light"
              color="primary"
            >
              查看全部
            </Button>
          </div>
        </CardHeader>
        <CardBody className="px-6 pb-5">
          <ServerStatusTable servers={servers.slice(0, 5)} />
        </CardBody>
      </Card>

      {/* 告警和任务 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm">
          <CardHeader className="px-6 pt-5 pb-2">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                <h3 className="text-lg font-semibold text-gray-800">最新告警</h3>
                {stats?.pending_alerts && stats.pending_alerts > 0 && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-600 rounded-full">
                    {stats.pending_alerts}
                  </span>
                )}
              </div>
              <Button
                size="sm"
                variant="light"
                color="primary"
              >
                全部告警
              </Button>
            </div>
          </CardHeader>
          <CardBody className="px-6 pb-5">
            <AlertList alerts={alerts.slice(0, 3)} />
          </CardBody>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader className="px-6 pt-5 pb-2">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-primary-500" />
                <h3 className="text-lg font-semibold text-gray-800">任务列表</h3>
              </div>
              <Button
                size="sm"
                variant="light"
                color="primary"
              >
                全部任务
              </Button>
            </div>
          </CardHeader>
          <CardBody className="px-6 pb-5">
            <TaskList tasks={tasks.slice(0, 3)} />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
