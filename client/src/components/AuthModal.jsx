import React, { useState, useEffect } from 'react';
import { X, Sprout, Store, Building, Shield, CheckCircle, AlertCircle, Eye, EyeOff, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ isOpen, onClose, initialMode = 'login', onSuccess, onNavigateLoginPage }) {
  const { login, register, demoLogin } = useAuth();
  const [mode, setMode] = useState(initialMode); // 'login' or 'register'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setMode(initialMode);
    setError(null);
  }, [initialMode, isOpen]);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('farmer');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Hyderabad');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match.');
        }
        await register({
          name,
          email,
          phone,
          password,
          confirmPassword,
          role,
          address,
          city
        });
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Operation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = async (demoRole) => {
    setError(null);
    setLoading(true);
    try {
      await demoLogin(demoRole);
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-stone-200 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-green-900 p-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full text-emerald-200 hover:text-white hover:bg-emerald-700/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mx-auto mb-2 border border-white/20">
            <Sprout className="w-7 h-7 text-yellow-300" />
          </div>
          <h3 className="text-xl font-bold tracking-tight">Agri to Harvest</h3>
          <p className="text-xs text-emerald-200 mt-0.5">
            {mode === 'login' ? 'Sign in to access your platform dashboard' : 'Create an account to join the circular economy'}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-stone-200 text-sm font-semibold">
          <button
            onClick={() => { setMode('login'); setError(null); }}
            className={`flex-1 py-3 text-center transition-colors ${
              mode === 'login' ? 'text-emerald-800 border-b-2 border-emerald-700 bg-emerald-50/50' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setMode('register'); setError(null); }}
            className={`flex-1 py-3 text-center transition-colors ${
              mode === 'register' ? 'text-emerald-800 border-b-2 border-emerald-700 bg-emerald-50/50' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Register Role
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Demo Switcher inside Modal */}
          <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100">
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-900 mb-2 flex items-center gap-1.5">
              <span>⚡ 1-Click Evaluation Login:</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoClick('shopkeeper')}
                className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-emerald-100/70 border border-emerald-200 text-stone-800 text-xs font-semibold text-left flex items-center gap-2 shadow-xs transition-colors"
              >
                <Store className="w-4 h-4 text-orange-600 shrink-0" />
                <span className="truncate">Shopkeeper</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoClick('compost_producer')}
                className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-emerald-100/70 border border-emerald-200 text-stone-800 text-xs font-semibold text-left flex items-center gap-2 shadow-xs transition-colors"
              >
                <Building className="w-4 h-4 text-amber-700 shrink-0" />
                <span className="truncate">Producer</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoClick('farmer')}
                className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-emerald-100/70 border border-emerald-200 text-stone-800 text-xs font-semibold text-left flex items-center gap-2 shadow-xs transition-colors"
              >
                <Sprout className="w-4 h-4 text-emerald-700 shrink-0" />
                <span className="truncate">Farmer</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoClick('admin')}
                className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-emerald-100/70 border border-emerald-200 text-stone-800 text-xs font-semibold text-left flex items-center gap-2 shadow-xs transition-colors"
              >
                <Shield className="w-4 h-4 text-emerald-900 shrink-0" />
                <span className="truncate">Admin</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Full Name or Business Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Babu / Sri Krishna Veggies"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Select Your Platform Role *</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('shopkeeper')}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        role === 'shopkeeper' ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold' : 'border-stone-200 text-stone-600'
                      }`}
                    >
                      <Store className="w-4 h-4 mx-auto mb-1 text-orange-600" />
                      <span className="text-[11px] block">Shopkeeper</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('compost_producer')}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        role === 'compost_producer' ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold' : 'border-stone-200 text-stone-600'
                      }`}
                    >
                      <Building className="w-4 h-4 mx-auto mb-1 text-amber-700" />
                      <span className="text-[11px] block">Producer</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('farmer')}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        role === 'farmer' ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold' : 'border-stone-200 text-stone-600'
                      }`}
                    >
                      <Sprout className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
                      <span className="text-[11px] block">Farmer</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98490 00000"
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">City / Region *</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Hyderabad / Medchal"
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Address / Stall Location *</label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Stall 14, Rythu Bazar / Village Farm Plot"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Password *</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Confirm Password *</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md transition-all hover:shadow-lg disabled:opacity-50"
            >
              {loading ? 'Processing...' : mode === 'login' ? 'Sign In to Dashboard' : 'Complete Registration'}
            </button>

            {onNavigateLoginPage && (
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={onNavigateLoginPage}
                  className="text-xs text-emerald-800 hover:text-emerald-950 font-bold hover:underline inline-flex items-center gap-1"
                >
                  <span>Open Dedicated Full-Screen Login Page</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
