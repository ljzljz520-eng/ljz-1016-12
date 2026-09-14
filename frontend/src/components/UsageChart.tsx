'use client';

import { Card, CardBody, CardHeader } from '@heroui/react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

interface UsageChartProps {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
}

// 模拟时序数据
const generateTimeSeriesData = () => {
  const now = new Date();
  return Array.from({ length: 24 }, (_, i) => {
    const time = new Date(now.getTime() - (23 - i) * 3600000);
    return {
      time: `${time.getHours()}:00`,
      cpu: Math.random() * 30 + 30,
      memory: Math.random() * 20 + 50,
    };
  });
};

const COLORS = ['#006FEE', '#17c964', '#f5a524'];

export function UsageChart({ cpuUsage, memoryUsage, diskUsage }: UsageChartProps) {
  const timeSeriesData = generateTimeSeriesData();
  
  const pieData = [
    { name: 'CPU', value: cpuUsage },
    { name: '内存', value: memoryUsage },
    { name: '磁盘', value: diskUsage },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 时序图表 */}
      <Card className="border-none shadow-sm">
        <CardHeader className="pb-0">
          <h3 className="text-lg font-semibold text-gray-800">资源使用趋势</h3>
        </CardHeader>
        <CardBody>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeriesData}>
                <defs>
                  <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#006FEE" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#006FEE" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorMemory" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#17c964" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#17c964" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="time" 
                  stroke="#9ca3af" 
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#9ca3af" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                  formatter={(value: number) => [`${value.toFixed(1)}%`]}
                />
                <Area
                  type="monotone"
                  dataKey="cpu"
                  stroke="#006FEE"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorCpu)"
                  name="CPU"
                />
                <Area
                  type="monotone"
                  dataKey="memory"
                  stroke="#17c964"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorMemory)"
                  name="内存"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardBody>
      </Card>

      {/* 饼图 */}
      <Card className="border-none shadow-sm">
        <CardHeader className="pb-0">
          <h3 className="text-lg font-semibold text-gray-800">平均资源占用</h3>
        </CardHeader>
        <CardBody>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                  labelLine={false}
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`${value.toFixed(1)}%`]}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Legend 
                  verticalAlign="bottom"
                  formatter={(value) => <span className="text-gray-600">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
