import React, { useState } from 'react';
import {
  Sprout,
  Store,
  Building,
  Shield,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  Key,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage({ setActivePage, initialMode = 'login' }) {
  const { login, register, demoLogin } = useAuth();
  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('farmer');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Hyderabad');
  const [confirmPassword, setConfirmPassword] = useState('');

  const demoAccounts = [
    {
      role: 'shopkeeper',
      title: 'Vegetable Shopkeeper',
      icon: Store,
      name: 'Ramesh Babu',
      stall: 'Bowenpally Rythu Bazar Stall #14',
      email: 'ramesh.veggies@gmail.com',
      password: 'password123',
      color: 'border-orange-200 bg-orange-50/50 hover:border-orange-400 text-orange-950',
      badgeColor: 'bg-orange-100 text-orange-800',
      desc: 'Lists excess tomatoes, leafy greens & market waste for pickup'
    },
    {
      role: 'compost_producer',
      title: 'Compost Producer (Composer)',
      icon: Building,
      name: 'Suresh Reddy',
      stall: 'GreenSoil Bio-Organics, Shamshabad',
      email: 'suresh.compost@gmail.com',
      password: 'password123',
      color: 'border-amber-200 bg-amber-50/50 hover:border-amber-400 text-amber-950',
      badgeColor: 'bg-amber-100 text-amber-800',
      desc: 'Collects market waste & produces vermicompost for farmers'
    },
    {
      role: 'farmer',
      title: 'Agricultural Farmer',
      icon: Sprout,
      name: 'Venkat Rao',
      stall: 'Chevella Farmland, Rangareddy',
      email: 'venkat.farmer@gmail.com',
      password: 'password123',
      color: 'border-emerald-200 bg-emerald-50/50 hover:border-emerald-400 text-emerald-950',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      desc: 'Purchases organic compost directly for field crops'
    },
    {
      role: 'admin',
      title: 'System Administrator',
      icon: Shield,
      name: 'AgriAdmin Monitor',
      stall: 'Agri Innovation Center, Hyderabad',
      email: 'admin@agritoharvest.org',
      password: 'admin123',
      color: 'border-stone-300 bg-stone-100/70 hover:border-stone-400 text-stone-900',
      badgeColor: 'bg-stone-200 text-stone-800',
      desc: 'Oversees platform audit logs, users & circular metrics'
    }
  ];

  const handle1ClickLogin = async (account) => {
    setError(null);
    setLoading(true);
    try {
      await demoLogin(account.role);
      setSuccessMsg(`Welcome, ${account.name}! Redirecting to your dashboard...`);
      setTimeout(() => {
        if (account.role === 'shopkeeper') setActivePage('shopkeeper_dashboard');
        else if (account.role === 'compost_producer') setActivePage('producer_dashboard');
        else if (account.role === 'farmer') setActivePage('farmer_dashboard');
        else if (account.role === 'admin') setActivePage('admin_dashboard');
      }, 700);
    } catch (err) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillForm = (account) => {
    setMode('login');
    setEmail(account.email);
    setPassword(account.password);
    setError(null);
    setSuccessMsg(`Populated credentials for ${account.name}! Click 'Sign In' or the button below.`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const loggedInUser = await login(email, password);
        setSuccessMsg(`Welcome back, ${loggedInUser.name}!`);
        setTimeout(() => {
          if (loggedInUser.role === 'shopkeeper') setActivePage('shopkeeper_dashboard');
          else if (loggedInUser.role === 'compost_producer') setActivePage('producer_dashboard');
          else if (loggedInUser.role === 'farmer') setActivePage('farmer_dashboard');
          else if (loggedInUser.role === 'admin') setActivePage('admin_dashboard');
          else setActivePage('home');
        }, 700);
      } else {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match. Please re-enter.');
        }
        const newUser = await register({
          name,
          email,
          phone,
          password,
          confirmPassword,
          role,
          address,
          city
        });
        setSuccessMsg(`Account registered successfully as ${newUser.role.replace('_', ' ')}!`);
        setTimeout(() => {
          if (newUser.role === 'shopkeeper') setActivePage('shopkeeper_dashboard');
          else if (newUser.role === 'compost_producer') setActivePage('producer_dashboard');
          else if (newUser.role === 'farmer') setActivePage('farmer_dashboard');
          else setActivePage('home');
        }, 700);
      }
    } catch (err) {
      setError(err.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-in fade-in">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 to-green-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800 text-yellow-300 text-xs font-bold mb-2">
            <Key className="w-3.5 h-3.5" />
            <span>Secure Role-Based Access Control</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Sign In to Agri to Harvest
          </h1>
          <p className="text-xs sm:text-sm text-emerald-200 mt-1 max-w-xl">
            Choose your role below for instant 1-click evaluation, or sign in with your email and password.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActivePage('home')}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xs transition-colors"
          >
            ← Return to Home
          </button>
        </div>
      </div>

      {/* Main Grid: 1-Click Demo Profiles (Left) + Form (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Col: 1-Click Demo Cards */}
        <div className="lg:col-span-6 space-y-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              ⚡ College Evaluation Mode
            </span>
            <h2 className="text-xl font-black text-stone-900 mt-2">
              1-Click Demo Profiles (Ready to Test)
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Click any profile below to instantly log in with pre-seeded data, active listings, and orders:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {demoAccounts.map((acc) => {
              const IconComp = acc.icon;
              return (
                <div
                  key={acc.role}
                  className={`p-4 rounded-2xl border-2 transition-all shadow-xs flex flex-col justify-between ${acc.color}`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${acc.badgeColor}`}>
                        {acc.title.split(' ')[0]}
                      </span>
                      <IconComp className="w-5 h-5 opacity-80" />
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-stone-900">{acc.name}</h4>
                      <div className="text-[11px] text-stone-500 truncate">{acc.stall}</div>
                    </div>

                    <p className="text-[11px] text-stone-600 line-clamp-2 leading-relaxed">
                      {acc.desc}
                    </p>

                    <div className="p-2 rounded-lg bg-white/80 border border-stone-200/80 text-[10px] font-mono space-y-0.5">
                      <div className="truncate"><strong>Email:</strong> {acc.email}</div>
                      <div><strong>Pass:</strong> {acc.password}</div>
                    </div>
                  </div>

                  <div className="pt-3 flex gap-2">
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handle1ClickLogin(acc)}
                      className="flex-1 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                      <span>Log In Now ➔</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFillForm(acc)}
                      className="px-2.5 py-2 rounded-xl bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 text-xs font-semibold"
                      title="Fill in form"
                    >
                      Fill
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Clean Sign In / Register Form */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-md space-y-6">
          {/* Tabs */}
          <div className="flex border-b border-stone-200 text-sm font-bold">
            <button
              onClick={() => { setMode('login'); setError(null); setSuccessMsg(null); }}
              className={`flex-1 pb-3 text-center transition-colors border-b-2 flex items-center justify-center gap-2 ${
                mode === 'login'
                  ? 'border-emerald-700 text-emerald-950 font-black'
                  : 'border-transparent text-stone-400 hover:text-stone-700'
              }`}
            >
              <Key className="w-4 h-4 text-emerald-700" />
              <span>Sign In</span>
            </button>
            <button
              onClick={() => { setMode('register'); setError(null); setSuccessMsg(null); }}
              className={`flex-1 pb-3 text-center transition-colors border-b-2 flex items-center justify-center gap-2 ${
                mode === 'register'
                  ? 'border-emerald-700 text-emerald-950 font-black'
                  : 'border-transparent text-stone-400 hover:text-stone-700'
              }`}
            >
              <User className="w-4 h-4 text-emerald-700" />
              <span>Create New Account</span>
            </button>
          </div>

          {/* Feedback alerts */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-semibold">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Select Your Role in Circular Agriculture *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('shopkeeper')}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        role === 'shopkeeper'
                          ? 'border-orange-500 bg-orange-50 text-orange-950 ring-2 ring-orange-400 font-bold shadow-xs'
                          : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      <Store className="w-5 h-5 mx-auto mb-1 text-orange-600" />
                      <span className="text-xs block font-bold">Shopkeeper</span>
                      <span className="text-[10px] text-stone-500 block">Post Waste</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole('compost_producer')}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        role === 'compost_producer'
                          ? 'border-amber-500 bg-amber-50 text-amber-950 ring-2 ring-amber-400 font-bold shadow-xs'
                          : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      <Building className="w-5 h-5 mx-auto mb-1 text-amber-700" />
                      <span className="text-xs block font-bold">Producer</span>
                      <span className="text-[10px] text-stone-500 block">Make Compost</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole('farmer')}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        role === 'farmer'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500 font-bold shadow-xs'
                          : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      <Sprout className="w-5 h-5 mx-auto mb-1 text-emerald-600" />
                      <span className="text-xs block font-bold">Farmer</span>
                      <span className="text-[10px] text-stone-500 block">Buy Organic</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Full Name or Farm/Stall Entity *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Ramesh Babu / Sri Krishna Organic Farms"
                      className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Phone Number *</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98490 12345"
                        className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">City / District *</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Hyderabad / Rangareddy"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Stall / Facility / Farmland Address *
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. Stall #14, Bowenpally Rythu Bazar Yard"
                      className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Email Address *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. venkat.farmer@gmail.com"
                  className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-stone-700">Password *</label>
                {mode === 'login' && (
                  <span className="text-[11px] text-stone-400 font-mono">Demo: password123</span>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono"
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
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-sm shadow-md transition-all hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : mode === 'login' ? (
                <>
                  <Key className="w-4 h-4 text-yellow-300" />
                  <span>Sign In to Dashboard</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 text-yellow-300" />
                  <span>Register & Join Circular Network</span>
                </>
              )}
            </button>
          </form>

          {/* Quick toggle at bottom */}
          <div className="pt-2 text-center text-xs text-stone-500">
            {mode === 'login' ? (
              <span>
                Don't have an account yet?{' '}
                <button
                  onClick={() => { setMode('register'); setError(null); }}
                  className="font-bold text-emerald-700 hover:underline"
                >
                  Register here
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{' '}
                <button
                  onClick={() => { setMode('login'); setError(null); }}
                  className="font-bold text-emerald-700 hover:underline"
                >
                  Sign In
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
