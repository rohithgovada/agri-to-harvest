import React, { useEffect, useState } from 'react';
import {
  Building,
  Plus,
  Recycle,
  Sprout,
  Store,
  Clock,
  CheckCircle,
  Truck,
  TrendingUp,
  MapPin,
  Calendar,
  AlertCircle,
  Filter,
  Search,
  Check,
  X,
  FileSpreadsheet,
  Award,
  DollarSign
} from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export default function ProducerDashboard() {
  const { user } = useAuth();
  const { showToast, fetchNotifications } = useNotifications();
  const [stats, setStats] = useState({
    totalWasteCollectedKg: 0,
    pendingRequests: 0,
    acceptedRequests: 0,
    totalCompostProducedKg: 0,
    activeBatches: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    availableMarketWasteKg: 0
  });

  const [activeTab, setActiveTab] = useState('browse_waste'); // 'browse_waste' | 'collections' | 'batches' | 'products'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Data lists
  const [marketWaste, setMarketWaste] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [myBatches, setMyBatches] = useState([]);
  const [myProducts, setMyProducts] = useState([]);

  // Filter for browsing waste
  const [wasteSearch, setWasteSearch] = useState('');
  const [wasteTypeFilter, setWasteTypeFilter] = useState('all');

  // Modals
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [selectedWaste, setSelectedWaste] = useState(null);
  const [reqQuantity, setReqQuantity] = useState('');
  const [pickupDatetime, setPickupDatetime] = useState('Tomorrow 10:00 AM');
  const [reqNotes, setReqNotes] = useState('');

  // Batch Creation Modal
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [sourceWasteType, setSourceWasteType] = useState('Market leafy trimmings and vegetable peels');
  const [inputWasteKg, setInputWasteKg] = useState('500');
  const [processingMethod, setProcessingMethod] = useState('Vermicomposting');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [estCompletionDate, setEstCompletionDate] = useState(
    new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [npkRatio, setNpkRatio] = useState('2.5 - 1.6 - 1.8');
  const [moisturePercent, setMoisturePercent] = useState('35');
  const [phLevel, setPhLevel] = useState('7.2');
  const [batchNotes, setBatchNotes] = useState('Inoculated with Eisenia fetida worms. Temperature and moisture controlled.');

  // Complete Batch Modal
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [batchToComplete, setBatchToComplete] = useState(null);
  const [finishedKg, setFinishedKg] = useState('');

  // Product Creation Modal
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [pTitle, setPTitle] = useState('');
  const [pCategory, setPCategory] = useState('Vermicompost');
  const [pDescription, setPDescription] = useState('');
  const [pPrice, setPPrice] = useState('320');
  const [pStock, setPStock] = useState('50');
  const [pUnit, setPUnit] = useState('25kg bag');
  const [pImage, setPImage] = useState('https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?auto=format&fit=crop&w=800&q=80');
  const [pUsage, setPUsage] = useState('Apply 1-2kg around the root base and incorporate gently into topsoil.');
  const [pBatchId, setPBatchId] = useState('');

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsRes, wasteRes, reqRes, batchRes, prodRes] = await Promise.all([
        api.getProducerStats(),
        api.getPublicWaste({ search: wasteSearch, type: wasteTypeFilter }),
        api.getProducerRequests(),
        api.getProducerBatches(),
        api.getProducerProducts()
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (wasteRes.success) setMarketWaste(wasteRes.listings || []);
      if (reqRes.success) setMyRequests(reqRes.requests || []);
      if (batchRes.success) setMyBatches(batchRes.batches || []);
      if (prodRes.success) setMyProducts(prodRes.products || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [wasteTypeFilter]);

  // Request Waste
  const handleOpenRequest = (waste) => {
    setSelectedWaste(waste);
    setReqQuantity(String(waste.available_quantity_kg));
    setRequestModalOpen(true);
  };

  const submitWasteRequest = async (e) => {
    e.preventDefault();
    try {
      const res = await api.requestWasteCollection({
        waste_listing_id: selectedWaste.id,
        requested_quantity_kg: parseFloat(reqQuantity),
        proposed_pickup_datetime: pickupDatetime,
        notes: reqNotes
      });

      if (res.success) {
        setSuccessMsg(`Collection request submitted for ${reqQuantity}kg from "${selectedWaste.title}".`);
        showToast('Collection Request Sent', `Request submitted for ${reqQuantity}kg from "${selectedWaste.title}".`, 'success');
        fetchNotifications();
        setRequestModalOpen(false);
        await loadAllData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // Create Batch
  const submitCreateBatch = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createBatch({
        source_waste_type: sourceWasteType,
        input_waste_kg: parseFloat(inputWasteKg),
        processing_method: processingMethod,
        processing_start_date: startDate,
        estimated_completion_date: estCompletionDate,
        npk_ratio: npkRatio,
        moisture_percent: parseFloat(moisturePercent),
        ph_level: parseFloat(phLevel),
        quality_notes: batchNotes
      });

      if (res.success) {
        setSuccessMsg(`Compost production batch ${res.batchCode} initiated!`);
        showToast('Compost Batch Logged', `Batch ${res.batchCode} initiated with ${inputWasteKg}kg input waste.`, 'success');
        fetchNotifications();
        setBatchModalOpen(false);
        await loadAllData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // Complete Batch
  const submitCompleteBatch = async (e) => {
    e.preventDefault();
    try {
      const res = await api.updateBatch(batchToComplete.id, {
        status: 'completed',
        finished_compost_kg: parseFloat(finishedKg),
        actual_completion_date: new Date().toISOString().split('T')[0]
      });

      if (res.success) {
        setSuccessMsg(`Batch completed! Yielded ${finishedKg}kg of finished compost.`);
        showToast('Batch Processing Completed', `Yielded ${finishedKg}kg of nutrient-rich finished compost.`, 'success');
        fetchNotifications();
        setCompleteModalOpen(false);
        await loadAllData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // Publish Product
  const submitCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createProduct({
        title: pTitle,
        category: pCategory,
        description: pDescription,
        price: parseFloat(pPrice),
        stock_quantity: parseFloat(pStock),
        unit: pUnit,
        image_url: pImage,
        batch_id: pBatchId ? parseInt(pBatchId) : null,
        usage_instructions: pUsage,
        is_verified_organic: true
      });

      if (res.success) {
        setSuccessMsg(`Product "${pTitle}" is now live on the farmer marketplace!`);
        showToast('Product Live on Store', `Product "${pTitle}" is now visible to regional farmers.`, 'success');
        fetchNotifications();
        setProductModalOpen(false);
        await loadAllData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-3 py-1 rounded-full w-fit border border-amber-200 mb-2">
            <Building className="w-3.5 h-3.5" />
            <span>Compost Producer Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            {user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Collect market vegetable waste, manage biological vermicomposting batches, and sell certified compost to farmers.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setBatchModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2"
          >
            <Recycle className="w-4 h-4 text-yellow-300" />
            <span>Start Production Batch</span>
          </button>
          <button
            onClick={() => setProductModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4 text-yellow-300" />
            <span>List Product for Sale</span>
          </button>
        </div>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
          <div className="text-xs font-semibold text-stone-500">Waste Collected</div>
          <div className="text-2xl sm:text-3xl font-black text-amber-900 mt-1">
            {stats.totalWasteCollectedKg} <span className="text-sm font-semibold text-stone-400">kg</span>
          </div>
          <p className="text-[11px] text-stone-400 mt-1">Raw vegetable feedstock</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
          <div className="text-xs font-semibold text-stone-500">Finished Compost Output</div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700 mt-1">
            {stats.totalCompostProducedKg} <span className="text-sm font-semibold text-stone-400">kg</span>
          </div>
          <p className="text-[11px] text-stone-400 mt-1">Ready organic humus</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
          <div className="text-xs font-semibold text-stone-500">Batches in Progress</div>
          <div className="text-2xl sm:text-3xl font-black text-stone-800 mt-1">
            {stats.activeBatches} <span className="text-sm font-semibold text-stone-400">active</span>
          </div>
          <p className="text-[11px] text-stone-400 mt-1">Undergoing decomposition</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
          <div className="text-xs font-semibold text-stone-500">Marketplace Sales</div>
          <div className="text-2xl sm:text-3xl font-black text-green-700 mt-1">
            ₹{stats.totalRevenue.toLocaleString()}
          </div>
          <p className="text-[11px] text-stone-400 mt-1">From {stats.totalOrders} farmer orders</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-stone-200 gap-6 text-sm font-bold overflow-x-auto">
        <button
          onClick={() => setActiveTab('browse_waste')}
          className={`pb-3 border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'browse_waste' ? 'border-amber-700 text-stone-900' : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Store className="w-4 h-4 text-orange-600" />
          <span>Market Waste Directory ({marketWaste.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('collections')}
          className={`pb-3 border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'collections' ? 'border-amber-700 text-stone-900' : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Truck className="w-4 h-4 text-amber-700" />
          <span>Collection Requests ({myRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('batches')}
          className={`pb-3 border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'batches' ? 'border-amber-700 text-stone-900' : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Recycle className="w-4 h-4 text-emerald-700" />
          <span>Compost Batches ({myBatches.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'products' ? 'border-amber-700 text-stone-900' : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Sprout className="w-4 h-4 text-green-700" />
          <span>My Listed Products ({myProducts.length})</span>
        </button>
      </div>

      {/* TAB 1: BROWSE AVAILABLE WASTE */}
      {activeTab === 'browse_waste' && (
        <div className="space-y-6">
          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search by vegetable type, shopkeeper or location..."
                value={wasteSearch}
                onChange={(e) => setWasteSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadAllData()}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-amber-700 bg-white"
              />
            </div>
            <select
              value={wasteTypeFilter}
              onChange={(e) => setWasteTypeFilter(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-700"
            >
              <option value="all">All Vegetable Types</option>
              <option value="Leafy Greens">Leafy Greens</option>
              <option value="Brassicas & Root Vegetables">Brassicas & Root Veggies</option>
              <option value="Tomatoes, Gourds & Solanaceae">Tomatoes & Gourds</option>
              <option value="Dry Husks, Peels & Stems">Dry Husks & Peels</option>
              <option value="Mixed Market Produce">Mixed Market Produce</option>
            </select>
          </div>

          {/* Waste cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {marketWaste.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44">
                    <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                    <span className="absolute top-3 left-3 px-2 py-0.5 rounded-md text-[11px] font-bold bg-white/90 text-stone-900">
                      {item.vegetable_type}
                    </span>
                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-800 text-white">
                      {item.is_free ? 'Free Collection' : `₹${item.price_per_kg}/kg`}
                    </span>
                  </div>

                  <div className="p-4 space-y-2">
                    <h4 className="font-bold text-stone-900 text-sm line-clamp-1">{item.title}</h4>
                    <p className="text-xs text-stone-500 line-clamp-2">{item.description}</p>

                    <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100 text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-stone-500">Condition:</span>
                        <span className="font-medium text-stone-800">{item.waste_condition}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">Available:</span>
                        <span className="font-bold text-emerald-800">{item.available_quantity_kg} kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">Pickup Window:</span>
                        <span className="text-stone-700">{item.available_datetime}</span>
                      </div>
                    </div>

                    <div className="text-xs text-stone-600 flex items-center gap-1.5 pt-1">
                      <MapPin className="w-3.5 h-3.5 text-stone-400" />
                      <span className="truncate">{item.collection_address}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <button
                    onClick={() => handleOpenRequest(item)}
                    className="w-full py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-xs"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Request Collection</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: MY COLLECTION REQUESTS */}
      {activeTab === 'collections' && (
        <div className="space-y-4">
          {myRequests.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-stone-200">
              <Truck className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <h3 className="font-bold text-stone-800 text-base">No collection requests sent yet</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1 mb-4">
                Explore the Market Waste Directory tab to find excess produce and request pickup.
              </p>
              <button
                onClick={() => setActiveTab('browse_waste')}
                className="px-4 py-2 rounded-xl bg-amber-800 text-white text-xs font-bold"
              >
                Browse Waste Listings
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {myRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                        req.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                        req.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                        req.status === 'collected' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-stone-100 text-stone-700'
                      }`}>
                        {req.status}
                      </span>
                      <h4 className="font-bold text-stone-900 text-sm">{req.waste_title}</h4>
                    </div>

                    <p className="text-xs text-stone-600">
                      Shopkeeper: <strong className="text-stone-900">{req.shopkeeper_name}</strong> • Phone: {req.shopkeeper_phone}
                    </p>

                    <div className="flex flex-wrap gap-4 text-xs text-stone-500 pt-1">
                      <span><strong>Requested Qty:</strong> {req.requested_quantity_kg} kg</span>
                      <span><strong>Pickup Address:</strong> {req.collection_address}</span>
                      <span><strong>Pickup Time:</strong> {req.proposed_pickup_datetime}</span>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {req.status === 'accepted' && (
                      <button
                        onClick={async () => {
                          await api.updateRequestStatus(req.id, {
                            status: 'collected',
                            actual_collected_kg: req.requested_quantity_kg
                          });
                          setSuccessMsg(`Collection of ${req.requested_quantity_kg}kg verified and logged.`);
                          await loadAllData();
                        }}
                        className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                      >
                        <CheckCircle className="w-4 h-4 text-yellow-300" />
                        <span>Confirm Pickup Completed ({req.requested_quantity_kg} kg)</span>
                      </button>
                    )}

                    {req.status === 'collected' && (
                      <div className="flex items-center gap-2">
                        <div className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                          ✓ Collected ({req.actual_collected_kg || req.requested_quantity_kg} kg)
                        </div>
                        <button
                          onClick={() => {
                            setSourceWasteType(`Collected ${req.actual_collected_kg || req.requested_quantity_kg}kg of ${req.waste_title}`);
                            setInputWasteKg(String(req.actual_collected_kg || req.requested_quantity_kg));
                            setBatchNotes(`Batch started from waste collected from ${req.shopkeeper_name} at ${req.collection_address}`);
                            setActiveTab('batches');
                            setBatchModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
                        >
                          <Recycle className="w-3.5 h-3.5 text-yellow-300" />
                          <span>Compost This Batch</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: COMPOST PRODUCTION BATCHES */}
      {activeTab === 'batches' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-stone-900 text-base">Compost Production Records</h3>
              <p className="text-xs text-stone-500">Track raw organic waste inputs, degradation methods, and final output yields.</p>
            </div>
            <button
              onClick={() => setBatchModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-amber-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4 text-yellow-300" />
              <span>New Batch</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myBatches.map((batch) => (
              <div
                key={batch.id}
                className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-mono text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                        {batch.batch_code}
                      </span>
                      <h4 className="font-bold text-stone-900 text-sm mt-1">{batch.processing_method}</h4>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                      batch.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {batch.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs pt-3 border-t border-stone-100">
                    <div>
                      <span className="text-stone-400 block text-[10px]">Input Waste:</span>
                      <span className="font-bold text-stone-900">{batch.input_waste_kg} kg</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px]">Finished Output:</span>
                      <span className="font-bold text-emerald-800">
                        {batch.finished_compost_kg ? `${batch.finished_compost_kg} kg` : 'Processing...'}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-100 text-xs space-y-1 mt-2">
                    <div className="flex justify-between">
                      <span className="text-stone-500">Source Waste:</span>
                      <span className="font-medium text-stone-800">{batch.source_waste_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">NPK Target:</span>
                      <span className="font-semibold text-emerald-800">{batch.npk_ratio}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">pH / Moisture:</span>
                      <span className="text-stone-700">pH {batch.ph_level} • {batch.moisture_percent}%</span>
                    </div>
                  </div>

                  {batch.quality_notes && (
                    <p className="text-[11px] text-stone-500 italic mt-2">
                      Notes: {batch.quality_notes}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-[11px] text-stone-400">
                    Started: {batch.processing_start_date}
                  </span>

                  {batch.status !== 'completed' ? (
                    <button
                      onClick={() => {
                        setBatchToComplete(batch);
                        setFinishedKg(String(Math.round(batch.input_waste_kg * 0.36)));
                        setCompleteModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs"
                    >
                      Record Completion
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Lab Verified</span>
                      </span>
                      <button
                        onClick={() => {
                          setPTitle(`Enriched ${batch.source_waste_type} Compost`);
                          setPBatchId(String(batch.id));
                          setPStock(String(Math.floor(batch.finished_compost_kg / 25) || 10));
                          setPUnit('25kg bag');
                          setPPrice('280');
                          setPDescription(`100% organic compost crafted from decomposed ${batch.source_waste_type}. Inoculated with beneficial microbes, lab tested NPK ${batch.npk_ratio}.`);
                          setActiveTab('products');
                          setProductModalOpen(true);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold shadow-xs flex items-center gap-1"
                      >
                        <Sprout className="w-3 h-3 text-yellow-300" />
                        <span>Sell to Farmers</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: MY LISTED PRODUCTS */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-stone-900 text-base">Finished Organic Compost Store</h3>
              <p className="text-xs text-stone-500">Manage products available for farmer purchase.</p>
            </div>
            <button
              onClick={() => setProductModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4 text-yellow-300" />
              <span>List New Product</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myProducts.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44">
                    <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
                    <span className="absolute top-3 left-3 px-2 py-0.5 rounded-md text-[11px] font-bold bg-white/90 text-stone-900">
                      {p.category}
                    </span>
                    <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md text-[11px] font-bold bg-yellow-400 text-emerald-950">
                      ★ {p.rating}
                    </span>
                  </div>

                  <div className="p-4 space-y-2">
                    <h4 className="font-bold text-stone-900 text-sm line-clamp-1">{p.title}</h4>
                    <p className="text-xs text-stone-500 line-clamp-2">{p.description}</p>

                    <div className="flex justify-between items-center text-xs pt-2 border-t border-stone-100">
                      <span className="font-black text-emerald-900 text-base">
                        ₹{p.price} <span className="text-xs font-normal text-stone-500">/ {p.unit}</span>
                      </span>
                      <span className="font-semibold text-stone-700">Stock: {p.stock_quantity}</span>
                    </div>

                    {p.batch_code && (
                      <div className="text-[11px] text-stone-400">
                        Derived from batch: <strong className="text-amber-800">{p.batch_code}</strong>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 pt-0 border-t border-stone-100 flex items-center justify-between mt-2">
                  <span className="text-[11px] text-emerald-700 font-bold">● Active in Store</span>
                  <button
                    onClick={async () => {
                      if (window.confirm('Delete this product from marketplace?')) {
                        await api.deleteProduct(p.id);
                        await loadAllData();
                      }
                    }}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: REQUEST WASTE COLLECTION */}
      {requestModalOpen && selectedWaste && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-stone-200">
            <div className="p-5 bg-gradient-to-r from-amber-800 to-amber-900 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base">Request Waste Collection</h3>
                <p className="text-xs text-amber-200">{selectedWaste.title}</p>
              </div>
              <button onClick={() => setRequestModalOpen(false)} className="text-amber-200 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={submitWasteRequest} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Requested Quantity (Available: {selectedWaste.available_quantity_kg} kg) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  max={selectedWaste.available_quantity_kg}
                  required
                  value={reqQuantity}
                  onChange={(e) => setReqQuantity(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Proposed Pickup Date & Time *</label>
                <input
                  type="text"
                  required
                  value={pickupDatetime}
                  onChange={(e) => setPickupDatetime(e.target.value)}
                  placeholder="e.g. Today at 5:00 PM"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Pickup Notes / Transport Details</label>
                <textarea
                  rows="2"
                  value={reqNotes}
                  onChange={(e) => setReqNotes(e.target.value)}
                  placeholder="We will arrive with a 1-ton pickup truck and sealed food-grade bins."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300"
                ></textarea>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 text-amber-900 text-xs border border-amber-200">
                Notice: Submitting will reserve this quantity concurrency-safely pending the shopkeeper's approval.
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs shadow-md"
              >
                Send Collection Request
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: START PRODUCTION BATCH */}
      {batchModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-stone-200">
            <div className="p-5 bg-gradient-to-r from-emerald-800 to-green-900 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base">New Compost Production Batch</h3>
                <p className="text-xs text-emerald-200">Scientific composting record & quality logs</p>
              </div>
              <button onClick={() => setBatchModalOpen(false)} className="text-emerald-200 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={submitCreateBatch} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Source Waste Description *</label>
                <input
                  type="text"
                  required
                  value={sourceWasteType}
                  onChange={(e) => setSourceWasteType(e.target.value)}
                  placeholder="e.g. Mixed Bowenpally market trimmings"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Input Waste (kg) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={inputWasteKg}
                    onChange={(e) => setInputWasteKg(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Processing Method *</label>
                  <select
                    value={processingMethod}
                    onChange={(e) => setProcessingMethod(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 bg-white"
                  >
                    <option value="Vermicomposting">Vermicomposting (Earthworms)</option>
                    <option value="Aerobic Windrow">Aerobic Windrow (Turned Piles)</option>
                    <option value="Bokashi Fermentation">Bokashi (Anaerobic Ferment)</option>
                    <option value="In-Vessel / Pit Composting">In-Vessel / Pit Composting</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Estimated Completion *</label>
                  <input
                    type="date"
                    required
                    value={estCompletionDate}
                    onChange={(e) => setEstCompletionDate(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">NPK Ratio</label>
                  <input
                    type="text"
                    value={npkRatio}
                    onChange={(e) => setNpkRatio(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs rounded-xl border border-stone-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Moisture %</label>
                  <input
                    type="number"
                    value={moisturePercent}
                    onChange={(e) => setMoisturePercent(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs rounded-xl border border-stone-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">pH Level</label>
                  <input
                    type="number"
                    step="0.1"
                    value={phLevel}
                    onChange={(e) => setPhLevel(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs rounded-xl border border-stone-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Quality Check & Processing Notes</label>
                <textarea
                  rows="2"
                  value={batchNotes}
                  onChange={(e) => setBatchNotes(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-md"
              >
                Start & Record Production Batch
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: COMPLETE BATCH */}
      {completeModalOpen && batchToComplete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-stone-200">
            <div className="p-5 bg-gradient-to-r from-emerald-800 to-green-900 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base">Record Finished Compost Yield</h3>
                <p className="text-xs text-emerald-200">{batchToComplete.batch_code}</p>
              </div>
              <button onClick={() => setCompleteModalOpen(false)} className="text-emerald-200 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={submitCompleteBatch} className="p-6 space-y-4">
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-950 text-xs border border-emerald-200">
                <strong>Input Raw Waste:</strong> {batchToComplete.input_waste_kg} kg. Due to biological evaporation and moisture reduction, typical finished humus output is 30% to 40% of original mass.
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Finished Compost Quantity (kg) *</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={finishedKg}
                  onChange={(e) => setFinishedKg(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-md"
              >
                Finalize Batch & Certify Output
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PUBLISH ORGANIC PRODUCT */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-stone-200">
            <div className="p-5 bg-gradient-to-r from-emerald-800 to-green-900 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base">Publish Organic Product for Farmers</h3>
                <p className="text-xs text-emerald-200">List finished compost or bio-fertilizers</p>
              </div>
              <button onClick={() => setProductModalOpen(false)} className="text-emerald-200 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={submitCreateProduct} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={pTitle}
                  onChange={(e) => setPTitle(e.target.value)}
                  placeholder="e.g. Premium Pure Vermicompost (Black Gold)"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Category *</label>
                  <select
                    value={pCategory}
                    onChange={(e) => setPCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 bg-white"
                  >
                    <option value="Vermicompost">Vermicompost</option>
                    <option value="Vegetable Compost">Vegetable Compost</option>
                    <option value="Organic Manure">Organic Manure</option>
                    <option value="Soil Conditioners">Soil Conditioners</option>
                    <option value="Bio-fertilizers">Bio-fertilizers</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Link to Finished Batch</label>
                  <select
                    value={pBatchId}
                    onChange={(e) => setPBatchId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 bg-white"
                  >
                    <option value="">None / General Stock</option>
                    {myBatches.map(b => (
                      <option key={b.id} value={b.id}>{b.batch_code} ({b.processing_method})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Description *</label>
                <textarea
                  rows="2"
                  required
                  value={pDescription}
                  onChange={(e) => setPDescription(e.target.value)}
                  placeholder="Pure organic humus crafted from recycled vegetable market trimmings..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300"
                ></textarea>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={pPrice}
                    onChange={(e) => setPPrice(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Stock *</label>
                  <input
                    type="number"
                    required
                    value={pStock}
                    onChange={(e) => setPStock(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Unit *</label>
                  <select
                    value={pUnit}
                    onChange={(e) => setPUnit(e.target.value)}
                    className="w-full px-2 py-2 text-xs rounded-xl border border-stone-300 bg-white"
                  >
                    <option value="25kg bag">25kg bag</option>
                    <option value="50kg bag">50kg bag</option>
                    <option value="kg">kg</option>
                    <option value="5L can">5L can</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Usage Instructions for Farmers</label>
                <input
                  type="text"
                  value={pUsage}
                  onChange={(e) => setPUsage(e.target.value)}
                  placeholder="Incorporate 200g per vegetable plant or 1 ton/acre basal dose."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-md"
              >
                Publish to Marketplace
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
