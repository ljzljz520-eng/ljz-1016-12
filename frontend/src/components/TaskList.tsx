'use client';

import { Card, CardBody, Chip, Avatar } from '@heroui/react';
import { Task } from '@/types';
import { Clock, User, Flag } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  loading?: boolean;
}

const statusConfig = {
  pending: { label: '待处理', color: 'default' as const },
  in_progress: { label: '进行中', color: 'primary' as const },
  completed: { label: '已完成', color: 'success' as const },
  cancelled: { label: '已取消', color: 'danger' as const },
};

const priorityConfig = {
  low: { label: '低', color: 'default' as const },
  normal: { label: '普通', color: 'primary' as const },
  high: { label: '高', color: 'warning' as const },
  urgent: { label: '紧急', color: 'danger' as const },
};

export function TaskList({ tasks, loading }: TaskListProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
        <Flag size={48} className="mb-3" />
        <p>暂无任务</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => {
        const status = statusConfig[task.status];
        const priority = priorityConfig[task.priority];

        return (
          <Card 
            key={task.id} 
            className="card-hover border-none shadow-sm"
          >
            <CardBody className="p-4">
              <div className="flex items-start justify-between gap-4 mb-2">
                <h4 className="font-medium text-gray-800">{task.name}</h4>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Chip size="sm" color={priority.color} variant="dot">
                    {priority.label}
                  </Chip>
                  <Chip size="sm" color={status.color} variant="flat">
                    {status.label}
                  </Chip>
                </div>
              </div>
              {task.description && (
                <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                  {task.description}
                </p>
              )}
              <div className="flex items-center justify-between text-xs text-gray-400">
                <div className="flex items-center gap-1">
                  <User size={12} />
                  <span>{task.assigned_to_name || '未分配'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={12} />
                  <span>{new Date(task.created_at).toLocaleString('zh-CN')}</span>
                </div>
              </div>
            </CardBody>
          </Card>
        );
      })}
    </div>
  );
}
