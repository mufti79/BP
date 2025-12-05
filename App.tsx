import React, { useState } from 'react';
import { LayoutDashboard, Users, CheckCircle, LogOut } from 'lucide-react';
import { UserRole } from './types';
import { getPromoters } from './services/storageService';
import LogoUploader from './components/LogoUploader';
import LeadDashboard from './components/LeadDashboard';
import PromoterView from './components/PromoterView';
import SalesVerifier from './components/SalesVerifier';

const App: React.FC = () => {
  const [currentRole, setCurrentRole] = useState<UserRole>('LEAD');
  // For demo, we just pick the first promoter as the logged in one if role is PROMOTER
  const [currentPromoterId, setCurrentPromoterId] = useState<string>('p1');
  
  const promoters = getPromoters();
  const activePromoter = promoters.find(p => p.id === currentPromoterId) || promoters[0];

  const renderContent = () => {
    switch (currentRole) {
      case 'LEAD':
        return <LeadDashboard />;
      case 'PROMOTER':
        return <PromoterView promoter={activePromoter} />;
      case 'VERIFIER':
        return <SalesVerifier />;
      default:
        return <div>Select a role</div>;
    }
  };

  const navItems = [
    { role: 'LEAD', label: 'Team Lead', icon: LayoutDashboard },
    { role: 'PROMOTER', label: 'Brand Promoter', icon: Users },
    { role: 'VERIFIER', label: 'Sales Concern', icon: CheckCircle },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col hidden md:flex shadow-2xl relative z-20">
        <div className="p-6 border-b border-slate-800 flex flex-col items-center">
           <LogoUploader />
           <h1 className="text-white font-bold text-xl text-center tracking-tight mt-2 leading-tight">
             Brand Promoter <span className="text-indigo-500 whitespace-nowrap">KPI Tracker</span>
           </h1>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 pl-3">Switch Role (Demo)</div>
          {navItems.map((item) => (
            <button
              key={item.role}
              onClick={() => setCurrentRole(item.role as UserRole)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                currentRole === item.role 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' 
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        {currentRole === 'PROMOTER' && (
           <div className="p-4 bg-slate-800/50 border-t border-slate-800">
             <label className="block text-xs font-medium text-slate-400 mb-2">Simulate Promoter:</label>
             <select 
               className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white outline-none focus:border-indigo-500"
               value={currentPromoterId}
               onChange={(e) => setCurrentPromoterId(e.target.value)}
             >
                {promoters.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
             </select>
           </div>
        )}

        <div className="p-4 border-t border-slate-800">
          <button className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors text-sm">
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Nav Header (Visible only on small screens) */}
      <div className="md:hidden fixed top-0 w-full bg-slate-900 text-white z-50 p-4 flex justify-between items-center">
         <div className="font-bold">Promoter KPI Tracker</div>
         <select 
            value={currentRole} 
            onChange={(e) => setCurrentRole(e.target.value as UserRole)}
            className="bg-slate-800 text-sm rounded p-1"
          >
            <option value="LEAD">Lead</option>
            <option value="PROMOTER">Promoter</option>
            <option value="VERIFIER">Verifier</option>
         </select>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pt-16 md:pt-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-white relative">
        <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-30 px-8 py-4 flex justify-between items-center shadow-sm">
           <div>
             <h2 className="text-xl font-bold text-slate-800">
               {navItems.find(i => i.role === currentRole)?.label} Dashboard
             </h2>
             <p className="text-sm text-slate-500">Welcome back, verified user.</p>
           </div>
           <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold border-2 border-white shadow-sm">
              {currentRole[0]}
           </div>
        </header>

        <div className="p-2 md:p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;