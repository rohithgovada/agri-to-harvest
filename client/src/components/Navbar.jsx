import React, { useState } from 'react';
import { Sprout, ShoppingCart, Globe, User, LogOut, LayoutDashboard, Shield, Store, Building, ChevronDown, Menu, X, ArrowRight, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNotifications } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar({ onOpenAuth, activePage, setActivePage }) {
  const { user, logout, demoLogin } = useAuth();
  const { itemCount, setIsOpen: setCartOpen } = useCart();
  const { unreadCount, setIsOpen: setNotifOpen } = useNotifications();
  const { lang, toggleLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleDemoSwitch = async (role) => {
    try {
      await demoLogin(role);
      setDemoMenuOpen(false);
      if (role === 'shopkeeper') setActivePage('shopkeeper_dashboard');
      else if (role === 'compost_producer') setActivePage('producer_dashboard');
      else if (role === 'farmer') setActivePage('farmer_dashboard');
      else if (role === 'admin') setActivePage('admin_dashboard');
    } catch (e) {
      console.error(e);
    }
  };

  const getDashboardTarget = () => {
    if (!user) return 'home';
    if (user.role === 'shopkeeper') return 'shopkeeper_dashboard';
    if (user.role === 'compost_producer') return 'producer_dashboard';
    if (user.role === 'farmer') return 'farmer_dashboard';
    if (user.role === 'admin') return 'admin_dashboard';
    return 'home';
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
      {/* Top Convenience Bar: Quick Demo Role Switcher */}
      <div className="bg-[#14532d] text-emerald-100 text-xs py-1.5 px-4 sm:px-8 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-yellow-300">🌱 DTI Demo Mode:</span>
          <span className="hidden sm:inline text-emerald-200">{t('switchRole')}</span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setActivePage('login')}
            className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
              activePage === 'login' ? 'bg-yellow-400 text-emerald-950' : 'bg-emerald-900/90 hover:bg-emerald-800 text-yellow-300 border border-yellow-400/50'
            }`}
          >
            🔑 Login Screen
          </button>
          <button
            onClick={() => handleDemoSwitch('shopkeeper')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
              user?.role === 'shopkeeper' ? 'bg-yellow-400 text-emerald-950 font-bold' : 'bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100'
            }`}
          >
            🏪 Shopkeeper
          </button>
          <button
            onClick={() => handleDemoSwitch('compost_producer')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
              user?.role === 'compost_producer' ? 'bg-yellow-400 text-emerald-950 font-bold' : 'bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100'
            }`}
          >
            🏭 Compost Producer
          </button>
          <button
            onClick={() => handleDemoSwitch('farmer')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
              user?.role === 'farmer' ? 'bg-yellow-400 text-emerald-950 font-bold' : 'bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100'
            }`}
          >
            🚜 Farmer
          </button>
          <button
            onClick={() => handleDemoSwitch('admin')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
              user?.role === 'admin' ? 'bg-yellow-400 text-emerald-950 font-bold' : 'bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100'
            }`}
          >
            🛡️ Admin
          </button>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <div
            onClick={() => setActivePage('home')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-emerald-600 to-green-800 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <Sprout className="w-6 h-6 text-yellow-300" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-emerald-950 tracking-tight leading-none flex items-center gap-1">
                Agri to Harvest
              </div>
              <p className="text-[11px] text-emerald-700 font-semibold tracking-wide hidden sm:block">
                Turning Vegetable Waste into Farming Wealth
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            <button
              onClick={() => setActivePage('home')}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                activePage === 'home' ? 'text-emerald-900 bg-emerald-50' : 'text-stone-700 hover:text-emerald-800 hover:bg-stone-50'
              }`}
            >
              {t('home')}
            </button>

            <button
              onClick={() => {
                handleDemoSwitch('shopkeeper');
              }}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                activePage === 'shopkeeper_dashboard' ? 'text-orange-900 bg-orange-50 ring-1 ring-orange-300' : 'text-stone-700 hover:text-orange-800 hover:bg-orange-50/50'
              }`}
            >
              <Store className="w-3.5 h-3.5 text-orange-600" />
              <span>1. Shopkeeper (Post Waste)</span>
            </button>

            <button
              onClick={() => {
                handleDemoSwitch('compost_producer');
              }}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                activePage === 'producer_dashboard' ? 'text-amber-900 bg-amber-50 ring-1 ring-amber-300' : 'text-stone-700 hover:text-amber-800 hover:bg-amber-50/50'
              }`}
            >
              <Building className="w-3.5 h-3.5 text-amber-700" />
              <span>2. Composer (Collect & Compost)</span>
            </button>

            <button
              onClick={() => {
                handleDemoSwitch('farmer');
              }}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                activePage === 'farmer_dashboard' || activePage === 'product_market' ? 'text-green-900 bg-green-50 ring-1 ring-green-300' : 'text-stone-700 hover:text-green-800 hover:bg-green-50/50'
              }`}
            >
              <Sprout className="w-3.5 h-3.5 text-green-600" />
              <span>3. Farmer (Buy Compost)</span>
            </button>

            <button
              onClick={() => setActivePage('impact_page')}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                activePage === 'impact_page' ? 'text-emerald-900 bg-emerald-50' : 'text-stone-700 hover:text-emerald-800 hover:bg-stone-50'
              }`}
            >
              📊 {t('impact')}
            </button>
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Bilingual toggle button */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
              title="Switch Language"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-700" />
              <span>{lang === 'en' ? 'తెలుగు' : 'English'}</span>
            </button>

            {/* Notification Bell Trigger */}
            <button
              onClick={() => setNotifOpen(true)}
              className="relative p-2 rounded-xl text-stone-700 hover:text-emerald-800 hover:bg-emerald-50 transition-colors group"
              aria-label="View Notifications"
              title="Notifications & Alerts"
            >
              <Bell className="w-5 h-5 text-emerald-900 group-hover:rotate-12 transition-transform" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-orange-600 text-white font-black text-[10px] flex items-center justify-center shadow-md animate-pulse border-2 border-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Cart Trigger */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2 rounded-xl text-stone-700 hover:text-emerald-800 hover:bg-emerald-50 transition-colors"
              aria-label="View Cart"
            >
              <ShoppingCart className="w-5 h-5 text-emerald-900" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-700 text-white font-bold text-[11px] flex items-center justify-center animate-bounce shadow-sm">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Authenticated User Menu or Login Buttons */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-stone-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-800 text-yellow-300 font-bold flex items-center justify-center text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden md:block">
                    <div className="text-xs font-bold text-stone-900 truncate max-w-[120px]">
                      {user.name}
                    </div>
                    <div className="text-[10px] font-semibold text-emerald-700 capitalize">
                      {user.role.replace('_', ' ')}
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-stone-500" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div
                    onClick={() => setUserDropdownOpen(false)}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-stone-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-2"
                  >
                    <div className="px-4 py-2 border-b border-stone-100">
                      <p className="text-xs text-stone-500 font-medium">Signed in as</p>
                      <p className="text-sm font-bold text-stone-900 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                        {user.role.replace('_', ' ')}
                      </span>
                    </div>

                    <button
                      onClick={() => setActivePage(getDashboardTarget())}
                      className="w-full px-4 py-2 text-left text-xs sm:text-sm font-medium text-stone-700 hover:bg-emerald-50 hover:text-emerald-900 flex items-center gap-2"
                    >
                      <LayoutDashboard className="w-4 h-4 text-emerald-700" />
                      Role Dashboard
                    </button>

                    {user.role === 'farmer' && (
                      <button
                        onClick={() => setActivePage('farmer_dashboard')}
                        className="w-full px-4 py-2 text-left text-xs sm:text-sm font-medium text-stone-700 hover:bg-emerald-50 hover:text-emerald-900 flex items-center gap-2"
                      >
                        <ShoppingCart className="w-4 h-4 text-emerald-700" />
                        My Orders & Farm Tips
                      </button>
                    )}

                    {user.role === 'shopkeeper' && (
                      <button
                        onClick={() => setActivePage('shopkeeper_dashboard')}
                        className="w-full px-4 py-2 text-left text-xs sm:text-sm font-medium text-stone-700 hover:bg-emerald-50 hover:text-emerald-900 flex items-center gap-2"
                      >
                        <Store className="w-4 h-4 text-emerald-700" />
                        My Waste Listings
                      </button>
                    )}

                    {user.role === 'compost_producer' && (
                      <button
                        onClick={() => setActivePage('producer_dashboard')}
                        className="w-full px-4 py-2 text-left text-xs sm:text-sm font-medium text-stone-700 hover:bg-emerald-50 hover:text-emerald-900 flex items-center gap-2"
                      >
                        <Building className="w-4 h-4 text-emerald-700" />
                        Production Batches & Sales
                      </button>
                    )}

                    {user.role === 'admin' && (
                      <button
                        onClick={() => setActivePage('admin_dashboard')}
                        className="w-full px-4 py-2 text-left text-xs sm:text-sm font-medium text-stone-700 hover:bg-emerald-50 hover:text-emerald-900 flex items-center gap-2"
                      >
                        <Shield className="w-4 h-4 text-emerald-700" />
                        System Administration
                      </button>
                    )}

                    <button
                      onClick={() => setNotifOpen(true)}
                      className="w-full px-4 py-2 text-left text-xs sm:text-sm font-medium text-stone-700 hover:bg-emerald-50 hover:text-emerald-900 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-emerald-700" />
                        <span>Notification Center</span>
                      </div>
                      {unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-orange-600 text-white font-bold text-[10px]">
                          {unreadCount}
                        </span>
                      )}
                    </button>

                    <div className="border-t border-stone-100 my-1"></div>

                    <button
                      onClick={logout}
                      className="w-full px-4 py-2 text-left text-xs sm:text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActivePage('login')}
                  className="px-3.5 py-2 text-xs sm:text-sm font-bold text-emerald-950 hover:bg-emerald-50 rounded-xl transition-colors border border-emerald-300 shadow-2xs flex items-center gap-1.5"
                >
                  <span>🔑</span>
                  <span>{t('login')}</span>
                </button>
                <button
                  onClick={() => setActivePage('register')}
                  className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-sm transition-all hover:shadow"
                >
                  {t('register')}
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-stone-700 hover:bg-stone-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-stone-200 py-3 space-y-1">
            <button
              onClick={() => { setActivePage('home'); setMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-stone-800 hover:bg-emerald-50"
            >
              {t('home')}
            </button>
            <button
              onClick={() => { setActivePage('waste_market'); setMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-stone-800 hover:bg-emerald-50"
            >
              {t('availableWaste')}
            </button>
            <button
              onClick={() => { setActivePage('product_market'); setMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-stone-800 hover:bg-emerald-50"
            >
              {t('organicProducts')}
            </button>
            <button
              onClick={() => { setActivePage('impact_page'); setMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-stone-800 hover:bg-emerald-50"
            >
              {t('impact')}
            </button>
            <button
              onClick={() => { setNotifOpen(true); setMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-stone-800 hover:bg-emerald-50 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-700" />
                <span>Notifications</span>
              </div>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-orange-600 text-white font-bold text-xs">
                  {unreadCount} new
                </span>
              )}
            </button>
            {user ? (
              <button
                onClick={() => { setActivePage(getDashboardTarget()); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-bold text-emerald-800 bg-emerald-50 flex items-center justify-between"
              >
                <span>Open {user.role.replace('_', ' ')} Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="pt-2 border-t border-stone-100 flex gap-2">
                <button
                  onClick={() => { setActivePage('login'); setMobileMenuOpen(false); }}
                  className="flex-1 py-2 text-center text-xs font-bold text-emerald-900 bg-emerald-50 rounded-xl border border-emerald-200"
                >
                  🔑 Sign In (1-Click Demo)
                </button>
                <button
                  onClick={() => { setActivePage('register'); setMobileMenuOpen(false); }}
                  className="flex-1 py-2 text-center text-xs font-bold text-white bg-emerald-700 rounded-xl"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
