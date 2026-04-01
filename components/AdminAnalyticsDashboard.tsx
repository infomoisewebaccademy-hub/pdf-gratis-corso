import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../services/supabase';
import { Course } from '../types';
import { Users, Download, TrendingUp, CheckCircle, BarChart3, DollarSign, Loader2, Calendar } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, Cell, PieChart, Pie
} from 'recharts';
import { subDays, isAfter, format, parseISO, startOfDay } from 'date-fns';
import { it } from 'date-fns/locale';

interface AdminAnalyticsDashboardProps {
  courses: Course[];
}

type TimeRange = '7d' | '30d' | '90d' | 'all';

export const AdminAnalyticsDashboard: React.FC<AdminAnalyticsDashboardProps> = ({ courses }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [isMounted, setIsMounted] = useState(false);
  
  const [rawData, setRawData] = useState<{
    purchases: any[];
    progress: any[];
  }>({ purchases: [], progress: [] });

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 100);
    fetchRawData();
    return () => clearTimeout(timer);
  }, []);

  const fetchRawData = async () => {
    setIsLoading(true);
    try {
      const { data: purchases, error: purchasesError } = await supabase
        .from('purchases')
        .select('user_id, course_id, created_at');
      
      if (purchasesError) throw purchasesError;

      const { data: progressData, error: progressError } = await supabase
        .from('lesson_progress')
        .select('user_id, course_id, completed, updated_at')
        .eq('completed', true);
        
      if (progressError) throw progressError;

      setRawData({
        purchases: purchases || [],
        progress: progressData || []
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    const now = new Date();
    let startDate: Date | null = null;

    if (timeRange === '7d') startDate = subDays(now, 7);
    else if (timeRange === '30d') startDate = subDays(now, 30);
    else if (timeRange === '90d') startDate = subDays(now, 90);

    const filteredPurchases = startDate 
      ? rawData.purchases.filter(p => p.created_at && isAfter(parseISO(p.created_at), startDate!))
      : rawData.purchases;

    const filteredProgress = startDate
      ? rawData.progress.filter(p => p.updated_at && isAfter(parseISO(p.updated_at), startDate!))
      : rawData.progress;

    return { purchases: filteredPurchases, progress: filteredProgress };
  }, [rawData, timeRange]);

  const stats = useMemo(() => {
    const { purchases, progress } = filteredData;
    const pdfCourseId = 'course_pdf_guide_free';

    const uniqueUsers = new Set(purchases.map(p => p.user_id));
    const pdfDownloads = purchases.filter(p => p.course_id === pdfCourseId);
    const pdfUserIds = new Set(pdfDownloads.map(p => p.user_id));

    let upsellCount = 0;
    let totalRev = 0;
    
    const userPurchases = new Map<string, string[]>();
    purchases.forEach(p => {
      if (!userPurchases.has(p.user_id)) {
        userPurchases.set(p.user_id, []);
      }
      userPurchases.get(p.user_id)!.push(p.course_id);
    });

    userPurchases.forEach((userCourseIds) => {
      const hasPdf = userCourseIds.includes(pdfCourseId);
      const paidCourses = userCourseIds.filter(id => id !== pdfCourseId);
      
      if (hasPdf && paidCourses.length > 0) {
        upsellCount++;
      }

      paidCourses.forEach(courseId => {
        const course = courses.find(c => c.id === courseId);
        if (course) {
          totalRev += (course.discounted_price || course.price || 0);
        }
      });
    });

    let completions = 0;
    const userProgress = new Map<string, Map<string, number>>(); 
    
    progress.forEach(p => {
      if (!userProgress.has(p.user_id)) {
        userProgress.set(p.user_id, new Map());
      }
      const courseMap = userProgress.get(p.user_id)!;
      courseMap.set(p.course_id, (courseMap.get(p.course_id) || 0) + 1);
    });

    userProgress.forEach((courseMap) => {
      courseMap.forEach((completedCount, courseId) => {
        const course = courses.find(c => c.id === courseId);
        if (course) {
          const totalLessons = course.lessons_content?.length || course.lessons || 1;
          if (completedCount >= totalLessons) {
            completions++;
          }
        }
      });
    });

    return {
      totalPdfDownloads: pdfUserIds.size,
      upsellPurchases: upsellCount,
      courseCompletions: completions,
      totalRevenue: totalRev,
      totalUsers: uniqueUsers.size,
    };
  }, [filteredData, courses]);

  const chartData = useMemo(() => {
    const { purchases } = filteredData;
    const dailyData = new Map<string, { date: string, revenue: number, users: number }>();
    
    purchases.forEach(p => {
      if (!p.created_at) return;
      const dateStr = format(startOfDay(parseISO(p.created_at)), 'dd MMM', { locale: it });
      
      if (!dailyData.has(dateStr)) {
        dailyData.set(dateStr, { date: dateStr, revenue: 0, users: 0 });
      }
      
      const day = dailyData.get(dateStr)!;
      day.users += 1;
      
      const course = courses.find(c => c.id === p.course_id);
      if (course && p.course_id !== 'course_pdf_guide_free') {
        day.revenue += (course.discounted_price || course.price || 0);
      }
    });

    return Array.from(dailyData.values()).sort((a, b) => {
      // Simple sort, assuming data is within a year for display
      return 0; // In a real app, sort by actual date object
    });
  }, [filteredData, courses]);

  const coursePopularityData = useMemo(() => {
    const { purchases } = filteredData;
    const counts = new Map<string, number>();
    
    purchases.forEach(p => {
      if (p.course_id !== 'course_pdf_guide_free') {
        counts.set(p.course_id, (counts.get(p.course_id) || 0) + 1);
      }
    });

    return Array.from(counts.entries()).map(([id, count]) => {
      const course = courses.find(c => c.id === id);
      return {
        name: course?.title.substring(0, 15) + '...' || 'Sconosciuto',
        value: count
      };
    }).sort((a, b) => b.value - a.value).slice(0, 5);
  }, [filteredData, courses]);

  const COLORS = ['#0ea5e9', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-gray-500" />
          <span className="font-medium text-gray-700">Periodo di analisi:</span>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl">
          {(['7d', '30d', '90d', 'all'] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                timeRange === range 
                  ? 'bg-white text-brand-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {range === '7d' ? '7 Giorni' : range === '30d' ? '30 Giorni' : range === '90d' ? '3 Mesi' : 'Sempre'}
            </button>
          ))}
        </div>
        <button onClick={fetchRawData} className="p-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 ml-auto sm:ml-0">
          <BarChart3 className="h-5 w-5" />
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-white to-blue-50/50 rounded-2xl p-6 border border-blue-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-100/50 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500 text-white rounded-xl shadow-inner shadow-blue-600/50">
                <Download className="h-6 w-6" />
              </div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Lead Magnet</span>
            </div>
            <h3 className="text-4xl font-black text-gray-900 mb-1 tracking-tight">{stats.totalPdfDownloads}</h3>
            <p className="text-blue-600/80 font-medium text-sm">Download PDF Gratuito</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-green-50/50 rounded-2xl p-6 border border-green-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-green-100/50 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500 text-white rounded-xl shadow-inner shadow-green-600/50">
                <TrendingUp className="h-6 w-6" />
              </div>
              <span className="text-xs font-bold text-green-600 uppercase tracking-wider">Conversione</span>
            </div>
            <h3 className="text-4xl font-black text-gray-900 mb-1 tracking-tight">{stats.upsellPurchases}</h3>
            <p className="text-green-600/80 font-medium text-sm">Acquisti da Upsell PDF</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-emerald-50/50 rounded-2xl p-6 border border-emerald-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-100/50 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-500 text-white rounded-xl shadow-inner shadow-emerald-600/50">
                <DollarSign className="h-6 w-6" />
              </div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Fatturato</span>
            </div>
            <h3 className="text-4xl font-black text-gray-900 mb-1 tracking-tight">€{stats.totalRevenue.toLocaleString('it-IT')}</h3>
            <p className="text-emerald-600/80 font-medium text-sm">Ricavi Totali (Stima)</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm lg:col-span-2">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Andamento Fatturato</h3>
          <div className="h-72 w-full" style={{ minWidth: 0, minHeight: '288px' }}>
            {isMounted && (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={50}>
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} tickFormatter={(value) => `€${value}`} dx={-10} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                    formatter={(value: number) => [`€${value}`, 'Fatturato']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Popular Courses Pie Chart */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Corsi più venduti</h3>
          <div className="h-72 w-full flex items-center justify-center" style={{ minWidth: 0, minHeight: '288px' }}>
            {coursePopularityData.length > 0 && isMounted ? (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={50}>
                <PieChart>
                  <Pie
                    data={coursePopularityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {coursePopularityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-gray-400 text-sm flex flex-col items-center">
                <BarChart3 className="h-8 w-8 mb-2 opacity-50" />
                Nessun dato disponibile
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="p-4 bg-orange-50 rounded-2xl text-orange-600">
                <Users className="h-8 w-8" />
            </div>
            <div>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Nuovi Utenti</p>
                <h4 className="text-2xl font-black text-gray-900">{stats.totalUsers}</h4>
            </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="p-4 bg-purple-50 rounded-2xl text-purple-600">
                <CheckCircle className="h-8 w-8" />
            </div>
            <div>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Corsi Completati</p>
                <h4 className="text-2xl font-black text-gray-900">{stats.courseCompletions}</h4>
            </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="p-4 bg-brand-50 rounded-2xl text-brand-600">
                <BarChart3 className="h-8 w-8" />
            </div>
            <div>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Tasso Conv. PDF</p>
                <h4 className="text-2xl font-black text-gray-900">
                    {stats.totalPdfDownloads > 0 ? Math.round((stats.upsellPurchases / stats.totalPdfDownloads) * 100) : 0}%
                </h4>
            </div>
        </div>
      </div>
    </div>
  );
};
