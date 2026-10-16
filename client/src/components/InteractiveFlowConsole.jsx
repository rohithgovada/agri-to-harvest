import React, { useState, useEffect } from 'react';
import {
  Store,
  Building,
  Sprout,
  ArrowRight,
  CheckCircle,
  Truck,
  Recycle,
  ShoppingBag,
  MapPin,
  Calendar,
  Sparkles,
  RefreshCw,
  Plus,
  Clock
} from 'lucide-react';
import { api } from '../api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export default function InteractiveFlowConsole({ setActivePage }) {
  const { addToCart, setIsOpen: setCartOpen } = useCart();
  const { demoLogin, user } = useAuth();
  const { showToast, fetchNotifications } = useNotifications();

  const [activeStep, setActiveStep] = useState(1); // 1: Shopkeeper, 2: Composer, 3: Farmer

  // Step 1: Form state
  const [vegTitle, setVegTitle] = useState('10kg Surplus Ripe Tomatoes Waste');
  const [vegType, setVegType] = useState('Tomatoes, Gourds & Solanaceae');
  const [vegQuantity, setVegQuantity] = useState('10');
  const [vegLocation, setVegLocation] = useState('Bowenpally Rythu Bazar Stall #14, Hyderabad');
  const [vegCondition, setVegCondition] = useState('Wilted / Overripe');
  const [isFree, setIsFree] = useState(true);
  const [pricePerKg, setPricePerKg] = useState('0');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusNotice, setStatusNotice] = useState(null);

  // Live state
  const [liveWasteList, setLiveWasteList] = useState([]);
  const [liveProducts, setLiveProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const refreshData = async () => {
    try {
      setLoading(true);
      const [wasteRes, prodRes] = await Promise.all([
        api.getPublicWaste(),
        api.getPublicProducts()
      ]);
      if (wasteRes.success) setLiveWasteList(wasteRes.listings || []);
      if (prodRes.success) setLiveProducts(prodRes.products || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Quick preset filler
  const handleApplyPreset = (preset) => {
    if (preset === 'tomatoes') {
      setVegTitle('10kg Surplus Ripe Tomatoes Waste');
      setVegType('Tomatoes, Gourds & Solanaceae');
      setVegQuantity('10');
      setVegCondition('Wilted / Overripe');
      setVegLocation('Bowenpally Rythu Bazar Stall #14, Hyderabad');
      setIsFree(true);
      setPricePerKg('0');
    } else if (preset === 'greens') {
      setVegTitle('25kg Fresh Spinach & Leafy Cuts');
      setVegType('Leafy Greens');
      setVegQuantity('25');
      setVegCondition('Freshly Cut / Trimmings');
      setVegLocation('Madhapur Green Grocers, Hyderabad');
      setIsFree(false);
      setPricePerKg('0.50');
    } else if (preset === 'cabbage') {
      setVegTitle('40kg Cabbage, Cauliflower & Carrot Peels');
      setVegType('Brassicas & Root Vegetables');
      setVegQuantity('40');
      setVegCondition('Freshly Cut / Trimmings');
      setVegLocation('Secunderabad Wholesale Yard, Hyderabad');
      setIsFree(true);
      setPricePerKg('0');
    }
  };

  // Step 1: Post Waste Action (Seller can list Free or at Cost)
  const handlePostWaste = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      // Auto-switch to shopkeeper demo if not already
      if (!user || user.role !== 'shopkeeper') {
        await demoLogin('shopkeeper');
      }

      const parsedPrice = isFree ? 0 : (parseFloat(pricePerKg) || 0);

      const res = await api.createWasteListing({
        title: vegTitle,
        vegetable_type: vegType,
        quantity_kg: parseFloat(vegQuantity),
        waste_condition: vegCondition,
        available_datetime: 'Today, 2:00 PM - 7:00 PM',
        collection_address: vegLocation,
        city: 'Hyderabad',
        price_per_kg: parsedPrice,
        is_free: isFree,
        image_url: vegTitle.toLowerCase().includes('tomato')
          ? 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80'
          : 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
        contact_phone: '+91 94401 22334'
      });

      if (res.success) {
        const pricingText = isFree ? 'Free Donation' : `Paid at ₹${parsedPrice}/kg`;
        setStatusNotice(`✅ Listed ${vegQuantity}kg of "${vegTitle}" (${pricingText})! Now switch to Step 2 to see the Composer collect it.`);
        showToast('Waste Listed Successfully', `Listed ${vegQuantity}kg of "${vegTitle}" (${pricingText}) in the circular waste ledger.`, 'success');
        fetchNotifications();
        await refreshData();
        setTimeout(() => setActiveStep(2), 1200);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Composer Collects Action (1-click collection & composting pipeline)
  const handleCollectWaste = async (listing) => {
    try {
      // Auto-switch to producer demo
      await demoLogin('compost_producer');
      const reqRes = await api.requestWasteCollection({
        waste_listing_id: listing.id,
        requested_quantity_kg: listing.available_quantity_kg,
        proposed_pickup_datetime: 'Today with pickup truck',
        notes: 'Dispatched airtight bins for composting.'
      });

      if (reqRes.success && reqRes.requestId) {
        // Automatically verify handover collection so it enters the composter's facility
        await api.updateRequestStatus(reqRes.requestId, {
          status: 'collected',
          actual_collected_kg: listing.available_quantity_kg
        });

        setStatusNotice(`✅ Composer collected ${listing.available_quantity_kg}kg from ${listing.collection_address}! Composting initiated.`);
        showToast('Collection Verified', `Composer collected ${listing.available_quantity_kg}kg from ${listing.collection_address}. Inoculated into composting facility.`, 'success');
        fetchNotifications();
        await refreshData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // Step 3: Farmer Orders Compost (Flawless click handler)
  const handleFarmerBuy = async (product) => {
    try {
      // Auto-switch to farmer demo so farmer buttons always work smoothly
      if (!user || user.role !== 'farmer') {
        await demoLogin('farmer');
      }
      await addToCart(product.id, 1);
      setCartOpen(true);
      setStatusNotice(`🛒 Added "${product.title}" to Farmer Cart! Opening checkout drawer...`);
      showToast('Compost Added to Cart', `Added "${product.title}" to your cart. Opening checkout drawer...`, 'success');
      fetchNotifications();
    } catch (err) {
      console.error('Farmer buy error:', err);
      alert(err.message || 'Could not place order.');
    }
  };

  return (
    <div className="bg-white rounded-3xl border-2 border-emerald-600/20 shadow-xl overflow-hidden">
      {/* Top Banner explaining the simple concept */}
      <div className="bg-[#14532d] p-6 sm:p-8 text-white">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-800 text-yellow-300 text-xs font-bold mb-3 border border-emerald-700">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Neat Step-by-Step Display</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            How Agri to Harvest Works (In 3 Simple Steps)
          </h2>
          <p className="text-xs sm:text-sm text-emerald-200 mt-1 leading-relaxed">
            Follow the clean 3-step circular flow below: A shopkeeper enters waste vegetables (like 10kg tomatoes),
            a composer collects and composts it, and farmers buy the finished organic compost.
          </p>
        </div>

        {/* 3 Interactive Stepper Tabs */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-6">
          <button
            onClick={() => setActiveStep(1)}
            className={`p-3 sm:p-4 rounded-2xl text-left transition-all border ${
              activeStep === 1
                ? 'bg-white text-stone-900 border-yellow-400 ring-2 ring-yellow-400 shadow-md font-bold'
                : 'bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border-emerald-800'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                activeStep === 1 ? 'bg-orange-500 text-white' : 'bg-emerald-800 text-emerald-300'
              }`}>
                1
              </span>
              <span className="text-xs sm:text-sm truncate">🏪 Vegetable Shopkeeper</span>
            </div>
            <div className="text-[11px] opacity-80 hidden sm:block">
              Enters 10kg waste & location
            </div>
          </button>

          <button
            onClick={() => setActiveStep(2)}
            className={`p-3 sm:p-4 rounded-2xl text-left transition-all border ${
              activeStep === 2
                ? 'bg-white text-stone-900 border-yellow-400 ring-2 ring-yellow-400 shadow-md font-bold'
                : 'bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border-emerald-800'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                activeStep === 2 ? 'bg-amber-600 text-white' : 'bg-emerald-800 text-emerald-300'
              }`}>
                2
              </span>
              <span className="text-xs sm:text-sm truncate">🏭 The Composer</span>
            </div>
            <div className="text-[11px] opacity-80 hidden sm:block">
              Collects & makes compost
            </div>
          </button>

          <button
            onClick={() => setActiveStep(3)}
            className={`p-3 sm:p-4 rounded-2xl text-left transition-all border ${
              activeStep === 3
                ? 'bg-white text-stone-900 border-yellow-400 ring-2 ring-yellow-400 shadow-md font-bold'
                : 'bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border-emerald-800'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                activeStep === 3 ? 'bg-green-600 text-white' : 'bg-emerald-800 text-emerald-300'
              }`}>
                3
              </span>
              <span className="text-xs sm:text-sm truncate">🚜 Farmers</span>
            </div>
            <div className="text-[11px] opacity-80 hidden sm:block">
              Buys compost for farmland
            </div>
          </button>
        </div>
      </div>

      {/* Status Notice alert */}
      {statusNotice && (
        <div className="bg-emerald-50 border-b border-emerald-200 p-3 px-6 text-xs text-emerald-900 font-bold flex justify-between items-center animate-in fade-in">
          <span>{statusNotice}</span>
          <button onClick={() => setStatusNotice(null)} className="text-emerald-700 hover:text-emerald-950 font-black">
            ✕
          </button>
        </div>
      )}

      {/* Main Interactive Stage Body */}
      <div className="p-6 sm:p-8">
        {/* ================= STEP 1: SHOPKEEPER ================= */}
        {activeStep === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Clean Form */}
            <div className="lg:col-span-6 bg-stone-50 rounded-2xl p-6 border border-stone-200 space-y-4">
              <div className="border-b border-stone-200 pb-3">
                <div className="text-xs font-bold uppercase tracking-wider text-orange-700">
                  Step 1 of 3: Shopkeeper Entry
                </div>
                <h3 className="text-lg font-bold text-stone-900 mt-0.5">
                  Enter Your Waste Vegetables
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Fill in the vegetable name, quantity, and stall location so composers can collect it.
                </p>
              </div>

              {/* 1-Click quick presets */}
              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1.5 uppercase">
                  ⚡ 1-Click Preset Examples:
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('tomatoes')}
                    className="px-3 py-1.5 rounded-lg bg-white border border-orange-300 text-orange-950 text-xs font-bold hover:bg-orange-100 transition-colors shadow-xs"
                  >
                    🍅 10kg Waste Tomatoes
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('greens')}
                    className="px-3 py-1.5 rounded-lg bg-white border border-emerald-300 text-emerald-950 text-xs font-semibold hover:bg-emerald-100 transition-colors shadow-xs"
                  >
                    🥬 25kg Leafy Greens
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('cabbage')}
                    className="px-3 py-1.5 rounded-lg bg-white border border-stone-300 text-stone-800 text-xs font-semibold hover:bg-stone-100 transition-colors shadow-xs"
                  >
                    🥕 40kg Mixed Peels
                  </button>
                </div>
              </div>

              <form onSubmit={handlePostWaste} className="space-y-3.5 pt-1">
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    Vegetable Name(s) *
                  </label>
                  <input
                    type="text"
                    required
                    value={vegTitle}
                    onChange={(e) => setVegTitle(e.target.value)}
                    placeholder="e.g. 10kg Tomatoes Waste"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-300 bg-white font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1">
                      Quantity (in Kilograms) *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        required
                        value={vegQuantity}
                        onChange={(e) => setVegQuantity(e.target.value)}
                        placeholder="10"
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-300 bg-white font-bold text-emerald-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none pr-8"
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-stone-400 font-bold">kg</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1">
                      Vegetable Type
                    </label>
                    <select
                      value={vegType}
                      onChange={(e) => setVegType(e.target.value)}
                      className="w-full px-3 py-2.5 text-xs rounded-xl border border-stone-300 bg-white font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    >
                      <option value="Tomatoes, Gourds & Solanaceae">Tomatoes & Gourds</option>
                      <option value="Leafy Greens">Leafy Greens (Palak, Coriander)</option>
                      <option value="Brassicas & Root Vegetables">Brassicas & Root Veggies</option>
                      <option value="Dry Husks, Peels & Stems">Peels, Husks & Shells</option>
                      <option value="Mixed Market Produce">Mixed Market Cuts</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    Shop / Stall Location (Address) *
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-emerald-700 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={vegLocation}
                      onChange={(e) => setVegLocation(e.target.value)}
                      placeholder="e.g. Bowenpally Rythu Bazar Stall #14, Hyderabad"
                      className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-stone-300 bg-white font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Seller Pricing Choice: Free vs Cost */}
                <div className="space-y-2 pt-1">
                  <label className="block text-xs font-bold text-stone-800">
                    Pricing Option (Seller's Choice) *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => { setIsFree(true); setPricePerKg('0'); }}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        isFree
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500 font-bold shadow-xs'
                          : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      <div className="text-xs flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                        <span>🟢 Free Collection</span>
                      </div>
                      <div className="text-[10px] text-stone-500 mt-0.5">Zero disposal fee</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => { setIsFree(false); if (pricePerKg === '0') setPricePerKg('0.50'); }}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        !isFree
                          ? 'border-amber-600 bg-amber-50 text-amber-950 ring-2 ring-amber-500 font-bold shadow-xs'
                          : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      <div className="text-xs flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
                        <span>💰 Paid (Set ₹/kg)</span>
                      </div>
                      <div className="text-[10px] text-stone-500 mt-0.5">Earn revenue per kg</div>
                    </button>
                  </div>

                  {!isFree && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-2 animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-amber-950">Price per Kilogram (₹):</label>
                        <div className="flex gap-1">
                          {['0.50', '1.00', '2.00'].map((rate) => (
                            <button
                              key={rate}
                              type="button"
                              onClick={() => setPricePerKg(rate)}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                                pricePerKg === rate ? 'bg-amber-600 text-white border-amber-600' : 'bg-white text-amber-900 border-amber-300 hover:bg-amber-100'
                              }`}
                            >
                              ₹{rate}/kg
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-xs font-bold text-stone-500">₹</span>
                        <input
                          type="number"
                          step="0.1"
                          min="0.1"
                          required={!isFree}
                          value={pricePerKg}
                          onChange={(e) => setPricePerKg(e.target.value)}
                          placeholder="e.g. 0.50"
                          className="w-full pl-7 pr-3 py-1.5 text-xs rounded-lg border border-amber-300 bg-white font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-600"
                        />
                      </div>
                      <div className="text-[10px] text-amber-800 font-medium flex justify-between">
                        <span>Expected Seller Earnings:</span>
                        <strong className="text-amber-950">
                          ₹{(parseFloat(vegQuantity || 0) * (parseFloat(pricePerKg) || 0)).toFixed(2)}
                        </strong>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 hover:shadow-lg disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isSubmitting ? 'Posting Waste...' : 'Post Waste for Collection ➔'}</span>
                </button>
              </form>
            </div>

            {/* Right: Live List of Posted Waste */}
            <div className="lg:col-span-6 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-base font-bold text-stone-900">
                    Live Vegetable Waste Ready for Pickup
                  </h4>
                  <p className="text-xs text-stone-500">Currently awaiting composer collection</p>
                </div>
                <button onClick={refreshData} className="p-1.5 text-stone-400 hover:text-stone-700">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                {liveWasteList.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl border border-stone-200 bg-white shadow-xs flex items-center justify-between gap-4 hover:border-emerald-300 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-14 h-14 rounded-xl object-cover border border-stone-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-800">
                            {item.vegetable_type}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                            {item.is_free ? 'Free' : `₹${item.price_per_kg}/kg`}
                          </span>
                        </div>
                        <h5 className="font-bold text-stone-900 text-xs truncate mt-1">{item.title}</h5>
                        <p className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-stone-400" />
                          <span className="truncate">{item.collection_address}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-base font-black text-emerald-800">
                        {item.available_quantity_kg} <span className="text-xs font-normal">kg</span>
                      </div>
                      <button
                        onClick={() => {
                          setActiveStep(2);
                        }}
                        className="mt-1 px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-[11px] font-bold transition-colors"
                      >
                        Collect ➔
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 2: THE COMPOSER ================= */}
        {activeStep === 2 && (
          <div className="space-y-6">
            <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                  Step 2 of 3: Composer Operations
                </span>
                <h3 className="text-lg font-bold text-stone-900 mt-0.5">
                  Collect Waste Vegetables & Convert into Compost
                </h3>
                <p className="text-xs text-stone-600 mt-1">
                  The composer schedules collection at the shopkeeper's stall, turns the waste into vermicompost, and packages it for farmers.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => setActivePage('producer_dashboard')}
                  className="px-4 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold shadow-xs"
                >
                  Open Full Producer Hub
                </button>
              </div>
            </div>

            {/* List of waste waiting to be collected */}
            <div>
              <h4 className="text-sm font-bold text-stone-900 mb-3">
                Click "Collect & Compost" on Any Available Vegetable Waste:
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {liveWasteList.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900">
                          {item.vegetable_type}
                        </span>
                        <span className="text-xs font-bold text-emerald-800">
                          {item.available_quantity_kg} kg Available
                        </span>
                      </div>
                      <h5 className="font-bold text-stone-900 text-sm">{item.title}</h5>
                      <p className="text-xs text-stone-500 mt-1 line-clamp-2">{item.description}</p>
                      <div className="text-xs text-stone-600 mt-2 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-stone-400" />
                        <span className="truncate">{item.collection_address}</span>
                      </div>
                    </div>

                    {/* Action button */}
                    <div className="pt-2 border-t border-stone-100">
                      <button
                        onClick={async () => {
                          await handleCollectWaste(item);
                          setTimeout(() => setActiveStep(3), 1500);
                        }}
                        className="w-full py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition-colors"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Collect & Start Composting ➔</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Explanatory Banner: Composting transformation */}
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  <Recycle className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-emerald-950">
                    Biological Transformation: 10kg Waste Tomatoes ➔ ~3.6kg Finished Humus
                  </div>
                  <div className="text-[11px] text-emerald-800">
                    64% moisture evaporates during aerobic breakdown, concentrating organic nitrogen, potassium, and beneficial soil microbes.
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveStep(3)}
                className="px-4 py-2 rounded-xl bg-emerald-800 text-white font-bold text-xs shrink-0 hover:bg-emerald-900"
              >
                Go to Step 3: Sell to Farmers ➔
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: THE FARMER ================= */}
        {activeStep === 3 && (
          <div className="space-y-6">
            <div className="bg-green-50 rounded-2xl p-6 border border-green-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-green-900">
                  Step 3 of 3: Farmer Purchase
                </span>
                <h3 className="text-lg font-bold text-stone-900 mt-0.5">
                  Organic Compost Ready for Agricultural Fields
                </h3>
                <p className="text-xs text-stone-600 mt-1">
                  Farmers browse certified compost made from recycled vegetable waste and order it directly for delivery to their farm.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => setActivePage('product_market')}
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs"
                >
                  View Full Farm Store
                </button>
              </div>
            </div>

            {/* Products catalog */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {liveProducts.map((p) => (
                <div
                  key={p.id}
                  className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs flex flex-col justify-between space-y-3 hover:border-emerald-400 transition-colors"
                >
                  <div>
                    <img
                      src={p.image_url}
                      alt={p.title}
                      className="w-full h-36 object-cover rounded-xl border border-stone-200 mb-2"
                    />
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {p.category}
                    </span>
                    <h5 className="font-bold text-stone-900 text-xs mt-1.5 line-clamp-1">{p.title}</h5>
                    <p className="text-[11px] text-stone-500 line-clamp-2 mt-1 leading-relaxed">
                      {p.description}
                    </p>
                    <div className="text-xs font-bold text-emerald-900 mt-2">
                      ₹{p.price} <span className="text-stone-400 font-normal">/ {p.unit}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleFarmerBuy(p)}
                    className="w-full py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Order for My Farm</span>
                  </button>
                </div>
              ))}
            </div>

            {/* Finished Circular Loop Banner */}
            <div className="p-5 rounded-2xl bg-stone-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  ✓
                </div>
                <div>
                  <div className="text-xs font-bold text-yellow-300">
                    Circular Loop Complete!
                  </div>
                  <div className="text-[11px] text-stone-300">
                    Vegetable waste kept out of landfills ➔ Composted scientifically ➔ Returned to farm soil to grow healthy new crops!
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveStep(1)}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-white text-xs font-bold border border-stone-700 shrink-0"
              >
                Restart from Step 1 ↺
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
