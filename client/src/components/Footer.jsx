import React from 'react';
import { Sprout, Heart, Leaf, Mail, Phone, MapPin, Award } from 'lucide-react';

export default function Footer({ setActivePage }) {
  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-stone-800">
          {/* Brand info */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md">
                <Sprout className="w-6 h-6 text-yellow-300" />
              </div>
              <div>
                <span className="text-xl font-black text-white tracking-tight">Agri to Harvest</span>
                <p className="text-xs text-emerald-400 font-medium">Turning Vegetable Waste into Farming Wealth</p>
              </div>
            </div>
            <p className="text-sm text-stone-400 leading-relaxed max-w-sm mb-6">
              A sustainable agriculture and waste-management circular ecosystem connecting vegetable markets,
              scientific compost producers, and farmers to divert waste from landfills and restore soil biology.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-800/80 text-xs text-emerald-300 font-semibold">
              <Award className="w-4 h-4 text-yellow-400" />
              <span>Design Thinking & Innovation (DTI) Showcase</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Explore</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => setActivePage('home')} className="hover:text-emerald-400 transition-colors">
                  Home Overview
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('waste_market')} className="hover:text-emerald-400 transition-colors">
                  Available Waste Directory
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('product_market')} className="hover:text-emerald-400 transition-colors">
                  Organic Compost Store
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('impact_page')} className="hover:text-emerald-400 transition-colors">
                  Environmental Impact
                </button>
              </li>
            </ul>
          </div>

          {/* Circular Loop */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Circular Loop</h4>
            <ul className="space-y-2.5 text-sm text-stone-400">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
                <span>1. Vegetable Shopkeepers</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                <span>2. Bio-Compost Producers</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>3. Soil Enriching Farmers</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>
                <span>4. Healthy Food Harvest</span>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Demonstration Hub</h4>
            <ul className="space-y-3 text-xs sm:text-sm text-stone-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-1" />
                <span>Agri Innovation Corridor, Hyderabad, Telangana</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>support@agritoharvest.org</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>+91 98490 11223</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© 2026 Agri to Harvest. All rights reserved. Built for College DTI Evaluation.</p>
          <div className="flex items-center gap-2">
            <span>Powered by Clean Circular Innovation</span>
            <Leaf className="w-4 h-4 text-emerald-500 inline" />
          </div>
        </div>
      </div>
    </footer>
  );
}
