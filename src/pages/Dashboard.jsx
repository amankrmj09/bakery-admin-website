import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardStats, fetchOrders } from '../store/slices/dashboardSlice';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Users, ShoppingCart, CreditCard, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Badge } from '../components/ui/Badge';

export default function Dashboard() {
  const dispatch = useDispatch();
  const { stats } = useSelector((state) => state.dashboard);
  const { data: ordersData } = useSelector((state) => state.dashboard.orders);

  useEffect(() => {
    dispatch(fetchDashboardStats());
    dispatch(fetchOrders());
  }, [dispatch]);

  const calculateGrowth = () => {
    if (stats.payments?.currentMonth && stats.payments?.lastMonth) {
      const growth = ((stats.payments.currentMonth - stats.payments.lastMonth) / stats.payments.lastMonth) * 100;
      return `${growth > 0 ? '+' : ''}${growth.toFixed(1)}%`;
    }
    return '+12.5%';
  };

  const chartData = [
    { name: 'Jan', revenue: 4000 },
    { name: 'Feb', revenue: 3000 },
    { name: 'Mar', revenue: 5000 },
    { name: 'Apr', revenue: 4500 },
    { name: 'May', revenue: 6000 },
    { name: 'Jun', revenue: 5500 },
  ];

  const recentOrders = [...(ordersData || [])]
    .sort((a, b) => new Date(b.orderDate || b.createdAt || 0) - new Date(a.orderDate || a.createdAt || 0))
    .slice(0, 5);

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
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard Overview</h2>
        <p className="text-muted-foreground">Here's what's happening in your bakery today.</p>
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
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${stat.bg}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
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
                    <Badge variant={order.status === 'COMPLETED' ? 'success' : 'default'} className="mt-1 text-[10px]">
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
