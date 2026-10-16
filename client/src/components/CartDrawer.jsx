import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, CheckCircle2, ShieldCheck, MapPin, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { api } from '../api';

export default function CartDrawer({ onOrderSuccess }) {
  const { items, itemCount, subtotal, isOpen, setIsOpen, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const { showToast, fetchNotifications } = useNotifications();

  const [checkoutStep, setCheckoutStep] = useState('cart'); // 'cart' | 'checkout' | 'success'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Checkout form with farmer-friendly defaults
  const [fulfillmentType, setFulfillmentType] = useState('delivery'); // 'delivery' | 'pickup'
  const [shippingName, setShippingName] = useState(user?.name || 'Venkat Rao');
  const [shippingPhone, setShippingPhone] = useState(user?.phone || '+91 96180 66778');
  const [shippingAddress, setShippingAddress] = useState(user?.address || 'Survey No 54, Chevella Mandal, Near Water Tank');
  const [shippingCity, setShippingCity] = useState(user?.city || 'Rangareddy / Hyderabad');
  const [paymentMethod, setPaymentMethod] = useState('UPI / QR');
  const [notes, setNotes] = useState('');
  const [placedOrder, setPlacedOrder] = useState(null);

  // Keep shipping details in sync whenever user logs in or checkout opens
  React.useEffect(() => {
    if (user) {
      if (!shippingName || shippingName === 'Venkat Rao') setShippingName(user.name || 'Venkat Rao');
      if (!shippingPhone || shippingPhone === '+91 96180 66778') setShippingPhone(user.phone || '+91 96180 66778');
      if (!shippingAddress || shippingAddress.includes('Chevella')) setShippingAddress(user.address || 'Survey No 54, Chevella Mandal');
      if (!shippingCity) setShippingCity(user.city || 'Hyderabad');
    }
  }, [user, checkoutStep]);

  if (!isOpen) return null;

  const deliveryFee = fulfillmentType === 'pickup' ? 0.0 : 80.0;
  const finalTotal = subtotal + deliveryFee;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.createOrder({
        fulfillment_type: fulfillmentType,
        shipping_name: shippingName || 'Venkat Rao',
        shipping_phone: shippingPhone || '+91 96180 66778',
        shipping_address: shippingAddress || 'Survey No 54, Chevella Mandal',
        shipping_city: shippingCity || 'Hyderabad',
        payment_method: paymentMethod,
        notes
      });

      if (res.success) {
        setPlacedOrder(res.order);
        setCheckoutStep('success');
        showToast(
          'Order Confirmed & Logged',
          `Order #${res.order?.orderNumber || 'ATH-2026'} created! Compost producer notified for dispatch.`,
          'success',
          'farmer_dashboard'
        );
        fetchNotifications();
        await clearCart();
        onOrderSuccess?.(res.order);
      }
    } catch (err) {
      setError(err.message || 'Failed to place order.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setCheckoutStep('cart');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-900/60 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-700" />
            <h3 className="font-bold text-stone-900 text-base">
              {checkoutStep === 'cart' && `Your Shopping Cart (${itemCount})`}
              {checkoutStep === 'checkout' && 'Farmer Checkout & Delivery'}
              {checkoutStep === 'success' && 'Order Confirmed!'}
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
              {error}
            </div>
          )}

          {checkoutStep === 'cart' && (
            <>
              {items.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto mb-3">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h4 className="font-semibold text-stone-800 text-base">Your cart is empty</h4>
                  <p className="text-xs text-stone-500 max-w-xs mx-auto mt-1">
                    Explore our certified organic compost and soil conditioners made from recycled market vegetable waste.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.cart_item_id}
                      className="p-3 rounded-2xl border border-stone-200 bg-stone-50/50 flex items-center gap-3"
                    >
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-16 h-16 rounded-xl object-cover shrink-0 border border-stone-200"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-stone-900 truncate">{item.title}</h4>
                        <p className="text-[11px] text-stone-500">{item.unit} • by {item.producer_name}</p>
                        <div className="text-xs font-bold text-emerald-800 mt-1">
                          ₹{item.price} <span className="font-normal text-stone-500">/ {item.unit}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center border border-stone-300 rounded-lg bg-white overflow-hidden">
                          <button
                            onClick={() => {
                              if (item.quantity > 1) updateQuantity(item.cart_item_id, item.quantity - 1);
                              else removeFromCart(item.cart_item_id);
                            }}
                            className="p-1 hover:bg-stone-100 text-stone-600"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2 text-xs font-bold text-stone-800">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.cart_item_id, item.quantity + 1)}
                            className="p-1 hover:bg-stone-100 text-stone-600"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.cart_item_id)}
                          className="p-1.5 text-stone-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {checkoutStep === 'checkout' && (
            <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-4">
              {/* Fulfillment option */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">Delivery or Self-Pickup</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFulfillmentType('delivery')}
                    className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                      fulfillmentType === 'delivery' ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold' : 'border-stone-200 text-stone-600'
                    }`}
                  >
                    <Truck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold">Direct Delivery</div>
                      <div className="text-[10px] text-stone-500">₹80 Flat Delivery Fee</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFulfillmentType('pickup')}
                    className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                      fulfillmentType === 'pickup' ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold' : 'border-stone-200 text-stone-600'
                    }`}
                  >
                    <MapPin className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold">Self-Pickup</div>
                      <div className="text-[10px] text-emerald-700 font-semibold">Free (At Producer Hub)</div>
                    </div>
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center pb-1">
                <span className="text-xs font-bold text-stone-700">Farmer Contact & Farm Location</span>
                <button
                  type="button"
                  onClick={() => {
                    setShippingName('Venkat Rao (Organic Farmer)');
                    setShippingPhone('+91 96180 66778');
                    setShippingAddress('Sy No 54, Chevella Mandal, Rangareddy Agri Belt');
                    setShippingCity('Rangareddy');
                  }}
                  className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 transition-colors shadow-2xs"
                >
                  ⚡ Auto-Fill Farmer
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Farmer / Buyer Full Name *</label>
                <input
                  type="text"
                  required
                  value={shippingName}
                  onChange={(e) => setShippingName(e.target.value)}
                  placeholder="e.g. Venkat Rao"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Contact Phone *</label>
                  <input
                    type="tel"
                    required
                    value={shippingPhone}
                    onChange={(e) => setShippingPhone(e.target.value)}
                    placeholder="+91 96180 66778"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">City / District *</label>
                  <input
                    type="text"
                    required
                    value={shippingCity}
                    onChange={(e) => setShippingCity(e.target.value)}
                    placeholder="Rangareddy / Hyderabad"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Delivery Address / Farm Location *</label>
                <textarea
                  rows="2"
                  required
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Sy No 54, Chevella Mandal, Near Water Tank"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                ></textarea>
              </div>

              {/* Payment Mode Selection */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Payment Method</label>
                <div className="space-y-1.5">
                  {['UPI / QR Code (Instant)', 'Debit / Credit Card', 'Net Banking', 'Cash on Delivery'].map((m) => (
                    <label
                      key={m}
                      className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer transition-colors ${
                        paymentMethod.startsWith(m.split(' ')[0]) ? 'border-emerald-600 bg-emerald-50/70 font-semibold' : 'border-stone-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod.startsWith(m.split(' ')[0])}
                        onChange={() => setPaymentMethod(m)}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>{m}</span>
                    </label>
                  ))}
                </div>
                <div className="mt-2 p-2 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>College Demo Mode: Simulated instant approval with verified receipt.</span>
                </div>
              </div>
            </form>
          )}

          {checkoutStep === 'success' && placedOrder && (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-stone-900">Order Placed Successfully!</h4>
                <p className="text-xs text-stone-500 mt-1">
                  Thank you for supporting sustainable circular agriculture.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-left text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-stone-500">Order Reference:</span>
                  <span className="font-bold text-stone-900">{placedOrder.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Total Paid (Demo):</span>
                  <span className="font-bold text-emerald-800">₹{placedOrder.totalAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Simulation Ref:</span>
                  <span className="text-stone-600 font-mono text-[11px]">{placedOrder.paymentRef}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Estimated Delivery:</span>
                  <span className="font-medium text-stone-800">2-3 Business Days</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer / Action */}
        <div className="p-4 sm:p-5 border-t border-stone-200 bg-stone-50">
          {checkoutStep === 'cart' && (
            <div>
              <div className="space-y-1 text-xs mb-3">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-stone-900">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Standard Delivery:</span>
                  <span className="font-semibold text-stone-900">₹80.00</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-emerald-950 pt-2 border-t border-stone-200">
                  <span>Estimated Total:</span>
                  <span className="text-base text-emerald-800">₹{(subtotal + 80).toFixed(2)}</span>
                </div>
              </div>

              <button
                disabled={items.length === 0}
                onClick={() => setCheckoutStep('checkout')}
                className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md transition-all hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {checkoutStep === 'checkout' && (
            <div>
              <div className="flex justify-between text-sm font-bold text-stone-900 mb-3">
                <span>Total Amount:</span>
                <span className="text-base text-emerald-800">₹{finalTotal.toFixed(2)}</span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCheckoutStep('cart')}
                  className="px-4 py-3 rounded-xl border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-100"
                >
                  Back
                </button>
                <button
                  type="submit"
                  form="checkout-form"
                  disabled={loading}
                  className="flex-1 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md transition-all hover:shadow-lg disabled:opacity-50"
                >
                  {loading ? 'Processing Order...' : 'Confirm & Place Order (Demo)'}
                </button>
              </div>
            </div>
          )}

          {checkoutStep === 'success' && (
            <button
              onClick={handleClose}
              className="w-full py-3 rounded-xl bg-emerald-800 text-white font-bold text-sm shadow-md hover:bg-emerald-900 transition-colors"
            >
              Done & View Order in Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
