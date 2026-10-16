import React, { useEffect, useState } from 'react';
import {
  Sprout,
  ShoppingBag,
  Star,
  Search,
  Filter,
  CheckCircle,
  ShieldCheck,
  ArrowUpDown,
  X,
  Info,
  Calendar,
  Layers
} from 'lucide-react';
import { api } from '../api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function ProductMarketplacePage() {
  const { addToCart, setIsOpen: setCartOpen } = useCart();
  const { user, demoLogin } = useAuth();
  const { lang } = useLanguage();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('newest');

  // Detail Modal
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productReviews, setProductReviews] = useState([]);
  const [addedNotice, setAddedNotice] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.getPublicProducts({
        search,
        category: category !== 'all' ? category : undefined,
        sort
      });
      if (res.success) {
        setProducts(res.products || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [category, sort]);

  const handleOpenDetail = async (prod) => {
    setSelectedProduct(prod);
    setDetailModalOpen(true);
    try {
      const res = await api.getProductById(prod.id);
      if (res.success) {
        setSelectedProduct(res.product);
        setProductReviews(res.reviews || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddToCart = async (prod) => {
    try {
      if (!user || user.role !== 'farmer') {
        await demoLogin('farmer');
      }
      await addToCart(prod.id, 1);
      setCartOpen(true);
      setAddedNotice(`🛒 Added "${prod.title}" to cart! Opening checkout drawer...`);
      setTimeout(() => setAddedNotice(null), 3000);
    } catch (e) {
      console.error(e);
      alert(e.message || 'Could not add to cart.');
    }
  };

  const categories = [
    'all',
    'Vermicompost',
    'Vegetable Compost',
    'Organic Manure',
    'Soil Conditioners',
    'Bio-fertilizers'
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 to-green-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800 text-yellow-300 text-xs font-bold mb-2">
            <Sprout className="w-3.5 h-3.5" />
            <span>Certified Organic Marketplace</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Organic Compost & Soil Enhancers
          </h1>
          <p className="text-xs sm:text-sm text-emerald-200 mt-1 max-w-xl">
            100% produced from recycled vegetable market waste. Fortified with beneficial soil microbes, humic acids, and macro-nutrients.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center">
            <div className="text-xl font-black text-yellow-300">₹0</div>
            <div className="text-[10px] text-emerald-200 uppercase font-semibold">Middlemen Markup</div>
          </div>
          <div className="px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center">
            <div className="text-xl font-black text-emerald-300">100%</div>
            <div className="text-[10px] text-emerald-200 uppercase font-semibold">Weed-Seed Free</div>
          </div>
        </div>
      </div>

      {addedNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{addedNotice}</span>
          </div>
          <button onClick={() => setAddedNotice(null)} className="text-emerald-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search products by title, crop suitability, or producer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchProducts()}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500 whitespace-nowrap">Sort by:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
            >
              <option value="newest">Newest Releases</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                category === cat
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
              }`}
            >
              {cat === 'all' ? 'All Organic Products' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-16 text-xs text-stone-500">Loading organic products...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-stone-200">
          <Sprout className="w-12 h-12 text-stone-300 mx-auto mb-2" />
          <h3 className="font-bold text-stone-800 text-sm">No products found</h3>
          <p className="text-xs text-stone-500 mt-1">Try another category or search filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((prod) => (
            <div
              key={prod.id}
              className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow group"
            >
              <div>
                <div
                  onClick={() => handleOpenDetail(prod)}
                  className="relative h-48 cursor-pointer overflow-hidden"
                >
                  <img
                    src={prod.image_url}
                    alt={prod.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-3 left-3 px-2 py-0.5 rounded-md text-[11px] font-bold bg-white/90 text-stone-900 backdrop-blur-xs">
                    {prod.category}
                  </span>
                  <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md text-[11px] font-bold bg-yellow-400 text-emerald-950 flex items-center gap-1 shadow-xs">
                    <Star className="w-3 h-3 fill-emerald-950" />
                    <span>{prod.rating}</span>
                  </span>
                </div>

                <div className="p-4 space-y-2">
                  <h3
                    onClick={() => handleOpenDetail(prod)}
                    className="font-bold text-stone-900 text-sm line-clamp-1 hover:text-emerald-800 cursor-pointer"
                  >
                    {prod.title}
                  </h3>
                  <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                    {prod.description}
                  </p>
                  <div className="text-[11px] text-stone-400">
                    Produced by <strong className="text-stone-700">{prod.producer_name}</strong>
                  </div>

                  <div className="flex justify-between items-center text-xs pt-2 border-t border-stone-100">
                    <span className="text-base font-black text-emerald-950">
                      ₹{prod.price} <span className="text-xs font-normal text-stone-500">/ {prod.unit}</span>
                    </span>
                    <span className="text-[11px] font-semibold text-stone-600">
                      {prod.stock_quantity > 0 ? `Stock: ${prod.stock_quantity}` : 'Out of stock'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0 flex gap-2">
                <button
                  onClick={() => handleOpenDetail(prod)}
                  className="px-3 py-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold"
                  title="View Specs & Details"
                >
                  <Info className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleAddToCart(prod)}
                  disabled={prod.stock_quantity <= 0}
                  className="flex-1 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>{prod.stock_quantity > 0 ? 'Add to Cart' : 'Out of Stock'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DETAIL MODAL */}
      {detailModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden border border-stone-200">
            <div className="relative h-60">
              <img
                src={selectedProduct.image_url}
                alt={selectedProduct.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setDetailModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-stone-900/60 text-white hover:bg-stone-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <span className="absolute bottom-4 left-4 px-3 py-1 rounded-full text-xs font-bold bg-emerald-800 text-white">
                {selectedProduct.category}
              </span>
            </div>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-bold text-stone-900">{selectedProduct.title}</h3>
                  <div className="text-right">
                    <div className="text-lg font-black text-emerald-950">₹{selectedProduct.price}</div>
                    <div className="text-xs text-stone-500">per {selectedProduct.unit}</div>
                  </div>
                </div>
                <div className="text-xs text-stone-500 mt-1">
                  Producer: {selectedProduct.producer_name} ({selectedProduct.producer_city})
                </div>
              </div>

              <p className="text-xs text-stone-600 leading-relaxed">
                {selectedProduct.description}
              </p>

              {/* Lab Quality Specs */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs space-y-2">
                <div className="font-bold text-stone-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>Quality Assurance & Specifications</span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                  <div>
                    <span className="text-stone-400">NPK Rating:</span>
                    <span className="font-bold text-stone-800 ml-1">{selectedProduct.npk_ratio || '2.5 - 1.6 - 1.8'}</span>
                  </div>
                  <div>
                    <span className="text-stone-400">Decomposition:</span>
                    <span className="font-medium text-stone-800 ml-1">{selectedProduct.processing_method || 'Vermicomposting'}</span>
                  </div>
                  <div>
                    <span className="text-stone-400">Organic Certification:</span>
                    <span className="font-bold text-emerald-700 ml-1">Verified Biodegradable</span>
                  </div>
                  <div>
                    <span className="text-stone-400">Batch Code:</span>
                    <span className="font-mono text-stone-700 ml-1">{selectedProduct.batch_code || 'BATCH-VERIFIED'}</span>
                  </div>
                </div>
              </div>

              {selectedProduct.usage_instructions && (
                <div>
                  <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-1">
                    Farmer Usage Guidelines
                  </h4>
                  <p className="text-xs text-stone-600 leading-relaxed bg-emerald-50/60 p-3 rounded-xl border border-emerald-100">
                    {selectedProduct.usage_instructions}
                  </p>
                </div>
              )}

              {/* Reviews */}
              {productReviews.length > 0 && (
                <div className="pt-2">
                  <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
                    Farmer Reviews ({productReviews.length})
                  </h4>
                  <div className="space-y-2">
                    {productReviews.map((rev) => (
                      <div key={rev.id} className="p-3 rounded-xl bg-stone-50 border border-stone-100 text-xs space-y-1">
                        <div className="flex justify-between font-semibold">
                          <span className="text-stone-900">{rev.farmer_name}</span>
                          <span className="text-yellow-500 font-bold">★ {rev.rating}</span>
                        </div>
                        <p className="text-stone-600 italic">"{rev.comment}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-stone-200 bg-stone-50 flex gap-3">
              <button
                onClick={() => setDetailModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleAddToCart(selectedProduct);
                  setDetailModalOpen(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Cart (₹{selectedProduct.price})</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
