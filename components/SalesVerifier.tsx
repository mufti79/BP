import React, { useState, useEffect } from 'react';
import { Check, X, Clock, MapPin, User, Mail, Phone } from 'lucide-react';
import { SaleRecord, SaleStatus } from '../types';
import { getSales, updateSaleStatus } from '../services/storageService';

const SalesVerifier: React.FC = () => {
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [filter, setFilter] = useState<SaleStatus>(SaleStatus.PENDING);

  useEffect(() => {
    loadSales();
    const interval = setInterval(loadSales, 5000); // Poll for new sales
    return () => clearInterval(interval);
  }, []);

  const loadSales = () => {
    setSales(getSales().sort((a, b) => b.timestamp - a.timestamp));
  };

  const handleStatusChange = (id: string, status: SaleStatus) => {
    updateSaleStatus(id, status);
    loadSales();
  };

  const filteredSales = sales.filter(s => s.status === filter);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Sales Verification</h2>
          <p className="text-slate-500">Verify customer entries from Brand Promoters</p>
        </div>
        <div className="flex bg-white rounded-lg p-1 shadow-sm border">
          {(Object.values(SaleStatus) as SaleStatus[]).map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === status 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {filteredSales.length === 0 ? (
          <div className="col-span-full py-20 text-center text-slate-400 bg-white rounded-xl border border-dashed">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No sales found with status: {filter}</p>
          </div>
        ) : (
          filteredSales.map((sale) => (
            <div key={sale.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg text-slate-800">{sale.customer.name}</h3>
                  <div className="flex items-center text-xs text-slate-500 mt-1 space-x-3">
                     <span className="flex items-center"><User size={12} className="mr-1"/> Age: {sale.customer.age}</span>
                     <span className="flex items-center"><MapPin size={12} className="mr-1"/> {sale.customer.location}</span>
                  </div>
                </div>
                <div className="text-right">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Promoter</span>
                    <p className="text-sm font-medium text-indigo-600">{sale.promoterName}</p>
                </div>
              </div>
              
              <div className="p-5 bg-slate-50/50">
                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div className="flex items-center text-slate-600">
                    <Phone size={14} className="mr-2 text-slate-400" /> {sale.customer.mobile}
                  </div>
                  <div className="flex items-center text-slate-600">
                    <Mail size={14} className="mr-2 text-slate-400" /> {sale.customer.email}
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  <h4 className="text-xs font-bold text-slate-400 uppercase">Tickets</h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(sale.items).map(([type, count]) => (
                      typeof count === 'number' && count > 0 ? (
                        <span key={type} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {type}: {count}
                        </span>
                      ) : null
                    ))}
                  </div>
                </div>

                {filter === SaleStatus.PENDING && (
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => handleStatusChange(sale.id, SaleStatus.VERIFIED)}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-lg flex items-center justify-center font-medium transition-colors"
                    >
                      <Check size={18} className="mr-2" /> Verify
                    </button>
                    <button
                      onClick={() => handleStatusChange(sale.id, SaleStatus.REJECTED)}
                      className="flex-1 bg-white border border-red-200 text-red-600 hover:bg-red-50 py-2 px-4 rounded-lg flex items-center justify-center font-medium transition-colors"
                    >
                      <X size={18} className="mr-2" /> Reject
                    </button>
                  </div>
                )}
                
                {filter !== SaleStatus.PENDING && (
                    <div className={`mt-4 text-center py-2 rounded-lg font-medium text-sm ${
                        filter === SaleStatus.VERIFIED ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                    }`}>
                        {filter === SaleStatus.VERIFIED ? 'Verified Entry' : 'Entry Rejected'}
                    </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SalesVerifier;