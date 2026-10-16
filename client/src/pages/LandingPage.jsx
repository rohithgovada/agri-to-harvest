import React, { useEffect, useState } from 'react';
import {
  Sprout,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Store,
  Building,
  Recycle,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  Calculator,
  ChevronDown,
  ShoppingBag,
  Leaf,
  MapPin,
  Calendar,
  Layers
} from 'lucide-react';
import { api } from '../api';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import MapViewer from '../components/MapViewer';
import InteractiveFlowConsole from '../components/InteractiveFlowConsole';
import { useAuth } from '../context/AuthContext';

export default function LandingPage({ setActivePage, onOpenAuth }) {
  const { t } = useLanguage();
  const { addToCart, setIsOpen: setCartOpen } = useCart();
  const { user, demoLogin } = useAuth();

  const [stats, setStats] = useState({
    totalWasteCollectedKg: 850,
    totalCompostProducedKg: 310,
    activeShopkeepers: 14,
    activeFarmers: 28,
  });

  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [recentWaste, setRecentWaste] = useState([]);
  const [calculatorWaste, setCalculatorWaste] = useState(250);
  const [openFaq, setOpenFaq] = useState(0);
  const [addedNotice, setAddedNotice] = useState(null);

  const handleFarmerAddToCart = async (prod) => {
    try {
      if (!user || user.role !== 'farmer') {
        await demoLogin('farmer');
      }
      await addToCart(prod.id, 1);
      setCartOpen(true);
      setAddedNotice(`🛒 Added "${prod.title}" to Farmer Cart!`);
      setTimeout(() => setAddedNotice(null), 3000);
    } catch (err) {
      console.error('Farmer add to cart failed:', err);
      alert(err.message || 'Could not add product to cart.');
    }
  };

  useEffect(() => {
    async function loadData() {
      try {
        const impactRes = await api.getImpactStats();
        if (impactRes.success && impactRes.metrics) {
          setStats(impactRes.metrics);
        }
      } catch (e) {
        console.error(e);
      }

      try {
        const prodRes = await api.getPublicProducts();
        if (prodRes.success && prodRes.products) {
          setFeaturedProducts(prodRes.products.slice(0, 4));
        }
      } catch (e) {
        console.error(e);
      }

      try {
        const wasteRes = await api.getPublicWaste();
        if (wasteRes.success && wasteRes.listings) {
          setRecentWaste(wasteRes.listings.slice(0, 4));
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadData();
  }, []);

  // Waste calculator outcomes
  const estimatedCompostYield = Math.round(calculatorWaste * 0.36);
  const estimatedCo2Saved = Math.round(calculatorWaste * 0.45);
  const estimatedSoilNourished = Math.round(estimatedCompostYield / 2.5);

  const faqs = [
    {
      q: 'What types of vegetable waste are accepted on Agri to Harvest?',
      a: 'We accept organic, biodegradable produce trimmings including leafy greens, brassica outer leaves, rejected gourds, tomato and onion peels, and corn husks. Non-biodegradable plastics, packaging, and cooked food oils are strictly prohibited.'
    },
    {
      q: 'How do compost producers arrange waste collection?',
      a: 'Producers browse the "Available Waste" directory, filter by proximity or quantity, and click "Request Collection". Once the vegetable shopkeeper accepts, the producer dispatches airtight collection crates at the agreed pickup time.'
    },
    {
      q: 'How does the platform ensure compost quality for farmers?',
      a: 'Compost producers must record source batches, method of decomposition, and lab verification notes including NPK ratings (Nitrogen-Phosphorus-Potassium), pH levels, and moisture percentage before listing for sale.'
    },
    {
      q: 'Is payment simulated or real in this application?',
      a: 'For this college Design Thinking and Innovation project, a simulated payment gateway sandbox is provided. It models UPI, Card, and Cash on Delivery with full validation, receipt generation, and transactional stock deductions.'
    }
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#f1f6ed] via-[#f7f5ef] to-transparent pt-10 pb-16 sm:pt-16 sm:pb-24 border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 shadow-xs">
                <Recycle className="w-4 h-4 text-emerald-600 animate-spin" style={{ animationDuration: '6s' }} />
                <span>Circular Agricultural Waste Economy</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-emerald-950 tracking-tight leading-[1.1]">
                {t('heroTitle')}
              </h1>

              <p className="text-base sm:text-lg text-stone-600 max-w-2xl leading-relaxed">
                {t('heroSub')}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <button
                  onClick={() => setActivePage('product_market')}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md transition-all hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4 text-yellow-300" />
                  <span>{t('exploreProducts')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setActivePage('shopkeeper_dashboard');
                  }}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-900 font-bold text-sm border-2 border-emerald-600/30 transition-all flex items-center justify-center gap-2 shadow-xs"
                >
                  <Store className="w-4 h-4 text-emerald-700" />
                  <span>{t('listWaste')}</span>
                </button>
              </div>

              {/* Trust Badges */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-xs text-stone-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Zero Landfill Dumping</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Lab Verified Organic Humus</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Fair Pricing for Farmers</span>
                </div>
              </div>
            </div>

            {/* Right Hero Image Collage */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Main Card */}
                <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white">
                  <img
                    src="https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1000&q=80"
                    alt="Vegetable Market Produce Waste"
                    className="w-full h-64 sm:h-72 object-cover"
                  />
                  <div className="p-5 bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-orange-100 text-orange-800">
                        Market Waste Listing
                      </span>
                      <span className="text-xs font-bold text-emerald-800">180 kg Available</span>
                    </div>
                    <h4 className="font-bold text-stone-900 text-sm">
                      Bowenpally Rythu Bazar Spinach & Leafy Trimmings
                    </h4>
                    <p className="text-xs text-stone-500 mt-1">
                      Directly collected today for high-nitrogen vermiculture pits.
                    </p>
                  </div>
                </div>

                {/* Floating Badge 1: Finished Compost */}
                <div className="absolute -bottom-6 -left-6 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-stone-100 flex items-center gap-3 hidden sm:flex">
                  <div className="w-10 h-10 rounded-xl bg-amber-800 text-white flex items-center justify-center font-bold text-xs">
                    NPK
                  </div>
                  <div>
                    <div className="text-xs font-bold text-stone-900">Enriched Compost</div>
                    <div className="text-[11px] text-emerald-700 font-semibold">Ready for Farm Soil</div>
                  </div>
                </div>

                {/* Floating Badge 2: Diversion efficiency */}
                <div className="absolute -top-4 -right-4 bg-emerald-800 text-white p-3.5 rounded-2xl shadow-xl flex items-center gap-2">
                  <Sprout className="w-5 h-5 text-yellow-300" />
                  <div className="text-left">
                    <div className="text-[10px] text-emerald-200 uppercase font-semibold">Circular Loop</div>
                    <div className="text-xs font-bold">100% Recycled</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. REAL DATABASE-DRIVEN IMPACT STATISTICS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 sm:-mt-16 relative z-20">
        <div className="bg-white rounded-3xl shadow-xl border border-stone-200/80 p-6 sm:p-8">
          <div className="text-center mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Live Database Verification
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-stone-900 mt-1">
              Measurable Circular Economy Impact
            </h3>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-stone-100">
            {/* Stat 1 */}
            <div className="text-center pt-4 sm:pt-0">
              <div className="text-3xl sm:text-4xl font-black text-emerald-800 tracking-tight">
                {stats.totalWasteCollectedKg.toLocaleString()} <span className="text-lg font-bold text-emerald-600">kg</span>
              </div>
              <div className="text-xs font-semibold text-stone-600 mt-1">
                {t('wasteCollectedKg')}
              </div>
              <p className="text-[11px] text-stone-400 mt-0.5">Diverted from municipal landfills</p>
            </div>

            {/* Stat 2 */}
            <div className="text-center pt-4 sm:pt-0">
              <div className="text-3xl sm:text-4xl font-black text-amber-800 tracking-tight">
                {stats.totalCompostProducedKg.toLocaleString()} <span className="text-lg font-bold text-amber-600">kg</span>
              </div>
              <div className="text-xs font-semibold text-stone-600 mt-1">
                {t('compostProducedKg')}
              </div>
              <p className="text-[11px] text-stone-400 mt-0.5">Nutrient-rich biological humus</p>
            </div>

            {/* Stat 3 */}
            <div className="text-center pt-4 sm:pt-0">
              <div className="text-3xl sm:text-4xl font-black text-emerald-700 tracking-tight">
                {stats.activeShopkeepers}
              </div>
              <div className="text-xs font-semibold text-stone-600 mt-1">
                {t('participatingShopkeepers')}
              </div>
              <p className="text-[11px] text-stone-400 mt-0.5">Rythu Bazars & grocers</p>
            </div>

            {/* Stat 4 */}
            <div className="text-center pt-4 sm:pt-0">
              <div className="text-3xl sm:text-4xl font-black text-green-700 tracking-tight">
                {stats.activeFarmers}
              </div>
              <div className="text-xs font-semibold text-stone-600 mt-1">
                {t('participatingFarmers')}
              </div>
              <p className="text-[11px] text-stone-400 mt-0.5">Certified organic farms</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2.5 INTERACTIVE 3-STEP FLOW CONSOLE (NEAT & CLEAR DISPLAY) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <InteractiveFlowConsole setActivePage={setActivePage} />
      </section>

      {/* 3. HOW IT WORKS SECTION */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Four-Step Circular Loop
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight mt-3">
            How Agri to Harvest Transforms Waste
          </h2>
          <p className="text-sm text-stone-600 mt-2">
            A frictionless digital process connecting urban vegetable market surplus to rural farming vitality.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Step 1 */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm hover:shadow-md transition-shadow relative group">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-lg mb-4 group-hover:scale-110 transition-transform">
              <Store className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-orange-600">Phase 1</span>
            <h3 className="text-base font-bold text-stone-900 mt-1 mb-2">
              {t('step1Title')}
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              {t('step1Desc')}
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm hover:shadow-md transition-shadow relative group">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-lg mb-4 group-hover:scale-110 transition-transform">
              <Building className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-amber-700">Phase 2</span>
            <h3 className="text-base font-bold text-stone-900 mt-1 mb-2">
              {t('step2Title')}
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              {t('step2Desc')}
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm hover:shadow-md transition-shadow relative group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg mb-4 group-hover:scale-110 transition-transform">
              <Recycle className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-emerald-700">Phase 3</span>
            <h3 className="text-base font-bold text-stone-900 mt-1 mb-2">
              {t('step3Title')}
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              {t('step3Desc')}
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm hover:shadow-md transition-shadow relative group">
            <div className="w-12 h-12 rounded-2xl bg-green-100 text-green-800 flex items-center justify-center font-bold text-lg mb-4 group-hover:scale-110 transition-transform">
              <Sprout className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-green-700">Phase 4</span>
            <h3 className="text-base font-bold text-stone-900 mt-1 mb-2">
              {t('step4Title')}
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              {t('step4Desc')}
            </p>
          </div>
        </div>
      </section>

      {/* DEDICATED REAL-WORLD SCENARIO: 10kg TOMATOES FLOW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-[#f8faf5] via-white to-[#f4f7ee] rounded-3xl p-6 sm:p-10 border-2 border-emerald-600/30 shadow-lg relative overflow-hidden">
          <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-bold border border-orange-200 mb-2">
              <span>🍅 Real-World Scenario In Action</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              The 10kg Waste Tomatoes Journey
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed">
              When a vegetable shop has waste produce like <strong>10kg of surplus tomatoes</strong>, here is how Agri to Harvest connects the shopkeeper, the composer (compost producer), and the farmer:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Step 1: Shopkeeper */}
            <div className="bg-white rounded-2xl p-6 border border-orange-200 shadow-sm flex flex-col justify-between relative group hover:border-orange-400 transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-orange-100 text-orange-800">
                    Step 1: Vegetable Shopkeeper
                  </span>
                  <span className="text-xl">🍅</span>
                </div>
                <h3 className="font-bold text-stone-900 text-base">Enters 10kg Tomatoes Waste</h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  The vegetable stall owner enters the waste details online instead of dumping it in garbage bins:
                </p>
                <div className="p-3 rounded-xl bg-orange-50/60 border border-orange-100 text-xs space-y-1.5 font-medium">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Vegetable Name:</span>
                    <span className="font-bold text-stone-800">Ripe Tomatoes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Waste Quantity:</span>
                    <span className="font-bold text-orange-700">10 kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Location:</span>
                    <span className="font-bold text-stone-800">Rythu Bazar Stall #14</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Collection Price:</span>
                    <span className="font-bold text-emerald-700">Free / Give-away</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setActivePage('shopkeeper_dashboard')}
                className="mt-4 w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-1.5"
              >
                <Store className="w-3.5 h-3.5" />
                <span>Open Shopkeeper Form</span>
              </button>
            </div>

            {/* Step 2: Compost Producer (Composer) */}
            <div className="bg-white rounded-2xl p-6 border border-amber-200 shadow-sm flex flex-col justify-between relative group hover:border-amber-400 transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-amber-100 text-amber-800">
                    Step 2: The Composer (Producer)
                  </span>
                  <span className="text-xl">🏭</span>
                </div>
                <h3 className="font-bold text-stone-900 text-base">Collects It & Composts It</h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  The compost producer receives the alert, picks up the 10kg tomatoes, and starts scientific biological processing:
                </p>
                <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100 text-xs space-y-1.5 font-medium">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Collection Action:</span>
                    <span className="font-bold text-stone-800">Crates dispatched</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Method:</span>
                    <span className="font-bold text-stone-800">Vermicomposting Pit</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Biological Loss:</span>
                    <span className="text-stone-600">~64% Moisture evaporated</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Compost Yield:</span>
                    <span className="font-bold text-emerald-800">~3.6 kg Premium Humus</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setActivePage('producer_dashboard')}
                className="mt-4 w-full py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-1.5"
              >
                <Recycle className="w-3.5 h-3.5" />
                <span>Open Composer Batch Hub</span>
              </button>
            </div>

            {/* Step 3: Farmer */}
            <div className="bg-white rounded-2xl p-6 border border-emerald-200 shadow-sm flex flex-col justify-between relative group hover:border-emerald-400 transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                    Step 3: Soil-Enriching Farmer
                  </span>
                  <span className="text-xl">🚜</span>
                </div>
                <h3 className="font-bold text-stone-900 text-base">Sells Finished Compost to Farmers</h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  The composer lists the finished organic compost in the online store. Farmers purchase it directly for their crops:
                </p>
                <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-xs space-y-1.5 font-medium">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Store Product:</span>
                    <span className="font-bold text-stone-800">Enriched Vermicompost</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Farmer Price:</span>
                    <span className="font-bold text-emerald-800">₹12/kg (Fair Price)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Delivery:</span>
                    <span className="font-bold text-stone-800">Direct to Farmer's Field</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Soil Benefit:</span>
                    <span className="font-bold text-green-700">Rich Microbes & Moisture</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setActivePage('product_market')}
                className="mt-4 w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-1.5"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Browse & Buy as Farmer</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. RECENT VEGETABLE WASTE LISTINGS PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Fresh Listings from Markets
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 mt-1">
              Vegetable Waste Available for Collection
            </h2>
          </div>
          <button
            onClick={() => setActivePage('waste_market')}
            className="text-xs font-bold text-emerald-800 hover:text-emerald-900 flex items-center gap-1 group"
          >
            <span>View All Market Waste ({recentWaste.length}+)</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {recentWaste.map((waste) => (
            <div
              key={waste.id}
              className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={waste.image_url}
                    alt={waste.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-3 left-3 px-2 py-0.5 rounded-md text-[11px] font-bold bg-white/90 text-stone-900 backdrop-blur-xs">
                    {waste.vegetable_type}
                  </span>
                  <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-800 text-white">
                    {waste.is_free ? 'Free Waste' : `₹${waste.price_per_kg}/kg`}
                  </span>
                </div>

                <div className="p-4 space-y-2">
                  <h4 className="font-bold text-stone-900 text-sm line-clamp-1">{waste.title}</h4>
                  <div className="flex items-center gap-1 text-xs text-stone-500">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span className="truncate">{waste.collection_address}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs pt-2 border-t border-stone-100">
                    <span className="text-stone-500">Available Quantity:</span>
                    <span className="font-bold text-emerald-800">{waste.available_quantity_kg} kg</span>
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0">
                <button
                  onClick={() => setActivePage('waste_market')}
                  className="w-full py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold transition-colors"
                >
                  Request Collection
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. FEATURED ORGANIC PRODUCTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Direct from Producers to Farmers
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 mt-1">
              Finished Organic Compost & Products
            </h2>
          </div>
          <button
            onClick={() => setActivePage('product_market')}
            className="text-xs font-bold text-emerald-800 hover:text-emerald-900 flex items-center gap-1 group"
          >
            <span>Browse Full Store</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {addedNotice && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>{addedNotice}</span>
            </div>
            <button onClick={() => setAddedNotice(null)} className="text-emerald-700 hover:text-emerald-950 font-black">
              ✕
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((prod) => (
            <div
              key={prod.id}
              className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={prod.image_url}
                    alt={prod.title}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-3 left-3 px-2 py-0.5 rounded-md text-[11px] font-bold bg-white/90 text-stone-900">
                    {prod.category}
                  </span>
                  <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md text-[11px] font-bold bg-yellow-400 text-emerald-950">
                    ★ {prod.rating}
                  </span>
                </div>

                <div className="p-4 space-y-2">
                  <h4 className="font-bold text-stone-900 text-sm line-clamp-1">{prod.title}</h4>
                  <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                    {prod.description}
                  </p>
                  <div className="flex justify-between items-center text-xs pt-2 border-t border-stone-100">
                    <span className="text-xs font-black text-emerald-900 text-base">
                      ₹{prod.price} <span className="text-xs font-normal text-stone-500">/ {prod.unit}</span>
                    </span>
                    <span className="text-[11px] text-stone-500 font-medium">Stock: {prod.stock_quantity}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0">
                <button
                  onClick={() => handleFarmerAddToCart(prod)}
                  className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs hover:shadow"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Order for My Farm</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. INTERACTIVE GEOSPATIAL MAP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            Regional Circular Infrastructure
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 mt-1">
            Network of Markets, Producers & Farms
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Explore live pickup points and bio-enrichment nodes across Hyderabad, Shamshabad, Medchal, and Rangareddy.
          </p>
        </div>
        <MapViewer activeTab="all" />
      </section>

      {/* 7. INTERACTIVE WASTE-TO-WEALTH IMPACT CALCULATOR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-emerald-900 to-green-950 rounded-3xl p-6 sm:p-12 text-white shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800 text-yellow-300 text-xs font-bold border border-emerald-700">
                <Calculator className="w-3.5 h-3.5" />
                <span>Impact Forecaster</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                Simulate Your Vegetable Waste Transformation
              </h3>
              <p className="text-xs sm:text-sm text-emerald-200 leading-relaxed">
                Adjust the slider below to see how many kilograms of discarded market vegetable matter can be turned into rich vermicompost and farmer soil coverage.
              </p>

              {/* Slider */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-emerald-200">Waste Input:</span>
                  <span className="text-yellow-300 text-base font-bold">{calculatorWaste} kg / week</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="2000"
                  step="25"
                  value={calculatorWaste}
                  onChange={(e) => setCalculatorWaste(parseInt(e.target.value))}
                  className="w-full accent-yellow-400 bg-emerald-800 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-emerald-400">
                  <span>50 kg (Small Grocer)</span>
                  <span>1,000 kg (Wholesale Market)</span>
                  <span>2,000 kg (Rythu Bazar)</span>
                </div>
              </div>
            </div>

            {/* Results Grid */}
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 text-center">
                <div className="text-2xl sm:text-3xl font-black text-yellow-300">{estimatedCompostYield} kg</div>
                <div className="text-xs font-bold text-white mt-1">Finished Compost</div>
                <p className="text-[10px] text-emerald-200 mt-1">Rich in microbial biology (36% conversion)</p>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 text-center">
                <div className="text-2xl sm:text-3xl font-black text-emerald-300">{estimatedCo2Saved} kg</div>
                <div className="text-xs font-bold text-white mt-1">CO₂e Avoided</div>
                <p className="text-[10px] text-emerald-200 mt-1">Methane reduction from landfill diversion</p>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 text-center">
                <div className="text-2xl sm:text-3xl font-black text-yellow-300">{estimatedSoilNourished} m²</div>
                <div className="text-xs font-bold text-white mt-1">Farmland Restored</div>
                <p className="text-[10px] text-emerald-200 mt-1">Enriched crop root soil zone</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. BENEFITS FOR ALL THREE PARTICIPANTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            Tripartite Circular Economy
          </span>
          <h2 className="text-3xl font-black text-stone-900 tracking-tight mt-1">
            Benefits Across the Ecosystem
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Shopkeepers */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center mb-4">
              <Store className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-stone-900 mb-2">Vegetable Shopkeepers</h3>
            <ul className="space-y-2.5 text-xs text-stone-600">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Zero waste disposal fees and clean, odor-free market stalls.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Option to offer free waste or earn revenue per kilogram on clean bulk produce.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Scheduled pickup directly at stall door without transport hassle.</span>
              </li>
            </ul>
          </div>

          {/* Compost Producers */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mb-4">
              <Building className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-stone-900 mb-2">Compost Producers</h3>
            <ul className="space-y-2.5 text-xs text-stone-600">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Reliable, predictable supply of high-nitrogen vegetable organic feedstock.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Batch tracking tool ensuring scientific composting compliance and lab quality.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Built-in farmer marketplace to sell finished vermicompost with direct payouts.</span>
              </li>
            </ul>
          </div>

          {/* Farmers */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-green-100 text-green-800 flex items-center justify-center mb-4">
              <Sprout className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-stone-900 mb-2">Farming Community</h3>
            <ul className="space-y-2.5 text-xs text-stone-600">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>High-grade organic compost restoring dead, chemical-exhausted soil fertility.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Increases soil moisture retention by up to 40%, reducing irrigation stress.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Transparent prices, printable invoices, and convenient doorstep farm delivery.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 9. TESTIMONIALS (CLEARLY LABELED DEMO SHOWCASE) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-stone-50 rounded-3xl p-6 sm:p-12 border border-stone-200">
          <div className="text-center mb-8">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
              Demonstration Showcase
            </span>
            <h3 className="text-2xl font-bold text-stone-900 mt-2">
              Stories from the Pilot Network
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-white border border-stone-200 text-xs space-y-3">
              <p className="italic text-stone-600 leading-relaxed">
                "Earlier, sorting discarded coriander and cabbage heads was our biggest headache. Now, Suresh's compost team collects 350kg every evening. Our market stall is cleaner than ever."
              </p>
              <div className="font-bold text-stone-900">
                — Ramesh Babu, Rythu Bazar Bowenpally
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-stone-200 text-xs space-y-3">
              <p className="italic text-stone-600 leading-relaxed">
                "We turned 850kg of market trimmings into 310kg of premium earthworm castings with high microbial diversity. The Agri to Harvest batch tracker kept all temperature logs organized."
              </p>
              <div className="font-bold text-stone-900">
                — Suresh Reddy, GreenSoil Bio-Organics
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-stone-200 text-xs space-y-3">
              <p className="italic text-stone-600 leading-relaxed">
                "I ordered 50kg of vermicompost directly through the portal for my chili fields in Chevella. The soil texture changed within weeks, and my chemical fertilizer costs dropped by 30%."
              </p>
              <div className="font-bold text-stone-900">
                — Venkat Rao, Certified Organic Farmer
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. FREQUENTLY ASKED QUESTIONS */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            Got Questions?
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 mt-1">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="border border-stone-200 rounded-2xl overflow-hidden bg-white shadow-xs"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                className="w-full p-4 sm:p-5 text-left flex justify-between items-center gap-4 hover:bg-stone-50 transition-colors"
              >
                <span className="text-sm font-bold text-stone-800">{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-stone-400 transition-transform ${openFaq === idx ? 'rotate-180 text-emerald-700' : ''}`}
                />
              </button>
              {openFaq === idx && (
                <div className="p-4 sm:p-5 pt-0 text-xs text-stone-600 leading-relaxed border-t border-stone-100 bg-stone-50/50">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
