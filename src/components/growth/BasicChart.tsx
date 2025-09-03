'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { TrendingUp, Heart, Calendar, Target, Activity, Users } from 'lucide-react';
import { GrowthMetrics, ChartDataPoint } from '@/lib/chart-data';
import { cn } from '@/lib/utils';

interface BasicChartProps {
  data: GrowthMetrics;
  className?: string;
}

interface SimpleBarChartProps {
  data: ChartDataPoint[];
  height?: number;
  color?: string;
  label?: string;
}

function SimpleBarChart({ data, height = 120, color = 'bg-pink-500', label }: SimpleBarChartProps) {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className="relative" style={{ height }}>
      <div className="flex items-end justify-between h-full gap-1">
        {data.map((point, index) => {
          const barHeight = (point.value / maxValue) * 100;
          
          return (
            <motion.div
              key={index}
              className="relative flex-1 flex flex-col items-center justify-end"
              initial={{ height: 0 }}
              animate={{ height: '100%' }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
            >
              <div className="relative w-full h-full flex items-end">
                <motion.div
                  className={cn('w-full rounded-t-md', color)}
                  initial={{ height: 0 }}
                  animate={{ height: `${barHeight}%` }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                >
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 whitespace-nowrap">
                    {point.value > 0 && Math.round(point.value)}
                  </div>
                </motion.div>
              </div>
              <div className="text-[10px] text-gray-500 mt-1 truncate max-w-full">
                {point.date.split(' ')[1] || point.date}
              </div>
            </motion.div>
          );
        })}
      </div>
      {label && (
        <div className="text-xs text-gray-500 text-center mt-2">{label}</div>
      )}
    </div>
  );
}

interface SimpleLineChartProps {
  data: ChartDataPoint[];
  height?: number;
  color?: string;
  label?: string;
}

function SimpleLineChart({ data, height = 120, color = '#ec4899', label }: SimpleLineChartProps) {
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;
  
  const points = data.map((point, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((point.value - minValue) / range) * 100;
    return `${x},${y}`;
  });
  
  const pathData = `M ${points.join(' L ')}`;
  
  return (
    <div className="relative" style={{ height }}>
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0.05} />
          </linearGradient>
        </defs>
        
        <motion.path
          d={`${pathData} L 100,100 L 0,100 Z`}
          fill="url(#gradient)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
        
        <motion.path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1 }}
        />
        
        {data.map((point, index) => {
          const x = (index / (data.length - 1)) * 100;
          const y = 100 - ((point.value - minValue) / range) * 100;
          
          return (
            <motion.circle
              key={index}
              cx={x}
              cy={y}
              r="2"
              fill={color}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            />
          );
        })}
      </svg>
      
      <div className="flex justify-between mt-2">
        <span className="text-xs text-gray-500">{data[0]?.date}</span>
        <span className="text-xs text-gray-500">{data[data.length - 1]?.date}</span>
      </div>
      
      {label && (
        <div className="text-xs text-gray-500 text-center mt-2">{label}</div>
      )}
    </div>
  );
}

interface CategoryBarProps {
  category: string;
  count: number;
  percentage: number;
  index: number;
}

function CategoryBar({ category, count, percentage, index }: CategoryBarProps) {
  return (
    <motion.div
      className="flex items-center gap-3"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-gray-700">{category}</span>
          <span className="text-xs text-gray-500">{count} times</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-pink-400 to-pink-500 h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          />
        </div>
      </div>
      <span className="text-sm font-semibold text-gray-700 w-10 text-right">
        {percentage}%
      </span>
    </motion.div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  delay?: number;
}

function StatCard({ icon, label, value, trend, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="p-2 bg-pink-50 rounded-lg text-pink-500">
          {icon}
        </div>
        {trend && (
          <div className={cn(
            'text-xs px-2 py-1 rounded-full',
            trend === 'up' && 'bg-green-50 text-green-600',
            trend === 'down' && 'bg-red-50 text-red-600',
            trend === 'neutral' && 'bg-gray-50 text-gray-600'
          )}>
            {trend === 'up' && '↑'}
            {trend === 'down' && '↓'}
            {trend === 'neutral' && '→'}
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-800">{value}</div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </motion.div>
  );
}

export function BasicChart({ data, className }: BasicChartProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={<Target size={20} />}
          label="Completion Rate"
          value={`${data.completionRate}%`}
          trend="up"
          delay={0}
        />
        <StatCard
          icon={<Heart size={20} />}
          label="Avg Mood"
          value={data.averageMood.toFixed(1)}
          trend="up"
          delay={0.1}
        />
        <StatCard
          icon={<Calendar size={20} />}
          label="Total Check-ins"
          value={data.totalCheckIns}
          trend="neutral"
          delay={0.2}
        />
        <StatCard
          icon={<Activity size={20} />}
          label="Current Streak"
          value={`${data.currentStreak}d`}
          trend="up"
          delay={0.3}
        />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-pink-500" />
            Check-in Frequency
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SimpleBarChart
            data={data.checkInFrequency.slice(-14)}
            color="bg-gradient-to-t from-pink-500 to-pink-400"
            label="Daily check-in completion (%)"
          />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-500" />
            Mood Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SimpleLineChart
            data={data.moodTrend.slice(-14)}
            color="#ec4899"
            label="Average daily mood (1-5)"
          />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-pink-500" />
            Discussion Topics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.categoryDistribution.map((cat, index) => (
              <CategoryBar
                key={cat.category}
                category={cat.category}
                count={cat.count}
                percentage={cat.percentage}
                index={index}
              />
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-pink-500" />
            Weekly Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SimpleBarChart
            data={data.weeklyActivity}
            color="bg-gradient-to-t from-purple-500 to-purple-400"
            height={100}
            label="Check-ins per week"
          />
        </CardContent>
      </Card>
    </div>
  );
}