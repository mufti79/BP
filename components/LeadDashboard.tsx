import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, Map, CheckCircle, Plus, Trash2, Settings, Check } from 'lucide-react';
import { Promoter, SaleRecord, SaleStatus, TicketType, KPIStats, Floor } from '../types';
import { getPromoters, getSales, savePromoters, getFloors, saveFloors, generateId } from '../services/storageService';

const LeadDashboard: React.FC = () => {
  const [promoters, setPromoters] = useState<Promoter[]>([]);
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [stats, setStats] = useState<KPIStats[]>([]);

  // Management State
  const [newPromoterName, setNewPromoterName] = useState('');
  const [newFloorName, setNewFloorName] = useState('');

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000); // Live refresh
    return () => clearInterval(interval);
  }, []);

  const loadData = () => {
    const loadedPromoters = getPromoters();
    const loadedSales = getSales();
    const loadedFloors = getFloors();
    setPromoters(loadedPromoters);
    setSales(loadedSales);
    setFloors(loadedFloors);
    calculateStats(loadedPromoters, loadedSales);
  };

  const calculateStats = (currentPromoters: Promoter[], currentSales: SaleRecord[]) => {
    // Only count VERIFIED sales for KPIs
    const verifiedSales = currentSales.filter(s => s.status === SaleStatus.VERIFIED);
    
    const newStats: KPIStats[] = currentPromoters.map(p => {
      const pSales = verifiedSales.filter(s => s.promoterId === p.id);
      return {
        promoterId: p.id,
        totalKiddo: pSales.reduce((sum, s) => sum + (s.items[TicketType.KIDDO] || 0), 0),
        totalExtreme: pSales.reduce((sum, s) => sum + (s.items[TicketType.EXTREME] || 0), 0),
        totalIndividual: pSales.reduce((sum, s) => sum + (s.items[TicketType.INDIVIDUAL] || 0), 0),
        totalEntry: pSales.reduce((sum, s) => sum + (s.items[TicketType.ENTRY_ONLY] || 0), 0),
        totalSalesLeads: pSales.length,
        totalMailCollect: pSales.filter(s => s.customer.email && s.customer.email.length > 3).length,
        revenue: 0 // Placeholder
      };
    });
    setStats(newStats);
  };

  const toggleFloorAssign = (promoterId: string, floorName: string) => {
    const updated = promoters.map(p => {
      if (p.id === promoterId) {
        const currentFloors = p.assignedFloors || [];
        const exists = currentFloors.includes(floorName);
        let newFloors;
        if (exists) {
          newFloors = currentFloors.filter(f => f !== floorName);
        } else {
          newFloors = [...currentFloors, floorName];
        }
        return { ...p, assignedFloors: newFloors };
      }
      return p;
    });
    setPromoters(updated);
    savePromoters(updated);
  };

  // --- Management Functions ---

  const handleAddPromoter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromoterName.trim()) return;
    const newPromoter: Promoter = {
      id: generateId(),
      name: newPromoterName,
      assignedFloors: []
    };
    const updated = [...promoters, newPromoter];
    setPromoters(updated);
    savePromoters(updated);
    setNewPromoterName('');
    // Recalculate stats immediately to show new row
    calculateStats(updated, sales);
  };

  const handleDeletePromoter = (id: string) => {
    if (confirm('Are you sure you want to remove this promoter?')) {
      const updated = promoters.filter(p => p.id !== id);
      setPromoters(updated);
      savePromoters(updated);
      calculateStats(updated, sales);
    }
  };

  const handleAddFloor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFloorName.trim()) return;
    const newFloor: Floor = {
      id: generateId(),
      name: newFloorName
    };
    const updated = [...floors, newFloor];
    setFloors(updated);
    saveFloors(updated);
    setNewFloorName('');
  };

  const handleDeleteFloor = (id: string) => {
    if (confirm('Are you sure you want to remove this floor?')) {
      const updated = floors.filter(f => f.id !== id);
      setFloors(updated);
      saveFloors(updated);
    }
  };

  // Prepare Chart Data
  const chartData = stats.map(s => {
    const name = promoters.find(p => p.id === s.promoterId)?.name.split(' ')[0] || 'Unknown';
    return {
      name,
      Kiddo: s.totalKiddo,
      Extreme: s.totalExtreme,
      Mails: s.totalMailCollect,
    };
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 pb-20">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Ticket Entries</p>
              <h3 className="text-2xl font-bold text-slate-800">
                {stats.reduce((acc, curr) => acc + curr.totalEntry + curr.totalExtreme + curr.totalKiddo + curr.totalIndividual, 0)}
              </h3>
            </div>
            <div className="bg-blue-100 p-3 rounded-full text-blue-600"><Users size={20} /></div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
             <div>
              <p className="text-sm font-medium text-slate-500">Emails Collected</p>
              <h3 className="text-2xl font-bold text-slate-800">
                {stats.reduce((acc, curr) => acc + curr.totalMailCollect, 0)}
              </h3>
            </div>
            <div className="bg-emerald-100 p-3 rounded-full text-emerald-600"><Users size={20} /></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
             <div>
              <p className="text-sm font-medium text-slate-500">Verified Sales</p>
              <h3 className="text-2xl font-bold text-slate-800">
                {stats.reduce((acc, curr) => acc + curr.totalSalesLeads, 0)}
              </h3>
            </div>
            <div className="bg-indigo-100 p-3 rounded-full text-indigo-600"><CheckCircle size={20} /></div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* KPI Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Real-time KPI Overview</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" tickLine={false} axisLine={false} />
                <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Legend iconType="circle" />
                <Bar dataKey="Kiddo" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Extreme" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Mails" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Floor Assignment */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
            <Map size={18} className="mr-2 text-slate-500" /> Floor Assignments
          </h3>
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {promoters.map(promoter => (
              <div key={promoter.id} className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex justify-between items-center mb-2">
                   <div className="font-medium text-slate-900">{promoter.name}</div>
                   <div className="text-xs text-slate-400">{promoter.assignedFloors?.length || 0} assigned</div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {floors.map(f => {
                    const isAssigned = (promoter.assignedFloors || []).includes(f.name);
                    return (
                      <button
                        key={f.id}
                        onClick={() => toggleFloorAssign(promoter.id, f.name)}
                        className={`text-xs px-2 py-1 rounded-md border transition-all duration-200 flex items-center ${
                          isAssigned 
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
                            : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                        }`}
                      >
                        {isAssigned && <Check size={10} className="mr-1" />}
                        {f.name}
                      </button>
                    )
                  })}
                </div>

                <div className="flex justify-between text-xs text-slate-500 border-t border-slate-100 pt-2">
                  <span>Sales Lead: {stats.find(s => s.promoterId === promoter.id)?.totalSalesLeads || 0}</span>
                  <span>Mails: {stats.find(s => s.promoterId === promoter.id)?.totalMailCollect || 0}</span>
                </div>
              </div>
            ))}
            {promoters.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">No promoters active.</p>
            )}
          </div>
        </div>
      </div>

      {/* Management Section */}
      <div className="border-t border-slate-200 pt-8">
         <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
           <Settings className="mr-2" size={24} /> Management Console
         </h2>
         
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Promoter Management */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="font-semibold text-lg text-slate-700 mb-4">Manage Brand Promoters</h3>
              
              <form onSubmit={handleAddPromoter} className="flex gap-2 mb-6">
                <input 
                  type="text" 
                  value={newPromoterName}
                  onChange={(e) => setNewPromoterName(e.target.value)}
                  placeholder="New promoter name..."
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                />
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors">
                  <Plus size={18} />
                </button>
              </form>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {promoters.map(p => (
                  <div key={p.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100 group">
                     <span className="text-sm font-medium text-slate-700">{p.name}</span>
                     <button 
                       onClick={() => handleDeletePromoter(p.id)}
                       className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1"
                       title="Remove Promoter"
                     >
                       <Trash2 size={16} />
                     </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Floor Management */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="font-semibold text-lg text-slate-700 mb-4">Manage Floors</h3>
              
              <form onSubmit={handleAddFloor} className="flex gap-2 mb-6">
                <input 
                  type="text" 
                  value={newFloorName}
                  onChange={(e) => setNewFloorName(e.target.value)}
                  placeholder="New floor name..."
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                />
                <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors">
                  <Plus size={18} />
                </button>
              </form>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {floors.map(f => (
                  <div key={f.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100 group">
                     <span className="text-sm font-medium text-slate-700">{f.name}</span>
                     <button 
                       onClick={() => handleDeleteFloor(f.id)}
                       className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1"
                       title="Remove Floor"
                     >
                       <Trash2 size={16} />
                     </button>
                  </div>
                ))}
              </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default LeadDashboard;