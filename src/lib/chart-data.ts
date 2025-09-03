import { CheckIn } from '@/types';
import { startOfWeek, endOfWeek, eachDayOfInterval, format, subWeeks, isWithinInterval } from 'date-fns';

export interface ChartDataPoint {
  date: string;
  value: number;
  label: string;
}

export interface GrowthMetrics {
  checkInFrequency: ChartDataPoint[];
  moodTrend: ChartDataPoint[];
  categoryDistribution: { category: string; count: number; percentage: number }[];
  weeklyActivity: ChartDataPoint[];
  completionRate: number;
  averageMood: number;
  totalCheckIns: number;
  currentStreak: number;
}

export function generateMockChartData(): GrowthMetrics {
  const now = new Date();
  const fourWeeksAgo = subWeeks(now, 4);
  const days = eachDayOfInterval({ start: fourWeeksAgo, end: now });
  
  const checkInFrequency = days.map((date, index) => {
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const baseValue = isWeekend ? 0.8 : 0.6;
    const variation = Math.random() * 0.4;
    const trend = index / days.length * 0.2;
    
    return {
      date: format(date, 'MMM dd'),
      value: Math.min(1, baseValue + variation + trend) * 100,
      label: format(date, 'EEEE')
    };
  });
  
  const moodTrend = days.map((date, index) => {
    const baseValue = 3.5;
    const variation = (Math.sin(index / 3) + Math.random() - 0.5) * 0.5;
    const trend = index / days.length * 0.5;
    
    return {
      date: format(date, 'MMM dd'),
      value: Math.min(5, Math.max(1, baseValue + variation + trend)),
      label: format(date, 'EEEE')
    };
  });
  
  const categories = [
    { category: 'Communication', count: 12, percentage: 25 },
    { category: 'Quality Time', count: 10, percentage: 21 },
    { category: 'Intimacy', count: 8, percentage: 17 },
    { category: 'Goals', count: 7, percentage: 15 },
    { category: 'Finances', count: 5, percentage: 10 },
    { category: 'Family', count: 6, percentage: 12 }
  ];
  
  const weeklyActivity = Array.from({ length: 4 }, (_, weekIndex) => {
    const weekStart = subWeeks(now, 3 - weekIndex);
    const checkIns = Math.floor(Math.random() * 3 + 2);
    
    return {
      date: `Week ${weekIndex + 1}`,
      value: checkIns,
      label: format(weekStart, 'MMM dd')
    };
  });
  
  return {
    checkInFrequency,
    moodTrend,
    categoryDistribution: categories,
    weeklyActivity,
    completionRate: 78,
    averageMood: 3.8,
    totalCheckIns: 48,
    currentStreak: 7
  };
}

export function calculateGrowthMetrics(checkIns: CheckIn[]): GrowthMetrics {
  const now = new Date();
  const fourWeeksAgo = subWeeks(now, 4);
  const days = eachDayOfInterval({ start: fourWeeksAgo, end: now });
  
  const recentCheckIns = checkIns.filter(checkIn => 
    isWithinInterval(new Date(checkIn.startedAt), { start: fourWeeksAgo, end: now })
  );
  
  const checkInsByDay = new Map<string, number>();
  const moodByDay = new Map<string, number[]>();
  const categoryCount = new Map<string, number>();
  
  recentCheckIns.forEach(checkIn => {
    const dateKey = format(new Date(checkIn.startedAt), 'yyyy-MM-dd');
    checkInsByDay.set(dateKey, (checkInsByDay.get(dateKey) || 0) + 1);
    
    if (checkIn.mood?.after) {
      const moods = moodByDay.get(dateKey) || [];
      moods.push(checkIn.mood.after);
      moodByDay.set(dateKey, moods);
    }
    
    checkIn.categories.forEach(category => {
      categoryCount.set(category, (categoryCount.get(category) || 0) + 1);
    });
  });
  
  const checkInFrequency = days.map(date => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const hasCheckIn = checkInsByDay.has(dateKey);
    
    return {
      date: format(date, 'MMM dd'),
      value: hasCheckIn ? 100 : 0,
      label: format(date, 'EEEE')
    };
  });
  
  const moodTrend = days.map(date => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const moods = moodByDay.get(dateKey) || [];
    const avgMood = moods.length > 0 
      ? moods.reduce((a, b) => a + b, 0) / moods.length 
      : 0;
    
    return {
      date: format(date, 'MMM dd'),
      value: avgMood,
      label: format(date, 'EEEE')
    };
  });
  
  const totalCategories = Array.from(categoryCount.values()).reduce((a, b) => a + b, 0);
  const categoryDistribution = Array.from(categoryCount.entries())
    .map(([category, count]) => ({
      category,
      count,
      percentage: Math.round((count / totalCategories) * 100)
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
  
  const weeklyActivity = Array.from({ length: 4 }, (_, weekIndex) => {
    const weekStart = startOfWeek(subWeeks(now, 3 - weekIndex));
    const weekEnd = endOfWeek(weekStart);
    
    const weekCheckIns = recentCheckIns.filter(checkIn => 
      isWithinInterval(new Date(checkIn.startedAt), { start: weekStart, end: weekEnd })
    );
    
    return {
      date: `Week ${weekIndex + 1}`,
      value: weekCheckIns.length,
      label: format(weekStart, 'MMM dd')
    };
  });
  
  const completedCheckIns = recentCheckIns.filter(c => c.status === 'completed');
  const completionRate = recentCheckIns.length > 0 
    ? Math.round((completedCheckIns.length / recentCheckIns.length) * 100)
    : 0;
  
  const allMoods = recentCheckIns
    .filter(c => c.mood?.after !== undefined)
    .map(c => c.mood!.after!);
  const averageMood = allMoods.length > 0
    ? Math.round((allMoods.reduce((a, b) => a + b, 0) / allMoods.length) * 10) / 10
    : 0;
  
  let currentStreak = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    const dateKey = format(days[i], 'yyyy-MM-dd');
    if (checkInsByDay.has(dateKey)) {
      currentStreak++;
    } else {
      break;
    }
  }
  
  return {
    checkInFrequency,
    moodTrend,
    categoryDistribution,
    weeklyActivity,
    completionRate,
    averageMood,
    totalCheckIns: checkIns.length,
    currentStreak
  };
}