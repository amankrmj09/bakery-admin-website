import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardStats, fetchOrders } from '../store/slices/dashboardSlice';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Users, ShoppingCart, CreditCard, TrendingUp, LayoutDashboard } from 'lucide-react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Badge } from '../components/ui/Badge';
import { cn } from '../lib/utils';
import { useScrollTop } from '../hooks/useScrollTop';

export default function Dashboard() {
  const dispatch = useDispatch();
  const isScrolled = useScrollTop();
  const [timeframe, setTimeframe] = useState('1m');
  const { stats } = useSelector((state) => state.dashboard);
  const { data: ordersData } = useSelector((state) => state.dashboard.orders);

  useEffect(() => {
    dispatch(fetchDashboardStats(timeframe));
  }, [dispatch, timeframe]);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  const calculateGrowth = () => {
    if (stats.growthRate !== undefined) {
      const growth = stats.growthRate;
      return `${growth > 0 ? '+' : ''}${growth.toFixed(1)}%`;
    }
    return '0.0%';
  };

  const chartData = stats.chartData && stats.chartData.length > 0 ? stats.chartData : [
    { name: 'No Data', revenue: 0 }
  ];

  const recentOrders = [...(ordersData || [])]
    .sort((a, b) => new Date(b.orderDate || b.createdAt || 0) - new Date(a.orderDate || a.createdAt || 0))
    .slice(0, 5);

  const getStatusBadgeVariant = (status) => {
    const s = (status || '').toUpperCase();
    if (['COMPLETED', 'DELIVERED', 'SUCCESS'].includes(s)) return 'success';
    if (['PENDING', 'PROCESSING'].includes(s)) return 'warning';
    if (['CANCELLED', 'FAILED', 'DECLINED'].includes(s)) return 'destructive';
    return 'default';
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers || '0',
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    {
      title: 'Active Orders',
      value: stats.activeOrders || '0',
      icon: ShoppingCart,
      color: 'text-orange-600',
      bg: 'bg-orange-100',
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue?.toFixed(2) || '0.00'}`,
      icon: CreditCard,
      color: 'text-emerald-600',
      bg: 'bg-emerald-100',
    },
    {
      title: 'Growth',
      value: calculateGrowth(),
      icon: TrendingUp,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
      isGrowthCard: true,
    },
  ];

  return (
    <div className="flex flex-col min-h-full gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full pb-8">
      <div className={cn(
        "sticky top-0 z-30 flex justify-between items-center flex-wrap gap-4 transition-all duration-300",
        isScrolled 
          ? "bg-[var(--bg-panel)]/80 backdrop-blur-xl border border-[var(--border-color)] shadow-md rounded-2xl px-6 py-4 mt-2" 
          : "bg-transparent border-transparent py-2"
      )}>
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-main)] mb-1 flex items-center gap-2">
            <LayoutDashboard className="text-[var(--color-primary)] h-6 w-6" />
            Dashboard Overview
          </h1>
          <p className="text-[var(--text-muted)] text-sm">Here's what's happening in your bakery today.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                {stat.isGrowthCard ? (
                  <div className="absolute top-4 right-4 flex items-center bg-muted rounded-lg p-0.5 border border-border text-xs">
                    <button
                      onClick={() => setTimeframe('7d')}
                      className={`px-2 py-1 rounded-md transition-colors ${timeframe === '7d' ? 'bg-background shadow text-foreground font-semibold' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      7D
                    </button>
                    <button
                      onClick={() => setTimeframe('1m')}
                      className={`px-2 py-1 rounded-md transition-colors ${timeframe === '1m' ? 'bg-background shadow text-foreground font-semibold' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      1M
                    </button>
                  </div>
                ) : (
                  <div className={`p-2 rounded-full ${stat.bg}`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                {stat.isGrowthCard && (
                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    <TrendingUp className={`mr-1 h-3 w-3 ${stat.color}`} />
                    vs last {timeframe === '7d' ? '7 days' : 'month'}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts / Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="col-span-3 overflow-hidden">
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
          </CardHeader>
          <CardContent className="h-80 overflow-y-auto">
            <div className="space-y-4 w-full">
              {recentOrders.length > 0 ? recentOrders.map((order, i) => (
                <div key={order.id || i} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium">Order #{order.id?.toString().substring(0,8) || 'N/A'}</p>
                    <p className="text-xs text-muted-foreground">{new Date(order.createdAt || order.orderDate || new Date()).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">${order.totalAmount?.toFixed(2) || '0.00'}</p>
                    <Badge variant={getStatusBadgeVariant(order.status)} className="mt-1 text-[10px]">
                      {order.status || 'PENDING'}
                    </Badge>
                  </div>
                </div>
              )) : (
                <div className="text-center text-sm text-muted-foreground mt-4">No recent orders found.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
