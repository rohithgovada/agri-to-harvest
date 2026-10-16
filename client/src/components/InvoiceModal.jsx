import React, { useEffect, useState } from 'react';
import { X, Printer, Sprout, CheckCircle, Download, FileText } from 'lucide-react';
import { api } from '../api';

export default function InvoiceModal({ orderId, onClose }) {
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchOrder() {
      if (!orderId) return;
      try {
        setLoading(true);
        const res = await api.getOrderById(orderId);
        if (res.success) {
          setOrderData(res);
        }
      } catch (err) {
        setError(err.message || 'Failed to load order receipt.');
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [orderId]);

  if (!orderId) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-stone-200">
        {/* Modal Controls (Hidden in Print) */}
        <div className="p-4 bg-stone-100 border-b border-stone-200 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2 text-stone-700 text-xs font-semibold">
            <FileText className="w-4 h-4 text-emerald-700" />
            <span>Official Circular Agriculture Order Invoice</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-emerald-800 transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Invoice / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Area */}
        <div id="printable-receipt" className="p-6 sm:p-10 text-stone-800 bg-white">
          {loading ? (
            <div className="text-center py-12 text-xs text-stone-500">Loading invoice details...</div>
          ) : error ? (
            <div className="text-center py-12 text-xs text-red-600">{error}</div>
          ) : orderData ? (
            <div>
              {/* Invoice Brand Header */}
              <div className="flex justify-between items-start pb-6 border-b border-stone-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-700 flex items-center justify-center text-white">
                    <Sprout className="w-6 h-6 text-yellow-300" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-emerald-950 tracking-tight">Agri to Harvest</h2>
                    <p className="text-xs text-emerald-700 font-medium">Vegetable Waste to Organic Farming Wealth</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 text-[11px] font-bold uppercase tracking-wider">
                    {orderData.order.status.replace('_', ' ')}
                  </span>
                  <div className="text-xs text-stone-500 mt-1">Invoice: #{orderData.order.order_number}</div>
                  <div className="text-xs text-stone-400">Date: {new Date(orderData.order.created_at).toLocaleDateString()}</div>
                </div>
              </div>

              {/* Parties info */}
              <div className="grid grid-cols-2 gap-6 my-6 text-xs">
                <div>
                  <h4 className="font-bold text-stone-400 uppercase tracking-wider text-[10px] mb-1">Delivered To:</h4>
                  <div className="font-bold text-stone-900 text-sm">{orderData.order.shipping_name}</div>
                  <div className="text-stone-600 mt-0.5">{orderData.order.shipping_address}</div>
                  <div className="text-stone-600">{orderData.order.shipping_city}</div>
                  <div className="text-stone-600 font-mono mt-1">📞 {orderData.order.shipping_phone}</div>
                </div>
                <div className="text-right">
                  <h4 className="font-bold text-stone-400 uppercase tracking-wider text-[10px] mb-1">Fulfillment Mode:</h4>
                  <div className="font-semibold text-stone-800 capitalize">
                    {orderData.order.fulfillment_type === 'delivery' ? 'Direct Farm Delivery' : 'Self-Pickup at Hub'}
                  </div>
                  <div className="text-stone-500 mt-1">Payment Method: {orderData.order.payment_method}</div>
                  <div className="text-emerald-700 font-mono text-[11px]">Txn Ref: {orderData.order.payment_ref}</div>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-xs text-left mb-6">
                <thead>
                  <tr className="border-y border-stone-200 bg-stone-50 text-stone-600 font-semibold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Item Description</th>
                    <th className="py-2.5 px-3 text-center">Unit</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Unit Price</th>
                    <th className="py-2.5 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {orderData.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-3 px-3">
                        <div className="font-bold text-stone-900">{item.product_name}</div>
                        <div className="text-[11px] text-stone-500">Produced by {item.producer_name}</div>
                      </td>
                      <td className="py-3 px-3 text-center text-stone-600">{item.unit}</td>
                      <td className="py-3 px-3 text-center font-bold text-stone-800">{item.quantity}</td>
                      <td className="py-3 px-3 text-right text-stone-600">₹{item.price_per_unit}</td>
                      <td className="py-3 px-3 text-right font-bold text-stone-900">₹{item.total_item_price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="flex justify-end pt-4 border-t border-stone-200">
                <div className="w-64 space-y-2 text-xs">
                  <div className="flex justify-between text-stone-600">
                    <span>Subtotal:</span>
                    <span className="font-semibold text-stone-900">₹{orderData.order.subtotal}</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>Delivery Charge:</span>
                    <span className="font-semibold text-stone-900">₹{orderData.order.delivery_fee}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-emerald-950 pt-2 border-t border-stone-200">
                    <span>Grand Total:</span>
                    <span className="text-base text-emerald-800">₹{orderData.order.total_amount}</span>
                  </div>
                </div>
              </div>

              {/* Verification watermark */}
              <div className="mt-8 pt-6 border-t border-dashed border-stone-200 flex items-center justify-between text-[11px] text-stone-400">
                <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                  <CheckCircle className="w-4 h-4" />
                  <span>100% Verified Recycled Waste to Organic Fertilizer</span>
                </div>
                <span>Agri to Harvest • DTI 2026</span>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
