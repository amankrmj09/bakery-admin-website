import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { updateOrderStatus, cancelOrder } from '../store/slices/dashboardSlice';
import { Card, CardContent } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import SleekDropdown from '../components/ui/SleekDropdown';
import ActionButton from '../components/ui/ActionButton';
import { Modal } from '../components/ui/Modal';
import { Textarea } from '../components/ui/Textarea';
import { toast } from 'sonner';
import api from '../api/axiosConfig';
import { useScrollTop } from '../hooks/useScrollTop';
import { cn } from '../lib/utils';
import { ArrowLeft, Clock, CreditCard, User, Truck, DollarSign, XCircle, ShoppingBag, Calendar, Mail, Phone, MapPin, ReceiptText, AlertTriangle, Check } from 'lucide-react';

const ADMIN_CANCEL_REASONS = [
  "Items out of stock",
  "Customer requested cancellation",
  "Payment failed / Suspected fraud",
  "Invalid delivery address",
  "Other reason"
];

export default function OrderDetails({ order, onClose }) {
  const dispatch = useDispatch();
  const isScrolled = useScrollTop();

  const [paymentStatus, setPaymentStatus] = useState('Loading...');
  const [paymentId, setPaymentId] = useState(null);
  const [orderStatus, setOrderStatus] = useState(order?.status || 'PENDING');
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(ADMIN_CANCEL_REASONS[0]);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      if (!order?.id) return;
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
    fetchPaymentDetails();
  }, [order]);

  const handleStatusChange = async (newStatus) => {
    if (newStatus === 'CANCELLED') {
      handleDecline();
      return;
    }
    try {
      await dispatch(updateOrderStatus({ orderId: order.id, status: newStatus })).unwrap();
      setOrderStatus(newStatus);
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update order status.");
    }
  };

  const handleDecline = () => {
    setIsCancelModalOpen(true);
    setSelectedPreset(ADMIN_CANCEL_REASONS[0]);
    setCancelReason('');
  };

  const confirmDecline = async () => {
    const finalReason = selectedPreset === "Other reason" && cancelReason.trim()
      ? `Other: ${cancelReason.trim()}`
      : selectedPreset;

    try {
      await dispatch(cancelOrder({ orderId: order.id, reason: finalReason })).unwrap();
      setOrderStatus('CANCELLED');
      setIsCancelModalOpen(false);
      toast.success("Order cancelled successfully.");
    } catch (error) {
      console.error("Failed to cancel order:", error);
      toast.error("Failed to cancel order.");
    }
  };

  const handlePaymentStatusChange = async (newStatus) => {
    try {
      if (paymentId) {
        await api.patch(`/api/payments/${paymentId}/status`, { status: newStatus });
      } else {
        await api.post(`/api/orders/${order.id}/payment-update`, { status: newStatus });
      }
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

  if (!order) return null;

  const isCOD = order.paymentMethod === 'COD' || order.paymentMethod === 'CASH';
  const isPaymentCompleted = paymentStatus === 'COMPLETED';
  const isOrderCancelled = orderStatus === 'CANCELLED';

  let showPaymentDropdown = false;
  let paymentOptions = [];

  if (isCOD && !isPaymentCompleted && !isOrderCancelled) {
    showPaymentDropdown = true;
    paymentOptions = [
      { value: paymentStatus, label: paymentStatus },
      { value: 'COMPLETED', label: 'Completed (Paid)' }
    ];
  } else if (isOrderCancelled && isPaymentCompleted) {
    showPaymentDropdown = true;
    paymentOptions = [
      { value: 'COMPLETED', label: 'Completed' },
      { value: 'REFUNDED', label: 'Refunded' }
    ];
  }

  return (
    <div className="flex flex-col min-h-full gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full pb-8">
      {/* Sticky Header */}
      <div className={cn(
        "sticky top-0 z-0 flex justify-between items-center flex-wrap gap-4 transition-all duration-300",
        isScrolled 
          ? "bg-[var(--bg-panel)]/80 backdrop-blur-xl border border-[var(--border-color)] shadow-md rounded-2xl px-6 py-4 mt-2" 
          : "bg-transparent border-transparent py-2"
      )}>
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-xl font-bold text-[var(--text-main)] mb-0.5 flex items-center gap-2">
              Order #{order.orderNumber || order.id.slice(0, 8)}
            </h1>
            <p className="text-[var(--text-muted)] text-xs">
              Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant={getStatusBadge(orderStatus)} className="uppercase tracking-wider text-[10px] px-3 py-1.5 shadow-sm">
            Order: {orderStatus === 'DELIVERED' && order.deliveryType === 'PICKUP' ? 'PICKED_UP' : orderStatus}
          </Badge>
          <Badge variant={
            paymentStatus === 'COMPLETED' ? 'success' : 
            paymentStatus === 'PENDING' ? 'warning' : 
            paymentStatus === 'FAILED' ? 'destructive' : 'secondary'
          } className="uppercase tracking-wider text-[10px] px-3 py-1.5 shadow-sm">
            Payment: {paymentStatus}
          </Badge>
          {orderStatus !== 'CANCELLED' && orderStatus !== 'DELIVERED' && (
            <ActionButton 
              onClick={handleDecline}
              text="Cancel Order"
              bgClass="bg-red-500"
              hoverBgClass="bg-red-600"
              icon={XCircle}
              className="px-4 h-[36px] text-xs font-semibold"
              showArrow={false}
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details (Left/Center Column) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4 border-b border-[var(--border-color)] pb-3">
                <ShoppingBag className="text-[var(--color-primary)] w-5 h-5" />
                <h3 className="text-lg font-bold text-[var(--text-main)]">Order Items</h3>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead className="text-center">Quantity</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Total Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.items?.map((item, index) => (
                      <TableRow key={item.id || index}>
                        <TableCell>
                          <div className="font-semibold text-[var(--text-main)]">{item.productName}</div>
                          {item.specialInstructions && (
                            <div className="text-xs text-[var(--text-muted)] mt-1 italic">
                              Note: {item.specialInstructions}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-center text-[var(--text-main)]">{item.quantity}</TableCell>
                        <TableCell className="text-right text-[var(--text-main)]">₹{item.unitPrice}</TableCell>
                        <TableCell className="text-right font-medium text-[var(--text-main)]">₹{item.subtotal}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Special Instructions / Notes */}
          {order.specialInstructions && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-3 border-b border-[var(--border-color)] pb-2">
                  <ReceiptText className="text-[var(--color-primary)] w-4 h-4" />
                  <h4 className="text-sm font-semibold text-[var(--text-main)] uppercase tracking-wider">Order Notes / Special Instructions</h4>
                </div>
                <p className="text-sm text-[var(--text-main)] leading-relaxed bg-[var(--bg-panel)]/30 border border-[var(--border-color)] rounded-xl p-4">
                  {order.specialInstructions}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Info & Management Panels (Right Column) */}
        <div className="flex flex-col-reverse gap-6">

          {/* Bill Summary */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-[var(--border-color)] pb-3">
                <DollarSign className="text-[var(--color-primary)] w-5 h-5" />
                <h3 className="text-lg font-bold text-[var(--text-main)]">Payment Summary</h3>
              </div>

              <div className="space-y-2 text-sm text-[var(--text-muted)]">
                <div className="flex justify-between mb-3 pb-3 border-b border-dashed border-[var(--border-color)]">
                  <span>Payment Method</span>
                  <span className="text-[var(--text-main)] font-semibold uppercase">{order.paymentMethod || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-[var(--text-main)] font-medium">₹{order.subtotal || 0}</span>
                </div>
                {order.taxAmount > 0 && (
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span className="text-[var(--text-main)] font-medium">₹{order.taxAmount}</span>
                  </div>
                )}
                {order.deliveryFee > 0 && (
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span className="text-[var(--text-main)] font-medium">₹{order.deliveryFee}</span>
                  </div>
                )}
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span className="font-semibold">-₹{order.discountAmount}</span>
                  </div>
                )}
                <div className="h-[1px] bg-[var(--border-color)] my-2" />
                <div className="flex justify-between text-[var(--text-main)] font-bold text-base">
                  <span>Total Bill</span>
                  <span>₹{order.totalAmount}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery & Delivery Address */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-[var(--border-color)] pb-3">
                <Truck className="text-[var(--color-primary)] w-5 h-5" />
                <h3 className="text-lg font-bold text-[var(--text-main)]">Delivery Details</h3>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-xs font-semibold text-[var(--text-muted)] block uppercase">Delivery Type</span>
                  <span className="text-[var(--text-main)] font-medium capitalize">{order.deliveryType?.toLowerCase() || 'N/A'}</span>
                </div>
                {order.deliveryDate && (
                  <div>
                    <span className="text-xs font-semibold text-[var(--text-muted)] block uppercase flex items-center gap-1"><Calendar size={12} /> Expected Delivery Date</span>
                    <span className="text-[var(--text-main)] font-medium">{new Date(order.deliveryDate).toLocaleString()}</span>
                  </div>
                )}
                {order.deliveryAddress && (
                  <div>
                    <span className="text-xs font-semibold text-[var(--text-muted)] block uppercase flex items-center gap-1"><MapPin size={12} /> Shipping Address</span>
                    <span className="text-[var(--text-main)] font-medium block bg-[var(--bg-panel)]/30 border border-[var(--border-color)] rounded-xl p-3 mt-1.5 whitespace-pre-line leading-relaxed">
                      {order.deliveryAddress}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Customer Details */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-[var(--border-color)] pb-3">
                <User className="text-[var(--color-primary)] w-5 h-5" />
                <h3 className="text-lg font-bold text-[var(--text-main)]">Customer Information</h3>
              </div>
              
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-xs font-semibold text-[var(--text-muted)] block uppercase">Name</span>
                  <span className="text-[var(--text-main)] font-medium">{order.customerName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-[var(--text-muted)]" />
                  <a href={`mailto:${order.customerEmail}`} className="text-[var(--color-primary)] hover:underline break-all">
                    {order.customerEmail}
                  </a>
                </div>
                {order.customerPhone && (
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-[var(--text-muted)]" />
                    <span className="text-[var(--text-main)]">{order.customerPhone}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Management Panel */}
          <Card className="!overflow-visible">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2 mb-2 border-b border-[var(--border-color)] pb-3">
                <Clock className="text-[var(--color-primary)] w-5 h-5" />
                <h3 className="text-lg font-bold text-[var(--text-main)]">Manage Order</h3>
              </div>

              <div className="space-y-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[var(--text-muted)]">ORDER STATUS</label>
                  <SleekDropdown 
                    widthClass="w-full"
                    value={orderStatus}
                    onChange={handleStatusChange}
                    options={
                      order.deliveryType === 'PICKUP' 
                      ? [
                          { value: "PENDING", label: "Pending" },
                          { value: "CONFIRMED", label: "Confirmed" },
                          { value: "PREPARING", label: "Preparing" },
                          { value: "READY", label: "Ready" },
                          { value: "DELIVERED", label: "Picked Up / Completed" },
                          { value: "CANCELLED", label: "Cancelled" },
                        ]
                      : [
                          { value: "PENDING", label: "Pending" },
                          { value: "CONFIRMED", label: "Confirmed" },
                          { value: "PREPARING", label: "Preparing" },
                          { value: "READY", label: "Ready" },
                          { value: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
                          { value: "DELIVERED", label: "Delivered / Completed" },
                          { value: "CANCELLED", label: "Cancelled" },
                        ]
                    }
                  />
                </div>

                {showPaymentDropdown && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[var(--text-muted)]">PAYMENT STATUS</label>
                    <SleekDropdown 
                      widthClass="w-full"
                      value={paymentStatus}
                      onChange={handlePaymentStatusChange}
                      options={paymentOptions}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Modal 
        isOpen={isCancelModalOpen} 
        onClose={() => setIsCancelModalOpen(false)}
        title={
          <div className="flex items-center gap-2 text-red-500">
            <AlertTriangle className="w-5 h-5" />
            <span>Cancel Order</span>
          </div>
        }
      >
        <div className="space-y-6">
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-4 rounded-xl flex gap-3">
            <div className="text-red-500 mt-0.5"><AlertTriangle size={18} /></div>
            <div className="text-sm text-red-800 dark:text-red-200">
              <p className="font-semibold mb-1">Are you absolutely sure?</p>
              <p>This action cannot be undone. If the customer has already paid, an automatic refund will be initiated immediately.</p>
            </div>
          </div>
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Please select a reason
            </label>
            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
              {ADMIN_CANCEL_REASONS.map((reason) => {
                const isSelected = selectedPreset === reason;
                return (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => setSelectedPreset(reason)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-left text-sm font-medium transition-all ${
                      isSelected
                        ? 'bg-red-500/10 border-red-500/40 text-red-600 dark:text-red-400 font-bold'
                        : 'bg-[var(--card-bg)] border-[var(--border-color)] hover:bg-[var(--card-hover)] text-[var(--text-main)]'
                    }`}
                  >
                    <span>{reason}</span>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-red-500 bg-red-500 text-white' : 'border-[var(--text-muted)] opacity-30'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedPreset === "Other reason" && (
              <div className="pt-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <Textarea 
                  label="Additional Details (Required)"
                  placeholder="Tell us why you are cancelling..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows={2}
                />
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-3 pt-2 border-t border-[var(--border-color)]">
            <Button variant="outline" onClick={() => setIsCancelModalOpen(false)}>
              Keep Order
            </Button>
            <Button 
              variant="danger" 
              onClick={confirmDecline}
              disabled={selectedPreset === "Other reason" && !cancelReason.trim()}
              className="flex items-center gap-2"
            >
              <XCircle size={16} />
              Confirm Cancellation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
