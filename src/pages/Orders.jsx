import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders, updateOrderStatus, cancelOrder } from '../store/slices/dashboardSlice';
import { Card, CardContent } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { toast } from 'sonner';
import api from '../api/axiosConfig';
import { cn } from '../lib/utils';
import { useScrollTop } from '../hooks/useScrollTop';
import { Select } from '../components/ui/Select';
import { Package, Truck, CheckCircle2, Clock, XCircle, Search, Eye, Download, SearchX, Coffee, ShoppingCart } from 'lucide-react';

export default function Orders() {
  const dispatch = useDispatch();
  const isScrolled = useScrollTop();
  const { data: orders, totalElements, loading } = useSelector((state) => state.dashboard.orders);

  const [page, setPage] = useState(0);
  const ITEMS_PER_PAGE = 10;
  
  useEffect(() => {
    dispatch(fetchOrders({ page, size: ITEMS_PER_PAGE }));
  }, [dispatch, page]);
  
  const totalPages = Math.ceil((totalElements || orders?.length || 0) / ITEMS_PER_PAGE);
  const paginatedOrders = orders || [];

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('Loading...');

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

  const handleViewClick = async (order) => {
    setSelectedOrder(order);
    setIsViewModalOpen(true);
    setPaymentStatus('Loading...');
    try {
      const response = await api.get(`/api/payments/order/${order.id}`);
      setPaymentStatus(response.data.status);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setPaymentStatus('Not Paid');
      } else {
        setPaymentStatus('Error');
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
      case 'DELIVERED':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'CANCELLED':
        return 'destructive';
      case 'CONFIRMED':
      case 'IN_PROGRESS':
        return 'default';
      default:
        return 'secondary';
    }
  };

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
            <ShoppingCart className="text-[var(--color-primary)] h-6 w-6" />
            Orders
          </h1>
          <p className="text-[var(--text-muted)] text-sm">Monitor and manage customer orders.</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading && orders.length === 0 ? (
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
                {paginatedOrders?.length > 0 ? (
                  paginatedOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium text-muted-foreground">{order.orderNumber || order.id.slice(0,8)}</TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>${order.totalAmount}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadge(order.status)}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        {order.status === 'PENDING' && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleStatusChange(order.id, 'CONFIRMED')}
                            >
                              Confirm
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              className="bg-red-500/10 text-red-500 hover:bg-red-500/20"
                              onClick={() => handleDecline(order.id)}
                            >
                              Decline
                            </Button>
                          </>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => handleViewClick(order)}>
                          View
                        </Button>
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
        {orders?.length > ITEMS_PER_PAGE && (
          <div className="flex justify-between items-center p-4 border-t border-[var(--border-color)]/50 bg-[var(--bg-panel-hover)]/30">
            <span className="text-sm text-[var(--text-muted)]">
              Showing Page <span className="font-medium text-[var(--text-main)]">{page + 1}</span> of <span className="font-medium text-[var(--text-main)]">{totalPages || 1}</span>
            </span>
            <div className="flex gap-2">
              <button 
                disabled={page === 0} 
                onClick={() => setPage(p => p - 1)}
                className="text-sm px-3 py-1.5 rounded-lg border border-[var(--border-color)] hover:bg-[var(--bg-panel-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button 
                disabled={page >= totalPages - 1} 
                onClick={() => setPage(p => p + 1)}
                className="text-sm px-3 py-1.5 rounded-lg border border-[var(--border-color)] hover:bg-[var(--bg-panel-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </Card>

      <Modal 
        isOpen={isViewModalOpen} 
        onClose={() => setIsViewModalOpen(false)} 
        title={`Order Details`}
        maxWidth="max-w-3xl"
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Header Info */}
            <div className="flex justify-between items-start border-b border-border pb-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Order Number</h4>
                <p className="font-semibold text-lg text-foreground">{selectedOrder.orderNumber || selectedOrder.id}</p>
              </div>
              <div className="text-right">
                <Badge variant={getStatusBadge(selectedOrder.status)} className="mb-1 block w-fit ml-auto">
                  Order: {selectedOrder.status}
                </Badge>
                <Badge 
                  variant={
                    paymentStatus === 'COMPLETED' ? 'success' : 
                    paymentStatus === 'PENDING' ? 'warning' : 
                    paymentStatus === 'FAILED' ? 'destructive' : 'secondary'
                  } 
                  className="mb-1 block w-fit ml-auto"
                >
                  Payment: {paymentStatus}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Customer Details */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-muted-foreground mb-1">Customer Info</h4>
                <p className="text-foreground">{selectedOrder.customerName}</p>
                <p className="text-foreground">{selectedOrder.customerEmail}</p>
                <p className="text-foreground">{selectedOrder.customerPhone || 'N/A'}</p>
              </div>
              <div>
                <h4 className="font-medium text-muted-foreground mb-1">Delivery Details</h4>
                <p className="text-foreground capitalize">{selectedOrder.deliveryType?.toLowerCase() || 'N/A'}</p>
                {selectedOrder.deliveryAddress && (
                  <p className="text-foreground truncate">{selectedOrder.deliveryAddress}</p>
                )}
                {selectedOrder.deliveryDate && (
                  <p className="text-foreground">On: {new Date(selectedOrder.deliveryDate).toLocaleString()}</p>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h4 className="font-medium text-muted-foreground mb-3 text-sm">Order Items</h4>
              <div className="bg-muted/30 rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      <TableHead className="py-2 h-auto text-xs">Item</TableHead>
                      <TableHead className="py-2 h-auto text-xs text-center">Qty</TableHead>
                      <TableHead className="py-2 h-auto text-xs text-right">Price</TableHead>
                      <TableHead className="py-2 h-auto text-xs text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOrder.items?.map((item, index) => (
                      <TableRow key={item.id || index}>
                        <TableCell className="py-2 text-sm text-foreground">
                          {item.productName}
                          {item.specialInstructions && (
                            <p className="text-xs text-muted-foreground italic mt-0.5">Note: {item.specialInstructions}</p>
                          )}
                        </TableCell>
                        <TableCell className="py-2 text-sm text-center text-foreground">{item.quantity}</TableCell>
                        <TableCell className="py-2 text-sm text-right text-foreground">${item.unitPrice}</TableCell>
                        <TableCell className="py-2 text-sm text-right font-medium text-foreground">${item.subtotal}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Summary */}
            <div className="flex justify-end pt-4 border-t border-border">
              <div className="w-48 space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal:</span>
                  <span>${selectedOrder.subtotal || 0}</span>
                </div>
                {selectedOrder.taxAmount > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tax:</span>
                    <span>${selectedOrder.taxAmount}</span>
                  </div>
                )}
                {selectedOrder.deliveryFee > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Delivery Fee:</span>
                    <span>${selectedOrder.deliveryFee}</span>
                  </div>
                )}
                {selectedOrder.discountAmount > 0 && (
                  <div className="flex justify-between text-green-500">
                    <span>Discount:</span>
                    <span>-${selectedOrder.discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-base text-foreground pt-2 border-t border-border">
                  <span>Total:</span>
                  <span>${selectedOrder.totalAmount}</span>
                </div>
              </div>
            </div>

            {/* Special Instructions */}
            {selectedOrder.specialInstructions && (
              <div className="mt-4 p-3 bg-muted/50 rounded-lg border border-border">
                <h4 className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Order Notes</h4>
                <p className="text-sm text-foreground">{selectedOrder.specialInstructions}</p>
              </div>
            )}

            {/* Admin Actions */}
            <div className="mt-6 flex justify-between items-center border-t border-border pt-4">
              <div className="flex items-center space-x-3">
                <label className="text-sm font-medium text-foreground">Update Status:</label>
                <Select 
                  className="w-48"
                  value={selectedOrder.status}
                  onChange={(e) => {
                    handleStatusChange(selectedOrder.id, e.target.value);
                    setSelectedOrder({...selectedOrder, status: e.target.value});
                  }}
                >
                  <option value="PENDING">Pending</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="PREPARING">Preparing</option>
                  <option value="READY">Ready</option>
                  <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                  <option value="DELIVERED">Delivered / Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </Select>
              </div>
              {selectedOrder.status !== 'CANCELLED' && (
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => {
                    handleDecline(selectedOrder.id);
                    setIsViewModalOpen(false);
                  }}
                >
                  Cancel Order
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
