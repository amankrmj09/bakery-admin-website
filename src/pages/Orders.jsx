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
import SleekDropdown from '../components/ui/SleekDropdown';
import { Package, Truck, CheckCircle2, Clock, XCircle, Search, Eye, Download, SearchX, Coffee, ShoppingCart } from 'lucide-react';
import Pagination from '../components/shared/Pagination';
import TopSearchBar from '../components/shared/TopSearchBar';

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
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('Loading...');
  const [paymentId, setPaymentId] = useState(null);

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
    setPaymentId(null);
    try {
      const response = await api.get(`/api/payments/order/${order.id}`);
      setPaymentStatus(response.data.status);
      setPaymentId(response.data.id);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setPaymentStatus('Not Paid');
      } else {
        setPaymentStatus('Error');
      }
    }
  };

  const handlePaymentStatusChange = async (newStatus) => {
    if (!paymentId) return;
    try {
      await api.patch(`/api/payments/${paymentId}/status`, { status: newStatus });
      setPaymentStatus(newStatus);
      toast.success(`Payment status updated to ${newStatus}`);
    } catch (error) {
      console.error("Failed to update payment status:", error);
      toast.error("Failed to update payment status.");
    }
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
            <div className="mt-6 flex flex-col gap-4 border-t border-border pt-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <label className="text-sm font-medium text-foreground w-32">Update Status:</label>
                  <SleekDropdown 
                    widthClass="w-48"
                    value={selectedOrder.status}
                    onChange={(val) => {
                      handleStatusChange(selectedOrder.id, val);
                      setSelectedOrder({...selectedOrder, status: val});
                    }}
                    options={[
                      { value: "PENDING", label: "Pending" },
                      { value: "CONFIRMED", label: "Confirmed" },
                      { value: "PREPARING", label: "Preparing" },
                      { value: "READY", label: "Ready" },
                      { value: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
                      { value: "DELIVERED", label: "Delivered / Completed" },
                      { value: "CANCELLED", label: "Cancelled" },
                    ]}
                  />
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
              
              {paymentId && (
                <div className="flex items-center space-x-3">
                  <label className="text-sm font-medium text-foreground w-32">Update Payment:</label>
                  <SleekDropdown 
                    widthClass="w-48"
                    value={paymentStatus}
                    onChange={(val) => handlePaymentStatusChange(val)}
                    options={[
                      { value: "PENDING", label: "Pending" },
                      { value: "PROCESSING", label: "Processing" },
                      { value: "COMPLETED", label: "Completed" },
                      { value: "FAILED", label: "Failed" },
                      { value: "CANCELLED", label: "Cancelled" },
                      { value: "REFUNDED", label: "Refunded" },
                    ]}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
