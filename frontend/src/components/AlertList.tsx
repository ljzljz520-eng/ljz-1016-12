'use client';

import { Card, CardBody, Chip, Button } from '@heroui/react';
import { Alert } from '@/types';
import { AlertTriangle, Info, AlertCircle, Clock, Check } from 'lucide-react';

interface AlertListProps {
  alerts: Alert[];
  loading?: boolean;
}

const levelConfig = {
  info: {
    icon: Info,
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    chipColor: 'primary' as const,
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-yellow-500',
    bg: 'bg-yellow-50',
    chipColor: 'warning' as const,
  },
  danger: {
    icon: AlertCircle,
    color: 'text-red-500',
    bg: 'bg-red-50',
    chipColor: 'danger' as const,
  },
};

const statusConfig = {
  pending: { label: '待处理', color: 'warning' as const },
  processing: { label: '处理中', color: 'primary' as const },
  resolved: { label: '已解决', color: 'success' as const },
};

export function AlertList({ alerts, loading }: AlertListProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
        <Check size={48} className="mb-3" />
        <p>暂无告警</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => {
        const level = levelConfig[alert.level];
        const status = statusConfig[alert.status];
        const Icon = level.icon;

        return (
          <Card 
            key={alert.id} 
            className="card-hover border-none shadow-sm"
          >
            <CardBody className="p-4">
              <div className="flex items-start gap-4">
                <div className={`p-2.5 rounded-xl ${level.bg}`}>
                  <Icon className={`w-5 h-5 ${level.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-medium text-gray-800 truncate">
                      {alert.title}
                    </h4>
                    <Chip size="sm" color={status.color} variant="flat">
                      {status.label}
                    </Chip>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                    {alert.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    {alert.server_name && (
                      <span>服务器: {alert.server_name}</span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(alert.created_at).toLocaleString('zh-CN')}
                    </span>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        );
      })}
    </div>
  );
}
