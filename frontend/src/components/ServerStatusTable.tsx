'use client';

import { 
  Table, 
  TableHeader, 
  TableColumn, 
  TableBody, 
  TableRow, 
  TableCell,
  Chip,
  Progress,
  Tooltip
} from '@heroui/react';
import { Server } from '@/types';
import { Monitor, MapPin } from 'lucide-react';

interface ServerStatusTableProps {
  servers: Server[];
  loading?: boolean;
}

const statusColorMap = {
  running: 'success',
  stopped: 'default',
  warning: 'warning',
  error: 'danger',
} as const;

export function ServerStatusTable({ servers, loading }: ServerStatusTableProps) {
  const getProgressColor = (value: number) => {
    if (value >= 80) return 'danger';
    if (value >= 60) return 'warning';
    return 'success';
  };

  return (
    <Table 
      aria-label="服务器状态表"
      classNames={{
        wrapper: 'shadow-none border border-gray-100 rounded-xl',
        th: 'bg-gray-50 text-gray-600 font-medium',
      }}
    >
      <TableHeader>
        <TableColumn>服务器</TableColumn>
        <TableColumn>状态</TableColumn>
        <TableColumn>CPU</TableColumn>
        <TableColumn>内存</TableColumn>
        <TableColumn>磁盘</TableColumn>
        <TableColumn>位置</TableColumn>
      </TableHeader>
      <TableBody 
        emptyContent={loading ? '加载中...' : '暂无数据'}
        isLoading={loading}
      >
        {servers.map((server) => (
          <TableRow key={server.id} className="hover:bg-gray-50">
            <TableCell>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gray-100">
                  <Monitor size={16} className="text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">{server.name}</p>
                  <p className="text-xs text-gray-500">{server.ip_address}</p>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <Chip
                size="sm"
                color={statusColorMap[server.status]}
                variant="flat"
                classNames={{
                  content: 'font-medium',
                }}
              >
                <span className={`status-dot status-${server.status} mr-2`}></span>
                {server.status_display}
              </Chip>
            </TableCell>
            <TableCell>
              <Tooltip content={`${server.cpu_usage}%`}>
                <div className="w-24">
                  <Progress 
                    size="sm"
                    value={server.cpu_usage}
                    color={getProgressColor(server.cpu_usage)}
                    classNames={{
                      track: 'h-2',
                      indicator: 'h-2',
                    }}
                  />
                </div>
              </Tooltip>
            </TableCell>
            <TableCell>
              <Tooltip content={`${server.memory_usage}%`}>
                <div className="w-24">
                  <Progress 
                    size="sm"
                    value={server.memory_usage}
                    color={getProgressColor(server.memory_usage)}
                    classNames={{
                      track: 'h-2',
                      indicator: 'h-2',
                    }}
                  />
                </div>
              </Tooltip>
            </TableCell>
            <TableCell>
              <Tooltip content={`${server.disk_usage}%`}>
                <div className="w-24">
                  <Progress 
                    size="sm"
                    value={server.disk_usage}
                    color={getProgressColor(server.disk_usage)}
                    classNames={{
                      track: 'h-2',
                      indicator: 'h-2',
                    }}
                  />
                </div>
              </Tooltip>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1 text-gray-500 text-sm">
                <MapPin size={14} />
                <span>{server.location || '-'}</span>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
