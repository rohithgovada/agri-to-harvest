import React, { useEffect, useState } from 'react';
import {
  Store,
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  MapPin,
  Calendar,
  Check,
  X,
  Phone,
  Scale,
  Sparkles,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export default function ShopkeeperDashboard() {
  const { user } = useAuth();
  const { showToast, fetchNotifications } = useNotifications();
  const [stats, setStats] = useState({ totalListings: 0, activeListings: 0, totalWasteKg: 0, collectedWasteKg: 0 });
  const [listings, setListings] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Tabs
  const [activeTab, setActiveTab] = useState('listings'); // 'listings' | 'requests'

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Listing Form State
  const [title, setTitle] = useState('');
  const [vegetableType, setVegetableType] = useState('Leafy Greens');
  const [description, setDescription] = useState('');
  const [quantityKg, setQuantityKg] = useState('');
  const [wasteCondition, setWasteCondition] = useState('Freshly Cut / Trimmings');
  const [availableDatetime, setAvailableDatetime] = useState('Today, 3:00 PM - 7:00 PM');
  const [collectionAddress, setCollectionAddress] = useState(user?.address || 'Rythu Bazar Stall #14');
  const [city, setCity] = useState(user?.city || 'Hyderabad');
  const [pricePerKg, setPricePerKg] = useState('0');
  const [isFree, setIsFree] = useState(true);
  const [imageUrl, setImageUrl] = useState('');
  const [contactPhone, setContactPhone] = useState(user?.phone || '+91 94401 22334');
  const [isCompostableCertified, setIsCompostableCertified] = useState(true);

  // Preset photos for easy selection
  const presetPhotos = [
    { label: 'Leafy Greens', url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80' },
    { label: 'Brassicas & Roots', url: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=800&q=80' },
    { label: 'Tomatoes & Gourds', url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80' },
    { label: 'Peels & Husks', url: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=800&q=80' }
  ];

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [listingsRes, requestsRes] = await Promise.all([
        api.getShopkeeperListings(),
        api.getShopkeeperRequests()
      ]);

      if (listingsRes.success) {
        setListings(listingsRes.listings || []);
        if (listingsRes.stats) setStats(listingsRes.stats);
      }
      if (requestsRes.success) {
        setRequests(requestsRes.requests || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load shopkeeper data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateListing = async (e) => {
    e.preventDefault();
    if (!isCompostableCertified) {
      alert('You must certify that the waste is 100% organic and free of hazardous or non-biodegradable plastics.');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        title,
        vegetable_type: vegetableType,
        description,
        quantity_kg: parseFloat(quantityKg),
        waste_condition: wasteCondition,
        available_datetime: availableDatetime,
        collection_address: collectionAddress,
        city,
        price_per_kg: isFree ? 0 : parseFloat(pricePerKg),
        is_free: isFree,
        image_url: imageUrl || presetPhotos[0].url,
        contact_phone: contactPhone
      };

      const res = await api.createWasteListing(payload);
      if (res.success) {
        setSuccessMsg('Vegetable waste listed successfully! Nearby compost producers can now request pickup.');
        showToast('Vegetable Waste Listed', `Listed ${payload.quantity_kg}kg of "${payload.title}" for pickup.`, 'success');
        fetchNotifications();
        setIsModalOpen(false);
        // Reset
        setTitle('');
        setQuantityKg('');
        setDescription('');
        await loadData();
      }
    } catch (err) {
      setError(err.message || 'Failed to create listing.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateRequestStatus = async (requestId, status, actualKg) => {
    try {
      const res = await api.updateRequestStatus(requestId, { status, actual_collected_kg: actualKg });
      if (res.success) {
        setSuccessMsg(`Collection request marked as ${status}.`);
        showToast('Pickup Status Updated', `Collection request #${requestId} updated to "${status}".`, 'info');
        fetchNotifications();
        await loadData();
      }
    } catch (err) {
      alert(err.message || 'Failed to update request.');
    }
  };

  const handleDeleteListing = async (id) => {
    if (!window.confirm('Are you sure you want to remove this waste listing?')) return;
    try {
      await api.deleteWasteListing(id);
      setSuccessMsg('Listing deleted.');
      await loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const pendingRequestsCount = requests.filter(r => r.status === 'pending').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-700 bg-orange-50 px-3 py-1 rounded-full w-fit border border-orange-200 mb-2">
            <Store className="w-3.5 h-3.5" />
            <span>Shopkeeper Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            Welcome, {user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            List and manage your market's excess vegetable cuts, peels, and unsold produce for rapid collection.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 hover:shadow-lg"
          >
            <Plus className="w-4 h-4 text-yellow-300" />
            <span>List Vegetable Waste</span>
          </button>
          <button
            onClick={loadData}
            className="p-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
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

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
          <div className="text-xs font-semibold text-stone-500">Total Waste Listed</div>
          <div className="text-2xl sm:text-3xl font-black text-stone-900 mt-1">
            {stats.totalWasteKg} <span className="text-sm font-semibold text-stone-400">kg</span>
          </div>
          <p className="text-[11px] text-stone-400 mt-1">Across all historical posts</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
          <div className="text-xs font-semibold text-stone-500">Active Available Waste</div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700 mt-1">
            {stats.activeListings} <span className="text-sm font-semibold text-stone-400">listings</span>
          </div>
          <p className="text-[11px] text-stone-400 mt-1">Ready for producer pickup</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
          <div className="text-xs font-semibold text-stone-500">Successfully Collected</div>
          <div className="text-2xl sm:text-3xl font-black text-amber-800 mt-1">
            {stats.collectedWasteKg} <span className="text-sm font-semibold text-stone-400">kg</span>
          </div>
          <p className="text-[11px] text-stone-400 mt-1">Converted to organic compost</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
          <div className="text-xs font-semibold text-stone-500">Pending Requests</div>
          <div className="text-2xl sm:text-3xl font-black text-orange-600 mt-1">
            {pendingRequestsCount} <span className="text-sm font-semibold text-stone-400">awaiting</span>
          </div>
          <p className="text-[11px] text-stone-400 mt-1">Needs your approval</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-stone-200 gap-6 text-sm font-bold">
        <button
          onClick={() => setActiveTab('listings')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'listings' ? 'border-emerald-700 text-emerald-950' : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <span>My Waste Listings</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-stone-100 text-stone-700">
            {listings.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'requests' ? 'border-emerald-700 text-emerald-950' : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <span>Collection Requests</span>
          {pendingRequestsCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs bg-orange-500 text-white font-bold">
              {pendingRequestsCount} new
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: LISTINGS */}
      {activeTab === 'listings' && (
        <div className="space-y-4">
          {listings.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-stone-200">
              <Store className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <h3 className="font-bold text-stone-800 text-base">No waste listed yet</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1 mb-4">
                Have excess vegetable cuts, carrot greens, or overripe tomatoes? List them today so nearby composters can collect them.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-emerald-700 text-white font-bold text-xs shadow-sm hover:bg-emerald-800"
              >
                Create First Listing
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-44">
                      <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                      <span className={`absolute top-3 right-3 px-2 py-0.5 rounded-md text-[11px] font-bold uppercase ${
                        item.status === 'available' ? 'bg-emerald-600 text-white' :
                        item.status === 'partially_reserved' ? 'bg-amber-600 text-white' :
                        item.status === 'collected' ? 'bg-stone-700 text-white' :
                        'bg-orange-500 text-white'
                      }`}>
                        {item.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="p-4 space-y-2">
                      <h4 className="font-bold text-stone-900 text-sm line-clamp-1">{item.title}</h4>
                      <p className="text-xs text-stone-500 line-clamp-2">{item.description}</p>

                      <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-stone-100">
                        <div>
                          <span className="text-stone-400 block text-[10px]">Total Listed:</span>
                          <span className="font-bold text-stone-800">{item.quantity_kg} kg</span>
                        </div>
                        <div>
                          <span className="text-stone-400 block text-[10px]">Available:</span>
                          <span className="font-bold text-emerald-800">{item.available_quantity_kg} kg</span>
                        </div>
                      </div>

                      <div className="text-xs text-stone-600 flex items-center gap-1.5 pt-1">
                        <MapPin className="w-3.5 h-3.5 text-stone-400" />
                        <span className="truncate">{item.collection_address}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-0 border-t border-stone-100 flex items-center justify-between mt-2">
                    <span className="text-xs font-bold text-emerald-900">
                      {item.is_free ? 'Free Waste' : `₹${item.price_per_kg}/kg`}
                    </span>
                    <button
                      onClick={() => handleDeleteListing(item.id)}
                      className="p-1.5 text-stone-400 hover:text-red-600 transition-colors"
                      title="Remove Listing"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: COLLECTION REQUESTS */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {requests.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-stone-200">
              <Clock className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <h3 className="font-bold text-stone-800 text-base">No collection requests received yet</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1">
                When compost producers request pickup of your vegetable waste, their offers will appear here for your confirmation.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => (
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
                      Requested by <strong className="text-stone-900">{req.producer_name}</strong> • Phone: {req.producer_phone}
                    </p>

                    <div className="flex flex-wrap gap-4 text-xs text-stone-500 pt-1">
                      <span><strong>Requested Qty:</strong> {req.requested_quantity_kg} kg</span>
                      <span><strong>Pickup Time:</strong> {req.proposed_pickup_datetime}</span>
                    </div>

                    {req.notes && (
                      <p className="text-xs text-stone-500 bg-stone-50 p-2 rounded-lg italic border border-stone-100">
                        "{req.notes}"
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {req.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleUpdateRequestStatus(req.id, 'accepted')}
                          className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
                        >
                          <Check className="w-4 h-4" />
                          <span>Accept Request</span>
                        </button>
                        <button
                          onClick={() => handleUpdateRequestStatus(req.id, 'rejected')}
                          className="px-3 py-2 rounded-xl border border-stone-200 hover:bg-red-50 text-red-600 text-xs font-semibold"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {req.status === 'accepted' && (
                      <button
                        onClick={() => {
                          handleUpdateRequestStatus(req.id, 'collected', req.requested_quantity_kg);
                        }}
                        className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                      >
                        <CheckCircle className="w-4 h-4 text-yellow-300" />
                        <span>Confirm Handover ({req.requested_quantity_kg} kg)</span>
                      </button>
                    )}

                    {req.status === 'collected' && (
                      <div className="text-xs font-bold text-emerald-800 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span>Completed ({req.actual_collected_kg || req.requested_quantity_kg} kg)</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ADD WASTE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-stone-200 animate-in fade-in zoom-in-95">
            <div className="p-6 bg-gradient-to-r from-emerald-800 to-green-900 text-white flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold">List Vegetable Waste</h3>
                <p className="text-xs text-emerald-200 mt-0.5">Connect with certified compost producers</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-emerald-200 hover:text-white hover:bg-emerald-700/50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateListing} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Quick Scenario Templates */}
              <div className="p-3 rounded-2xl bg-orange-50 border border-orange-200">
                <span className="text-[11px] font-bold uppercase tracking-wider text-orange-900 block mb-1.5">
                  ⚡ 1-Click Quick Fill Templates:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setTitle('10kg Surplus Ripe Tomatoes Waste');
                      setVegetableType('Tomatoes, Gourds & Solanaceae');
                      setQuantityKg('10');
                      setWasteCondition('Wilted / Overripe');
                      setDescription('Overripe and cracked tomatoes separated from morning stall sorting. High moisture, ideal for composting.');
                      setIsFree(true);
                      setPricePerKg('0');
                      setImageUrl('https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-orange-100 text-orange-900 border border-orange-300 text-xs font-bold shadow-xs transition-colors"
                  >
                    🍅 10kg Waste Tomatoes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTitle('25kg Fresh Spinach & Leafy Cuts');
                      setVegetableType('Leafy Greens');
                      setQuantityKg('25');
                      setWasteCondition('Freshly Cut / Trimmings');
                      setDescription('Daily morning spinach and coriander trimmings. Clean, 100% organic nitrogen-rich matter.');
                      setIsFree(true);
                      setPricePerKg('0');
                      setImageUrl('https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-semibold shadow-xs transition-colors"
                  >
                    🥬 25kg Leafy Greens
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTitle('50kg Cabbage, Cauliflower & Carrot Tops');
                      setVegetableType('Brassicas & Root Vegetables');
                      setQuantityKg('50');
                      setWasteCondition('Freshly Cut / Trimmings');
                      setDescription('Crisp discarded outer leaves and stems from bulk crate unpacking.');
                      setIsFree(true);
                      setPricePerKg('0');
                      setImageUrl('https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=800&q=80');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-semibold shadow-xs transition-colors"
                  >
                    🥕 50kg Brassicas & Roots
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Vegetable Title / Name * (e.g. 10kg Tomatoes Waste)
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 10kg Tomatoes Waste / Fresh Coriander Trimmings"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Vegetable Type *</label>
                  <select
                    value={vegetableType}
                    onChange={(e) => setVegetableType(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                  >
                    <option value="Leafy Greens">Leafy Greens</option>
                    <option value="Brassicas & Root Vegetables">Brassicas & Root Veggies</option>
                    <option value="Tomatoes, Gourds & Solanaceae">Tomatoes & Gourds</option>
                    <option value="Dry Husks, Peels & Stems">Dry Husks & Peels</option>
                    <option value="Mixed Market Produce">Mixed Market Produce</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Quantity in Kilograms *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={quantityKg}
                    onChange={(e) => setQuantityKg(e.target.value)}
                    placeholder="e.g. 150"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Condition of Waste *</label>
                <select
                  value={wasteCondition}
                  onChange={(e) => setWasteCondition(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                >
                  <option value="Freshly Cut / Trimmings">Freshly Cut / Trimmings</option>
                  <option value="Wilted / Overripe">Wilted / Overripe</option>
                  <option value="Spoiled / Excess Market Produce">Spoiled / Excess Market Produce</option>
                  <option value="Dry Husks, Peels & Stems">Dry Husks, Peels & Stems</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Available Date & Time Window *</label>
                <input
                  type="text"
                  required
                  value={availableDatetime}
                  onChange={(e) => setAvailableDatetime(e.target.value)}
                  placeholder="e.g. Today, 2:00 PM - 7:00 PM"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Collection Address *</label>
                  <input
                    type="text"
                    required
                    value={collectionAddress}
                    onChange={(e) => setCollectionAddress(e.target.value)}
                    placeholder="Stall #14, Rythu Bazar"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">City / Yard Location *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Hyderabad"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              {/* Pricing Option: Free vs Paid */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-stone-700">
                  Pricing Option (Seller's Choice) *
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => { setIsFree(true); setPricePerKg('0'); }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isFree
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500 font-bold shadow-xs'
                        : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <div className="text-xs font-bold flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                      <span>🟢 Free Collection</span>
                    </div>
                    <div className="text-[10px] text-stone-500 mt-1">Zero fee • Free bio-recycling</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setIsFree(false); if (pricePerKg === '0') setPricePerKg('0.50'); }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      !isFree
                        ? 'border-amber-600 bg-amber-50 text-amber-950 ring-2 ring-amber-500 font-bold shadow-xs'
                        : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <div className="text-xs font-bold flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
                      <span>💰 Paid (Set ₹ / kg)</span>
                    </div>
                    <div className="text-[10px] text-stone-500 mt-1">Earn income per kilogram</div>
                  </button>
                </div>

                {!isFree && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-2 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-amber-950">Selling Price per Kilogram (₹):</label>
                      <div className="flex gap-1">
                        {['0.50', '1.00', '1.50', '2.00'].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setPricePerKg(val)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                              pricePerKg === val ? 'bg-amber-600 text-white border-amber-600' : 'bg-white text-amber-900 border-amber-300 hover:bg-amber-100'
                            }`}
                          >
                            ₹{val}
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

                    <div className="text-[11px] text-amber-800 font-medium flex justify-between">
                      <span>Estimated Stall Revenue:</span>
                      <strong className="text-amber-950">
                        ₹{(parseFloat(quantityKg || 0) * (parseFloat(pricePerKg) || 0)).toFixed(2)}
                      </strong>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Select Preset Photo or URL</label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {presetPhotos.map((p, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setImageUrl(p.url)}
                      className={`relative rounded-xl overflow-hidden h-14 border-2 transition-all ${
                        imageUrl === p.url ? 'border-emerald-600 ring-2 ring-emerald-300' : 'border-stone-200'
                      }`}
                    >
                      <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                      <span className="absolute bottom-0 inset-x-0 bg-stone-900/70 text-[9px] text-white py-0.5 truncate px-1">
                        {p.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Compostability Checklist */}
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-1">
                <label className="flex items-start gap-2 cursor-pointer font-semibold">
                  <input
                    type="checkbox"
                    checked={isCompostableCertified}
                    onChange={(e) => setIsCompostableCertified(e.target.checked)}
                    className="mt-0.5 text-emerald-700"
                  />
                  <span>
                    I certify this vegetable waste is 100% biodegradable and free from plastics, chemical cleansers, or hazardous material.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Publishing...' : 'Publish Waste Listing'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
