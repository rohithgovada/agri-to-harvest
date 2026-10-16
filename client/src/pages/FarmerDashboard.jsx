import React, { useEffect, useState } from 'react';
import {
  Sprout,
  ShoppingBag,
  Clock,
  CheckCircle,
  Truck,
  FileText,
  Star,
  Search,
  BookOpen,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  MessageSquare,
  X
} from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import InvoiceModal from '../components/InvoiceModal';

export default function FarmerDashboard({ setActivePage }) {
  const { user, demoLogin } = useAuth();
  const { addToCart, setIsOpen: setCartOpen } = useCart();
  const { lang } = useLanguage();

  const [orders, setOrders] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const [cartNotice, setCartNotice] = useState(null);

  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewProduct, setReviewProduct] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const handleFarmerAddToCart = async (prod) => {
    try {
      if (!user || user.role !== 'farmer') {
        await demoLogin('farmer');
      }
      await addToCart(prod.id, 1);
      setCartOpen(true);
      setCartNotice(`🛒 Added "${prod.title}" to cart! Opening checkout drawer...`);
      setTimeout(() => setCartNotice(null), 3000);
    } catch (err) {
      console.error(err);
      alert(err.message || 'Could not add to cart.');
    }
  };

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [ordersRes, prodsRes] = await Promise.all([
          api.getMyOrders(),
          api.getPublicProducts()
        ]);

        if (ordersRes.success) setOrders(ordersRes.orders || []);
        if (prodsRes.success) setRecommendedProducts(prodsRes.products || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleOpenReview = (product) => {
    setReviewProduct(product);
    setReviewRating(5);
    setReviewComment('');
    setReviewSuccess(false);
    setReviewModalOpen(true);
  };

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      const res = await api.addReview({
        product_id: reviewProduct.id,
        rating: reviewRating,
        comment: reviewComment
      });
      if (res.success) {
        setReviewSuccess(true);
        setTimeout(() => setReviewModalOpen(false), 1500);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const farmingTips = [
    {
      title: lang === 'te' ? 'సేంద్రీయ కంపోస్ట్ మోతాదు విధానం' : 'Compost Dosage by Crop Type',
      desc: lang === 'te'
        ? 'కూరగాయల పంటలకు ఎకరాకు 1 నుండి 1.5 టన్నుల కంపోస్ట్ దుక్కిలో వేయాలి. పండ్ల తోటలకు ఒక్కో చెట్టుకు 2-3 కిలోలు వేసి తేలికపాటి నీరు ఇవ్వాలి.'
        : 'Vegetable crops require 1 to 1.5 tons per acre during basal land preparation. For fruit trees, incorporate 2-3 kg per tree around the drip line.'
    },
    {
      title: lang === 'te' ? 'నేల తేమ నిలుపుదల సామర్థ్యం' : 'Soil Moisture Retention Boost',
      desc: lang === 'te'
        ? 'కూరగాయల వ్యర్థాలతో తయారైన వర్మీకంపోస్ట్ నేలలో నీటిని నిలిపి ఉంచే శక్తిని 40% వరకు పెంచుతుంది. దీంతో వేసవిలో కూడా పంటలు వాడిపోవు.'
        : 'Vegetable-derived vermicompost increases organic carbon matter, boosting water holding capacity by up to 40% and insulating roots against heat stress.'
    },
    {
      title: lang === 'te' ? 'రసాయన రహిత సాగు వల్ల ప్రయోజనం' : 'Microbial Soil Regeneration',
      desc: lang === 'te'
        ? 'రసాయన ఎరువుల వాడకం తగ్గించి సేంద్రీయ ఎరువు వాడటం వల్ల నేలలో వానపాములు, మిత్ర పురుగులు మరియు ప్రయోజనకర సూక్ష్మజీవులు వేగంగా వృద్ధి చెందుతాయి.'
        : 'Beneficial actinomycetes and mycorrhizae unlock insoluble soil phosphorus, fostering resilient natural pest defense and clean harvest.'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-green-900 rounded-3xl p-6 sm:p-8 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-700 text-yellow-300 text-xs font-bold mb-2">
            <Sprout className="w-3.5 h-3.5" />
            <span>{lang === 'te' ? 'రైతు సోదరుల పోర్టల్' : 'Farmer Community Portal'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            {lang === 'te' ? `స్వాగతం, ${user?.name}` : `Welcome, ${user?.name}`}
          </h1>
          <p className="text-xs sm:text-sm text-emerald-200 mt-1 max-w-xl">
            {lang === 'te'
              ? 'కూరగాయల వ్యర్థాలతో తయారుచేసిన స్వచ్ఛమైన సేంద్రీయ ఎరువులను నేరుగా కొనుగోలు చేసి మీ పంటల దిగుబడిని పెంచుకోండి.'
              : 'Direct access to verified organic compost, soil conditioners, and biological inputs to enrich your farmland sustainably.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActivePage('product_market')}
            className="px-4 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-emerald-950 font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{lang === 'te' ? 'ఎరువుల దుకాణం' : 'Browse Compost Store'}</span>
          </button>
        </div>
      </div>

      {cartNotice && (
        <div className="p-4 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-700" />
            <span>{cartNotice}</span>
          </div>
          <button onClick={() => setCartNotice(null)} className="text-emerald-800 hover:text-emerald-950">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Orders & Recommendations */}
        <div className="lg:col-span-2 space-y-8">
          {/* Order Tracking Section */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-stone-900">
                  {lang === 'te' ? 'మీ ఆర్డర్ల స్థితి' : 'My Compost Orders & Deliveries'}
                </h3>
                <p className="text-xs text-stone-500">Live order fulfillment and printable official receipts</p>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg">
                {orders.length} orders
              </span>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-10 bg-stone-50 rounded-2xl border border-stone-100">
                <ShoppingBag className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                <p className="text-xs text-stone-500">You haven't placed any orders yet.</p>
                <button
                  onClick={() => setActivePage('product_market')}
                  className="mt-3 text-xs font-bold text-emerald-800 hover:underline"
                >
                  Explore Organic Products →
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 rounded-2xl border border-stone-200 bg-stone-50/50 space-y-3"
                  >
                    <div className="flex flex-wrap justify-between items-center gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-stone-900">
                            #{order.order_number}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            order.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                            order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'dispatched' ? 'bg-purple-100 text-purple-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {order.status.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="text-[11px] text-stone-400 mt-0.5">
                          Placed on {new Date(order.created_at).toLocaleDateString()} • {order.payment_method} (Simulated)
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-emerald-900">
                          ₹{order.total_amount}
                        </span>
                        <button
                          onClick={() => setSelectedInvoiceId(order.id)}
                          className="px-2.5 py-1 rounded-lg bg-white border border-stone-200 text-stone-700 hover:text-emerald-800 hover:border-emerald-300 text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Receipt</span>
                        </button>
                      </div>
                    </div>

                    {/* Progress Timeline Indicator */}
                    <div className="pt-2">
                      <div className="grid grid-cols-4 gap-1 text-[10px] font-semibold text-center text-stone-500">
                        <div className={`p-1 rounded ${order.status !== 'cancelled' ? 'bg-emerald-100 text-emerald-900 font-bold' : 'bg-stone-200'}`}>
                          1. Placed
                        </div>
                        <div className={`p-1 rounded ${['confirmed', 'processing', 'dispatched', 'ready_for_pickup', 'delivered'].includes(order.status) ? 'bg-emerald-100 text-emerald-900 font-bold' : 'bg-stone-100'}`}>
                          2. Confirmed
                        </div>
                        <div className={`p-1 rounded ${['processing', 'dispatched', 'ready_for_pickup', 'delivered'].includes(order.status) ? 'bg-emerald-100 text-emerald-900 font-bold' : 'bg-stone-100'}`}>
                          3. Dispatched
                        </div>
                        <div className={`p-1 rounded ${order.status === 'delivered' ? 'bg-emerald-600 text-white font-bold' : 'bg-stone-100'}`}>
                          4. Delivered
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recommended Organic Products */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-stone-900">
                  {lang === 'te' ? 'రైతులకు సిఫార్సు చేసిన ఎరువులు' : 'Recommended Organic Composts'}
                </h3>
                <p className="text-xs text-stone-500">Highest rated products produced from fresh vegetable waste</p>
              </div>
              <button
                onClick={() => setActivePage('product_market')}
                className="text-xs font-bold text-emerald-800 hover:underline"
              >
                View Store →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recommendedProducts.slice(0, 4).map((p) => (
                <div
                  key={p.id}
                  className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50/50 flex flex-col justify-between"
                >
                  <div className="flex gap-3">
                    <img
                      src={p.image_url}
                      alt={p.title}
                      className="w-16 h-16 rounded-xl object-cover shrink-0 border border-stone-200"
                    />
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                        {p.category}
                      </span>
                      <h4 className="text-xs font-bold text-stone-900 truncate mt-1">{p.title}</h4>
                      <div className="text-xs font-bold text-emerald-900 mt-1">
                        ₹{p.price} <span className="text-[11px] font-normal text-stone-500">/ {p.unit}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 flex gap-2">
                    <button
                      onClick={() => handleFarmerAddToCart(p)}
                      className="flex-1 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center justify-center gap-1 shadow-xs hover:shadow transition-all"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Add to Cart</span>
                    </button>
                    <button
                      onClick={() => handleOpenReview(p)}
                      className="px-2.5 py-1.5 rounded-lg bg-white border border-stone-200 hover:bg-stone-50 text-stone-600 text-xs font-semibold"
                      title="Rate & Review"
                    >
                      <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Farming Guidance & Soil Health Tips */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-amber-900 to-stone-900 text-white rounded-3xl p-6 shadow-md space-y-4">
            <div className="flex items-center gap-2 text-yellow-300 font-bold text-xs uppercase tracking-wider">
              <BookOpen className="w-4 h-4" />
              <span>{lang === 'te' ? 'రైతు సూచనలు & సలహాలు' : 'Soil & Compost Guidance'}</span>
            </div>

            <h3 className="text-lg font-black tracking-tight">
              {lang === 'te' ? 'సేంద్రీయ వ్యవసాయ మార్గదర్శకాలు' : 'Maximize Soil Microbes'}
            </h3>

            <div className="space-y-4 pt-2">
              {farmingTips.map((tip, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10 space-y-1">
                  <h4 className="text-xs font-bold text-yellow-300">{tip.title}</h4>
                  <p className="text-[11px] text-stone-300 leading-relaxed">{tip.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quality Assurance Card */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-stone-900">100% Recycled Vegetable Origin</h4>
            <p className="text-xs text-stone-500 leading-relaxed">
              Every bag of compost purchased supports local market shopkeepers and redirects municipal organic waste from toxic landfill decomposition.
            </p>
          </div>
        </div>
      </div>

      {/* INVOICE MODAL */}
      {selectedInvoiceId && (
        <InvoiceModal orderId={selectedInvoiceId} onClose={() => setSelectedInvoiceId(null)} />
      )}

      {/* REVIEW PRODUCT MODAL */}
      {reviewModalOpen && reviewProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-stone-200">
            <div className="p-5 bg-gradient-to-r from-emerald-800 to-green-900 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base">Write a Farmer Review</h3>
                <p className="text-xs text-emerald-200 truncate max-w-xs">{reviewProduct.title}</p>
              </div>
              <button onClick={() => setReviewModalOpen(false)} className="text-emerald-200 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {reviewSuccess ? (
              <div className="p-8 text-center space-y-2">
                <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-stone-900 text-sm">Thank You for Your Review!</h4>
                <p className="text-xs text-stone-500">Your feedback helps fellow farmers and validates compost quality.</p>
              </div>
            ) : (
              <form onSubmit={submitReview} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">Rating (1 to 5 Stars) *</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className="p-1 hover:scale-125 transition-transform"
                      >
                        <Star className={`w-6 h-6 ${star <= reviewRating ? 'text-yellow-400 fill-yellow-400' : 'text-stone-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Your Experience / Crop Results *</label>
                  <textarea
                    rows="3"
                    required
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Describe how this compost improved your soil moisture, root development, or crop vigor..."
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md"
                >
                  Submit Farmer Review
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
