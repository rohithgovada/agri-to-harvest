import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';
import { LanguageProvider } from './context/LanguageContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import NotificationDrawer from './components/NotificationDrawer';
import NotificationToasts from './components/NotificationToasts';
import AuthModal from './components/AuthModal';

import LoginPage from './pages/LoginPage';
import LandingPage from './pages/LandingPage';
import WasteMarketplacePage from './pages/WasteMarketplacePage';
import ProductMarketplacePage from './pages/ProductMarketplacePage';
import ShopkeeperDashboard from './pages/ShopkeeperDashboard';
import ProducerDashboard from './pages/ProducerDashboard';
import FarmerDashboard from './pages/FarmerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ImpactDashboard from './pages/ImpactDashboard';

function MainApp() {
  const { user } = useAuth();
  const [activePage, setActivePage] = useState('home');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState('login');

  const handleOpenAuth = (mode = 'login') => {
    setAuthInitialMode(mode);
    setAuthModalOpen(true);
  };

  const renderCurrentPage = () => {
    switch (activePage) {
      case 'home':
        return <LandingPage setActivePage={setActivePage} onOpenAuth={handleOpenAuth} />;
      case 'login':
        return <LoginPage setActivePage={setActivePage} initialMode="login" />;
      case 'register':
        return <LoginPage setActivePage={setActivePage} initialMode="register" />;
      case 'waste_market':
        return <WasteMarketplacePage onOpenAuth={handleOpenAuth} />;
      case 'product_market':
        return <ProductMarketplacePage />;
      case 'impact_page':
        return <ImpactDashboard />;
      case 'shopkeeper_dashboard':
        if (!user) {
          return <LoginPage setActivePage={setActivePage} initialMode="login" />;
        }
        return <ShopkeeperDashboard />;
      case 'producer_dashboard':
        if (!user) {
          return <LoginPage setActivePage={setActivePage} initialMode="login" />;
        }
        return <ProducerDashboard />;
      case 'farmer_dashboard':
        if (!user) {
          return <LoginPage setActivePage={setActivePage} initialMode="login" />;
        }
        return <FarmerDashboard setActivePage={setActivePage} />;
      case 'admin_dashboard':
        if (!user || user.role !== 'admin') {
          return (
            <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-stone-200 text-center shadow-lg space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto font-bold text-lg">
                ⚠️
              </div>
              <h2 className="text-xl font-bold text-stone-900">Administrator Access Restricted</h2>
              <p className="text-xs text-stone-600">
                You must be logged in as an Administrator to view this console. Click "🛡️ Admin" in the top bar to switch into the demo administrator account.
              </p>
              <div className="flex justify-center gap-2 pt-2">
                <button
                  onClick={() => setActivePage('login')}
                  className="px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold"
                >
                  Go to Login Screen
                </button>
                <button
                  onClick={() => setActivePage('home')}
                  className="px-4 py-2 rounded-xl bg-stone-200 text-stone-800 text-xs font-bold"
                >
                  Return to Home
                </button>
              </div>
            </div>
          );
        }
        return <AdminDashboard />;
      default:
        return <LandingPage setActivePage={setActivePage} onOpenAuth={handleOpenAuth} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5] text-[#1c2e24]">
      <Navbar
        onOpenAuth={handleOpenAuth}
        activePage={activePage}
        setActivePage={setActivePage}
      />

      <main className="flex-1">
        {renderCurrentPage()}
      </main>

      <Footer setActivePage={setActivePage} />

      <CartDrawer
        onOrderSuccess={() => {
          if (user?.role === 'farmer') {
            setActivePage('farmer_dashboard');
          }
        }}
      />

      <NotificationDrawer setActivePage={setActivePage} />
      <NotificationToasts setActivePage={setActivePage} />

      <AuthModal
        isOpen={authModalOpen}
        initialMode={authInitialMode}
        onClose={() => setAuthModalOpen(false)}
        onNavigateLoginPage={() => {
          setAuthModalOpen(false);
          setActivePage('login');
        }}
        onSuccess={() => {
          // Stay or navigate
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <CartProvider>
          <LanguageProvider>
            <MainApp />
          </LanguageProvider>
        </CartProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}
