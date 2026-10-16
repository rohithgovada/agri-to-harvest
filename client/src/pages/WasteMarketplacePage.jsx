import React, { useEffect, useState } from 'react';
import { Store, Search, Filter, MapPin, Calendar, Truck, CheckCircle, Plus, X } from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export default function WasteMarketplacePage({ onOpenAuth }) {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [condition, setCondition] = useState('all');
  const [isFreeOnly, setIsFreeOnly] = useState(false);

  // Request Modal
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [selectedWaste, setSelectedWaste] = useState(null);
  const [reqQty, setReqQty] = useState('');
  const [pickupTime, setPickupTime] = useState('Tomorrow 10:00 AM');
  const [notes, setNotes] = useState('');
  const [successMsg, setSuccessMsg] = useState(null);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const res = await api.getPublicWaste({
        search,
        type: type !== 'all' ? type : undefined,
        condition: condition !== 'all' ? condition : undefined,
        isFree: isFreeOnly ? 'true' : undefined
      });
      if (res.success) {
        setListings(res.listings || []);
      }
    } catch (e) {
      setError(e.message || 'Failed to fetch waste listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [type, condition, isFreeOnly]);

  const handleRequestClick = (waste) => {
    if (!user) {
      onOpenAuth('login');
      return;
    }
    if (user.role !== 'compost_producer' && user.role !== 'admin') {
      alert('Only registered Compost Producers can request raw vegetable waste collections. You can test as a Compost Producer using the top Demo role switcher!');
      return;
    }
    setSelectedWaste(waste);
    setReqQty(String(waste.available_quantity_kg));
    setRequestModalOpen(true);
  };

  const submitRequest = async (e) => {
    e.preventDefault();
    try {
      const res = await api.requestWasteCollection({
        waste_listing_id: selectedWaste.id,
        requested_quantity_kg: parseFloat(reqQty),
        proposed_pickup_datetime: pickupTime,
        notes
      });
      if (res.success) {
        setSuccessMsg(`Collection request for ${reqQty}kg submitted successfully.`);
        setRequestModalOpen(false);
        await fetchListings();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 to-green-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800 text-yellow-300 text-xs font-bold mb-2">
            <Store className="w-3.5 h-3.5" />
            <span>Marketplace Waste Directory</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Vegetable Waste Available for Collection
          </h1>
          <p className="text-xs sm:text-sm text-emerald-200 mt-1 max-w-xl">
            Sourced daily from Rythu Bazars, supermarket trimmings, and local green grocers. 100% organic, pathogen-free feedstock.
          </p>
        </div>

        <div className="text-right">
          <div className="text-2xl font-black text-yellow-300">
            {listings.reduce((sum, l) => sum + (parseFloat(l.available_quantity_kg) || 0), 0)} kg
          </div>
          <div className="text-xs text-emerald-200 font-medium">Currently Available Today</div>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by vegetable name, market yard, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchListings()}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-stone-300 bg-white"
          >
            <option value="all">All Vegetable Types</option>
            <option value="Leafy Greens">Leafy Greens</option>
            <option value="Brassicas & Root Vegetables">Brassicas & Root Veggies</option>
            <option value="Tomatoes, Gourds & Solanaceae">Tomatoes & Gourds</option>
            <option value="Dry Husks, Peels & Stems">Dry Husks & Peels</option>
            <option value="Mixed Market Produce">Mixed Market Produce</option>
          </select>

          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-stone-300 bg-white"
          >
            <option value="all">All Conditions</option>
            <option value="Freshly Cut / Trimmings">Freshly Cut / Trimmings</option>
            <option value="Wilted / Overripe">Wilted / Overripe</option>
            <option value="Spoiled / Excess Market Produce">Spoiled / Excess</option>
            <option value="Dry Husks, Peels & Stems">Dry Husks & Peels</option>
          </select>

          <label className="flex items-center gap-1.5 text-xs text-stone-700 px-3 py-2 rounded-xl border border-stone-300 cursor-pointer bg-white">
            <input
              type="checkbox"
              checked={isFreeOnly}
              onChange={(e) => setIsFreeOnly(e.target.checked)}
              className="rounded text-emerald-700"
            />
            <span>Free Only</span>
          </label>
        </div>
      </div>

      {/* Grid of Listings */}
      {loading ? (
        <div className="text-center py-16 text-xs text-stone-500">Loading vegetable waste listings...</div>
      ) : listings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-stone-200">
          <Store className="w-12 h-12 text-stone-300 mx-auto mb-2" />
          <h3 className="font-bold text-stone-800 text-sm">No vegetable waste matches your filter</h3>
          <p className="text-xs text-stone-500 mt-1">Try resetting the search terms or filters above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <div className="relative h-48">
                  <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                  <span className="absolute top-3 left-3 px-2 py-0.5 rounded-md text-[11px] font-bold bg-white/90 text-stone-900">
                    {item.vegetable_type}
                  </span>
                  <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-800 text-white">
                    {item.is_free ? 'Free Collection' : `₹${item.price_per_kg}/kg`}
                  </span>
                </div>

                <div className="p-5 space-y-2.5">
                  <h3 className="font-bold text-stone-900 text-base">{item.title}</h3>
                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">{item.description}</p>

                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-100 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-stone-500">Condition:</span>
                      <span className="font-medium text-stone-800">{item.waste_condition}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Available Quantity:</span>
                      <span className="font-bold text-emerald-800">{item.available_quantity_kg} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Pickup Window:</span>
                      <span className="text-stone-700">{item.available_datetime}</span>
                    </div>
                  </div>

                  <div className="text-xs text-stone-600 flex items-center gap-1.5 pt-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span className="truncate">{item.collection_address}, {item.city}</span>
                  </div>
                  <div className="text-[11px] text-stone-500">
                    Stall Contact: {item.shopkeeper_name} ({item.contact_phone})
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <button
                  onClick={() => handleRequestClick(item)}
                  className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <Truck className="w-4 h-4" />
                  <span>Request Waste Collection</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* REQUEST MODAL */}
      {requestModalOpen && selectedWaste && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-stone-200">
            <div className="p-5 bg-gradient-to-r from-emerald-800 to-green-900 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base">Request Waste Collection</h3>
                <p className="text-xs text-emerald-200 truncate max-w-xs">{selectedWaste.title}</p>
              </div>
              <button onClick={() => setRequestModalOpen(false)} className="text-emerald-200 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={submitRequest} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Requested Quantity (kg) • Max {selectedWaste.available_quantity_kg} kg *
                </label>
                <input
                  type="number"
                  step="0.1"
                  max={selectedWaste.available_quantity_kg}
                  required
                  value={reqQty}
                  onChange={(e) => setReqQty(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Proposed Pickup Window *</label>
                <input
                  type="text"
                  required
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  placeholder="e.g. Today at 4:30 PM"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Transportation & Bin Notes</label>
                <textarea
                  rows="2"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Airtight sealed crates with hydraulic tipper..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md"
              >
                Confirm Collection Request
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
