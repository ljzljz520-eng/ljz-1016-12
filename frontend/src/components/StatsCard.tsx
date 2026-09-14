'use client';

import { Card, CardBody } from '@heroui/react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color: 'primary' | 'success' | 'warning' | 'danger';
  trend?: {
    value: number;
    isUp: boolean;
  };
  suffix?: string;
}

const colorClasses = {
  primary: {
    bg: 'bg-primary-50',
    icon: 'text-primary-500',
    iconBg: 'bg-primary-100',
  },
  success: {
    bg: 'bg-green-50',
    icon: 'text-green-500',
    iconBg: 'bg-green-100',
  },
  warning: {
    bg: 'bg-yellow-50',
    icon: 'text-yellow-500',
    iconBg: 'bg-yellow-100',
  },
  danger: {
    bg: 'bg-red-50',
    icon: 'text-red-500',
    iconBg: 'bg-red-100',
  },
};

export function StatsCard({ title, value, icon: Icon, color, trend, suffix }: StatsCardProps) {
  const colors = colorClasses[color];

  return (
    <Card className="card-hover border-none shadow-sm">
      <CardBody className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm text-gray-500 font-medium">{title}</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-gray-800">{value}</span>
              {suffix && <span className="text-sm text-gray-500">{suffix}</span>}
            </div>
            {trend && (
              <div className={`flex items-center gap-1 text-xs ${trend.isUp ? 'text-green-500' : 'text-red-500'}`}>
                <span>{trend.isUp ? '↑' : '↓'}</span>
                <span>{trend.value}%</span>
                <span className="text-gray-400">较昨日</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-xl ${colors.iconBg}`}>
            <Icon className={`w-6 h-6 ${colors.icon}`} />
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
