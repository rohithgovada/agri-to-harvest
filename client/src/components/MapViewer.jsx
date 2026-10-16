import React, { useState } from 'react';
import { MapPin, Navigation, Phone, Sparkles, Building, Sprout, Store } from 'lucide-react';

export default function MapViewer({ activeTab = 'all', onSelectListing }) {
  const [selectedHub, setSelectedHub] = useState(null);

  // Regional nodes in Hyderabad & Telangana Agri belt
  const locations = [
    {
      id: 'loc-1',
      name: 'Bowenpally Agricultural Market Yard (Rythu Bazar)',
      type: 'shopkeeper',
      role: 'Vegetable Market & Shopkeeper Hub',
      address: 'Bowenpally, Secunderabad, Telangana 500011',
      coords: { x: 52, y: 38 },
      lat: 17.4721,
      lng: 78.4842,
      metric: '530 kg waste daily',
      contact: '+91 94401 22334 (Ramesh Babu)',
      description: 'Major wholesale and retail vegetable market. Morning cabbage, coriander, and tomato trimmings listed daily.'
    },
    {
      id: 'loc-2',
      name: 'Madhapur Fresh Grocers Cooperative',
      type: 'shopkeeper',
      role: 'Urban Retail Grocery Cluster',
      address: 'Ayyappa Society, Madhapur, Hyderabad 500081',
      coords: { x: 38, y: 44 },
      lat: 17.4483,
      lng: 78.3915,
      metric: '220 kg ripe surplus',
      contact: '+91 98480 33445 (Lakshmi Devi)',
      description: 'Supermarket and grocery cluster separating organic peelings and surplus produce for bio-conversion.'
    },
    {
      id: 'loc-3',
      name: 'GreenSoil Bio-Organics Hub',
      type: 'producer',
      role: 'Compost & Vermiculture Facility',
      address: 'Survey No 128, Shamshabad Rural Agri Park',
      coords: { x: 48, y: 76 },
      lat: 17.2403,
      lng: 78.4294,
      metric: '1,200 kg monthly compost output',
      contact: '+91 97011 44556 (Suresh Reddy)',
      description: 'Multi-stage vermicomposting windrow pits processing leafy and brassica waste with certified microbial inoculants.'
    },
    {
      id: 'loc-4',
      name: 'Haritha Krishi Earth Solutions',
      type: 'producer',
      role: 'Bokashi & Bio-Fertilizer Unit',
      address: 'Medchal Agro-Industrial Corridor, 501401',
      coords: { x: 50, y: 18 },
      lat: 17.6297,
      lng: 78.4814,
      metric: '800 kg bio-compost capacity',
      contact: '+91 99590 55667 (Haritha Rao)',
      description: 'Specializes in accelerated anaerobic fermentation of market waste yielding concentrated bio-wash and conditioners.'
    },
    {
      id: 'loc-5',
      name: 'Chevella Organic Farming Cluster',
      type: 'farmer',
      role: 'Farmer Demonstration Plots (Paddy & Vegetables)',
      address: 'Chevella Mandal, Rangareddy District',
      coords: { x: 22, y: 62 },
      lat: 17.3075,
      lng: 78.1362,
      metric: '45 Acres nourished by waste-derived compost',
      contact: '+91 96180 66778 (Venkat Rao)',
      description: 'Certified organic farmers using finished compost to eliminate synthetic chemical fertilizer dependency.'
    },
    {
      id: 'loc-6',
      name: 'Sangareddy Sustainable Horticulture Belt',
      type: 'farmer',
      role: 'Farmer Fruit & Vegetable Orchards',
      address: 'Kondapur Agro Belt, Sangareddy',
      coords: { x: 18, y: 26 },
      lat: 17.6190,
      lng: 78.0818,
      metric: '30 Tons annual organic produce',
      contact: '+91 98660 77889 (Anjamma Goud)',
      description: 'Using high-potassium vegetable compost to boost guava, papaya, and chili yields.'
    }
  ];

  const filteredLocations = locations.filter(loc => {
    if (activeTab === 'all') return true;
    return loc.type === activeTab;
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
      {/* Map Header */}
      <div className="p-4 sm:p-6 bg-stone-50 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-800 font-semibold">
            <Navigation className="w-5 h-5 text-emerald-600" />
            <span>Interactive Circular Economy Geospatial Network</span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Real-time locations of vegetable waste pickup spots, compost processing centers, and enriched farm belts.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-100 text-orange-800 font-medium border border-orange-200">
            <Store className="w-3.5 h-3.5 text-orange-600" /> Vegetable Markets
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 font-medium border border-amber-200">
            <Building className="w-3.5 h-3.5 text-amber-700" /> Compost Producers
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-medium border border-emerald-200">
            <Sprout className="w-3.5 h-3.5 text-emerald-600" /> Farmer Hubs
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3">
        {/* Interactive Visual Map View */}
        <div className="lg:col-span-2 relative bg-[#f1f5eb] h-96 sm:h-[420px] overflow-hidden border-b lg:border-b-0 lg:border-r border-stone-200">
          {/* Stylized Topographic / Cartographic Grid */}
          <svg className="absolute inset-0 w-full h-full opacity-35" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#a3c293" strokeWidth="0.8" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            {/* Regional highway & link curves */}
            <path d="M 50 18 Q 52 38 48 76" fill="none" stroke="#86efac" strokeWidth="4" strokeDasharray="4,4" />
            <path d="M 18 26 Q 38 44 22 62" fill="none" stroke="#cbd5e1" strokeWidth="3" />
            <path d="M 38 44 Q 52 38 22 62" fill="none" stroke="#86efac" strokeWidth="3" strokeDasharray="6,4" />
          </svg>

          {/* Regional Water body / Hussain Sagar aesthetic note */}
          <div className="absolute top-[42%] left-[48%] w-14 h-9 bg-blue-200/50 rounded-full blur-[1px] border border-blue-300/40 pointer-events-none flex items-center justify-center">
            <span className="text-[9px] text-blue-700 font-bold opacity-60">Hyderabad</span>
          </div>

          {/* Markers */}
          {filteredLocations.map((loc) => {
            const isSelected = selectedHub?.id === loc.id;
            let pinColor = 'bg-emerald-600 text-white';
            if (loc.type === 'shopkeeper') pinColor = 'bg-orange-500 text-white';
            if (loc.type === 'producer') pinColor = 'bg-amber-700 text-white';

            return (
              <button
                key={loc.id}
                onClick={() => setSelectedHub(loc)}
                style={{ top: `${loc.coords.y}%`, left: `${loc.coords.x}%` }}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 group transition-all duration-200 focus:outline-none ${
                  isSelected ? 'scale-125 z-30' : 'hover:scale-110 z-10'
                }`}
              >
                <div className="relative flex items-center justify-center">
                  {/* Ping effect for active sites */}
                  <span className={`absolute w-8 h-8 rounded-full opacity-40 animate-ping ${
                    loc.type === 'shopkeeper' ? 'bg-orange-400' : loc.type === 'producer' ? 'bg-amber-500' : 'bg-emerald-400'
                  }`} />
                  <div className={`w-8 h-8 rounded-full shadow-md flex items-center justify-center border-2 border-white ${pinColor}`}>
                    {loc.type === 'shopkeeper' && <Store className="w-4 h-4" />}
                    {loc.type === 'producer' && <Building className="w-4 h-4" />}
                    {loc.type === 'farmer' && <Sprout className="w-4 h-4" />}
                  </div>
                </div>

                {/* Micro tooltip label */}
                <div className={`mt-1 text-[11px] font-semibold px-2 py-0.5 rounded shadow-sm whitespace-nowrap bg-stone-900/90 text-white pointer-events-none ${
                  isSelected ? 'opacity-100 ring-2 ring-emerald-400' : 'opacity-80 group-hover:opacity-100'
                }`}>
                  {loc.name.split('-')[0]}
                </div>
              </button>
            );
          })}

          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs text-stone-600 shadow-sm border border-stone-200">
            📍 OpenStreetMap Coordinates Simulated: Hyderabad & Rangareddy Region
          </div>
        </div>

        {/* Selected Hub Details Panel */}
        <div className="p-5 sm:p-6 bg-white flex flex-col justify-between">
          {selectedHub ? (
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold mb-3 bg-stone-100 text-stone-800">
                {selectedHub.role}
              </div>
              <h3 className="text-lg font-bold text-stone-900 leading-tight">
                {selectedHub.name}
              </h3>
              <p className="text-xs text-stone-500 mt-1 flex items-start gap-1">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{selectedHub.address}</span>
              </p>

              <div className="mt-4 p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
                <div className="text-xs font-semibold text-emerald-900 mb-1 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Active Capacity:
                </div>
                <div className="text-sm font-bold text-emerald-800">
                  {selectedHub.metric}
                </div>
                <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                  {selectedHub.description}
                </p>
              </div>

              <div className="mt-4 text-xs text-stone-600 flex items-center gap-2">
                <Phone className="w-4 h-4 text-stone-400" />
                <span className="font-medium text-stone-800">{selectedHub.contact}</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
                <Navigation className="w-6 h-6 animate-pulse" />
              </div>
              <h4 className="font-semibold text-stone-800 text-sm">Select Any Node on the Map</h4>
              <p className="text-xs text-stone-500 max-w-xs mt-1">
                Click on any vegetable market, compost facility, or farmer hub above to inspect pickup capacities and contact info.
              </p>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span>Circular Loop: Active</span>
            <span className="font-medium text-emerald-700">100% Traceable</span>
          </div>
        </div>
      </div>
    </div>
  );
}
