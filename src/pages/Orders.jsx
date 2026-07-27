import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders, updateOrderStatus, cancelOrder } from '../store/slices/dashboardSlice';
import { Card, CardContent } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { toast } from 'sonner';
import { cn } from '../lib/utils';
import { useScrollTop } from '../hooks/useScrollTop';
import { Package, Truck, CheckCircle2, Clock, XCircle, Search, Eye, Download, SearchX, Coffee, ShoppingCart, Check, X } from 'lucide-react';
import Pagination from '../components/shared/Pagination';
import TopSearchBar from '../components/shared/TopSearchBar';
import ActionIconButton from '../components/ui/ActionIconButton';
import { motion, AnimatePresence } from 'framer-motion';
import OrderDetails from './OrderDetails';

export default function Orders() {
  const dispatch = useDispatch();
  const isScrolled = useScrollTop();
  const { data: orders, totalElements, loading } = useSelector((state) => state.dashboard.orders);

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (term) => {
    setSearchTerm(term);
    setPage(0);
  };
  
  useEffect(() => {
    dispatch(fetchOrders({ page, size: pageSize, query: searchTerm }));
  }, [dispatch, page, pageSize, searchTerm]);
  
  const totalPages = Math.ceil((totalElements || orders?.length || 0) / pageSize) || 1;

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await dispatch(updateOrderStatus({ orderId, status: newStatus })).unwrap();
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to confirm order.");
    }
  };

  const handleDecline = async (orderId) => {
    try {
      if (window.confirm("Are you sure you want to decline this order?")) {
        await dispatch(cancelOrder({ orderId, reason: 'Declined by admin' })).unwrap();
        toast.success("Order declined successfully.");
      }
    } catch (error) {
      console.error("Failed to decline order:", error);
      toast.error("Failed to decline order.");
    }
  };

  const handleViewClick = (order) => {
    setSelectedOrder(order);
    setShowDetails(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DELIVERED':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'CANCELLED':
        return 'destructive';
      case 'CONFIRMED':
        return 'info';
      case 'PREPARING':
        return 'purple';
      case 'READY':
        return 'cyan';
      case 'OUT_FOR_DELIVERY':
        return 'indigo';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {!showDetails ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0, transitionEnd: { transform: 'none' } }}
            exit={{ opacity: 0, y: -15, transitionEnd: { transform: 'none' } }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="flex flex-col min-h-full gap-6 w-full pb-8"
          >
            <div className={cn(
              "sticky top-0 z-0 flex justify-between items-center flex-wrap gap-4 transition-all duration-300",
              isScrolled 
                ? "bg-[var(--bg-panel)]/80 backdrop-blur-xl border border-[var(--border-color)] shadow-md rounded-2xl px-6 py-4 mt-2" 
                : "bg-transparent border-transparent py-2"
            )}>
              <div>
                <h1 className="text-3xl font-bold text-[var(--text-main)] mb-1 flex items-center gap-2">
                  <ShoppingCart className="text-[var(--color-primary)] h-6 w-6" />
                  Orders
                </h1>
                <p className="text-[var(--text-muted)] text-sm">Monitor and manage customer orders.</p>
              </div>
              <TopSearchBar onSearch={handleSearch} placeholder="Search order ID or customer..." />
            </div>

            <Card>
              <CardContent className="p-0">
                {loading && orders?.length === 0 ? (
                  <div className="py-6 text-center text-muted-foreground">Loading orders...</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order #</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders?.length > 0 ? (
                        orders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium text-muted-foreground">{order.orderNumber || order.id.slice(0,8)}</TableCell>
                            <TableCell>{order.customerName}</TableCell>
                            <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell>${order.totalAmount}</TableCell>
                            <TableCell>
                              <Badge variant={getStatusBadge(order.status)}>
                                {order.status === 'DELIVERED' && order.deliveryType === 'PICKUP' ? 'PICKED_UP' : order.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right whitespace-nowrap">
                              {order.status === 'PENDING' && (
                                <>
                                  <ActionIconButton icon={Check} onClick={() => handleStatusChange(order.id, 'CONFIRMED')} title="Confirm Order" colorClass="text-green-600 bg-green-50 hover:bg-green-100" />
                                  <ActionIconButton icon={X} onClick={() => handleDecline(order.id)} title="Decline Order" colorClass="text-red-600 bg-red-50 hover:bg-red-100" />
                                </>
                              )}
                              <ActionIconButton icon={Eye} onClick={() => handleViewClick(order)} title="View Details" colorClass="text-blue-600 bg-blue-50 hover:bg-blue-100" />
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                            No orders found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
              {/* Pagination Controls */}
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                totalElements={totalElements || orders?.length || 0}
                pageSize={pageSize}
                onPageChange={setPage}
                onPageSizeChange={(newSize) => { setPageSize(newSize); setPage(0); }}
                loading={loading}
              />
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="details"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0, transitionEnd: { transform: 'none' } }}
            exit={{ opacity: 0, y: -15, transitionEnd: { transform: 'none' } }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="w-full"
          >
            <OrderDetails 
              order={selectedOrder} 
              onClose={() => {
                setShowDetails(false);
                dispatch(fetchOrders({ page, size: pageSize, query: searchTerm }));
              }} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
